import { Buffer } from 'node:buffer';
import { deflateSync } from 'node:zlib';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            [elemName: string]: Record<string, unknown>;
        }
        type Element = string;
    }
}

const VOID_TAGS = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
]);

const UNITLESS_PROPS = new Set([
    'opacity',
    'zIndex',
    'fontWeight',
    'lineHeight',
    'flex',
    'flexGrow',
    'flexShrink',
    'order',
]);

const toKebab = (prop: string): string =>
    prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

export const formatStyle = (
    style: Record<string, string | number | undefined | null>,
): string => {
    return Object.entries(style)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => {
            const rawVal =
                typeof v === 'number' && !UNITLESS_PROPS.has(k)
                    ? `${v}px`
                    : String(v);
            const val = rawVal.replace(/"/g, "'");
            return `${toKebab(k)}:${val}`;
        })
        .join(';');
};

export const h = (
    tag: string | ((props: Record<string, unknown>) => string),
    props: Record<string, unknown> | null,
    ...children: unknown[]
): string => {
    if (typeof tag === 'function') {
        const allChildren =
            children.length > 0
                ? children
                : props && 'children' in props
                  ? [props.children]
                  : [];
        return tag({ ...(props ?? {}), children: allChildren });
    }

    const attrs = props
        ? Object.entries(props)
              .filter(
                  ([k, v]) => k !== 'children' && v !== undefined && v !== null,
              )
              .map(([k, v]) => {
                  const attrName = k === 'className' ? 'class' : k;
                  if (typeof v === 'boolean') {
                      return v ? ` ${attrName}` : '';
                  }
                  if (
                      attrName === 'style' &&
                      typeof v === 'object' &&
                      v !== null
                  ) {
                      const css = formatStyle(
                          v as Record<
                              string,
                              string | number | undefined | null
                          >,
                      );
                      return css ? ` style="${css}"` : '';
                  }
                  return ` ${attrName}="${String(v)}"`;
              })
              .join('')
        : '';

    const allChildren =
        children.length > 0
            ? children
            : props && 'children' in props
              ? [props.children]
              : [];

    const content = allChildren
        .flat(Infinity)
        .filter((c) => c !== null && c !== undefined && c !== false)
        .join('');

    if (VOID_TAGS.has(tag)) {
        return `<${tag}${attrs} />`;
    }

    return `<${tag}${attrs}>${content}</${tag}>`;
};

export const Fragment = (props: { children?: unknown[] }): string => {
    const children = props.children ?? [];
    return children.flat(Infinity).join('');
};

import { minifyHtml, minifyHtmlSync } from './minifier';

export interface WidgetRenderOptions {
    /**
     * Включает агрессивную минификацию HTML и CSS (по умолчанию true)
     */
    minify?: boolean;
}

export interface WidgetSizeReport {
    html: string;
    byteLength: number;
    compressedByteLength: number;
    isValid: boolean;
    maxAllowed: number;
}

/**
 * Синхронная проверка размера HTML-разметки виджета в сжатом виде (deflate level 9)
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
 * Промышленная асинхронная проверка размера HTML-разметки виджета через `html-minifier-terser` (CleanCSS + Terser)
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
 * Синхронный рендер TSX в чистый HTML-документ виджета Telegram
 */
export const renderWidget = (
    bodyContent: string,
    options: WidgetRenderOptions = {},
): string => {
    const report = inspectWidgetSize(bodyContent, options);

    if (!report.isValid) {
        console.warn(
            `⚠️ [telegram-widgets] Widget compressed size (${report.compressedByteLength} B) exceeds Telegram limit of 4096 B!`,
        );
    }

    return report.html;
};

/**
 * Промышленный асинхронный рендер виджета с глубокой минификацией через `html-minifier-terser`
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

// Функции для автоматического рантайма react-jsx
export const jsx = (
    tag: string | ((props: Record<string, unknown>) => string),
    props: Record<string, unknown> | null,
): string => {
    return h(tag, props);
};

export const jsxs = jsx;
export const jsxDEV = jsx;
