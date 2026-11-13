/**
 * Telegram Widgets Built-in SVG Icons.
 *
 * Provides lightweight zero-dependency inline SVG icons for chevron, check, close, info, warning, copy, and star.
 *
 * @module components/Icon
 */

import { h } from '../jsx';

/**
 * Common properties for built-in SVG icons.
 */
export interface IconProps {
    /**
     * Width and height dimension in pixels.
     * @default 18
     */
    size?: number;
    /**
     * Stroke color in hex or CSS color format.
     * @default 'currentColor'
     */
    color?: string;
    /**
     * Custom inline style overrides.
     */
    style?: Record<string, string | number | undefined | null>;
    /**
     * Custom CSS class names.
     */
    className?: string;
}

/**
 * Chevron right navigation arrow icon.
 *
 * @param props Icon properties.
 * @returns Rendered SVG string.
 */
export const ChevronRightIcon = ({
    size = 18,
    color = 'currentColor',
    style,
    className = '',
}: IconProps): string => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        class={`tg-icon ${className}`}
        style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
        <path d="M9 18l6-6-6-6" />
    </svg>
);

/**
 * Checkmark confirmation icon.
 *
 * @param props Icon properties.
 * @returns Rendered SVG string.
 */
export const CheckIcon = ({
    size = 18,
    color = 'currentColor',
    style,
    className = '',
}: IconProps): string => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        class={`tg-icon ${className}`}
        style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

/**
 * Close/cross dismissal icon.
 *
 * @param props Icon properties.
 * @returns Rendered SVG string.
 */
export const CloseIcon = ({
    size = 18,
    color = 'currentColor',
    style,
    className = '',
}: IconProps): string => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        class={`tg-icon ${className}`}
        style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

/**
 * Informational circle icon.
 *
 * @param props Icon properties.
 * @returns Rendered SVG string.
 */
export const InfoIcon = ({
    size = 18,
    color = 'currentColor',
    style,
    className = '',
}: IconProps): string => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        class={`tg-icon ${className}`}
        style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

/**
 * Warning alert triangle icon.
 *
 * @param props Icon properties.
 * @returns Rendered SVG string.
 */
export const WarningIcon = ({
    size = 18,
    color = 'currentColor',
    style,
    className = '',
}: IconProps): string => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        class={`tg-icon ${className}`}
        style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

/**
 * Copy to clipboard overlapping sheets icon.
 *
 * @param props Icon properties.
 * @returns Rendered SVG string.
 */
export const CopyIcon = ({
    size = 18,
    color = 'currentColor',
    style,
    className = '',
}: IconProps): string => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        class={`tg-icon ${className}`}
        style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

/**
 * Star bookmark and rating icon.
 *
 * @param props Icon properties with optional fill color.
 * @returns Rendered SVG string.
 */
export const StarIcon = ({
    size = 18,
    color = 'currentColor',
    fill = 'none',
    style,
    className = '',
}: IconProps & {
    /**
     * Optional SVG fill color (e.g. 'gold' or '#f59e0b').
     */
    fill?: string;
}): string => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={fill}
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        class={`tg-icon ${className}`}
        style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);
