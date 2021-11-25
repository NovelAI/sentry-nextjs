Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var hub_1 = require("@sentry/hub");
var integrations_1 = require("@sentry/integrations");
var node_1 = require("@sentry/node");
var utils_1 = require("@sentry/utils");
var domainModule = require("domain");
var path = require("path");
var instrumentServer_1 = require("./utils/instrumentServer");
var metadataBuilder_1 = require("./utils/metadataBuilder");
var userIntegrations_1 = require("./utils/userIntegrations");
tslib_1.__exportStar(require("@sentry/node"), exports);
// Here we want to make sure to only include what doesn't have browser specifics
// because or SSR of next.js we can only use this.
var react_1 = require("@sentry/react");
exports.ErrorBoundary = react_1.ErrorBoundary;
exports.withErrorBoundary = react_1.withErrorBoundary;
var domain = domainModule;
/** Inits the Sentry NextJS SDK on node. */
function init(options) {
    var _a, _b;
    if (options.debug) {
        utils_1.logger.enable();
    }
    utils_1.logger.log('Initializing SDK...');
    if (sdkAlreadyInitialized()) {
        utils_1.logger.log('SDK already initialized');
        return;
    }
    var metadataBuilder = new metadataBuilder_1.MetadataBuilder(options, ['nextjs', 'node']);
    metadataBuilder.addSdkMetadata();
    options.environment = options.environment || process.env.NODE_ENV;
    addServerIntegrations(options);
    // Right now we only capture frontend sessions for Next.js
    options.autoSessionTracking = false;
    // In an ideal world, this init function would be called before any requests are handled. That way, every domain we
    // use to wrap a request would inherit its scope and client from the global hub. In practice, however, handling the
    // first request is what causes us to initialize the SDK, as the init code is injected into `_app` and all API route
    // handlers, and those are only accessed in the course of handling a request. As a result, we're already in a domain
    // when `init` is called. In order to compensate for this and mimic the ideal world scenario, we stash the active
    // domain, run `init` as normal, and then restore the domain afterwards, copying over data from the main hub as if we
    // really were inheriting.
    var activeDomain = domain.active;
    domain.active = null;
    node_1.init(options);
    node_1.configureScope(function (scope) {
        scope.setTag('runtime', 'node');
        if (process.env.VERCEL) {
            scope.setTag('vercel', true);
        }
        scope.addEventProcessor(filterTransactions);
    });
    if (activeDomain) {
        var globalHub = hub_1.getHubFromCarrier(hub_1.getMainCarrier());
        var domainHub = hub_1.getHubFromCarrier(activeDomain);
        // apply the changes made by `nodeInit` to the domain's hub also
        domainHub.bindClient(globalHub.getClient());
        (_a = domainHub.getScope()) === null || _a === void 0 ? void 0 : _a.update(globalHub.getScope());
        // `scope.update()` doesn’t copy over event processors, so we have to add it manually
        (_b = domainHub.getScope()) === null || _b === void 0 ? void 0 : _b.addEventProcessor(filterTransactions);
        // restore the domain hub as the current one
        domain.active = activeDomain;
    }
    utils_1.logger.log('SDK successfully initialized');
}
exports.init = init;
function sdkAlreadyInitialized() {
    var hub = node_1.getCurrentHub();
    return !!hub.getClient();
}
function addServerIntegrations(options) {
    // This value is injected at build time, based on the output directory specified in the build config
    var distDirName = global.__rewriteFramesDistDir__ || '.next';
    // nextjs always puts the build directory at the project root level, which is also where you run `next start` from, so
    // we can read in the project directory from the currently running process
    var distDirAbsPath = path.resolve(process.cwd(), distDirName);
    var SOURCEMAP_FILENAME_REGEX = new RegExp(utils_1.escapeStringForRegex(distDirAbsPath));
    var defaultRewriteFramesIntegration = new integrations_1.RewriteFrames({
        iteratee: function (frame) {
            var _a;
            frame.filename = (_a = frame.filename) === null || _a === void 0 ? void 0 : _a.replace(SOURCEMAP_FILENAME_REGEX, 'app:///_next');
            return frame;
        },
    });
    if (options.integrations) {
        options.integrations = userIntegrations_1.addIntegration(defaultRewriteFramesIntegration, options.integrations);
    }
    else {
        options.integrations = [defaultRewriteFramesIntegration];
    }
    if (options.tracesSampleRate !== undefined || options.tracesSampler !== undefined) {
        var defaultHttpTracingIntegration = new node_1.Integrations.Http({ tracing: true });
        options.integrations = userIntegrations_1.addIntegration(defaultHttpTracingIntegration, options.integrations, {
            Http: { keyPath: '_tracing', value: true },
        });
    }
}
function filterTransactions(event) {
    return event.type === 'transaction' && event.transaction === '/404' ? null : event;
}
var config_1 = require("./config");
exports.withSentryConfig = config_1.withSentryConfig;
var withSentry_1 = require("./utils/withSentry");
exports.withSentry = withSentry_1.withSentry;
// wrap various server methods to enable error monitoring and tracing
instrumentServer_1.instrumentServer();
//# sourceMappingURL=index.server.js.map