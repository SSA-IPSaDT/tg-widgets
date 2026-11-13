/**
 * Telegram Widgets CSS Minifier and Dead-Code Pruner.
 *
 * Implements high-performance, zero-dependency CSS minification, color compaction,
 * shorthand consolidation, and automated unused selector pruning for Telegram HTML widgets.
 *
 * @module minifier/css
 */

import type { CssMinifyOptions } from './types';

/**
 * Consolidates directional properties (e.g. 4 identical margin/padding rules into single shorthand).
 */
const consolidateDirectionalRules = (declarations: string): string => {
    let result = declarations;

    // Consolidate 4 identical margin rules into margin: X
    result = result.replace(
        /(?:^|;)\s*margin-top:([^;]+);\s*margin-right:\1;\s*margin-bottom:\1;\s*margin-left:\1(?=;|$)/g,
        ';margin:$1',
    );
    // Consolidate 4 identical padding rules into padding: X
    result = result.replace(
        /(?:^|;)\s*padding-top:([^;]+);\s*padding-right:\1;\s*padding-bottom:\1;\s*padding-left:\1(?=;|$)/g,
        ';padding:$1',
    );
    // background-color -> background
    result = result.replace(/(?:^|;)\s*background-color:([^;]+)(?=;|$)/g, ';background:$1');

    return result.replace(/^;+/, '');
};

/**
 * Minifies raw CSS stylesheet text by stripping comments, collapsing whitespace,
 * shortening 6-digit hex colors, removing zero units, and stripping redundant trailing semicolons.
 *
 * @param css Raw CSS stylesheet string.
 * @param options CSS minification options.
 * @returns Minified CSS stylesheet.
 */
export const minifyCssString = (css: string, options: CssMinifyOptions = {}): string => {
    if (!css || typeof css !== 'string') return '';

    const shortenColors = options.shortenColors !== false;
    const removeTrailingSemicolons = options.removeTrailingSemicolons !== false;

    let result = css
        // 1. Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // 2. Collapse whitespace
        .replace(/\s+/g, ' ')
        .replace(/\s*([;{}:,>+~])\s*/g, '$1');

    // 3. Shorten hex colors (#ffffff -> #fff, #aabbcc -> #abc)
    if (shortenColors) {
        result = result.replace(
            /#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3(?![0-9a-fA-F])/g,
            '#$1$2$3',
        );
    }

    // 4. Zero units normalization (0px -> 0, 0rem -> 0, etc.)
    result = result.replace(/(:\s*|\s+)0(?:px|em|rem|%|pt)(?=[;}\s])/g, '$10');

    // 5. Consolidate directional rules inside { ... } blocks or inline declarations
    if (result.includes('{')) {
        result = result.replace(
            /\{([^{}]+)\}/g,
            (_, block) => `{${consolidateDirectionalRules(block)}}`,
        );
    } else {
        result = consolidateDirectionalRules(result);
    }

    // 6. Remove trailing semicolons before closing brace
    if (removeTrailingSemicolons) {
        result = result.replace(/;}/g, '}');
    }

    // 7. Remove empty rulesets
    result = result.replace(/[^{};]+{\s*}/g, '');

    return result.trim();
};

/**
 * Removes unused CSS selectors and rules from `<style>` tags based on the actual HTML markup.
 * Significantly reduces widget CSS payload size to stay safely under the 4096-byte deflate limit.
 *
 * @param html Complete HTML document string.
 * @param options CSS minification options.
 * @returns HTML string with pruned CSS.
 */
export const purgeUnusedCss = (html: string, options: CssMinifyOptions = {}): string => {
    if (!html || typeof html !== 'string') return '';

    // Extract document body without <style> and <script> tags for exact matching
    const bodyContent = html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

    return html.replace(/<style([^>]*)>([\s\S]*?)<\/style>/gi, (_, attrs, css) => {
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

        const keptRules: string[] = [];
        for (const rule of rules) {
            const firstBrace = rule.indexOf('{');
            if (firstBrace === -1) continue;
            const selectorPart = rule.slice(0, firstBrace).trim();
            const block = rule.slice(firstBrace);
            if (!selectorPart) continue;

            // Preserve global resets, :root tokens, body, html, and root widget classes
            if (
                selectorPart.startsWith(':root') ||
                selectorPart.startsWith('html') ||
                selectorPart.startsWith('body') ||
                selectorPart.startsWith('*') ||
                selectorPart.startsWith('.tg-widget-root')
            ) {
                keptRules.push(rule);
                continue;
            }

            // Animation keyframes
            if (selectorPart.startsWith('@keyframes tg-pulse')) {
                if (bodyContent.includes('tg-badge-pulse')) keptRules.push(rule);
                continue;
            }
            if (selectorPart.startsWith('@keyframes')) {
                keptRules.push(rule);
                continue;
            }

            // Tag-based selectors
            if (selectorPart.startsWith('details')) {
                if (bodyContent.includes('<details') || bodyContent.includes('tg-accordion')) {
                    keptRules.push(rule);
                }
                continue;
            }
            if (selectorPart.startsWith('table')) {
                if (bodyContent.includes('<table') || bodyContent.includes('tg-table')) {
                    keptRules.push(rule);
                }
                continue;
            }
            if (selectorPart.startsWith('svg')) {
                if (bodyContent.includes('<svg') || bodyContent.includes('lucide')) {
                    keptRules.push(rule);
                }
                continue;
            }

            // Comma-separated branches and compound class matching
            const branches = selectorPart
                .split(',')
                .map((b) => b.trim())
                .filter(Boolean);
            const validBranches = branches.filter((branch) => {
                const classMatches = branch.match(/\.([a-zA-Z0-9_-]+)/g);
                if (!classMatches || classMatches.length === 0) return true;
                return classMatches.every((cls) => bodyContent.includes(cls.slice(1)));
            });

            if (validBranches.length > 0) {
                keptRules.push(`${validBranches.join(',')}${block}`);
            }
        }

        if (keptRules.length === 0) {
            return '';
        }

        const combined = keptRules.join('');
        const minifiedCss = minifyCssString(combined, options);
        return `<style${attrs}>${minifiedCss}</style>`;
    });
};
