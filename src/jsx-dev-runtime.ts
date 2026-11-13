/**
 * Telegram Widgets JSX Development Runtime.
 *
 * Implements the development JSX transform (`jsxDEV`, `Fragment`) for rendering
 * TSX components directly into optimized HTML strings with development metadata.
 *
 * @module jsx-dev-runtime
 */

export { Fragment, jsx, jsxDEV, jsxs } from './jsx';

/**
 * Ambient JSX development namespace providing intrinsic element and element type definitions.
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
