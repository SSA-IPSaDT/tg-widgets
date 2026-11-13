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

        return `<style${attrs}>${keptRules.join('')}</style>`;
    });
};

/**
 * Automatically detects repeated identical inline styles and hoists them into generated CSS classes.
 * Significantly cuts down HTML payload when repeating items/buttons share large inline style attributes.
 *
 * @param html Complete HTML document string.
 * @returns Transformed HTML string with repeated inline styles hoisted to a `<style>` tag.
 */
export const hoistRepeatedStyles = (html: string): string => {
    const styleRegex = /style=(["'])(.*?)\1/gi;
    const styleCounts = new Map<string, number>();
    let match: RegExpExecArray | null;

    while ((match = styleRegex.exec(html)) !== null) {
        const rawStyle = match[2].trim();
        if (rawStyle.length >= 20) {
            const normalized = rawStyle.endsWith(';') ? rawStyle : `${rawStyle};`;
            styleCounts.set(normalized, (styleCounts.get(normalized) ?? 0) + 1);
        }
    }

    const hoistedMap = new Map<string, string>();
    let classIndex = 0;

    for (const [styleStr, count] of styleCounts.entries()) {
        if (count >= 2 && styleStr.length * (count - 1) > 25) {
            const className = `_s${classIndex++}`;
            hoistedMap.set(styleStr, className);
        }
    }

    if (hoistedMap.size === 0) return html;

    let transformedHtml = html.replace(/<([a-zA-Z0-9_-]+)([^>]*?)>/g, (fullTag, tagName, attrs) => {
        const styleMatch = attrs.match(/style=(["'])(.*?)\1/i);
        if (!styleMatch) return fullTag;

        const rawStyle = styleMatch[2].trim();
        const normalized = rawStyle.endsWith(';') ? rawStyle : `${rawStyle};`;
        const hoistedClass = hoistedMap.get(normalized);
        if (!hoistedClass) return fullTag;

        let newAttrs = attrs.replace(styleMatch[0], '').trim();
        const classMatch = newAttrs.match(/class=(["'])(.*?)\1/i);

        if (classMatch) {
            const existingClasses = classMatch[2].trim();
            newAttrs = newAttrs.replace(
                classMatch[0],
                `class="${existingClasses} ${hoistedClass}"`,
            );
        } else {
            newAttrs = `class="${hoistedClass}" ${newAttrs}`.trim();
        }

        return `<${tagName} ${newAttrs}>`.replace(/\s{2,}/g, ' ');
    });

    const generatedCss = Array.from(hoistedMap.entries())
        .map(([css, cls]) => `.${cls}{${css}}`)
        .join('');

    if (transformedHtml.includes('</style>')) {
        transformedHtml = transformedHtml.replace('</style>', `${generatedCss}</style>`);
    } else {
        transformedHtml = `<style>${generatedCss}</style>${transformedHtml}`;
    }

    return transformedHtml;
};
