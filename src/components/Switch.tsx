import { h } from '../jsx';

export interface SwitchProps {
    id?: string;
    checked?: boolean;
    disabled?: boolean;
    label?: unknown;
    description?: unknown;
    action?: string;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
    [key: `data-${string}`]: string | undefined;
}

/**
 * Переключатель (Switch / Toggle) для Telegram Widgets.
 * Компактная разметка на базе кнопки с визуальным треком и бегунком.
 */
export const Switch = ({
    id,
    checked = false,
    disabled = false,
    label,
    description,
    action,
    style,
    className = '',
    ...dataAttrs
}: SwitchProps): string => {
    return (
        <button
            type="button"
            id={id}
            data-action={action}
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
                opacity: disabled ? 0.5 : 1,
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
                            class="tg-description"
                            style={{
                                fontSize: 12,
                                fontWeight: 500,
                                color: 'var(--tg-theme-subtitle-text-color, var(--tg-theme-text-color, inherit))',
                                opacity: 0.85,
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
