import { minify as terserMinify, type Options as HtmlMinifierOptions } from 'html-minifier-terser';

export interface WidgetMinifyOptions extends HtmlMinifierOptions {
    /**
     * Enables automatic purging of unused CSS rules from `<style>` tags (default: true).
     */
    purgeCss?: boolean;
}

export type { HtmlMinifierOptions };

/**
 * Removes unused CSS selectors and rules from `<style>` tags based on the actual HTML markup.
 * Significantly reduces widget CSS payload size to stay safely under the 4096-byte deflate limit.
 *
 * @param html Complete HTML document string.
 * @returns HTML string with pruned CSS.
 */
export const purgeUnusedCss = (html: string): string => {
    // Extract document body without <style> and <script> tags for exact matching
    const bodyContent = html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

    return html.replace(/<style([^>]*)>([\s\S]*?)<\/style>/gi, (_, attrs, css) => {
        // Split CSS into top-level rules
        const rules: string[] = [];
        let depth = 0;
        let current = '';

        for (let i = 0; i < css.length; i++) {
            const char = css[i];
            current += char;
            if (char === '{') {
                depth++;
            } else if (char === '}') {
                depth--;
                if (depth === 0) {
                    rules.push(current.trim());
                    current = '';
                }
            }
        }

        const keptRules = rules.filter((rule) => {
            const selectorPart = rule.split('{')[0].trim();
            if (!selectorPart) return false;

            // Always preserve global resets, :root tokens, body, html, and root widget classes
            if (
                selectorPart.startsWith(':root') ||
                selectorPart.startsWith('html') ||
                selectorPart.startsWith('body') ||
                selectorPart.startsWith('*') ||
                selectorPart.startsWith('.tg-widget-root')
            ) {
                return true;
            }

            // Animation keyframes
            if (selectorPart.startsWith('@keyframes tg-pulse')) {
                return bodyContent.includes('tg-badge-pulse');
            }
            if (selectorPart.startsWith('@keyframes')) {
                return true;
            }

            // Tag-based selectors
            if (selectorPart.startsWith('details')) {
                return bodyContent.includes('<details') || bodyContent.includes('tg-accordion');
            }
            if (selectorPart.startsWith('table')) {
                return bodyContent.includes('<table') || bodyContent.includes('tg-table');
            }
            if (selectorPart.startsWith('svg')) {
                return bodyContent.includes('<svg') || bodyContent.includes('lucide');
            }

            // Class selectors
            const classMatches = selectorPart.match(/\.([a-zA-Z0-9_-]+)/g);
            if (classMatches && classMatches.length > 0) {
                return classMatches.some((cls) => {
                    const className = cls.slice(1);
                    return bodyContent.includes(className);
                });
            }

            return true;
        });

        if (keptRules.length === 0) {
            return '';
        }

        return `<style${attrs}>${keptRules.join('')}</style>`;
    });
};

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
 * `html-minifier-terser` (CleanCSS + Terser) and automated CSS purging.
 *
 * @param html Raw HTML markup.
 * @param options Minification options.
 * @returns Fully minified HTML string.
 */
export const minifyHtml = async (html: string, options?: WidgetMinifyOptions): Promise<string> => {
    const shouldPurge = options?.purgeCss ?? DEFAULT_MINIFY_OPTIONS.purgeCss;
    const preprocessed = shouldPurge ? purgeUnusedCss(html) : html;

    return terserMinify(preprocessed, {
        ...DEFAULT_MINIFY_OPTIONS,
        ...options,
    });
};

/**
 * Fast synchronous HTML minifier (collapses whitespace, removes comments, and purges unused CSS).
 *
 * @param html Raw HTML markup.
 * @param options Minification options.
 * @returns Synchronously compressed HTML string.
 */
export const minifyHtmlSync = (html: string, options?: { purgeCss?: boolean }): string => {
    const shouldPurge = options?.purgeCss ?? true;
    const preprocessed = shouldPurge ? purgeUnusedCss(html) : html;

    return preprocessed
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\s*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, '')
        .replace(/>\s+</g, '><')
        .replace(/^\s+|\s+$/gm, '')
        .replace(/[ \t]+/g, ' ')
        .trim();
};
