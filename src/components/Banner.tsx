import { h } from '../jsx';

export interface BannerProps {
    badge?: string;
    gradient?: string;
    height?: number | string;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
    children?: unknown;
}

export const Banner = ({
    badge,
    gradient = 'linear-gradient(135deg, var(--tg-theme-secondary-bg-color, #242c38) 0%, var(--tg-theme-bg-color, #18222d) 100%)',
    height = 110,
    style,
    className = '',
    children,
}: BannerProps): string => (
    <div
        class={`tg-banner ${className}`}
        style={{
            width: '100%',
            height,
            background: gradient,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            ...style,
        }}
    >
        {badge && (
            <span
                style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'var(--tg-theme-button-color, #2481cc)',
                    color: 'var(--tg-theme-button-text-color, #ffffff)',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '3px 7px',
                    borderRadius: 6,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                }}
            >
                {badge}
            </span>
        )}
        {children}
    </div>
);
