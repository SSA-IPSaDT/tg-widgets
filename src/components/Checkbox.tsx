import { h } from '../jsx';

export interface CheckboxProps {
    id: string;
    name?: string;
    checked?: boolean;
    disabled?: boolean;
    label?: string;
    description?: string;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
}

export const Checkbox = ({
    id,
    name,
    checked = false,
    disabled = false,
    label,
    description,
    style,
    className = '',
}: CheckboxProps): string => {
    return (
        <label
            for={id}
            class={`tg-checkbox-wrapper ${className}`}
            style={{
                display: 'inline-flex',
                alignItems: description ? 'flex-start' : 'center',
                gap: 10,
                cursor: disabled ? 'default' : 'pointer',
                userSelect: 'none',
                opacity: disabled ? 0.6 : 1,
                fontSize: 14,
                color: 'var(--tg-theme-text-color, inherit)',
                ...style,
            }}
        >
            <input
                type="checkbox"
                id={id}
                name={name ?? id}
                checked={checked}
                disabled={disabled}
                class="tg-checkbox-input"
                style={{
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    border: '1.5px solid var(--tg-theme-hint-color, #999999)',
                    background: 'transparent',
                    cursor: disabled ? 'default' : 'pointer',
                    display: 'grid',
                    placeContent: 'center',
                    margin: description ? '2px 0 0 0' : 0,
                    flexShrink: 0,
                    transition:
                        'background-color 0.15s ease, border-color 0.15s ease',
                }}
            />
            {(label || description) && (
                <div
                    style={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                    {label && <span style={{ fontWeight: 500 }}>{label}</span>}
                    {description && (
                        <span
                            style={{
                                fontSize: 12,
                                color: 'var(--tg-theme-hint-color, #888888)',
                            }}
                        >
                            {description}
                        </span>
                    )}
                </div>
            )}
        </label>
    );
};
