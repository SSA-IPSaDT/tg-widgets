import type { Context, MiddlewareFn } from 'grammy';
import type { WidgetSizeReport } from '../jsx';
import type { WidgetMinifyOptions } from '../minifier';
import type { AnyWidgetScreen } from '../screen';
import type { WidgetsStorage } from '../storage';
import type { WidgetsFlavor } from './controller-types';

export * from './controller-types';

export interface WidgetsLogger {
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
}

export type PluginEnvironmentMode = 'production' | 'development' | 'prod' | 'dev';

export type CodecMode = 'prod' | 'dev' | 'auto' | 'off';

export interface CodecOptions {
    mode?: CodecMode;
    customKeys?: Record<string, string>;
    compressState?: boolean;
    compressAnswer?: boolean;
    decompressActionPayload?: boolean;
    injectClientSnippet?: boolean;
}

export type CodecConfig = CodecMode | boolean | CodecOptions;

export type MinifierEngine = 'terser' | 'fast' | 'none';

export interface WidgetMinifyConfig extends WidgetMinifyOptions {
    enabled?: boolean;
    engine?: MinifierEngine;
}

export type MinifierConfig = boolean | MinifierEngine | 'dev' | 'prod' | WidgetMinifyConfig;

export interface SizeLimitOptions {
    maxBytes?: number;
    onExceeded?: 'error' | 'warn' | 'ignore' | ((report: WidgetSizeReport) => void);
    autoInspect?: boolean;
}

export type SizeLimitConfig = number | SizeLimitOptions;

export interface StorageOptions {
    defaultTtlSeconds?: number;
    maxEntries?: number;
}

export interface WidgetDefaults {
    width?: number;
    height?: number;
    allowQueries?: boolean;
    parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML' | string;
}

export interface ResolvedPluginConfig {
    mode: 'prod' | 'dev';
    codec: {
        enabled: boolean;
        mode: 'prod' | 'dev';
        customKeys?: Record<string, string>;
        customReverseKeys?: Record<string, string>;
        compressState: boolean;
        compressAnswer: boolean;
        decompressActionPayload: boolean;
        injectClientSnippet: boolean;
    };
    minifier: {
        enabled: boolean;
        engine: MinifierEngine;
        options: WidgetMinifyOptions;
    };
    sizeLimit: {
        maxBytes: number;
        onExceeded: 'error' | 'warn' | 'ignore' | ((report: WidgetSizeReport) => void);
        autoInspect: boolean;
    };
    defaults: WidgetDefaults;
    debug: boolean;
}

export interface TelegramWidgetQueryPayload {
    id: string;
    from: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
        is_premium?: boolean;
        language_code?: string;
    };
    chat?: {
        id: number;
        type: string;
        title?: string;
        username?: string;
    };
    message?: {
        message_id: number;
        chat?: {
            id: number;
            type: string;
            title?: string;
            username?: string;
        };
    };
    message_id?: number;
    inline_message_id?: string;
    chat_instance: string;
    chat_type?: 'sender' | 'private' | 'group' | 'supergroup' | 'channel' | string;
    type?: unknown;
    data?: string;
}

export interface CreateWidgetsPluginOptions<TScreens extends Record<string, AnyWidgetScreen>> {
    screens: TScreens;
    mode?: PluginEnvironmentMode;
    codec?: CodecConfig;
    minifier?: MinifierConfig;
    sizeLimit?: SizeLimitConfig;
    storage?: WidgetsStorage | StorageOptions;
    logger?: WidgetsLogger | 'silent' | 'debug' | 'verbose' | boolean;
    debug?: boolean;
    defaults?: WidgetDefaults;
}

export interface TelegramWidgetsPluginReturn<TScreens extends Record<string, AnyWidgetScreen>> {
    middleware: MiddlewareFn<Context & WidgetsFlavor<TScreens>>;
    screens: TScreens;
    storage: WidgetsStorage;
    config: ResolvedPluginConfig;
}
