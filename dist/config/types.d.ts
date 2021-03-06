import { SentryCliPluginOptions } from '@sentry/webpack-plugin';
import { WebpackPluginInstance } from 'webpack';
export declare type SentryWebpackPluginOptions = SentryCliPluginOptions;
export declare type SentryWebpackPlugin = WebpackPluginInstance & {
    options: SentryWebpackPluginOptions;
};
/**
 * Overall Nextjs config
 */
export declare type ExportedNextConfig = Partial<NextConfigObject> | NextConfigFunction;
export declare type NextConfigObject = {
    webpack: WebpackConfigFunction;
    target: 'server' | 'experimental-serverless-trace';
    distDir: string;
    sentry?: {
        disableServerWebpackPlugin?: boolean;
        disableClientWebpackPlugin?: boolean;
    };
} & {
    [key: string]: unknown;
};
export declare type NextConfigFunction = (phase: string, defaults: {
    defaultConfig: NextConfigObject;
}) => Partial<NextConfigObject>;
/**
 * Webpack config
 */
export declare type WebpackConfigFunction = (config: WebpackConfigObject, options: BuildContext) => WebpackConfigObject;
export declare type WebpackConfigObject = {
    devtool?: string;
    plugins?: Array<WebpackPluginInstance | SentryWebpackPlugin>;
    entry: WebpackEntryProperty;
    output: {
        filename: string;
        path: string;
    };
    target: string;
    context: string;
    resolve?: {
        alias?: {
            [key: string]: string | boolean;
        };
    };
} & {
    [key: string]: unknown;
};
export declare type BuildContext = {
    dev: boolean;
    isServer: boolean;
    buildId: string;
    dir: string;
    config: NextConfigObject;
    webpack: {
        version: string;
    };
};
/**
 * Webpack `entry` config
 */
export declare type WebpackEntryProperty = EntryPropertyObject | EntryPropertyFunction;
export declare type EntryPropertyObject = {
    [key: string]: EntryPointValue;
};
export declare type EntryPropertyFunction = () => Promise<EntryPropertyObject>;
export declare type EntryPointValue = string | Array<string> | EntryPointObject;
export declare type EntryPointObject = {
    import: string | Array<string>;
};
//# sourceMappingURL=types.d.ts.map