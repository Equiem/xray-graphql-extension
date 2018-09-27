import { SegmentInterface } from "aws-xray-sdk-core";
import { GraphQLResolveInfo } from "graphql";
import { EndHandler, GraphQLExtension } from "graphql-extensions";
import { GraphQLExtensionRequestStartArgs } from "./GraphQLRequestStartArgs";
/**
 * An Apollo Server GraphQL Extension which reports trace data to AWS XRay.
 */
export declare class XRayGraphQLExtension<TContext = any> implements GraphQLExtension<TContext> {
    private root;
    private annotations;
    private segments;
    constructor(root: (args: GraphQLExtensionRequestStartArgs<TContext>) => string | SegmentInterface, annotations?: Array<{
        key: string;
        value: string;
    }>);
    requestDidStart(o: GraphQLExtensionRequestStartArgs<TContext>): EndHandler | void;
    willResolveField(_source: any, _args: {
        [argName: string]: any;
    }, _context: TContext, info: GraphQLResolveInfo): EndHandler;
}
