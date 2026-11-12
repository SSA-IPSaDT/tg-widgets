import { h } from '../jsx';

export interface SwitchProps {
    id: string;
    name?: string;
    checked?: boolean;
    disabled?: boolean;
    label?: string;
    description?: string;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
}

export const Switch = ({
    id,
    name,
    checked = false,
    disabled = false,
    label,
    description,
    style,
    className = '',
}: SwitchProps): string => {
    return (
        <label
            for={id}
            class={`tg-switch-wrapper ${className}`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent:
                    label || description ? 'space-between' : 'flex-start',
                gap: 12,
                cursor: disabled ? 'default' : 'pointer',
                userSelect: 'none',
                opacity: disabled ? 0.6 : 1,
                fontSize: 14,
                color: 'var(--tg-theme-text-color, inherit)',
                width: label || description ? '100%' : undefined,
                ...style,
            }}
        >
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
            <div
                style={{
                    position: 'relative',
                    width: 44,
                    height: 26,
                    flexShrink: 0,
                }}
            >
                <input
                    type="checkbox"
                    id={id}
                    name={name ?? id}
                    checked={checked}
                    disabled={disabled}
                    class="tg-switch-input"
                    style={{
                        opacity: 0,
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        margin: 0,
                        cursor: disabled ? 'default' : 'pointer',
                        zIndex: 2,
                    }}
                />
                <span
                    class="tg-switch-slider"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: checked
                            ? 'var(--tg-theme-button-color, #2481cc)'
                            : 'rgba(120, 120, 128, 0.24)',
                        transition: 'background-color 0.2s ease',
                        borderRadius: 13,
                        pointerEvents: 'none',
                    }}
                >
                    <span
                        class="tg-switch-thumb"
                        style={{
                            position: 'absolute',
                            height: 22,
                            width: 22,
                            left: checked ? 20 : 2,
                            bottom: 2,
                            backgroundColor: '#ffffff',
                            borderRadius: '50%',
                            transition: 'left 0.2s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            pointerEvents: 'none',
                        }}
                    />
                </span>
            </div>
        </label>
    );
};

export const Toggle = Switch;
