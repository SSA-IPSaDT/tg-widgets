import { h } from '../jsx';

export interface BadgeProps {
    id?: string;
    variant?:
        | 'default'
        | 'accent'
        | 'destructive'
        | 'outline'
        | 'success'
        | 'warning';
    size?: 'sm' | 'md';
    dot?: boolean;
    pulse?: boolean;
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
    icon,
    style,
    className = '',
    children,
}: BadgeProps): string => {
    const sizeClass = size === 'md' ? 'tg-badge-md' : '';
    const isIconOnly = !children;

    return (
        <span
            id={id}
            class={`tg-badge tg-badge-${variant} ${sizeClass} ${className}`.trim()}
            style={{
                ...(isIconOnly
                    ? {
                          padding: '3px 5px',
                          gap: 3,
                          borderRadius: 7,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                      }
                    : {}),
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
                <span
                    class={pulse ? 'tg-badge-pulse' : ''}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 0,
                        flexShrink: 0,
                    }}
                >
                    {icon}
                </span>
            )}
            {children}
        </span>
    );
};
