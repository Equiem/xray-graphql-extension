import { Segment, SegmentInterface } from "aws-xray-sdk-core";
import { GraphQLResolveInfo } from "graphql";
import { EndHandler, GraphQLExtension } from "graphql-extensions";
import { GraphQLExtensionRequestStartArgs } from "./GraphQLRequestStartArgs";
/**
 * An Apollo Server GraphQL Extension which reports trace data to AWS XRay.
 */
export declare class XRayGraphQLExtension<TContext = any> implements GraphQLExtension<TContext> {
    private root;
    private annotations;
    private _segments;
    constructor(root: (args: GraphQLExtensionRequestStartArgs<TContext>) => string | SegmentInterface, annotations?: Array<{
        key: string;
        value: string;
    }>);
    requestDidStart(o: GraphQLExtensionRequestStartArgs<TContext>): EndHandler;
    willResolveField(_source: any, _args: {
        [argName: string]: any;
    }, _context: TContext, info: GraphQLResolveInfo): EndHandler;
    closeParentsWithNoOpenSubsegments(segment: SegmentInterface): void;
    readonly segments: Segment[];
    readonly rootSegments: Segment[];
}
