import { h } from '../jsx';

export interface BadgeProps {
    id?: string;
    variant?: 'default' | 'accent' | 'destructive' | 'outline' | 'success' | 'warning';
    size?: 'sm' | 'md';
    dot?: boolean;
    pulse?: boolean;
    square?: boolean;
    icon?: unknown;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
    children?: unknown;
}

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
