import { h } from '../jsx';

export interface ButtonProps {
    id?: string;
    variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    radius?: number;
    fullWidth?: boolean;
    disabled?: boolean;
    loading?: boolean;
    icon?: unknown;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
    children?: unknown;
    [key: `data-${string}`]: string | undefined;
}

export const Button = ({
    id,
    variant = 'primary',
    size = 'md',
    radius,
    fullWidth = false,
    disabled = false,
    loading = false,
    icon,
    style,
    className = '',
    children,
    ...dataAttrs
}: ButtonProps): string => {
    const fullClass = fullWidth ? 'tg-btn-full' : '';
    const overrides: Record<string, string | number | undefined | null> = {
        ...(radius !== undefined ? { borderRadius: radius } : {}),
        ...(disabled || loading ? { cursor: 'default', opacity: 0.6 } : {}),
        ...style,
    };

    return (
        <button
            id={id}
            class={`tg-btn tg-btn-${variant} tg-btn-${size} ${fullClass} ${className}`.trim()}
            style={Object.keys(overrides).length > 0 ? overrides : undefined}
            disabled={disabled || loading}
            {...dataAttrs}
        >
            {loading ? (
                <span
                    style={{
                        display: 'inline-block',
                        width: 14,
                        height: 14,
                        border: '2px solid currentColor',
                        borderRightColor: 'transparent',
                        borderRadius: '50%',
                    }}
                />
            ) : (
                icon
            )}
            {children}
        </button>
    );
};
