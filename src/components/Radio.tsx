import { h } from '../jsx';

export interface RadioProps {
    id?: string;
    value?: string;
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
 * Радио-кнопка для Telegram Widgets (QuickJS Profile 1).
 * Генерирует ультралегкий HTML без неиспользуемых ARIA-атрибутов.
 */
export const Radio = ({
    id,
    value,
    checked = false,
    disabled = false,
    label,
    description,
    action,
    style,
    className = '',
    ...dataAttrs
}: RadioProps): string => {
    const radioIcon = checked ? (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            style={{
                flexShrink: 0,
                marginTop: description ? 2 : 0,
            }}
        >
            <circle
                cx="10"
                cy="10"
                r="9"
                stroke="var(--tg-theme-button-color, #2481cc)"
                strokeWidth="2"
            />
            <circle
                cx="10"
                cy="10"
                r="5"
                fill="var(--tg-theme-button-color, #2481cc)"
            />
        </svg>
    ) : (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            style={{
                flexShrink: 0,
                marginTop: description ? 2 : 0,
            }}
        >
            <circle
                cx="10"
                cy="10"
                r="9"
                stroke="var(--tg-theme-hint-color, rgba(120, 120, 128, 0.4))"
                strokeWidth="1.5"
            />
        </svg>
    );

    return (
        <button
            type="button"
            id={id}
            data-value={value}
            data-action={action}
            disabled={disabled}
            class={`tg-radio ${className}`.trim()}
            style={{
                display: 'inline-flex',
                alignItems: description ? 'flex-start' : 'center',
                gap: 10,
                background: 'transparent',
                border: 'none',
                padding: '4px 0',
                margin: 0,
                textAlign: 'left',
                fontFamily: 'inherit',
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                color: 'var(--tg-theme-text-color, inherit)',
                width: '100%',
                ...style,
            }}
            {...dataAttrs}
        >
            {radioIcon}
            {(label || description) && (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    {label && (
                        <span style={{ fontSize: 14, fontWeight: 500 }}>
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
        </button>
    );
};

export interface RadioGroupProps {
    id?: string;
    gap?: number;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
    children?: unknown;
}

export const RadioGroup = ({
    id,
    gap = 8,
    style,
    className = '',
    children,
}: RadioGroupProps): string => {
    return (
        <div
            id={id}
            class={`tg-radio-group ${className}`.trim()}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap,
                width: '100%',
                ...style,
            }}
        >
            {children}
        </div>
    );
};
