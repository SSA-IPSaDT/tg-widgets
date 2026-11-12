import {
    minify as terserMinify,
    type Options as HtmlMinifierOptions,
} from 'html-minifier-terser';

export type { HtmlMinifierOptions };

/**
 * Оптимальная конфигурация агрессивной минификации HTML, CSS и JS для Telegram Bot API 10.4
 */
export const DEFAULT_MINIFY_OPTIONS: HtmlMinifierOptions = {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
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
 * Асинхронная минификация HTML, встроенных стилей (CSS) и скриптов (JS)
 * с помощью официальной промышленной библиотеки `html-minifier-terser` (CleanCSS + Terser).
 */
export const minifyHtml = async (
    html: string,
    options?: HtmlMinifierOptions,
): Promise<string> => {
    return terserMinify(html, {
        ...DEFAULT_MINIFY_OPTIONS,
        ...options,
    });
};

/**
 * Быстрая синхронная минификация (схлопывание пробелов и удаление комментариев)
 */
export const minifyHtmlSync = (html: string): string => {
    return html
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/>\s+</g, '><')
        .replace(/^\s+|\s+$/gm, '')
        .replace(/[ \t]+/g, ' ')
        .trim();
};
