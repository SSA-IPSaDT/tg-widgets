import { h } from '../jsx';

export interface AvatarProps {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    shape?: 'circle' | 'rounded';
    radius?: number;
    badge?: unknown;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
}

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

    const defaultRadius =
        shape === 'circle'
            ? '50%'
            : size === 'lg'
              ? 16
              : size === 'md'
                ? 12
                : 8;

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
                    background:
                        'var(--tg-theme-secondary-bg-color, rgba(120, 120, 128, 0.16))',
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
