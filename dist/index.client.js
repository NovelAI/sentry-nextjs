Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = require("@sentry/react");
var tracing_1 = require("@sentry/tracing");
var client_1 = require("./performance/client");
var metadataBuilder_1 = require("./utils/metadataBuilder");
var userIntegrations_1 = require("./utils/userIntegrations");
tslib_1.__exportStar(require("@sentry/react"), exports);
var client_2 = require("./performance/client");
exports.nextRouterInstrumentation = client_2.nextRouterInstrumentation;
var BrowserTracing = tracing_1.Integrations.BrowserTracing;
exports.Integrations = tslib_1.__assign(tslib_1.__assign({}, react_1.Integrations), { BrowserTracing: BrowserTracing });
/** Inits the Sentry NextJS SDK on the browser with the React SDK. */
function init(options) {
    var metadataBuilder = new metadataBuilder_1.MetadataBuilder(options, ['nextjs', 'react']);
    metadataBuilder.addSdkMetadata();
    options.environment = options.environment || process.env.NODE_ENV;
    // Only add BrowserTracing if a tracesSampleRate or tracesSampler is set
    var integrations = options.tracesSampleRate === undefined && options.tracesSampler === undefined
        ? options.integrations
        : createClientIntegrations(options.integrations);
    react_1.init(tslib_1.__assign(tslib_1.__assign({}, options), { integrations: integrations }));
    react_1.configureScope(function (scope) {
        scope.setTag('runtime', 'browser');
        scope.addEventProcessor(function (event) { return (event.type === 'transaction' && event.transaction === '/404' ? null : event); });
    });
}
exports.init = init;
var defaultBrowserTracingIntegration = new BrowserTracing({
    tracingOrigins: tslib_1.__spread(tracing_1.defaultRequestInstrumentationOptions.tracingOrigins, [/^(api\/)/]),
    routingInstrumentation: client_1.nextRouterInstrumentation,
});
function createClientIntegrations(integrations) {
    if (integrations) {
        return userIntegrations_1.addIntegration(defaultBrowserTracingIntegration, integrations, {
            BrowserTracing: { keyPath: 'options.routingInstrumentation', value: client_1.nextRouterInstrumentation },
        });
    }
    else {
        return [defaultBrowserTracingIntegration];
    }
}
//# sourceMappingURL=index.client.js.map