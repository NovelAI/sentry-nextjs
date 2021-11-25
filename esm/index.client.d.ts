import { NextjsOptions } from './utils/nextjsOptions';
export * from '@sentry/react';
export { nextRouterInstrumentation } from './performance/client';
export declare const Integrations: {
    BrowserTracing: typeof import("@sentry/tracing/dist/browser").BrowserTracing;
    GlobalHandlers: typeof import("k:/development/sentry-javascript/packages/browser/dist/integrations").GlobalHandlers;
    TryCatch: typeof import("k:/development/sentry-javascript/packages/browser/dist/integrations").TryCatch;
    Breadcrumbs: typeof import("k:/development/sentry-javascript/packages/browser/dist/integrations").Breadcrumbs;
    LinkedErrors: typeof import("k:/development/sentry-javascript/packages/browser/dist/integrations").LinkedErrors;
    UserAgent: typeof import("k:/development/sentry-javascript/packages/browser/dist/integrations").UserAgent;
    Dedupe: typeof import("k:/development/sentry-javascript/packages/browser/dist/integrations").Dedupe;
    FunctionToString: typeof import("@sentry/core/dist/integrations").FunctionToString;
    InboundFilters: typeof import("@sentry/core/dist/integrations").InboundFilters;
};
/** Inits the Sentry NextJS SDK on the browser with the React SDK. */
export declare function init(options: NextjsOptions): void;
//# sourceMappingURL=index.client.d.ts.map