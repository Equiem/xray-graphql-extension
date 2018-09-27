import { DocumentNode, GraphQLResolveInfo } from "graphql";
import { EndHandler, GraphQLExtension, Request } from "graphql-extensions";
/**
 * An Apollo Server GraphQL Extension which reports trace data to AWS XRay.
 */
export declare class XRayGraphQLExtension<TContext = any> implements GraphQLExtension<TContext> {
    private rootName;
    private segments;
    constructor(rootName: string);
    requestDidStart(o: {
        request: Request;
        queryString?: string;
        parsedQuery?: DocumentNode;
        operationName?: string;
        variables?: {
            [key: string]: any;
        };
        persistedQueryHit?: boolean;
        persistedQueryRegister?: boolean;
        context: TContext;
    }): EndHandler | void;
    willResolveField(_source: any, _args: {
        [argName: string]: any;
    }, _context: TContext, info: GraphQLResolveInfo): EndHandler;
}
