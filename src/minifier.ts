import { minify as terserMinify, type Options as HtmlMinifierOptions } from 'html-minifier-terser';
import { hoistRepeatedStyles, purgeUnusedCss } from './minifier-css';

export interface WidgetMinifyOptions extends HtmlMinifierOptions {
    /**
     * Enables automatic purging of unused CSS rules from `<style>` tags (default: true).
     */
    purgeCss?: boolean;
    /**
     * Automatically hoists repeated inline style attributes into compact CSS classes (default: false).
     */
    hoistStyles?: boolean;
}

export type { HtmlMinifierOptions };
export { purgeUnusedCss, hoistRepeatedStyles } from './minifier-css';

/**
 * Optimal default minification settings for Telegram Bot API 10.4 widgets.
 */
export const DEFAULT_MINIFY_OPTIONS: WidgetMinifyOptions = {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    purgeCss: true,
    hoistStyles: false,
    minifyCSS: {
        level: 2,
    },
    minifyJS: {
        mangle: {
            toplevel: true,
        },
        compress: {
            passes: 2,
        },
    },
    sortAttributes: true,
    sortClassName: true,
    collapseBooleanAttributes: true,
};

/**
 * Asynchronously minifies HTML markup, embedded CSS, and client JavaScript using
 * `html-minifier-terser` (CleanCSS + Terser), automated CSS purging, and optional style hoisting.
 *
 * @param html Raw HTML markup.
 * @param options Minification options.
 * @returns Fully minified HTML string.
 */
export const minifyHtml = async (html: string, options?: WidgetMinifyOptions): Promise<string> => {
    let preprocessed = html;

    const shouldHoist = options?.hoistStyles ?? DEFAULT_MINIFY_OPTIONS.hoistStyles;
    if (shouldHoist) {
        preprocessed = hoistRepeatedStyles(preprocessed);
    }

    const shouldPurge = options?.purgeCss ?? DEFAULT_MINIFY_OPTIONS.purgeCss;
    if (shouldPurge) {
        preprocessed = purgeUnusedCss(preprocessed);
    }

    return terserMinify(preprocessed, {
        ...DEFAULT_MINIFY_OPTIONS,
        ...options,
    });
};

/**
 * Safely compacts JavaScript code by removing comments and unnecessary whitespace
 * while strictly preserving string literals intact.
 */
export const compactJsSync = (code: string): string => {
    const tokenRegex = /(["'`])(?:\\.|(?!\1)[^\\])*\1/g;
    let result = '';
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const cleanNonString = (str: string) =>
        str
            .replace(/\/\/[^\n]*/g, '')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/^\s+|\s+$/gm, '')
            .replace(/\n+/g, ' ')
            .replace(/\s*([;{},()=])\s*/g, '$1')
            .replace(/[ \t]+/g, ' ');

    while ((match = tokenRegex.exec(code)) !== null) {
        result += cleanNonString(code.slice(lastIndex, match.index));
        result += match[0];
        lastIndex = match.index + match[0].length;
    }

    result += cleanNonString(code.slice(lastIndex));
    return result.trim();
};

/**
 * Fast synchronous HTML minifier (collapses whitespace, removes comments, and purges unused CSS).
 *
 * @param html Raw HTML markup.
 * @param options Minification options.
 * @returns Synchronously compressed HTML string.
 */
export const minifyHtmlSync = (
    html: string,
    options?: { purgeCss?: boolean; hoistStyles?: boolean },
): string => {
    let preprocessed = html;

    if (options?.hoistStyles) {
        preprocessed = hoistRepeatedStyles(preprocessed);
    }

    const shouldPurge = options?.purgeCss ?? true;
    if (shouldPurge) {
        preprocessed = purgeUnusedCss(preprocessed);
    }

    const scriptCleaned = preprocessed.replace(
        /<script([^>]*)>([\s\S]*?)<\/script>/gi,
        (_, attrs, js) => `<script${attrs}>${compactJsSync(js)}</script>`,
    );

    return scriptCleaned
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\s*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, '')
        .replace(/>\s+</g, '><')
        .replace(/^\s+|\s+$/gm, '')
        .replace(/[ \t]+/g, ' ')
        .trim();
};
