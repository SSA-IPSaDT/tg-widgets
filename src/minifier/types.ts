/**
 * Telegram Widgets Minifier Options & Configuration Types.
 *
 * @module minifier/types
 */

/**
 * Detailed options configuring the Telegram Widgets HTML, CSS, and JS minification pipeline.
 */
export interface WidgetMinifyOptions {
    /**
     * Whether to collapse whitespace between HTML tags and inside text nodes (default: true).
     */
    collapseWhitespace?: boolean;

    /**
     * Whether to remove standard HTML comments (default: true).
     */
    removeComments?: boolean;

    /**
     * Whether to remove redundant HTML attributes like type="text/javascript" on scripts (default: true).
     */
    removeRedundantAttributes?: boolean;

    /**
     * Whether to collapse boolean attributes like disabled="disabled" into disabled (default: true).
     */
    collapseBooleanAttributes?: boolean;

    /**
     * Whether to automatically purge unused CSS rules from embedded <style> tags (default: true).
     */
    purgeCss?: boolean;

    /**
     * Whether to hoist repeated inline style attributes into compact generated CSS classes (default: false).
     */
    hoistStyles?: boolean;

    /**
     * Options or boolean flag controlling embedded CSS minification (default: true).
     */
    minifyCSS?: boolean | CssMinifyOptions;

    /**
     * Options or boolean flag controlling embedded client JS minification (default: true).
     */
    minifyJS?: boolean | JsMinifyOptions;

    /**
     * Backward-compatible option for script type attribute removal.
     */
    removeScriptTypeAttributes?: boolean;

    /**
     * Backward-compatible option for style link type attribute removal.
     */
    removeStyleLinkTypeAttributes?: boolean;

    /**
     * Backward-compatible option for short doctype.
     */
    useShortDoctype?: boolean;

    /**
     * Backward-compatible option for attribute sorting.
     */
    sortAttributes?: boolean;

    /**
     * Backward-compatible option for class name sorting.
     */
    sortClassName?: boolean;

    /**
     * Additional custom or legacy minifier options.
     */
    [key: string]: unknown;
}

/**
 * Options configuring embedded CSS minification.
 */
export interface CssMinifyOptions {
    /**
     * Level of CSS optimization (1: whitespace/comments/colors, 2: advanced merges).
     */
    level?: 1 | 2;

    /**
     * Whether to shorten hex colors (e.g. #ffffff -> #fff).
     */
    shortenColors?: boolean;

    /**
     * Whether to remove redundant trailing semicolons in declaration blocks.
     */
    removeTrailingSemicolons?: boolean;

    /**
     * Additional custom or legacy CSS minifier options.
     */
    [key: string]: unknown;
}

/**
 * Options configuring embedded JavaScript code compaction.
 */
export interface JsMinifyOptions {
    /**
     * Whether to strip single-line and multi-line comments from script blocks.
     */
    removeComments?: boolean;

    /**
     * Whether to collapse whitespace around operators, punctuation, and keyword boundaries.
     */
    collapseWhitespace?: boolean;

    /**
     * Backward-compatible Terser-like mangle options or boolean.
     */
    mangle?: boolean | Record<string, unknown>;

    /**
     * Backward-compatible Terser-like compress options or boolean.
     */
    compress?: boolean | Record<string, unknown>;

    /**
     * Additional custom or legacy JS minifier options.
     */
    [key: string]: unknown;
}
