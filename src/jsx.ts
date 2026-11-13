/**
 * Telegram Widgets JSX Primitives and Runtime.
 *
 * @module jsx
 */

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

export * from './jsx/types';
export * from './jsx/runtime';
export * from './jsx/inspector';
