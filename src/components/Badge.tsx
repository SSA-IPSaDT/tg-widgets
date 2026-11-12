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
    style?: Record<string, string | number | undefined | null>;
    className?: string;
    children?: unknown;
}

export const Badge = ({
    id,
    variant = 'default',
    size = 'sm',
    dot = false,
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
            {dot && (
                <span
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: 'currentColor',
                        display: 'inline-block',
                    }}
                />
            )}
            {children}
        </span>
    );
};
