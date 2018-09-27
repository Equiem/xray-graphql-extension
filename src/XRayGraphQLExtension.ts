import { Segment } from "aws-xray-sdk-core";
import { DocumentNode, GraphQLResolveInfo } from "graphql";
import { EndHandler, GraphQLExtension, Request } from "graphql-extensions";
import { SegmentRepository } from "./SegmentRepository";
import { XRayKey } from "./XRayKey";

/**
 * An Apollo Server GraphQL Extension which reports trace data to AWS XRay.
 */
export class XRayGraphQLExtension<TContext = any> implements GraphQLExtension<TContext> {
  private segments = new SegmentRepository();

  public constructor(private rootName: string) { }

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
    const segment = new Segment(
      this.rootName,
      o.request.headers.get("X-Amzn-Trace-Id"),
      o.request.headers.get("X-Amzn-Trace-Id"),
    );

    segment.addMetadata("query", o.queryString);
    segment.addAnnotation("url", o.request.url);

    this.segments.add({ key: "", prev: null }, segment);

    return (): void => {
      this.segments.forEach((s: Segment): void => {
        s.close();
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

    segment.addAnnotation("parentType", info.parentType.name);
    segment.addAnnotation("fieldName", info.fieldName);

    this.segments.add(info.path, segment);

    info[XRayKey] = segment;

    return (): void => {
      segment.close();
    };
  }
}
