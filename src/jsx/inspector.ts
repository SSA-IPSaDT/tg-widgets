import { Buffer } from 'node:buffer';
import { deflateSync } from 'node:zlib';
import { minifyHtml, minifyHtmlSync } from '../minifier';
import type { WidgetRenderOptions, WidgetSizeReport } from './types';

/**
 * Synchronous inspector for calculating deflate compression size (level 9) of widget HTML.
 *
 * @param html Raw HTML markup.
 * @param options Render and minification options.
 * @returns Size inspection report.
 */
export const inspectWidgetSize = (
    html: string,
    options: WidgetRenderOptions = {},
): WidgetSizeReport => {
    const shouldMinify = options.minify !== false;
    const processedBody = shouldMinify ? minifyHtmlSync(html) : html;

    const fullHtml = processedBody.startsWith('<!DOCTYPE html>')
        ? processedBody
        : `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>${processedBody}</body></html>`;

    const finalHtml = shouldMinify ? minifyHtmlSync(fullHtml) : fullHtml;
    const buf = Buffer.from(finalHtml, 'utf-8');
    const compressed = deflateSync(buf, { level: 9 });
    const maxAllowed = 4096;

    return {
        html: finalHtml,
        byteLength: buf.byteLength,
        compressedByteLength: compressed.byteLength,
        isValid: compressed.byteLength <= maxAllowed,
        maxAllowed,
    };
};

/**
 * Asynchronous production inspector utilizing `html-minifier-terser` (CleanCSS + Terser).
 *
 * @param html Raw HTML markup.
 * @param options Render and minification options.
 * @returns Size inspection report.
 */
export const inspectWidgetSizeAsync = async (
    html: string,
    options: WidgetRenderOptions = {},
): Promise<WidgetSizeReport> => {
    const shouldMinify = options.minify !== false;
    const rawHtml = html.startsWith('<!DOCTYPE html>')
        ? html
        : `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>${html}</body></html>`;

    const finalHtml = shouldMinify ? await minifyHtml(rawHtml) : rawHtml;
    const buf = Buffer.from(finalHtml, 'utf-8');
    const compressed = deflateSync(buf, { level: 9 });
    const maxAllowed = 4096;

    return {
        html: finalHtml,
        byteLength: buf.byteLength,
        compressedByteLength: compressed.byteLength,
        isValid: compressed.byteLength <= maxAllowed,
        maxAllowed,
    };
};

/**
 * Synchronously renders TSX markup into a minified, valid Telegram Widget HTML document.
 *
 * @param bodyContent JSX markup or HTML content.
 * @param options Render and minification options.
 * @returns Complete HTML document string.
 */
export const renderWidget = (bodyContent: string, options: WidgetRenderOptions = {}): string => {
    const report = inspectWidgetSize(bodyContent, options);

    if (!report.isValid) {
        console.warn(
            `⚠️ [telegram-widgets] Widget compressed size (${report.compressedByteLength} B) exceeds Telegram limit of 4096 B!`,
        );
    }

    return report.html;
};

/**
 * Asynchronously renders TSX markup with industrial minification via `html-minifier-terser`.
 *
 * @param bodyContent JSX markup or HTML content.
 * @param options Render and minification options.
 * @returns Complete HTML document string.
 */
export const renderWidgetAsync = async (
    bodyContent: string,
    options: WidgetRenderOptions = {},
): Promise<string> => {
    const report = await inspectWidgetSizeAsync(bodyContent, options);

    if (!report.isValid) {
        console.warn(
            `⚠️ [telegram-widgets] Widget compressed size (${report.compressedByteLength} B) exceeds Telegram limit of 4096 B!`,
        );
    }

    return report.html;
};

export const renderBubble = renderWidget;
export const renderBubbleAsync = renderWidgetAsync;
