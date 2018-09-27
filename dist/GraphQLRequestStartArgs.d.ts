import { DocumentNode } from "graphql";
import { Request } from "graphql-extensions";
export interface GraphQLExtensionRequestStartArgs<TContext> {
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
}
