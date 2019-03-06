import { DocumentNode } from "graphql";
import { Request } from "graphql-extensions";
export interface GraphQLExtensionRequestStartArgs<TContext> {
    request: Pick<Request, "url" | "method" | "headers">;
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
