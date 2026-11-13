/**
 * Telegram Widgets Avatar Component.
 *
 * @module components/Avatar
 */

import { h } from '../jsx';

/**
 * Properties for the Avatar component.
 */
export interface AvatarProps {
    /**
     * Image source URL.
     */
    src?: string;
    /**
     * Image alternate text.
     */
    alt?: string;
    /**
     * Fallback initials or text displayed when image is unavailable.
     * @default '?'
     */
    fallback?: string;
    /**
     * Avatar size dimension ('xs', 'sm', 'md', or 'lg').
     * @default 'md'
     */
    size?: 'xs' | 'sm' | 'md' | 'lg';
    /**
     * Avatar shape ('circle' or 'rounded').
     * @default 'circle'
     */
    shape?: 'circle' | 'rounded';
    /**
     * Custom corner radius override in pixels.
     */
    radius?: number;
    /**
     * Optional badge or status indicator element overlaid on the corner.
     */
    badge?: unknown;
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
 * Renders a user profile avatar or fallback initials with optional status badge overlay.
 *
 * @param props Avatar properties.
 * @returns Rendered HTML div element.
 */
export const Avatar = ({
    src,
    alt = '',
    fallback = '?',
    size = 'md',
    shape = 'circle',
    radius,
    badge,
    style,
    className = '',
}: AvatarProps): string => {
    const sizePx = {
        xs: 24,
        sm: 32,
        md: 40,
        lg: 48,
    }[size];

    const fontSize = {
        xs: 10,
        sm: 12,
        md: 15,
        lg: 18,
    }[size];

    const defaultRadius = shape === 'circle' ? '50%' : size === 'lg' ? 16 : size === 'md' ? 12 : 8;

    const computedRadius = radius !== undefined ? radius : defaultRadius;

    return (
        <div
            class={`tg-avatar tg-avatar-${size} ${className}`}
            style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: sizePx,
                height: sizePx,
                flexShrink: 0,
                overflow: 'visible',
                ...style,
            }}
        >
            <div
                class="tg-avatar-inner"
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: computedRadius,
                    background: 'var(--tg-theme-secondary-bg-color, rgba(120, 120, 128, 0.16))',
                    color: 'var(--tg-theme-text-color, inherit)',
                    fontSize,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                }}
            >
                {src ? (
                    <img
                        src={src}
                        alt={alt}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: computedRadius,
                        }}
                    />
                ) : (
                    <span>{fallback}</span>
                )}
            </div>
            {badge && (
                <div
                    class="tg-avatar-badge"
                    style={{
                        position: 'absolute',
                        bottom: -4,
                        right: -4,
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                    }}
                >
                    {badge}
                </div>
            )}
        </div>
    );
};
