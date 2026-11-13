import { registerCodecKeys } from '../codec';
import type { WidgetSizeReport } from '../jsx';
import { DEFAULT_MINIFY_OPTIONS, type WidgetMinifyOptions } from '../minifier';
import type { AnyWidgetScreen } from '../screen';
import type {
    CodecMode,
    CreateWidgetsPluginOptions,
    MinifierEngine,
    ResolvedPluginConfig,
} from './types';

export * from './resolvers';

export const resolvePluginConfig = (
    options: CreateWidgetsPluginOptions<Record<string, AnyWidgetScreen>>,
): ResolvedPluginConfig => {
    const isExplicitProd = options.mode === 'prod' || options.mode === 'production';
    const isExplicitDev = options.mode === 'dev' || options.mode === 'development';
    const isProd = isExplicitProd || (!isExplicitDev && process.env.NODE_ENV === 'production');

    const resolvedMode: 'prod' | 'dev' = isProd ? 'prod' : 'dev';
    const debug = Boolean(
        options.debug ||
        options.logger === 'debug' ||
        options.logger === 'verbose' ||
        options.logger === true,
    );

    // 1. Resolve Codec settings (disabled by default for clean transparent JSON)
    let codecMode: CodecMode;
    let customKeys: Record<string, string> | undefined;
    let customReverseKeys: Record<string, string> | undefined;

    if (typeof options.codec === 'string') {
        codecMode = options.codec;
    } else if (typeof options.codec === 'boolean') {
        codecMode = options.codec ? 'prod' : 'dev';
    } else if (typeof options.codec === 'object' && options.codec !== null) {
        codecMode = options.codec.mode === 'prod' ? 'prod' : 'dev';

        customKeys = options.codec.customKeys;
        if (customKeys) {
            registerCodecKeys(customKeys);
            customReverseKeys = Object.fromEntries(
                Object.entries(customKeys).map(([k, v]) => [v, k]),
            );
        }
    } else {
        codecMode = 'dev';
    }

    const isCodecActive = codecMode === 'prod';
    const compressState =
        typeof options.codec === 'object' && options.codec?.compressState !== undefined
            ? Boolean(options.codec.compressState)
            : isCodecActive;

    const compressAnswer =
        typeof options.codec === 'object' && options.codec?.compressAnswer !== undefined
            ? Boolean(options.codec.compressAnswer)
            : isCodecActive;

    const decompressActionPayload =
        typeof options.codec === 'object' && options.codec?.decompressActionPayload !== undefined
            ? Boolean(options.codec.decompressActionPayload)
            : isCodecActive;

    const injectClientSnippet =
        typeof options.codec === 'object' ? Boolean(options.codec.injectClientSnippet) : false;

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
    } else if (options.minifier === 'terser' || options.minifier === 'prod') {
        minifierEnabled = true;
        minifierEngine = 'terser';
    } else if (options.minifier === 'dev') {
        minifierEnabled = false;
        minifierEngine = 'none';
    } else if (typeof options.minifier === 'object' && options.minifier !== null) {
        minifierEnabled = options.minifier.enabled ?? true;
        minifierEngine = options.minifier.engine ?? (minifierEnabled ? 'terser' : 'none');
        minifierOptions = {
            ...DEFAULT_MINIFY_OPTIONS,
            ...options.minifier,
        };
    } else {
        minifierEnabled = !isExplicitDev;
        minifierEngine = isExplicitDev ? 'none' : 'terser';
    }

    // 3. Resolve Size Limit settings
    let maxBytes = 4096;
    let onExceeded: 'error' | 'warn' | 'ignore' | ((report: WidgetSizeReport) => void) =
        resolvedMode === 'prod' ? 'error' : 'warn';
    let autoInspect = debug;

    if (typeof options.sizeLimit === 'number') {
        maxBytes = options.sizeLimit;
    } else if (typeof options.sizeLimit === 'object' && options.sizeLimit !== null) {
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
