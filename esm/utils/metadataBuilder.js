import { SDK_VERSION } from '@sentry/core';
export var SDK_NAME = 'sentry.javascript.nextjs';
export var PACKAGE_NAME_PREFIX = 'npm:@sentry/';
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
            name: SDK_NAME,
            version: SDK_VERSION,
            packages: this._getPackages(),
        };
    };
    /** JSDoc */
    MetadataBuilder.prototype._getPackages = function () {
        return this._packageNames.map(function (pkgName) {
            return {
                name: PACKAGE_NAME_PREFIX + pkgName,
                version: SDK_VERSION,
            };
        });
    };
    return MetadataBuilder;
}());
export { MetadataBuilder };
//# sourceMappingURL=metadataBuilder.js.map