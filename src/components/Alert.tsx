import { h } from '../jsx';
import { InfoIcon, WarningIcon } from './Icon';

export interface AlertProps {
    id?: string;
    variant?: 'default' | 'destructive' | 'warning' | 'success' | 'info';
    icon?: unknown;
    title?: unknown;
    description?: unknown;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
    children?: unknown;
    [key: `data-${string}`]: string | undefined;
}

/**
 * Компонент Alert для виджетов Telegram.
 * Отображает важные сообщения, уведомления об ошибках и статусы.
 */
export const Alert = ({
    id,
    variant = 'default',
    icon,
    title,
    description,
    style,
    className = '',
    children,
    ...dataAttrs
}: AlertProps): string => {
    const variantStyles = {
        default: {
            bg: 'var(--tg-theme-secondary-bg-color, rgba(120, 120, 128, 0.08))',
            border: '1px solid rgba(120, 120, 128, 0.16)',
            text: 'var(--tg-theme-text-color, inherit)',
            defaultIcon: null,
        },
        info: {
            bg: 'rgba(36, 129, 204, 0.08)',
            border: '1px solid rgba(36, 129, 204, 0.25)',
            text: 'var(--tg-theme-link-color, #2481cc)',
            defaultIcon: InfoIcon({ size: 18, color: '#2481cc' }),
        },
        success: {
            bg: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            text: '#10b981',
            defaultIcon: (
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
            ),
        },
        warning: {
            bg: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            text: '#f59e0b',
            defaultIcon: WarningIcon({ size: 18, color: '#f59e0b' }),
        },
        destructive: {
            bg: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            text: 'var(--tg-theme-destructive-text-color, #ef4444)',
            defaultIcon: WarningIcon({ size: 18, color: '#ef4444' }),
        },
    }[variant];

    const currentIcon = icon ?? variantStyles.defaultIcon;

    return (
        <div
            id={id}
            class={`tg-alert tg-alert-${variant} ${className}`.trim()}
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 12,
                background: variantStyles.bg,
                border: variantStyles.border,
                color: 'var(--tg-theme-text-color, inherit)',
                width: '100%',
                boxSizing: 'border-box',
                fontSize: 13,
                ...style,
            }}
            {...dataAttrs}
        >
            {currentIcon && (
                <div style={{ flexShrink: 0, marginTop: 1 }}>{currentIcon}</div>
            )}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    flex: 1,
                }}
            >
                {title && (
                    <div
                        style={{
                            fontWeight: 600,
                            fontSize: 13,
                            color:
                                variant !== 'default'
                                    ? variantStyles.text
                                    : 'inherit',
                        }}
                    >
                        {title}
                    </div>
                )}
                {description && (
                    <div
                        style={{
                            fontSize: 12,
                            color: 'var(--tg-theme-hint-color, #888888)',
                            lineHeight: 1.35,
                        }}
                    >
                        {description}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};

export const AlertTitle = ({ children }: { children?: unknown }): string => (
    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
        {children}
    </div>
);

export const AlertDescription = ({
    children,
}: {
    children?: unknown;
}): string => (
    <div
        style={{
            fontSize: 12,
            color: 'var(--tg-theme-hint-color, #888888)',
            lineHeight: 1.35,
        }}
    >
        {children}
    </div>
);
