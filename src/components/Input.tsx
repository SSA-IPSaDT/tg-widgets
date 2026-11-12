import { h } from '../jsx';

export interface InputProps {
    id?: string;
    name?: string;
    type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';
    value?: string | number;
    placeholder?: string;
    label?: string;
    hint?: string;
    error?: string;
    disabled?: boolean;
    prefix?: unknown;
    suffix?: unknown;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
}

export const Input = ({
    id,
    name,
    type = 'text',
    value,
    placeholder,
    label,
    hint,
    error,
    disabled = false,
    prefix,
    suffix,
    style,
    className = '',
}: InputProps): string => {
    return (
        <div
            class={`tg-input-group ${className}`}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                width: '100%',
            }}
        >
            {label && (
                <label
                    for={id}
                    style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: error
                            ? 'var(--tg-theme-destructive-text-color, #ef4444)'
                            : 'var(--tg-theme-text-color, inherit)',
                    }}
                >
                    {label}
                </label>
            )}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: error
                        ? '1px solid var(--tg-theme-destructive-text-color, #ef4444)'
                        : '1px solid rgba(0,0,0,0.08)',
                    background:
                        'var(--tg-theme-secondary-bg-color, rgba(0,0,0,0.05))',
                    boxSizing: 'border-box',
                    opacity: disabled ? 0.6 : 1,
                    transition: 'border-color 0.15s ease',
                    ...style,
                }}
            >
                {prefix}
                <input
                    id={id}
                    name={name ?? id}
                    type={type}
                    value={value !== undefined ? String(value) : undefined}
                    placeholder={placeholder}
                    disabled={disabled}
                    style={{
                        width: '100%',
                        fontSize: 14,
                        fontFamily: 'inherit',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--tg-theme-text-color, inherit)',
                        outline: 'none',
                        padding: 0,
                        margin: 0,
                    }}
                />
                {suffix}
            </div>
            {error ? (
                <span
                    style={{
                        fontSize: 11,
                        color: 'var(--tg-theme-destructive-text-color, #ef4444)',
                    }}
                >
                    {error}
                </span>
            ) : hint ? (
                <span
                    style={{
                        fontSize: 11,
                        color: 'var(--tg-theme-hint-color, #888888)',
                    }}
                >
                    {hint}
                </span>
            ) : null}
        </div>
    );
};
