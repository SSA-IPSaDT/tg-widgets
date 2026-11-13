/**
 * Telegram Widgets Universal Class & ID Mangler.
 *
 * Safely compresses CSS classes and HTML/JS element IDs down to short identifiers
 * (e.g. c0, c1, d0, d1) across HTML attributes, embedded <style>, and client <script>.
 *
 * @module minifier/mangle
 */

import type { WidgetMinifyOptions } from './types';

const escapeRegExp = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Safely mangles class names and element IDs across HTML, CSS stylesheets, and JS scripts.
 *
 * @param html Complete or partial HTML document string.
 * @param options Minification options.
 * @returns HTML document with mangled classes and identifiers.
 */
export const mangleClassesAndIds = (html: string, options: WidgetMinifyOptions = {}): string => {
    if (!html || typeof html !== 'string') return '';
    const shouldMangleClasses = options.mangleClasses !== false;
    const shouldMangleIds = options.mangleIds !== false;
    if (!shouldMangleClasses && !shouldMangleIds) return html;

    // 1. Separate HTML markup from <style> and <script> blocks to prevent collisions
    const styleBlocks: string[] = [];
    let doc = html.replace(/<style([^>]*)>([\s\S]*?)<\/style>/gi, (_, attrs, css) => {
        styleBlocks.push(css);
        return `<style${attrs}>___STYLE_${styleBlocks.length - 1}___</style>`;
    });

    const scriptBlocks: string[] = [];
    doc = doc.replace(/<script([^>]*)>([\s\S]*?)<\/script>/gi, (_, attrs, js) => {
        scriptBlocks.push(js);
        return `<script${attrs}>___SCRIPT_${scriptBlocks.length - 1}___</script>`;
    });

    // 2. Collect and map CSS classes across <style> and HTML class="..." attributes
    const classMap = new Map<string, string>();
    if (shouldMangleClasses) {
        const cssClasses = new Set<string>();
        for (const css of styleBlocks) {
            for (const m of css.matchAll(/\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g)) {
                cssClasses.add(m[1]);
            }
        }
        const htmlClasses = new Set<string>();
        for (const m of doc.matchAll(/\bclass=["']([^"']+)["']/g)) {
            for (const c of m[1].split(/\s+/)) {
                if (c) htmlClasses.add(c);
            }
        }

        // Only mangle classes defined in CSS and used in the document
        const classes = new Set<string>();
        for (const c of htmlClasses) {
            if (cssClasses.has(c)) classes.add(c);
        }

        // Sort by length descending so longer compound names are replaced first
        const sortedClasses = Array.from(classes).sort((a, b) => b.length - a.length);
        let cIdx = 0;
        for (const cls of sortedClasses) {
            classMap.set(cls, 'c' + cIdx++);
        }

        // Replace class tokens in HTML class="..."
        doc = doc.replace(/\bclass=["']([^"']+)["']/g, (_, val) => {
            const mapped = val
                .split(/\s+/)
                .map((c: string) => classMap.get(c) || c)
                .join(' ');
            return `class="${mapped}"`;
        });
    }

    // 3. Collect and map element IDs that appear in HTML and client script/CSS
    const idMap = new Map<string, string>();
    if (shouldMangleIds) {
        const allJs = scriptBlocks.join(' ');
        const allCss = styleBlocks.join(' ');
        let dIdx = 0;
        for (const m of doc.matchAll(/\bid=["']([^"']+)["']/g)) {
            const id = m[1];
            // Only mangle if the ID is referenced literally in JS or CSS
            if (
                !idMap.has(id) &&
                (allJs.includes(`'${id}'`) ||
                    allJs.includes(`"${id}"`) ||
                    allJs.includes(`\`${id}\``) ||
                    allJs.includes(`#${id}`) ||
                    allCss.includes(`#${id}`))
            ) {
                idMap.set(id, 'd' + dIdx++);
            }
        }

        // Replace ID tokens in HTML id="..."
        doc = doc.replace(/\bid=["']([^"']+)["']/g, (_, val) => {
            return `id="${idMap.get(val) || val}"`;
        });
    }

    // 4. Update embedded <style> stylesheets
    const updatedStyles = styleBlocks.map((css) => {
        let updated = css.replace(/(?:-webkit-)?user-select:\s*none;?/g, '');
        for (const [orig, short] of classMap.entries()) {
            updated = updated.replace(
                new RegExp('\\.' + escapeRegExp(orig) + '(?![a-zA-Z0-9_-])', 'g'),
                '.' + short,
            );
        }
        for (const [orig, short] of idMap.entries()) {
            updated = updated.replace(
                new RegExp('#' + escapeRegExp(orig) + '(?![a-zA-Z0-9_-])', 'g'),
                '#' + short,
            );
        }
        return updated;
    });

    // 5. Update embedded <script> client scripts
    const updatedScripts = scriptBlocks.map((js) => {
        let updated = js;
        for (const [orig, short] of classMap.entries()) {
            updated = updated
                .replace(
                    new RegExp('\\.' + escapeRegExp(orig) + '(?![a-zA-Z0-9_-])', 'g'),
                    '.' + short,
                )
                .replace(new RegExp(`(['"\`])${escapeRegExp(orig)}\\1`, 'g'), `$1${short}$1`);
        }
        for (const [orig, short] of idMap.entries()) {
            updated = updated
                .replace(
                    new RegExp('#' + escapeRegExp(orig) + '(?![a-zA-Z0-9_-])', 'g'),
                    '#' + short,
                )
                .replace(new RegExp(`(['"\`])${escapeRegExp(orig)}\\1`, 'g'), `$1${short}$1`);
        }
        return updated;
    });

    // 6. Restore style and script blocks
    doc = doc.replace(
        /<style([^>]*)>___STYLE_(\d+)___<\/style>/g,
        (_, attrs, idx) => `<style${attrs}>${updatedStyles[Number(idx)]}</style>`,
    );
    doc = doc.replace(
        /<script([^>]*)>___SCRIPT_(\d+)___<\/script>/g,
        (_, attrs, idx) => `<script${attrs}>${updatedScripts[Number(idx)]}</script>`,
    );

    return doc;
};
