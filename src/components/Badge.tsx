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

    return (
        <span
            id={id}
            class={`tg-badge tg-badge-${variant} ${sizeClass} ${className}`.trim()}
            style={style}
        >
            {(dot || pulse) && (
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
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
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
