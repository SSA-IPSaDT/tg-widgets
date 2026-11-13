/**
 * Telegram Widgets JSX Production Runtime.
 *
 * Implements the automatic JSX runtime transform (`jsx`, `jsxs`, `Fragment`) for rendering
 * TSX components directly into optimized HTML strings without virtual DOM overhead.
 *
 * @module jsx-runtime
 */

export { Fragment, jsx, jsxDEV, jsxs } from './jsx';

/**
 * Ambient JSX namespace providing intrinsic element and element type definitions.
 */
export namespace JSX {
    /**
     * Standard HTML/SVG intrinsic elements map accepted in TSX widget templates.
     */
    export interface IntrinsicElements {
        /**
         * Generic HTML/SVG tag attributes map.
         */
        [elemName: string]: Record<string, unknown>;
    }

    /**
     * Return type of rendered JSX elements (raw HTML string).
     */
    export type Element = string;
}
