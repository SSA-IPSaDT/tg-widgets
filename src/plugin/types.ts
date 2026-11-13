/**
 * Telegram Widgets grammY Plugin Configuration Types.
 *
 * Defines plugin options, mode presets, codec configuration, minifier settings,
 * size ceiling limits, logger interfaces, and resolved runtime configurations.
 *
 * @module plugin/types
 */

import type { Context, MiddlewareFn } from 'grammy';
import type { WidgetSizeReport } from '../jsx';
import type { WidgetMinifyOptions } from '../minifier';
import type { AnyWidgetScreen } from '../screen';
import type { WidgetsStorage } from '../storage';
import type { WidgetsFlavor } from './controller-types';

export * from './controller-types';

/**
 * Custom logger interface compatible with console, pino, winston, or bunyan.
 */
export interface WidgetsLogger {
    /**
     * Logs informational messages.
     */
    info(message: string, ...args: unknown[]): void;
    /**
     * Logs warning messages.
     */
    warn(message: string, ...args: unknown[]): void;
    /**
     * Logs error messages.
     */
    error(message: string, ...args: unknown[]): void;
}

/**
 * Operating mode preset ('production' or 'development').
 */
export type PluginEnvironmentMode = 'production' | 'development' | 'prod' | 'dev';

/**
 * State and action payload compression codec mode.
 */
export type CodecMode = 'prod' | 'dev' | 'auto' | 'off';

/**
 * Detailed configuration options for the bidirectional codec.
 */
export interface CodecOptions {
    /**
     * Codec operation mode.
     */
    mode?: CodecMode;
    /**
     * Custom dictionary map of long key names to single-letter codes.
     */
    customKeys?: Record<string, string>;
    /**
     * Whether to compress chat_data state (default: true in production).
     */
    compressState?: boolean;
    /**
     * Whether to compress answerWidgetQuery payloads (default: true in production).
     */
    compressAnswer?: boolean;
    /**
     * Whether to decompress action payload keys when handling widget_query.
     */
    decompressActionPayload?: boolean;
    /**
     * Whether to inject client-side decompressor into widget HTML.
     */
    injectClientSnippet?: boolean;
}

/**
 * Codec configuration shortcut (mode string, boolean toggle, or options object).
 */
export type CodecConfig = CodecMode | boolean | CodecOptions;

/**
 * Minification engine strategy ('terser', 'fast', or 'none').
 */
export type MinifierEngine = 'terser' | 'fast' | 'none';

/**
 * Minifier configuration options extending standard HTML/CSS/JS options.
 */
export interface WidgetMinifyConfig extends WidgetMinifyOptions {
    /**
     * Master toggle enabling or disabling minification passes.
     */
    enabled?: boolean;
    /**
     * Selected minifier engine ('fast' or 'none').
     */
    engine?: MinifierEngine;
}

/**
 * Minifier configuration shortcut.
 */
export type MinifierConfig = boolean | MinifierEngine | 'dev' | 'prod' | WidgetMinifyConfig;

/**
 * Detailed options configuring the widget compressed size validator.
 */
export interface SizeLimitOptions {
    /**
     * Maximum allowed size in bytes after deflate compression (default: 4096).
     */
    maxBytes?: number;
    /**
     * Action taken when a widget exceeds maxBytes ('error', 'warn', 'ignore', or callback).
     */
    onExceeded?: 'error' | 'warn' | 'ignore' | ((report: WidgetSizeReport) => void);
    /**
     * Whether to automatically inspect and validate every sent widget.
     */
    autoInspect?: boolean;
}

/**
 * Size limit configuration shortcut (number of bytes or options object).
 */
export type SizeLimitConfig = number | SizeLimitOptions;

/**
 * In-memory storage initialization options shortcut.
 */
export interface StorageOptions {
    /**
     * Default record time-to-live in seconds (default: 86400).
     */
    defaultTtlSeconds?: number;
    /**
     * Maximum allowed records before least-recently-used eviction (default: 10000).
     */
    maxEntries?: number;
}

/**
 * Default parameters applied to all widgets sent by the controller.
 */
export interface WidgetDefaults {
    /**
     * Default widget width in pixels.
     */
    width?: number;
    /**
     * Default widget height in pixels.
     */
    height?: number;
    /**
     * Default allow_queries setting.
     */
    allowQueries?: boolean;
    /**
     * Default caption parse mode.
     */
    parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML' | string;
}

/**
 * Fully resolved plugin configuration object used during runtime execution.
 */
export interface ResolvedPluginConfig {
    /**
     * Active environment mode ('prod' or 'dev').
     */
    mode: 'prod' | 'dev';
    /**
     * Resolved codec settings.
     */
    codec: {
        /**
         * Whether the codec is active.
         */
        enabled: boolean;
        /**
         * Codec mode.
         */
        mode: 'prod' | 'dev';
        /**
         * Custom key map.
         */
        customKeys?: Record<string, string>;
        /**
         * Custom reverse key map.
         */
        customReverseKeys?: Record<string, string>;
        /**
         * State compression toggle.
         */
        compressState: boolean;
        /**
         * Answer compression toggle.
         */
        compressAnswer: boolean;
        /**
         * Payload decompression toggle.
         */
        decompressActionPayload: boolean;
        /**
         * Client snippet injection toggle.
         */
        injectClientSnippet: boolean;
    };
    /**
     * Resolved minifier settings.
     */
    minifier: {
        /**
         * Minification toggle.
         */
        enabled: boolean;
        /**
         * Minification engine.
         */
        engine: MinifierEngine;
        /**
         * Granular options.
         */
        options: WidgetMinifyOptions;
    };
    /**
     * Resolved size limit settings.
     */
    sizeLimit: {
        /**
         * Max deflate bytes ceiling.
         */
        maxBytes: number;
        /**
         * Overflow handling policy.
         */
        onExceeded: 'error' | 'warn' | 'ignore' | ((report: WidgetSizeReport) => void);
        /**
         * Auto-inspection toggle.
         */
        autoInspect: boolean;
    };
    /**
     * Default delivery options.
     */
    defaults: WidgetDefaults;
    /**
     * Debug mode flag.
     */
    debug: boolean;
}

/**
 * Raw Telegram widget_query update payload schema.
 */
export interface TelegramWidgetQueryPayload {
    /**
     * Unique query ID.
     */
    id: string;
    /**
     * Originating user.
     */
    from: {
        /**
         * Telegram user ID.
         */
        id: number;
        /**
         * First name.
         */
        first_name: string;
        /**
         * Optional last name.
         */
        last_name?: string;
        /**
         * Optional username.
         */
        username?: string;
        /**
         * Premium status.
         */
        is_premium?: boolean;
        /**
         * Language code.
         */
        language_code?: string;
    };
    /**
     * Target chat if sent as regular message.
     */
    chat?: {
        /**
         * Chat ID.
         */
        id: number;
        /**
         * Chat type.
         */
        type: string;
        /**
         * Title.
         */
        title?: string;
        /**
         * Username.
         */
        username?: string;
    };
    /**
     * Target message metadata.
     */
    message?: {
        /**
         * Message ID.
         */
        message_id: number;
        /**
         * Embedded chat.
         */
        chat?: {
            /**
             * Chat ID.
             */
            id: number;
            /**
             * Chat type.
             */
            type: string;
            /**
             * Title.
             */
            title?: string;
            /**
             * Username.
             */
            username?: string;
        };
    };
    /**
     * Message ID shortcut.
     */
    message_id?: number;
    /**
     * Inline message ID if dispatched from inline query.
     */
    inline_message_id?: string;
    /**
     * Chat instance string.
     */
    chat_instance: string;
    /**
     * Chat type context string.
     */
    chat_type?: 'sender' | 'private' | 'group' | 'supergroup' | 'channel' | string;
    /**
     * Raw type discriminator.
     */
    type?: unknown;
    /**
     * Action data string (1-64 bytes UTF-8).
     */
    data?: string;
}

/**
 * Options configuring the `createTelegramWidgetsPlugin` factory.
 */
export interface CreateWidgetsPluginOptions<TScreens extends Record<string, AnyWidgetScreen>> {
    /**
     * Map of registered screen definitions available to the bot.
     */
    screens: TScreens;
    /**
     * Operating environment preset ('production' or 'development').
     */
    mode?: PluginEnvironmentMode;
    /**
     * Codec compression configuration.
     */
    codec?: CodecConfig;
    /**
     * HTML/CSS/JS minification configuration.
     */
    minifier?: MinifierConfig;
    /**
     * Deflate size limit configuration.
     */
    sizeLimit?: SizeLimitConfig;
    /**
     * Pluggable state storage instance or in-memory storage options.
     */
    storage?: WidgetsStorage | StorageOptions;
    /**
     * Logger destination or preset ('silent', 'debug', or boolean).
     */
    logger?: WidgetsLogger | 'silent' | 'debug' | 'verbose' | boolean;
    /**
     * Enables detailed console debug output.
     */
    debug?: boolean;
    /**
     * Default delivery options for widgets.
     */
    defaults?: WidgetDefaults;
}

/**
 * Return type of `createTelegramWidgetsPlugin`, containing the middleware and controllers.
 */
export interface TelegramWidgetsPluginReturn<TScreens extends Record<string, AnyWidgetScreen>> {
    /**
     * grammY middleware function to install via `bot.use()`.
     */
    middleware: MiddlewareFn<Context & WidgetsFlavor<TScreens>>;
    /**
     * Map of registered screen definitions.
     */
    screens: TScreens;
    /**
     * Active state storage backend instance.
     */
    storage: WidgetsStorage;
    /**
     * Fully resolved plugin configuration.
     */
    config: ResolvedPluginConfig;
}
