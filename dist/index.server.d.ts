import { NextjsOptions } from './utils/nextjsOptions';
export * from '@sentry/node';
export { ErrorBoundary, withErrorBoundary } from '@sentry/react';
/** Inits the Sentry NextJS SDK on node. */
export declare function init(options: NextjsOptions): void;
export { withSentryConfig } from './config';
export { withSentry } from './utils/withSentry';
//# sourceMappingURL=index.server.d.ts.map