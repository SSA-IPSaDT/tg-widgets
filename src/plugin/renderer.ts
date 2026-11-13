import { CLIENT_CODEC_SNIPPET } from '../codec';
import { inspectWidgetSize, type WidgetSizeReport } from '../jsx';
import { minifyHtml, minifyHtmlSync } from '../minifier';
import type { MinifierConfig, ResolvedPluginConfig, SizeLimitConfig, WidgetsLogger } from './types';

/**
 * Renders markup according to configured minification and snippet settings.
 */
export const renderHtml = async (
    rawMarkup: string,
    config: ResolvedPluginConfig,
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
        } else if (overrideMinifier === 'none' || overrideMinifier === 'dev') {
            isMinifyEnabled = false;
            engine = 'none';
        } else if (overrideMinifier === 'fast') {
            isMinifyEnabled = true;
            engine = 'fast';
        } else if (overrideMinifier === 'terser' || overrideMinifier === 'prod') {
            isMinifyEnabled = true;
            engine = 'terser';
        } else if (typeof overrideMinifier === 'object') {
            isMinifyEnabled = overrideMinifier.enabled ?? true;
            engine = overrideMinifier.engine ?? (isMinifyEnabled ? 'terser' : 'none');
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
export const validateSize = (
    screenId: string,
    finalHtml: string,
    config: ResolvedPluginConfig,
    logger: WidgetsLogger,
    overrideSizeLimit?: SizeLimitConfig,
): WidgetSizeReport => {
    let maxBytes = config.sizeLimit.maxBytes;
    let onExceeded = config.sizeLimit.onExceeded;
    let autoInspect = config.sizeLimit.autoInspect;

    if (typeof overrideSizeLimit === 'number') {
        maxBytes = overrideSizeLimit;
    } else if (typeof overrideSizeLimit === 'object' && overrideSizeLimit !== null) {
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
        const pct = ((report.compressedByteLength / maxBytes) * 100).toFixed(1);
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
