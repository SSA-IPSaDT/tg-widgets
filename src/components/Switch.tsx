import { h } from '../jsx';

export interface SwitchProps {
    id?: string;
    name?: string;
    checked?: boolean;
    disabled?: boolean;
    label?: unknown;
    description?: unknown;
    action?: string;
    value?: string;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
    [key: `data-${string}`]: string | undefined;
}

/**
 * Переключатель (Switch / Toggle) для Telegram Widgets (QuickJS Profile 1).
 * Реализован на семантической кнопке с анимацией положения ползунка без тега <input>.
 */
export const Switch = ({
    id,
    name,
    checked = false,
    disabled = false,
    label,
    description,
    action,
    value,
    style,
    className = '',
    ...dataAttrs
}: SwitchProps): string => {
    return (
        <button
            type="button"
            id={id}
            name={name ?? id}
            role="switch"
            aria-checked={checked ? 'true' : 'false'}
            data-checked={checked ? 'true' : 'false'}
            data-action={action}
            data-value={value}
            disabled={disabled}
            class={`tg-switch ${className}`.trim()}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent:
                    label || description ? 'space-between' : 'flex-start',
                gap: 12,
                background: 'transparent',
                border: 'none',
                padding: '4px 0',
                margin: 0,
                textAlign: 'left',
                fontFamily: 'inherit',
                cursor: disabled ? 'default' : 'pointer',
                userSelect: 'none',
                touchAction: 'manipulation',
                opacity: disabled ? 0.5 : 1,
                fontSize: 14,
                color: 'var(--tg-theme-text-color, inherit)',
                width: label || description ? '100%' : undefined,
                ...style,
            }}
            {...dataAttrs}
        >
            {(label || description) && (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    {label && (
                        <span style={{ fontWeight: 500, fontSize: 14 }}>
                            {label}
                        </span>
                    )}
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
                class="tg-switch-track"
                style={{
                    position: 'relative',
                    width: 44,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: checked
                        ? 'var(--tg-theme-button-color, #2481cc)'
                        : 'rgba(120, 120, 128, 0.24)',
                    transition: 'background-color 0.2s ease',
                    flexShrink: 0,
                }}
            >
                <div
                    class="tg-switch-thumb"
                    style={{
                        position: 'absolute',
                        top: 2,
                        left: checked ? 20 : 2,
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        transition: 'left 0.2s ease',
                    }}
                />
            </div>
        </button>
    );
};

export const Toggle = Switch;
