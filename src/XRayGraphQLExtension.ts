import { middleware, Segment, SegmentInterface } from "aws-xray-sdk-core";
import { GraphQLResolveInfo } from "graphql";
import { EndHandler, GraphQLExtension } from "graphql-extensions";
import { GraphQLExtensionRequestStartArgs } from "./GraphQLRequestStartArgs";
import { SegmentRepository } from "./SegmentRepository";
import { XRayKey } from "./XRayKey";

/**
 * An Apollo Server GraphQL Extension which reports trace data to AWS XRay.
 */
export class XRayGraphQLExtension<TContext = any> implements GraphQLExtension<TContext> {
  private _segments = new SegmentRepository();

  public constructor(
    private root: (args: GraphQLExtensionRequestStartArgs<TContext>) => string | SegmentInterface,
    private annotations: Array<{ key: string; value: string }> = [],
  ) { }

  public requestDidStart(o: GraphQLExtensionRequestStartArgs<TContext>): EndHandler {
    const trace = middleware.processHeaders({
      headers: { "X-Amzn-Trace-Id": o.request.headers.get("X-Amzn-Trace-Id") },
    });

    const root = this.root(o);
    const segment = typeof root === "string"
      ? new Segment(root, trace.Root, trace.Parent)
      : root;

    segment.addMetadata("query", o.queryString);

    this._segments.add(null, segment);

    return (...errors: Error[]): void => {
      if (errors.length > 0) {
        errors.forEach((error, i) => {
          segment.addAnnotation(`Error${i}`, `${error}`);
        });
      }
      this._segments.forEach((s: Segment): void => {
        s.close(errors.length > 0 ? errors[0] : undefined);
      });
    };
  }

  public willResolveField(
    _source: any,
    _args: { [argName: string]: any },
    _context: TContext,
    info: GraphQLResolveInfo,
  ): EndHandler {
    const parent = this._segments.findParent(info.path);
    const segment = parent.addNewSubsegment(this._segments.pathToString(info.path));

    segment.addAnnotation("GraphQLField", `${info.parentType.name}.${info.fieldName}`);

    for (const annotation of this.annotations) {
      segment.addAnnotation(annotation.key, annotation.value);
    }

    this._segments.add(info.path, segment);

    info[XRayKey] = segment;

    return (...errors: Error[]): void => {
      if (errors.length > 0) {
        errors.forEach((error, i) => {
          segment.addAnnotation(`Error${i}`, `${error}`);
        });
      }

      segment.close(errors.length > 0 ? errors[0] : undefined);
      this.closeParentsWithNoOpenSubsegments(segment);
    };
  }

  public closeParentsWithNoOpenSubsegments(segment: SegmentInterface): void {
    if (segment.parent != null && segment.parent.subsegments.find((s) => !s.isClosed()) == null) {
      // No remaining subsegments of parent are open, so close it too.
      segment.parent.close();
      // Continue recursively.
      this.closeParentsWithNoOpenSubsegments(segment.parent);
    }
  }

  public get segments(): Segment[] {
    return this._segments.segments;
  }

  public get rootSegments(): Segment[] {
    return this._segments.rootSegments;
  }
}
