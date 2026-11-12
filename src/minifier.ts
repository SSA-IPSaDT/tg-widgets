import {
    minify as terserMinify,
    type Options as HtmlMinifierOptions,
} from 'html-minifier-terser';

export interface WidgetMinifyOptions extends HtmlMinifierOptions {
    /**
     * Включает автоматическое удаление неиспользуемых CSS-правил из <style> (по умолчанию true)
     */
    purgeCss?: boolean;
}

export type { HtmlMinifierOptions };

/**
 * Удаляет неиспользуемые селекторы и правила из тегов <style> на основе фактической разметки документа.
 * Существенно снижает объем CSS в баббле без ущерба для рендера.
 */
export const purgeUnusedCss = (html: string): string => {
    // Получаем тело документа без тегов <style> и <script> для точного сопоставления
    const bodyContent = html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

    return html.replace(
        /<style([^>]*)>([\s\S]*?)<\/style>/gi,
        (_, attrs, css) => {
            // Разделяем CSS на правила
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

                // Всегда сохраняем глобальные сбросы, переменные :root, body, html, *
                if (
                    selectorPart.startsWith(':root') ||
                    selectorPart.startsWith('html') ||
                    selectorPart.startsWith('body') ||
                    selectorPart.startsWith('*') ||
                    selectorPart.startsWith('.tg-widget-root')
                ) {
                    return true;
                }

                // Анимации
                if (selectorPart.startsWith('@keyframes tg-pulse')) {
                    return bodyContent.includes('tg-badge-pulse');
                }
                if (selectorPart.startsWith('@keyframes')) {
                    return true;
                }

                // Теговые селекторы
                if (selectorPart.startsWith('details')) {
                    return (
                        bodyContent.includes('<details') ||
                        bodyContent.includes('tg-accordion')
                    );
                }
                if (selectorPart.startsWith('table')) {
                    return (
                        bodyContent.includes('<table') ||
                        bodyContent.includes('tg-table')
                    );
                }
                if (selectorPart.startsWith('svg')) {
                    return (
                        bodyContent.includes('<svg') ||
                        bodyContent.includes('lucide')
                    );
                }

                // Селекторы классов
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
        },
    );
};

/**
 * Оптимальная конфигурация агрессивной минификации HTML, CSS и JS для Telegram Bot API 10.4
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
 * Асинхронная минификация HTML, встроенных стилей (CSS) и скриптов (JS)
 * с помощью официальной промышленной библиотеки `html-minifier-terser` (CleanCSS + Terser)
 * и автоматической очистки неиспользуемого CSS (CSS Purge).
 */
export const minifyHtml = async (
    html: string,
    options?: WidgetMinifyOptions,
): Promise<string> => {
    const shouldPurge = options?.purgeCss ?? DEFAULT_MINIFY_OPTIONS.purgeCss;
    const preprocessed = shouldPurge ? purgeUnusedCss(html) : html;

    return terserMinify(preprocessed, {
        ...DEFAULT_MINIFY_OPTIONS,
        ...options,
    });
};

/**
 * Быстрая синхронная минификация (схлопывание пробелов, удаление комментариев и очистка неиспользуемого CSS)
 */
export const minifyHtmlSync = (
    html: string,
    options?: { purgeCss?: boolean },
): string => {
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
