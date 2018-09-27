import { middleware, Segment, SegmentInterface } from "aws-xray-sdk-core";
import { DocumentNode, GraphQLResolveInfo } from "graphql";
import { EndHandler, GraphQLExtension, Request } from "graphql-extensions";
import { SegmentRepository } from "./SegmentRepository";
import { XRayKey } from "./XRayKey";

/**
 * An Apollo Server GraphQL Extension which reports trace data to AWS XRay.
 */
export class XRayGraphQLExtension<TContext = any> implements GraphQLExtension<TContext> {
  private segments = new SegmentRepository();

  public constructor(
    private root: string | SegmentInterface,
    private annotations: Array<{ key: string; value: string }> = [],
  ) { }

  public requestDidStart(o: {
    request: Request;
    queryString?: string;
    parsedQuery?: DocumentNode;
    operationName?: string;
    variables?: { [key: string]: any };
    persistedQueryHit?: boolean;
    persistedQueryRegister?: boolean;
    context: TContext;
  }): EndHandler | void {
    const trace = middleware.processHeaders({
      headers: { "X-Amzn-Trace-Id": o.request.headers.get("X-Amzn-Trace-Id") },
    });

    const segment = typeof this.root === "string"
      ? new Segment(
        this.root,
        trace.Root,
        trace.Parent,
      )
      : this.root;

    segment.addMetadata("query", o.queryString);
    segment.addAnnotation("url", o.request.url);

    this.segments.add({ key: "", prev: null }, segment);

    return (...errors: Error[]): void => {
      if (errors.length > 0) {
        errors.forEach((error, i) => {
          segment.addAnnotation(`Error${i}`, `${error}`);
        });
      }
      this.segments.forEach((s: Segment): void => {
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
    const segment = this.segments
      .findParent(info.path)
      .addNewSubsegment(this.segments.pathToString(info.path));

    segment.addAnnotation("GraphQLField", `${info.parentType.name}.${info.fieldName}`);

    for (const annotation of this.annotations) {
      segment.addAnnotation(annotation.key, annotation.value);
    }

    this.segments.add(info.path, segment);

    info[XRayKey] = segment;

    return (): void => {
      segment.close();
    };
  }
}
