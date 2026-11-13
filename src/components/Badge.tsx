/**
 * Telegram Widgets Badge Component.
 *
 * @module components/Badge
 */

import { h } from '../jsx';

/**
 * Properties for the Badge component.
 */
export interface BadgeProps {
    /**
     * Unique HTML element ID.
     */
    id?: string;
    /**
     * Visual color variant.
     * @default 'default'
     */
    variant?: 'default' | 'accent' | 'destructive' | 'outline' | 'success' | 'warning';
    /**
     * Size dimension ('sm' or 'md').
     * @default 'sm'
     */
    size?: 'sm' | 'md';
    /**
     * When true, displays a status indicator dot.
     * @default false
     */
    dot?: boolean;
    /**
     * When true, displays an animated pulse indicator.
     * @default false
     */
    pulse?: boolean;
    /**
     * Forces square 1:1 aspect ratio when displaying icons.
     */
    square?: boolean;
    /**
     * Icon element or SVG rendered inside badge.
     */
    icon?: unknown;
    /**
     * Custom inline style overrides.
     */
    style?: Record<string, string | number | undefined | null>;
    /**
     * Custom CSS class names.
     */
    className?: string;
    /**
     * Text or child content.
     */
    children?: unknown;
}

/**
 * Renders a compact badge or counter indicator.
 *
 * @param props Badge properties.
 * @returns Rendered HTML span element.
 */
export const Badge = ({
    id,
    variant = 'default',
    size = 'sm',
    dot = false,
    pulse = false,
    square,
    icon,
    style,
    className = '',
    children,
}: BadgeProps): string => {
    const sizeClass = size === 'md' ? 'tg-badge-md' : '';
    const hasChildren =
        children !== undefined &&
        children !== null &&
        (Array.isArray(children) ? children.length > 0 : String(children).trim().length > 0);
    const isSquare = square ?? (Boolean(icon) && !hasChildren);
    const squareDim = size === 'md' ? 30 : 26;
    const squareClass = isSquare ? 'tg-badge-square' : '';

    return (
        <span
            id={id}
            class={`tg-badge tg-badge-${variant} ${sizeClass} ${squareClass} ${className}`
                .replace(/\s+/g, ' ')
                .trim()}
            style={{
                ...(isSquare
                    ? {
                          width: squareDim,
                          height: squareDim,
                          aspectRatio: '1 / 1',
                          padding: 0,
                          '--badge-radius': 'var(--tg-radius-sm, 8px)',
                      }
                    : {
                          '--badge-radius':
                              size === 'md'
                                  ? 'var(--tg-radius-sm, 7px)'
                                  : 'var(--tg-radius-sm, 6px)',
                      }),
                ...style,
            }}
        >
            {(dot || (pulse && !icon)) && (
                <span
                    class={pulse ? 'tg-badge-pulse' : ''}
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: 'currentColor',
                        display: 'inline-block',
                        flexShrink: 0,
                    }}
                />
            )}
            {icon && (
                <span class={`tg-badge-icon ${pulse ? 'tg-badge-pulse' : ''}`.trim()}>{icon}</span>
            )}
            {children}
        </span>
    );
};
