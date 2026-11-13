import type { WidgetMinifyOptions } from '../minifier';

export interface WidgetRenderOptions extends WidgetMinifyOptions {
    /**
     * Enables aggressive HTML and CSS minification (default: true).
     */
    minify?: boolean;
}

export interface WidgetSizeReport {
    html: string;
    byteLength: number;
    compressedByteLength: number;
    isValid: boolean;
    maxAllowed: number;
}
