import { deflateSync } from 'node:zlib';
import type { Context, MiddlewareFn } from 'grammy';

import { decodeWidgetAction } from './action';
import {
    CLIENT_CODEC_SNIPPET,
    packPayload,
    packState,
    registerCodecKeys,
    unpackState,
} from './codec';
import {
    inspectWidgetSize,
    inspectWidgetSizeAsync,
    type WidgetSizeReport,
} from './jsx';
import {
    DEFAULT_MINIFY_OPTIONS,
    minifyHtml,
    minifyHtmlSync,
    type WidgetMinifyOptions,
} from './minifier';
import {
    getWidgetScreenType,
    type AnyWidgetScreen,
    type RawWidgetApiMethods,
    type WidgetActionContext,
} from './screen';
import { MemoryWidgetsStorage, type WidgetsStorage } from './storage';

export interface WidgetsLogger {
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
}

const defaultLogger: WidgetsLogger = {
    info: (msg, ...args) => console.log(`[telegram-widgets] ${msg}`, ...args),
    warn: (msg, ...args) => console.warn(`[telegram-widgets] ${msg}`, ...args),
    error: (msg, ...args) =>
        console.error(`[telegram-widgets] ${msg}`, ...args),
};

/**
 * Global execution mode preset for the Telegram Widgets plugin.
 * - 'prod' | 'production': Optimized for minimal byte sizes, full Terser minification, CSS purging, and strict limit checks.
 * - 'dev' | 'development': Optimized for readability, developer ergonomics, uncompressed JSON states, and non-blocking warnings.
 */
export type PluginEnvironmentMode =
    | 'production'
    | 'development'
    | 'prod'
    | 'dev';

/**
 * Codec compression mode.
 */
export type CodecMode = 'prod' | 'dev' | 'auto' | 'off';

/**
 * Detailed configuration for the bidirectional object key compression codec.
 */
export interface CodecOptions {
    /**
     * Codec compression mode:
     * - 'prod': Compresses object keys down to single letters (e.g. notifications -> o, __screen -> _s)
     * - 'dev' | 'off': Disables key minification, keeping full property names for easier debugging
     * - 'auto': Uses 'prod' in production mode, 'dev' otherwise
     *
     * @default 'auto'
     */
    mode?: CodecMode;

    /**
     * Custom key mapping dictionary to register domain-specific fields.
     * @example { transactionHash: 'tx', recipientId: 'rc' }
     */
    customKeys?: Record<string, string>;

    /**
     * Whether to compress chat_data state (default: true when codec mode is 'prod').
     */
    compressState?: boolean;

    /**
     * Whether to compress action responses returned from answerWidgetQuery (default: true when codec mode is 'prod').
     */
    compressAnswer?: boolean;

    /**
     * Whether to decompress incoming action payloads from query.data (default: true).
     */
    decompressActionPayload?: boolean;

    /**
     * Automatically inject CLIENT_CODEC_SNIPPET into widget HTML to provide window.packState / window.unpackState (default: false).
     */
    injectClientSnippet?: boolean;
}

export type CodecConfig = CodecMode | boolean | CodecOptions;

/**
 * Minification engine choice.
 */
export type MinifierEngine = 'terser' | 'fast' | 'none';

/**
 * Detailed HTML, CSS, and JS minification configuration.
 */
export interface WidgetMinifyConfig extends WidgetMinifyOptions {
    /**
     * Whether HTML/CSS minification is enabled (default: true in prod, false in dev).
     */
    enabled?: boolean;

    /**
     * Minification engine:
     * - 'terser': Full production minification via html-minifier-terser (CleanCSS + Terser).
     * - 'fast': Synchronous regex-based minifier (collapses whitespace, purges CSS, removes comments).
     * - 'none': Disables minification.
     */
    engine?: MinifierEngine;
}

export type MinifierConfig =
    | boolean
    | MinifierEngine
    | 'dev'
    | 'prod'
    | WidgetMinifyConfig;

/**
 * Configuration for validating payload byte limits against Telegram's 4096-byte deflate constraint.
 */
export interface SizeLimitOptions {
    /**
     * Maximum allowed deflate-compressed payload in bytes (default: 4096).
     */
    maxBytes?: number;

    /**
     * Behavior when the widget exceeds the maximum payload limit:
     * - 'error': Throws an error preventing sending the oversized widget to Telegram.
     * - 'warn': Logs a warning but proceeds with sending.
     * - 'ignore': Silently ignores size violations.
     * Default: 'error' in prod, 'warn' in dev.
     */
    onExceeded?:
        | 'error'
        | 'warn'
        | 'ignore'
        | ((report: WidgetSizeReport) => void);

    /**
     * Log size metrics on every send / render (default: false in prod, true in dev).
     */
    autoInspect?: boolean;
}

export type SizeLimitConfig = number | SizeLimitOptions;

/**
 * Storage configuration shortcuts for in-memory LRU/TTL storage.
 */
export interface StorageOptions {
    /**
     * Default time-to-live for widget states in seconds (default: 86400 = 24 hours).
     */
    defaultTtlSeconds?: number;

    /**
     * Maximum entries to keep in memory before LRU eviction (default: 1000).
     */
    maxEntries?: number;
}

/**
 * Default parameters applied to all sent widgets unless explicitly overridden.
 */
export interface WidgetDefaults {
    /**
     * Default width for sent widgets (Telegram allows 1 to 3).
     */
    width?: number;

    /**
     * Default height for sent widgets (Telegram allows 1 to 3).
     */
    height?: number;

    /**
     * Default allowQueries flag (default: true).
     */
    allowQueries?: boolean;

    /**
     * Default parseMode for captions ('Markdown' | 'HTML' | 'MarkdownV2').
     */
    parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML' | string;
}

/**
 * Fully resolved plugin configuration.
 */
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
        onExceeded:
            | 'error'
            | 'warn'
            | 'ignore'
            | ((report: WidgetSizeReport) => void);
        autoInspect: boolean;
    };
    defaults: WidgetDefaults;
    debug: boolean;
}

/**
 * Payload structure of incoming `update.widget_query` in Telegram Bot API 10.4.
 */
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
    message_id?: number;
    inline_message_id?: string;
    chat_instance: string;
    chat_type?:
        | 'sender'
        | 'private'
        | 'group'
        | 'supergroup'
        | 'channel'
        | string;
    type?: unknown;
    data?: string;
}

export interface SendWidgetOptions<TProps> {
    chatId?: number | string;
    props?: TProps;
    messageThreadId?: number;
    width?: number;
    height?: number;
    caption?: string;
    captionEntities?: unknown[];
    parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML' | string;
    parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML' | string;
    publicData?: string;
    replyMarkup?: unknown;
    allowQueries?: boolean;
    isShared?: boolean;
    replyParameters?: { message_id: number; [key: string]: unknown };

    /**
     * Override minifier settings for this specific send call.
     */
    minifier?: MinifierConfig;

    /**
     * Override whether chat_data state is compressed for this specific send call.
     */
    compressState?: boolean;

    /**
     * Override size limit validation for this specific send call.
     */
    sizeLimit?: SizeLimitConfig;

    /**
     * Explicitly skip state storage allocation (automatically skipped for static and client-only screens).
     */
    skipStorage?: boolean;
}

export type SendBubbleOptions<TProps> = SendWidgetOptions<TProps>;

export interface UpdateWidgetOptions<TProps> {
    chatId?: number | string;
    props?: TProps;
    state?: Record<string, unknown>;
    compressState?: boolean;
}

export interface WidgetsController<
    TScreens extends Record<string, AnyWidgetScreen>,
> {
    /**
     * Sends a rendered widget message to the specified (or current) chat.
     */
    send: <K extends keyof TScreens & string>(
        screenId: K,
        options: SendWidgetOptions<Parameters<TScreens[K]['component']>[0]>,
    ) => Promise<{ message_id: number; [key: string]: unknown }>;

    /**
     * Replies with a widget to the current message in the chat context.
     */
    reply: <K extends keyof TScreens & string>(
        screenId: K,
        options: SendWidgetOptions<Parameters<TScreens[K]['component']>[0]>,
    ) => Promise<{ message_id: number; [key: string]: unknown }>;

    /**
     * Synchronously renders and inspects the compressed deflate size of a widget screen without sending.
     */
    render: <K extends keyof TScreens & string>(
        screenId: K,
        props: Parameters<TScreens[K]['component']>[0],
    ) => WidgetSizeReport;

    /**
     * Asynchronously renders and inspects the compressed size with deep minification via html-minifier-terser.
     */
    renderAsync: <K extends keyof TScreens & string>(
        screenId: K,
        props: Parameters<TScreens[K]['component']>[0],
    ) => Promise<WidgetSizeReport>;

    /**
     * Updates the chat_data state of an existing sent widget message.
     */
    update: <K extends keyof TScreens & string>(
        messageId: number,
        screenId: K,
        options: UpdateWidgetOptions<Parameters<TScreens[K]['component']>[0]>,
    ) => Promise<unknown>;

    /**
     * Returns a registered screen definition by its identifier.
     */
    getScreen: (screenId: string) => AnyWidgetScreen | undefined;

    /**
     * Inspects widget size report for a given screen and props using current plugin minification options.
     */
    inspect: <K extends keyof TScreens & string>(
        screenId: K,
        props: Parameters<TScreens[K]['component']>[0],
        options?: { minifier?: MinifierConfig },
    ) => Promise<WidgetSizeReport>;

    /**
     * Pluggable widget state storage.
     */
    storage: WidgetsStorage;

    /**
     * Readonly resolved configuration of the plugin.
     */
    readonly config: ResolvedPluginConfig;
}

export type BubblesController<
    TScreens extends Record<string, AnyWidgetScreen>,
> = WidgetsController<TScreens>;

export type WidgetsFlavor<TScreens extends Record<string, AnyWidgetScreen>> = {
    widgets: WidgetsController<TScreens>;
    bubbles: WidgetsController<TScreens>;
};

export type BubblesFlavor<TScreens extends Record<string, AnyWidgetScreen>> =
    WidgetsFlavor<TScreens>;

export interface CreateWidgetsPluginOptions<
    TScreens extends Record<string, AnyWidgetScreen>,
> {
    /**
     * Dictionary of widget screens registered in the bot.
     */
    screens: TScreens;

    /**
     * Global environment preset:
     * - 'prod' | 'production': Minimal byte size, full Terser minification, CSS purging, strict 4096B limit checks, and codec key compression.
     * - 'dev' | 'development': Readable HTML, uncompressed JSON states, verbose logging, and non-blocking warnings.
     *
     * @default process.env.NODE_ENV === 'production' ? 'prod' : 'dev'
     */
    mode?: PluginEnvironmentMode;

    /**
     * Codec configuration for compressing object keys in chat_data and action requests:
     * - 'prod': Compress object keys down to single letters.
     * - 'dev' | 'off': Keep full readable property names.
     * - object: Detailed options (`{ mode, customKeys, compressState, compressAnswer }`).
     */
    codec?: CodecConfig;

    /**
     * Minification configuration for widget HTML, embedded CSS, and client JavaScript:
     * - 'terser': Deep async minification with CleanCSS + Terser.
     * - 'fast': Lightweight synchronous whitespace & CSS purge.
     * - false | 'none': Raw unminified HTML.
     * - object: Custom html-minifier-terser options.
     */
    minifier?: MinifierConfig;

    /**
     * Payload size limit validation (Telegram Bot API limit is 4096 bytes deflate level 9):
     * - number: Custom max bytes (e.g. 4096).
     * - object: `{ maxBytes: 4096, onExceeded: 'error' | 'warn' | 'ignore', autoInspect: boolean }`.
     */
    sizeLimit?: SizeLimitConfig;

    /**
     * State storage for widgets:
     * - Instance of `WidgetsStorage` (e.g. MemoryWidgetsStorage, Redis, etc.)
     * - Configuration object: `{ defaultTtlSeconds: 3600, maxEntries: 500 }` to auto-create memory storage.
     */
    storage?: WidgetsStorage | StorageOptions;

    /**
     * Logging configuration:
     * - Custom logger implementation (`info`, `warn`, `error`).
     * - 'silent' or false: Silences all logs.
     * - 'debug' or 'verbose' or true: Enables verbose diagnostic logging.
     */
    logger?: WidgetsLogger | 'silent' | 'debug' | 'verbose' | boolean;

    /**
     * Enable verbose debug logs (convenience shortcut).
     */
    debug?: boolean;

    /**
     * Default parameters applied to all sent widgets (width, height, parseMode, allowQueries).
     */
    defaults?: WidgetDefaults;
}

const getStorageKey = (
    chatId?: number | string,
    messageId?: number,
    inlineMessageId?: string,
): string | undefined => {
    if (inlineMessageId) {
        return `inline:${inlineMessageId}`;
    }
    if (chatId !== undefined && messageId !== undefined) {
        return `${chatId}:${messageId}`;
    }
    return undefined;
};

/**
 * Resolves the user configuration options into a strictly typed ResolvedPluginConfig.
 */
const resolvePluginConfig = (
    options: CreateWidgetsPluginOptions<Record<string, AnyWidgetScreen>>,
): ResolvedPluginConfig => {
    const isExplicitProd =
        options.mode === 'prod' || options.mode === 'production';
    const isExplicitDev =
        options.mode === 'dev' || options.mode === 'development';
    const isProd =
        isExplicitProd ||
        (!isExplicitDev && process.env.NODE_ENV === 'production');

    const resolvedMode: 'prod' | 'dev' = isProd ? 'prod' : 'dev';
    const debug = Boolean(
        options.debug ||
            options.logger === 'debug' ||
            options.logger === 'verbose' ||
            options.logger === true,
    );

    // 1. Resolve Codec settings
    let codecMode: CodecMode;
    let customKeys: Record<string, string> | undefined;
    let customReverseKeys: Record<string, string> | undefined;
    let compressState: boolean;
    let compressAnswer: boolean;
    let decompressActionPayload = true;
    let injectClientSnippet = false;

    if (typeof options.codec === 'string') {
        codecMode = options.codec;
    } else if (typeof options.codec === 'boolean') {
        codecMode = options.codec ? 'prod' : 'dev';
    } else if (typeof options.codec === 'object' && options.codec !== null) {
        codecMode =
            options.codec.mode === 'auto' || !options.codec.mode
                ? isExplicitProd
                    ? 'prod'
                    : 'dev'
                : options.codec.mode;

        customKeys = options.codec.customKeys;
        if (customKeys) {
            registerCodecKeys(customKeys);
            customReverseKeys = Object.fromEntries(
                Object.entries(customKeys).map(([k, v]) => [v, k]),
            );
        }
        decompressActionPayload =
            options.codec.decompressActionPayload !== false;
        injectClientSnippet = Boolean(options.codec.injectClientSnippet);
    } else {
        // Default: only compress if explicitly requested via mode: 'prod'
        codecMode = isExplicitProd ? 'prod' : 'dev';
    }

    const isCodecActive = codecMode === 'prod';
    compressState =
        typeof options.codec === 'object' &&
        options.codec?.compressState !== undefined
            ? options.codec.compressState
            : isCodecActive;

    compressAnswer =
        typeof options.codec === 'object' &&
        options.codec?.compressAnswer !== undefined
            ? options.codec.compressAnswer
            : isCodecActive;

    // 2. Resolve Minifier settings
    let minifierEnabled: boolean;
    let minifierEngine: MinifierEngine;
    let minifierOptions: WidgetMinifyOptions = { ...DEFAULT_MINIFY_OPTIONS };

    if (typeof options.minifier === 'boolean') {
        minifierEnabled = options.minifier;
        minifierEngine = options.minifier ? 'terser' : 'none';
    } else if (options.minifier === 'none') {
        minifierEnabled = false;
        minifierEngine = 'none';
    } else if (options.minifier === 'fast') {
        minifierEnabled = true;
        minifierEngine = 'fast';
    } else if (
        options.minifier === 'terser' ||
        options.minifier === 'prod'
    ) {
        minifierEnabled = true;
        minifierEngine = 'terser';
    } else if (options.minifier === 'dev') {
        minifierEnabled = false;
        minifierEngine = 'none';
    } else if (
        typeof options.minifier === 'object' &&
        options.minifier !== null
    ) {
        minifierEnabled = options.minifier.enabled ?? true;
        minifierEngine =
            options.minifier.engine ??
            (minifierEnabled ? 'terser' : 'none');
        minifierOptions = {
            ...DEFAULT_MINIFY_OPTIONS,
            ...options.minifier,
        };
    } else {
        // Default: if mode === 'dev', disable minification for readability; otherwise enable terser
        if (isExplicitDev) {
            minifierEnabled = false;
            minifierEngine = 'none';
        } else {
            minifierEnabled = true;
            minifierEngine = 'terser';
        }
    }

    // 3. Resolve Size Limit settings
    let maxBytes = 4096;
    let onExceeded:
        | 'error'
        | 'warn'
        | 'ignore'
        | ((report: WidgetSizeReport) => void) =
        resolvedMode === 'prod' ? 'error' : 'warn';
    let autoInspect = debug;

    if (typeof options.sizeLimit === 'number') {
        maxBytes = options.sizeLimit;
    } else if (
        typeof options.sizeLimit === 'object' &&
        options.sizeLimit !== null
    ) {
        if (options.sizeLimit.maxBytes !== undefined) {
            maxBytes = options.sizeLimit.maxBytes;
        }
        if (options.sizeLimit.onExceeded !== undefined) {
            onExceeded = options.sizeLimit.onExceeded;
        }
        if (options.sizeLimit.autoInspect !== undefined) {
            autoInspect = options.sizeLimit.autoInspect;
        }
    }

    return {
        mode: resolvedMode,
        codec: {
            enabled: isCodecActive,
            mode: isCodecActive ? 'prod' : 'dev',
            customKeys,
            customReverseKeys,
            compressState,
            compressAnswer,
            decompressActionPayload,
            injectClientSnippet,
        },
        minifier: {
            enabled: minifierEnabled,
            engine: minifierEngine,
            options: minifierOptions,
        },
        sizeLimit: {
            maxBytes,
            onExceeded,
            autoInspect,
        },
        defaults: options.defaults ?? {},
        debug,
    };
};

export const createTelegramWidgetsPlugin = <
    TScreens extends Record<string, AnyWidgetScreen>,
>(
    options: CreateWidgetsPluginOptions<TScreens>,
): {
    middleware: MiddlewareFn<Context & WidgetsFlavor<TScreens>>;
    screens: TScreens;
    storage: WidgetsStorage;
    config: ResolvedPluginConfig;
} => {
    const config = resolvePluginConfig(
        options as CreateWidgetsPluginOptions<Record<string, AnyWidgetScreen>>,
    );

    // Resolve logger
    let logger: WidgetsLogger;
    if (options.logger === false || options.logger === 'silent') {
        logger = { info: () => {}, warn: () => {}, error: () => {} };
    } else if (
        options.logger === true ||
        options.logger === 'debug' ||
        options.logger === 'verbose' ||
        options.debug === true
    ) {
        logger = {
            info: (msg, ...args) =>
                console.log(`[telegram-widgets:debug] ${msg}`, ...args),
            warn: (msg, ...args) =>
                console.warn(`[telegram-widgets:warn] ${msg}`, ...args),
            error: (msg, ...args) =>
                console.error(`[telegram-widgets:error] ${msg}`, ...args),
        };
    } else if (
        options.logger &&
        typeof options.logger === 'object' &&
        'info' in options.logger
    ) {
        logger = options.logger;
    } else {
        logger = defaultLogger;
    }

    // Resolve storage
    let storage: WidgetsStorage;
    if (
        options.storage &&
        typeof (options.storage as WidgetsStorage).get === 'function'
    ) {
        storage = options.storage as WidgetsStorage;
    } else if (options.storage && typeof options.storage === 'object') {
        const storageOpts = options.storage as StorageOptions;
        storage = new MemoryWidgetsStorage({
            defaultTtlSeconds: storageOpts.defaultTtlSeconds,
            maxEntries: storageOpts.maxEntries,
        });
    } else {
        storage = new MemoryWidgetsStorage();
    }

    const screens = options.screens;
    const screensById = new Map<string, AnyWidgetScreen>();

    for (const [key, screen] of Object.entries(screens)) {
        screensById.set(screen.id, screen);
        if (key !== screen.id) {
            screensById.set(key, screen);
        }
    }

    /**
     * Renders markup according to configured minification and snippet settings.
     */
    const renderHtml = async (
        rawMarkup: string,
        overrideMinifier?: MinifierConfig,
    ): Promise<string> => {
        let html = rawMarkup;
        if (config.codec.injectClientSnippet) {
            const snippetTag = `<script>${CLIENT_CODEC_SNIPPET}</script>`;
            html = html.includes('<body>')
                ? html.replace('<body>', `<body>${snippetTag}`)
                : `${snippetTag}${html}`;
        }

        let isMinifyEnabled = config.minifier.enabled;
        let engine = config.minifier.engine;
        let customOpts = config.minifier.options;

        if (overrideMinifier !== undefined) {
            if (typeof overrideMinifier === 'boolean') {
                isMinifyEnabled = overrideMinifier;
                engine = overrideMinifier ? 'terser' : 'none';
            } else if (
                overrideMinifier === 'none' ||
                overrideMinifier === 'dev'
            ) {
                isMinifyEnabled = false;
                engine = 'none';
            } else if (overrideMinifier === 'fast') {
                isMinifyEnabled = true;
                engine = 'fast';
            } else if (
                overrideMinifier === 'terser' ||
                overrideMinifier === 'prod'
            ) {
                isMinifyEnabled = true;
                engine = 'terser';
            } else if (typeof overrideMinifier === 'object') {
                isMinifyEnabled = overrideMinifier.enabled ?? true;
                engine =
                    overrideMinifier.engine ??
                    (isMinifyEnabled ? 'terser' : 'none');
                customOpts = { ...customOpts, ...overrideMinifier };
            }
        }

        const wrappedHtml = html.startsWith('<!DOCTYPE html>')
            ? html
            : `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>${html}</body></html>`;

        if (!isMinifyEnabled || engine === 'none') {
            return wrappedHtml;
        }
        if (engine === 'fast') {
            return minifyHtmlSync(wrappedHtml, {
                purgeCss: customOpts.purgeCss,
            });
        }
        return minifyHtml(wrappedHtml, customOpts);
    };

    /**
     * Validates deflate compressed size against the maximum limit.
     */
    const validateSize = (
        screenId: string,
        finalHtml: string,
        overrideSizeLimit?: SizeLimitConfig,
    ): WidgetSizeReport => {
        let maxBytes = config.sizeLimit.maxBytes;
        let onExceeded = config.sizeLimit.onExceeded;
        let autoInspect = config.sizeLimit.autoInspect;

        if (typeof overrideSizeLimit === 'number') {
            maxBytes = overrideSizeLimit;
        } else if (
            typeof overrideSizeLimit === 'object' &&
            overrideSizeLimit !== null
        ) {
            if (overrideSizeLimit.maxBytes !== undefined) {
                maxBytes = overrideSizeLimit.maxBytes;
            }
            if (overrideSizeLimit.onExceeded !== undefined) {
                onExceeded = overrideSizeLimit.onExceeded;
            }
            if (overrideSizeLimit.autoInspect !== undefined) {
                autoInspect = overrideSizeLimit.autoInspect;
            }
        }

        const report = inspectWidgetSize(finalHtml, { minify: false });

        if (autoInspect) {
            const pct = (
                (report.compressedByteLength / maxBytes) *
                100
            ).toFixed(1);
            logger.info(
                `Screen "${screenId}" size: ${report.compressedByteLength} / ${maxBytes} B (${pct}%) [raw: ${report.byteLength} B]`,
            );
        }

        if (report.compressedByteLength > maxBytes) {
            const diff = report.compressedByteLength - maxBytes;
            const msg = `[telegram-widgets] Screen "${screenId}" compressed payload (${report.compressedByteLength} B) exceeds maximum limit (${maxBytes} B) by ${diff} B.`;

            if (typeof onExceeded === 'function') {
                onExceeded(report);
            } else if (onExceeded === 'error') {
                throw new Error(msg);
            } else if (onExceeded === 'warn') {
                logger.warn(msg);
            }
        }

        return report;
    };

    const middleware: MiddlewareFn<Context & WidgetsFlavor<TScreens>> = async (
        ctx,
        next,
    ) => {
        const rawApi = ctx.api.raw as unknown as RawWidgetApiMethods;

        const controller: WidgetsController<TScreens> = {
            storage,
            config,

            send: async (screenId, sendOpts) => {
                const screen = screensById.get(screenId);
                if (!screen) {
                    throw new Error(
                        `[telegram-widgets] Screen "${screenId}" not found in registered screens.`,
                    );
                }

                const targetChatId = sendOpts.chatId ?? ctx.chat?.id;
                if (!targetChatId) {
                    throw new Error(
                        `[telegram-widgets] Cannot determine target chat_id to send screen "${screenId}".`,
                    );
                }

                const screenType = getWidgetScreenType(screen);

                // Minifier optimization for static screens:
                // Bypass JavaScript minification pass when rendering static markup with no scripts
                let minifierOverride = sendOpts.minifier;
                if (
                    screenType === 'static' &&
                    minifierOverride === undefined &&
                    config.minifier.options.minifyJS !== false
                ) {
                    minifierOverride = {
                        ...config.minifier.options,
                        minifyJS: false,
                    };
                }

                const rawMarkup = screen.component(sendOpts.props as never);
                const html = await renderHtml(rawMarkup, minifierOverride);

                // Check payload size
                validateSize(screen.id, html, sendOpts.sizeLimit);

                // Determine chat_data based on screen paradigm:
                // - 'dynamic': Full compressed or JSON state
                // - 'client': Optional initial state if defined
                // - 'static': Omitted (undefined) to save bandwidth and bytes
                let chatData: string | undefined = undefined;
                let initState: Record<string, unknown> = {};

                if (screenType === 'dynamic') {
                    initState = (screen.initialState
                        ? screen.initialState(sendOpts.props as never)
                        : {}) as Record<string, unknown>;

                    const shouldCompress =
                        sendOpts.compressState ?? config.codec.compressState;

                    chatData = shouldCompress
                        ? packState(
                              screen.id,
                              initState,
                              config.codec.customKeys,
                          )
                        : JSON.stringify({
                              ...initState,
                              __screen: screen.id,
                          });
                } else if (screenType === 'client' && screen.initialState) {
                    initState = (screen.initialState(
                        sendOpts.props as never,
                    ) ?? {}) as Record<string, unknown>;

                    const shouldCompress =
                        sendOpts.compressState ?? config.codec.compressState;

                    chatData = shouldCompress
                        ? packState(
                              screen.id,
                              initState,
                              config.codec.customKeys,
                          )
                        : JSON.stringify({
                              ...initState,
                              __screen: screen.id,
                          });
                }

                // Queries configuration:
                // - 'dynamic' screens enable queries by default (bidirectional)
                // - 'static' and 'client' screens disable queries by default (purely local)
                const defaultAllowQueries = screenType === 'dynamic';
                const allowQueries =
                    sendOpts.allowQueries ??
                    config.defaults.allowQueries ??
                    defaultAllowQueries;

                const parseMode =
                    sendOpts.parseMode ??
                    sendOpts.parse_mode ??
                    config.defaults.parseMode ??
                    (sendOpts.caption ? 'Markdown' : undefined);

                const result = await rawApi.sendWidget({
                    chat_id: targetChatId,
                    message_thread_id: sendOpts.messageThreadId,
                    html,
                    width: sendOpts.width ?? config.defaults.width,
                    height: sendOpts.height ?? config.defaults.height,
                    chat_data: chatData,
                    public_data: sendOpts.publicData,
                    allow_queries: allowQueries,
                    is_shared: sendOpts.isShared,
                    caption: sendOpts.caption,
                    caption_entities: sendOpts.captionEntities,
                    parse_mode: parseMode,
                    reply_markup: sendOpts.replyMarkup,
                    reply_parameters: sendOpts.replyParameters,
                });

                // Storage allocation:
                // Only persist state for dynamic screens; bypass storage for static and client-only
                const shouldSaveStorage =
                    screenType === 'dynamic' && sendOpts.skipStorage !== true;

                if (
                    shouldSaveStorage &&
                    result &&
                    typeof result.message_id === 'number'
                ) {
                    const storageKey = getStorageKey(
                        targetChatId,
                        result.message_id,
                    );
                    if (storageKey) {
                        await storage.set(storageKey, {
                            screenId: screen.id,
                            state: initState,
                            updatedAt: Date.now(),
                        });
                    }
                }

                if (config.debug) {
                    logger.info(
                        `Sent ${screenType} screen "${screen.id}" to chat ${targetChatId} (msg: ${result?.message_id}, allowQueries: ${allowQueries}, chatData: ${chatData !== undefined ? 'present' : 'omitted'}, storage: ${shouldSaveStorage ? 'saved' : 'skipped'})`,
                    );
                }

                return result;
            },

            reply: async (screenId, sendOpts) => {
                const currentMsgId = ctx.msg?.message_id;
                return controller.send(screenId, {
                    chatId: ctx.chat?.id,
                    ...sendOpts,
                    replyParameters:
                        sendOpts.replyParameters ??
                        (currentMsgId
                            ? { message_id: currentMsgId }
                            : undefined),
                });
            },

            render: (screenId, props) => {
                const screen = screensById.get(screenId);
                if (!screen) {
                    throw new Error(
                        `[telegram-widgets] Screen "${screenId}" not found in registered screens.`,
                    );
                }
                const body = screen.component(props as never);
                return inspectWidgetSize(body);
            },

            renderAsync: async (screenId, props) => {
                const screen = screensById.get(screenId);
                if (!screen) {
                    throw new Error(
                        `[telegram-widgets] Screen "${screenId}" not found in registered screens.`,
                    );
                }
                const body = screen.component(props as never);
                return inspectWidgetSizeAsync(body);
            },

            inspect: async (screenId, props, inspectOpts) => {
                const screen = screensById.get(screenId);
                if (!screen) {
                    throw new Error(
                        `[telegram-widgets] Screen "${screenId}" not found in registered screens.`,
                    );
                }
                const rawMarkup = screen.component(props as never);
                const html = await renderHtml(rawMarkup, inspectOpts?.minifier);
                const buf = Buffer.from(html, 'utf-8');
                const compressed = deflateSync(buf, { level: 9 });
                const maxAllowed = config.sizeLimit.maxBytes;
                return {
                    html,
                    byteLength: buf.byteLength,
                    compressedByteLength: compressed.byteLength,
                    isValid: compressed.byteLength <= maxAllowed,
                    maxAllowed,
                };
            },

            update: async (messageId, screenId, updateOpts) => {
                const screen = screensById.get(screenId);
                if (!screen) {
                    throw new Error(
                        `[telegram-widgets] Screen "${screenId}" not found in registered screens.`,
                    );
                }

                const screenType = getWidgetScreenType(screen);
                if (screenType === 'static') {
                    logger.warn(
                        `[telegram-widgets] Screen "${screenId}" is a static screen without dynamic state. Calling update() on static screens is not recommended.`,
                    );
                }

                const targetChatId = updateOpts.chatId ?? ctx.chat?.id;
                if (!targetChatId) {
                    throw new Error(
                        `[telegram-widgets] Cannot determine target chat_id to update screen "${screenId}".`,
                    );
                }

                const storageKey = getStorageKey(targetChatId, messageId);
                if (!storageKey) {
                    throw new Error(
                        `[telegram-widgets] Cannot resolve storage key for chat ${targetChatId} and message ${messageId}`,
                    );
                }

                const existingRecord = await storage.get(storageKey);
                const currentState =
                    updateOpts.state ??
                    (updateOpts.props && screen.initialState
                        ? (screen.initialState(
                              updateOpts.props as never,
                          ) as Record<string, unknown>)
                        : (existingRecord?.state ?? {}));

                const shouldCompress =
                    updateOpts.compressState ?? config.codec.compressState;

                const chatData = shouldCompress
                    ? packState(
                          screen.id,
                          currentState,
                          config.codec.customKeys,
                      )
                    : JSON.stringify({
                          ...currentState,
                          __screen: screen.id,
                      });

                await storage.set(storageKey, {
                    screenId: screen.id,
                    state: currentState,
                    updatedAt: Date.now(),
                });

                if (config.debug) {
                    logger.info(
                        `Updated screen "${screen.id}" for msg ${messageId} (compressState: ${shouldCompress})`,
                    );
                }

                return rawApi.editMessageWidgetData({
                    chat_id: targetChatId,
                    message_id: messageId,
                    chat_data: chatData,
                });
            },

            getScreen: (screenId: string) => screensById.get(screenId),
        };

        // Support both namespaces: ctx.widgets and ctx.bubbles
        ctx.widgets = controller;
        ctx.bubbles = controller;

        // Process incoming update.widget_query
        const rawUpdate = ctx.update as unknown as
            Record<string, unknown> | undefined;
        if (
            !rawUpdate ||
            typeof rawUpdate !== 'object' ||
            !('widget_query' in rawUpdate)
        ) {
            await next();
            return;
        }

        const query = rawUpdate.widget_query as
            | TelegramWidgetQueryPayload
            | undefined;
        if (!query) {
            await next();
            return;
        }

        const chatId = query.chat?.id;
        const messageId = query.message_id;
        const inlineMessageId = query.inline_message_id;

        const storageKey = getStorageKey(chatId, messageId, inlineMessageId);

        if (config.debug) {
            logger.info(
                `Received widget_query #${query.id} for storageKey: ${storageKey}, data: "${query.data}"`,
            );
        }

        if (!storageKey) {
            logger.warn(
                '[telegram-widgets] Missing chat/message identifier in widget_query.',
            );
            await rawApi.answerWidgetQuery({
                widget_query_id: query.id,
                data: JSON.stringify({ error: 'MISSING_MESSAGE_CONTEXT' }),
            });
            return;
        }

        let registeredRecord = await storage.get(storageKey);

        // Fallback: If not found in storage, attempt to recover screenId and state if embedded in query data
        if (!registeredRecord && query.data && typeof query.data === 'string') {
            if (
                query.data.includes('"_s"') ||
                query.data.includes('"__screen"')
            ) {
                const recovered = unpackState(
                    query.data,
                    config.codec.customReverseKeys,
                );
                if (recovered.screenId) {
                    registeredRecord = {
                        screenId: recovered.screenId,
                        state: recovered.state,
                        updatedAt: Date.now(),
                    };
                }
            }
        }

        if (!registeredRecord) {
            logger.warn(
                `[telegram-widgets] No registered screen found for storage key ${storageKey}. Consider configuring persistent storage.`,
            );
            await rawApi.answerWidgetQuery({
                widget_query_id: query.id,
                data: JSON.stringify({ error: 'SCREEN_NOT_FOUND' }),
            });
            return;
        }

        const screen = screensById.get(registeredRecord.screenId);
        if (!screen) {
            await rawApi.answerWidgetQuery({
                widget_query_id: query.id,
                data: JSON.stringify({ error: 'SCREEN_NOT_FOUND' }),
            });
            return;
        }

        const screenType = getWidgetScreenType(screen);
        if (
            screenType === 'static' ||
            screenType === 'client' ||
            !screen.actions ||
            Object.keys(screen.actions).length === 0
        ) {
            logger.warn(
                `[telegram-widgets] Received widget_query for non-interactive screen "${screen.id}" (type: ${screenType}).`,
            );
            await rawApi.answerWidgetQuery({
                widget_query_id: query.id,
                data: JSON.stringify({ error: 'NON_INTERACTIVE_SCREEN' }),
            });
            return;
        }

        // Parse action name and payload with codec support
        const { action: actionName, payload } = decodeWidgetAction(
            query.data ?? '',
            {
                decompress: config.codec.decompressActionPayload,
                customReverseMap: config.codec.customReverseKeys,
            },
        );

        const actions = (screen.actions ?? {}) as Record<
            string,
            (
                c: WidgetActionContext<Record<string, unknown>>,
                p: unknown,
            ) => unknown
        >;
        const handler = actions[actionName];
        if (!handler) {
            logger.warn(
                `[telegram-widgets] Unhandled action "${actionName}" for screen "${screen.id}".`,
            );
            await rawApi.answerWidgetQuery({
                widget_query_id: query.id,
                data: JSON.stringify({ error: 'UNKNOWN_ACTION' }),
            });
            return;
        }

        let isAnswered = false;
        let currentState = registeredRecord.state;
        let pendingEditPromise: Promise<unknown> | null = null;

        const actionCtx: WidgetActionContext<Record<string, unknown>> = {
            queryId: query.id,
            chatId,
            messageId,
            inlineMessageId,
            chatInstance: query.chat_instance,
            chatType: query.chat_type,
            from: {
                id: query.from.id,
                firstName: query.from.first_name,
                lastName: query.from.last_name,
                username: query.from.username,
                isPremium: query.from.is_premium,
                languageCode: query.from.language_code,
            },
            get state() {
                return currentState;
            },
            setState: async (
                nextState:
                    | Partial<Record<string, unknown>>
                    | Record<string, unknown>,
            ) => {
                const merged = { ...currentState, ...nextState };
                currentState = merged;
                await storage.set(storageKey, {
                    screenId: screen.id,
                    state: merged,
                    updatedAt: Date.now(),
                });

                const chatData = config.codec.compressState
                    ? packState(screen.id, merged, config.codec.customKeys)
                    : JSON.stringify({
                          ...merged,
                          __screen: screen.id,
                      });

                // Launch editMessageWidgetData concurrently so answerWidgetQuery is delivered with minimal latency
                pendingEditPromise = rawApi
                    .editMessageWidgetData({
                        chat_id: chatId,
                        message_id: messageId,
                        inline_message_id: inlineMessageId,
                        chat_data: chatData,
                    })
                    .catch((err) => {
                        const msg = String(err);
                        if (!msg.includes('message is not modified')) {
                            logger.warn(
                                `Failed to editMessageWidgetData for ${storageKey}`,
                                err,
                            );
                        }
                    });
            },
            answer: async (data?: unknown) => {
                isAnswered = true;
                if (data && typeof data === 'object' && 'text' in data) {
                    const notifyText = String(
                        (data as { text: unknown }).text,
                    );
                    const showAlert = Boolean(
                        (data as { show_alert?: boolean }).show_alert,
                    );
                    try {
                        await (rawApi as any).answerCallbackQuery?.({
                            callback_query_id: query.id,
                            text: notifyText,
                            show_alert: showAlert,
                        });
                    } catch {
                        // ignore if query is handled as raw widget_query
                    }
                }
                const responseData = data !== undefined ? data : currentState;
                let serialized: string;
                if (typeof responseData === 'string') {
                    serialized = responseData;
                } else if (
                    config.codec.compressAnswer &&
                    typeof responseData === 'object' &&
                    responseData !== null
                ) {
                    serialized = packPayload(
                        responseData,
                        config.codec.customKeys,
                    );
                } else {
                    serialized = JSON.stringify(responseData);
                }

                if (config.debug) {
                    logger.info(
                        `Answering query #${query.id} with data: ${serialized}`,
                    );
                }

                await rawApi.answerWidgetQuery({
                    widget_query_id: query.id,
                    data: serialized,
                });
            },
            rawApi,
        };

        try {
            const result = await handler(actionCtx, payload);
            if (!isAnswered) {
                await actionCtx.answer(result ?? currentState);
            }
        } catch (error) {
            logger.error(
                `[telegram-widgets] Error executing action "${actionName}" on screen "${screen.id}":`,
                error,
            );
            if (!isAnswered) {
                await actionCtx.answer({ error: 'INTERNAL_ERROR' });
            }
        } finally {
            if (pendingEditPromise) {
                await pendingEditPromise;
            }
        }
    };

    return { middleware, screens, storage, config };
};

export const createWidgetsPlugin = createTelegramWidgetsPlugin;
export const createBubblesPlugin = createTelegramWidgetsPlugin;
