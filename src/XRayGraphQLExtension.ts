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
    const ownsRootSegment = typeof root === "string";
    const rootSegment = typeof root === "string"
      ? new Segment(root, trace.Root, trace.Parent)
      : root;

    rootSegment.addMetadata("query", o.queryString);

    this._segments.add(null, rootSegment);

    return (...errors: Error[]): void => {
      if (errors.length > 0) {
        errors.forEach((error, i) => {
          rootSegment.addAnnotation(`Error${i}`, `${error}`);
        });
      }
      if (ownsRootSegment) {
        rootSegment.close();
      }
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

    return (error: Error | null, _result?: any): void => {
      segment.close(error != null ? error : undefined);
    };
  }

  public get segments(): Segment[] {
    return this._segments.segments;
  }

  public get rootSegments(): Segment[] {
    return this._segments.rootSegments;
  }
}
