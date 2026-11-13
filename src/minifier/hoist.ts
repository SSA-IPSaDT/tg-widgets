/**
 * Telegram Widgets Style Hoisting Engine.
 *
 * Automatically detects repeated identical inline styles and hoists them into generated CSS classes.
 * Significantly cuts down HTML payload when repeating items/buttons share large inline style attributes.
 *
 * @module minifier/hoist
 */

/**
 * Automatically detects repeated identical inline styles and hoists them into generated CSS classes.
 * Significantly cuts down HTML payload when repeating items/buttons share large inline style attributes.
 *
 * @param html Complete HTML document string.
 * @returns Transformed HTML string with repeated inline styles hoisted to a `<style>` tag.
 */
export const hoistRepeatedStyles = (html: string): string => {
    if (!html || typeof html !== 'string') return '';

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
