export interface WidgetRenderOptions {
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
