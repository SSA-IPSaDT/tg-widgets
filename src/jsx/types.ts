/**
 * Telegram Widgets JSX Rendering & Size Inspection Types.
 *
 * @module jsx/types
 */

import type { WidgetMinifyOptions } from '../minifier';

/**
 * Options configuring widget rendering and size validation.
 */
export interface WidgetRenderOptions extends WidgetMinifyOptions {
    /**
     * Enables aggressive HTML and CSS minification (default: true).
     */
    minify?: boolean;
}

/**
 * Inspection report detailing raw and deflate-compressed byte sizes of rendered widget markup.
 */
export interface WidgetSizeReport {
    /**
     * Rendered (and optionally minified) HTML string.
     */
    html: string;
    /**
     * Raw UTF-8 byte length of the HTML string.
     */
    byteLength: number;
    /**
     * Compressed byte length after zlib Deflate compression.
     */
    compressedByteLength: number;
    /**
     * True if compressedByteLength is within maxAllowed (Telegram 4096-byte ceiling).
     */
    isValid: boolean;
    /**
     * Maximum allowed deflate size threshold in bytes (typically 4096).
     */
    maxAllowed: number;
}
