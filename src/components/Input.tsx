import { h } from '../jsx';

export interface InputProps {
    id?: string;
    name?: string;
    value?: string | number;
    placeholder?: string;
    label?: string;
    hint?: string;
    error?: string;
    disabled?: boolean;
    prefix?: unknown;
    suffix?: unknown;
    action?: string;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
    [key: `data-${string}`]: string | undefined;
}

/**
 * Интерактивное поле ввода (ActionInput) для Telegram Widgets.
 * Примечание: Telegram Profile 1 не поддерживает клавиатурный ввод и вырезает нативные <input>.
 * Данный компонент эмулирует поле ввода в виде интерактивной плашки Telegram.
 * При нажатии бот может запросить ввод текста в чате или открыть диалог.
 */
export const Input = ({
    id,
    name,
    value,
    placeholder = 'Нажмите для ввода...',
    label,
    hint,
    error,
    disabled = false,
    prefix,
    suffix,
    action,
    style,
    className = '',
    ...dataAttrs
}: InputProps): string => {
    const hasValue = value !== undefined && value !== null && value !== '';

    return (
        <div
            class={`tg-input-group ${className}`.trim()}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                width: '100%',
            }}
        >
            {label && (
                <div
                    style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: error
                            ? 'var(--tg-theme-destructive-text-color, #ef4444)'
                            : 'var(--tg-theme-text-color, inherit)',
                    }}
                >
                    {label}
                </div>
            )}
            <button
                type="button"
                id={id}
                name={name ?? id}
                data-action={action}
                disabled={disabled}
                class="tg-input-field"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 10,
                    border: error
                        ? '1px solid var(--tg-theme-destructive-text-color, #ef4444)'
                        : '1px solid rgba(120, 120, 128, 0.18)',
                    background:
                        'var(--tg-theme-secondary-bg-color, rgba(0,0,0,0.05))',
                    boxSizing: 'border-box',
                    opacity: disabled ? 0.6 : 1,
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    fontSize: 14,
                    cursor: disabled ? 'default' : 'pointer',
                    userSelect: 'none',
                    touchAction: 'manipulation',
                    transition: 'border-color 0.15s ease',
                    ...style,
                }}
                {...dataAttrs}
            >
                {prefix}
                <span
                    style={{
                        flex: 1,
                        color: hasValue
                            ? 'var(--tg-theme-text-color, inherit)'
                            : 'var(--tg-theme-hint-color, #888888)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {hasValue ? String(value) : placeholder}
                </span>
                {suffix}
            </button>
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

export const ActionInput = Input;

export interface StepperProps {
    id?: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    decrementAction?: string;
    incrementAction?: string;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
    [key: `data-${string}`]: string | undefined;
}

/**
 * Числовой степпер (Stepper / Counter Input) для виджетов Telegram.
 * Предоставляет кнопки «-» и «+» для инкремента и декремента числовых значений без клавиатуры.
 */
export const Stepper = ({
    id,
    value,
    min,
    max,
    decrementAction = 'decrement',
    incrementAction = 'increment',
    disabled = false,
    style,
    className = '',
    ...dataAttrs
}: StepperProps): string => {
    const isMin = min !== undefined && value <= min;
    const isMax = max !== undefined && value >= max;

    return (
        <div
            id={id}
            class={`tg-stepper ${className}`.trim()}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                background:
                    'var(--tg-theme-secondary-bg-color, rgba(120, 120, 128, 0.12))',
                borderRadius: 10,
                padding: 3,
                gap: 4,
                ...style,
            }}
            {...dataAttrs}
        >
            <button
                type="button"
                data-action={decrementAction}
                disabled={disabled || isMin}
                class="tg-stepper-btn"
                style={{
                    width: 32,
                    height: 32,
                    border: 'none',
                    borderRadius: 8,
                    background:
                        'var(--tg-theme-bg-color, rgba(255, 255, 255, 0.9))',
                    color: 'var(--tg-theme-text-color, inherit)',
                    fontWeight: 700,
                    fontSize: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: disabled || isMin ? 'default' : 'pointer',
                    opacity: disabled || isMin ? 0.4 : 1,
                    touchAction: 'manipulation',
                }}
            >
                −
            </button>
            <span
                style={{
                    minWidth: 36,
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: 14,
                    color: 'var(--tg-theme-text-color, inherit)',
                }}
            >
                {value}
            </span>
            <button
                type="button"
                data-action={incrementAction}
                disabled={disabled || isMax}
                class="tg-stepper-btn"
                style={{
                    width: 32,
                    height: 32,
                    border: 'none',
                    borderRadius: 8,
                    background:
                        'var(--tg-theme-bg-color, rgba(255, 255, 255, 0.9))',
                    color: 'var(--tg-theme-text-color, inherit)',
                    fontWeight: 700,
                    fontSize: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: disabled || isMax ? 'default' : 'pointer',
                    opacity: disabled || isMax ? 0.4 : 1,
                    touchAction: 'manipulation',
                }}
            >
                +
            </button>
        </div>
    );
};
