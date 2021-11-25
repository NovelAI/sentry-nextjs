Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@sentry/core");
exports.SDK_NAME = 'sentry.javascript.nextjs';
exports.PACKAGE_NAME_PREFIX = 'npm:@sentry/';
/**
 * A builder for the SDK metadata in the options for the SDK initialization.
 */
var MetadataBuilder = /** @class */ (function () {
    function MetadataBuilder(options, packages) {
        this._options = options;
        this._packageNames = packages;
    }
    /** JSDoc */
    MetadataBuilder.prototype.addSdkMetadata = function () {
        this._options._metadata = this._options._metadata || {};
        this._options._metadata.sdk = this._getSdkInfo();
    };
    /** JSDoc */
    MetadataBuilder.prototype._getSdkInfo = function () {
        return {
            name: exports.SDK_NAME,
            version: core_1.SDK_VERSION,
            packages: this._getPackages(),
        };
    };
    /** JSDoc */
    MetadataBuilder.prototype._getPackages = function () {
        return this._packageNames.map(function (pkgName) {
            return {
                name: exports.PACKAGE_NAME_PREFIX + pkgName,
                version: core_1.SDK_VERSION,
            };
        });
    };
    return MetadataBuilder;
}());
exports.MetadataBuilder = MetadataBuilder;
//# sourceMappingURL=metadataBuilder.js.map