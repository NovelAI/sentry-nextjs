/// <reference types="node" />
import * as http from 'http';
export interface NextRequest extends http.IncomingMessage {
    cookies: Record<string, string>;
    url: string;
    query: {
        [key: string]: string;
    };
    headers: {
        [key: string]: string;
    };
    body: string | {
        [key: string]: unknown;
    };
}
/**
 * Do the monkeypatching and wrapping necessary to catch errors in page routes and record transactions for both page and
 * API routes.
 */
export declare function instrumentServer(): void;
//# sourceMappingURL=instrumentServer.d.ts.map