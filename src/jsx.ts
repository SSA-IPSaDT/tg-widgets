import { Buffer } from 'node:buffer';
import { deflateSync } from 'node:zlib';
import { minifyHtml, minifyHtmlSync } from './minifier';

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

/**
 * Formats a CSS style object into a minified inline CSS string.
 *
 * @param style Style property key-value map.
 * @returns Minified inline CSS string.
 */
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

/**
 * JSX factory function for building lightweight HTML strings.
 *
 * @param tag HTML tag name or functional component.
 * @param props Component or element properties.
 * @param children Child elements or text.
 * @returns Rendered HTML string.
 */
export const h = (
    tag: string | ((props: Record<string, unknown>) => string),
    props: Record<string, unknown> | null,
    ...children: unknown[]
): string => {
    if (typeof tag === 'function') {
        const rawChildren =
            children.length > 0
                ? children
                : props && 'children' in props && props.children !== undefined
                  ? Array.isArray(props.children)
                      ? props.children
                      : [props.children]
                  : [];
        const flatChildren = rawChildren
            .flat(Infinity)
            .filter((c) => c !== null && c !== undefined && c !== false && c !== '');
        const componentProps = { ...(props ?? {}) };
        if (flatChildren.length > 0) {
            componentProps.children = flatChildren;
        } else {
            delete componentProps.children;
        }
        return tag(componentProps);
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

/**
 * JSX Fragment helper that concatenates children without an extra wrapper element.
 */
export const Fragment = (props: { children?: unknown[] }): string => {
    const children = props.children ?? [];
    return children.flat(Infinity).join('');
};

export interface WidgetRenderOptions {
    /**
     * Enables aggressive HTML and CSS minification (default: true).
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

/**
 * @deprecated Use `renderWidget` instead. Kept for backwards compatibility.
 */
export const renderBubble = renderWidget;

/**
 * @deprecated Use `renderWidgetAsync` instead. Kept for backwards compatibility.
 */
export const renderBubbleAsync = renderWidgetAsync;

// Handlers for automatic react-jsx runtime
export const jsx = (
    tag: string | ((props: Record<string, unknown>) => string),
    props: Record<string, unknown> | null,
): string => {
    return h(tag, props);
};

export const jsxs = jsx;
export const jsxDEV = jsx;
