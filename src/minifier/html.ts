/**
 * Telegram Widgets HTML Minifier Engine.
 *
 * Implements high-performance, zero-dependency HTML minification, whitespace collapsing,
 * attribute compaction, and embedded resource orchestration for Telegram HTML widgets.
 *
 * @module minifier/html
 */

import { minifyCssString, purgeUnusedCss } from './css';
import { hoistRepeatedStyles } from './hoist';
import { compactJs } from './js';
import type { CssMinifyOptions, JsMinifyOptions, WidgetMinifyOptions } from './types';

/**
 * Standard default minification options for Telegram Bot API 10.4 HTML widgets.
 */
export const DEFAULT_MINIFY_OPTIONS: WidgetMinifyOptions = {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    collapseBooleanAttributes: true,
    purgeCss: true,
    hoistStyles: false,
    minifyCSS: true,
    minifyJS: true,
};

/**
 * Synchronously minifies HTML markup, embedded CSS stylesheets, and client JavaScript.
 *
 * @param html Raw HTML markup.
 * @param options Minification options.
 * @returns Fully minified, safe HTML string.
 */
export const minifyHtmlSync = (html: string, options?: WidgetMinifyOptions): string => {
    if (!html || typeof html !== 'string') return '';

    const opts: WidgetMinifyOptions = {
        ...DEFAULT_MINIFY_OPTIONS,
        ...options,
    };

    let processed = html;

    // 1. Hoist repeated inline styles if enabled
    if (opts.hoistStyles) {
        processed = hoistRepeatedStyles(processed);
    }

    // 2. CSS Purging & Minification
    if (opts.purgeCss) {
        const cssOpts: CssMinifyOptions = typeof opts.minifyCSS === 'object' ? opts.minifyCSS : {};
        processed = purgeUnusedCss(processed, cssOpts);
    } else if (opts.minifyCSS) {
        const cssOpts: CssMinifyOptions = typeof opts.minifyCSS === 'object' ? opts.minifyCSS : {};
        processed = processed.replace(
            /<style([^>]*)>([\s\S]*?)<\/style>/gi,
            (_, attrs, css) => `<style${attrs}>${minifyCssString(css, cssOpts)}</style>`,
        );
    }

    // 3. Compact embedded <script> tags
    if (opts.minifyJS !== false) {
        const jsOpts: JsMinifyOptions = typeof opts.minifyJS === 'object' ? opts.minifyJS : {};
        processed = processed.replace(
            /<script([^>]*)>([\s\S]*?)<\/script>/gi,
            (_, attrs, js) => `<script${attrs}>${compactJs(js, jsOpts)}</script>`,
        );
    }

    // 4. Minify inline style attributes
    if (opts.minifyCSS !== false) {
        processed = processed.replace(/style=(["'])(.*?)\1/gi, (_, quote, styleVal) => {
            const minifiedStyle = minifyCssString(styleVal);
            return `style=${quote}${minifiedStyle}${quote}`;
        });
    }

    // 5. Remove standard HTML comments (preserves IE conditional comments)
    if (opts.removeComments) {
        processed = processed.replace(/<!--(?!\s*(?:\[if [^\]]+]|<!|>))(?:(?!-->)[\s\S])*-->/g, '');
    }

    // 6. Remove redundant attributes (e.g. type="text/javascript", type="text/css", SVG xmlns)
    if (opts.removeRedundantAttributes) {
        processed = processed
            .replace(/\s*type=["']text\/(?:javascript|css)["']/gi, '')
            .replace(/\s*xmlns=["']http:\/\/www\.w3\.org\/2000\/svg["']/gi, '');
    }

    // 7. Collapse boolean attributes (e.g. disabled="disabled" -> disabled)
    if (opts.collapseBooleanAttributes) {
        processed = processed.replace(
            /\b(disabled|checked|readonly|required|multiple|selected|autofocus|novalidate|defer|async)=["']\1["']/gi,
            '$1',
        );
    }

    // 8. Collapse inter-tag whitespace and consecutive spaces
    if (opts.collapseWhitespace) {
        processed = processed
            .replace(/>\s+</g, '><')
            .replace(/^\s+|\s+$/gm, '')
            .replace(/[ \t]{2,}/g, ' ')
            .trim();
    }

    return processed;
};

/**
 * Asynchronously minifies HTML markup. Designed as a drop-in replacement
 * for Terser-based pipelines while guaranteeing zero dependencies and sub-millisecond execution.
 *
 * @param html Raw HTML markup.
 * @param options Minification options.
 * @returns Promise resolving to the minified HTML string.
 */
export const minifyHtml = async (html: string, options?: WidgetMinifyOptions): Promise<string> => {
    return minifyHtmlSync(html, options);
};
