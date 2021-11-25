import { NextjsOptions } from './nextjsOptions';
export declare const SDK_NAME = "sentry.javascript.nextjs";
export declare const PACKAGE_NAME_PREFIX = "npm:@sentry/";
/**
 * A builder for the SDK metadata in the options for the SDK initialization.
 */
export declare class MetadataBuilder {
    private _options;
    private _packageNames;
    constructor(options: NextjsOptions, packages: string[]);
    /** JSDoc */
    addSdkMetadata(): void;
    /** JSDoc */
    private _getSdkInfo;
    /** JSDoc */
    private _getPackages;
}
//# sourceMappingURL=metadataBuilder.d.ts.map