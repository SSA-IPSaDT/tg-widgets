import { h } from '../jsx';

export interface CheckboxProps {
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
 * Чекбокс для Telegram Widgets (QuickJS Profile 1).
 * Реализован на семантической кнопке с SVG-иконками без использования <input>
 * (поскольку нативные <input> вырезаются песочницей Telegram).
 */
export const Checkbox = ({
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
}: CheckboxProps): string => {
    const boxIcon = checked ? (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            style={{
                flexShrink: 0,
                marginTop: description ? 2 : 0,
                borderRadius: 5,
            }}
        >
            <rect
                width="20"
                height="20"
                rx="5"
                fill="var(--tg-theme-button-color, #2481cc)"
            />
            <path
                d="M5.5 10.5L8.5 13.5L14.5 7"
                stroke="var(--tg-theme-button-text-color, #ffffff)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
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
                borderRadius: 5,
            }}
        >
            <rect
                x="1"
                y="1"
                width="18"
                height="18"
                rx="5"
                stroke="var(--tg-theme-hint-color, rgba(120, 120, 128, 0.4))"
                strokeWidth="1.5"
                fill="transparent"
            />
        </svg>
    );

    return (
        <button
            type="button"
            id={id}
            name={name ?? id}
            role="checkbox"
            aria-checked={checked ? 'true' : 'false'}
            data-checked={checked ? 'true' : 'false'}
            data-action={action}
            data-value={value}
            disabled={disabled}
            class={`tg-checkbox ${className}`.trim()}
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
                userSelect: 'none',
                touchAction: 'manipulation',
                color: 'var(--tg-theme-text-color, inherit)',
                width: '100%',
                ...style,
            }}
            {...dataAttrs}
        >
            {boxIcon}
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
        </button>
    );
};
