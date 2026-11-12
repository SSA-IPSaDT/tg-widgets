import { h } from '../jsx';
import { LucideIcon, LucideIcons } from './LucideIcon';

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
 * Отображает важные сообщения, уведомления об ошибках и статусы с подлинными Lucide SVG иконками.
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
            iconBg: 'rgba(120, 120, 128, 0.12)',
            iconColor: 'var(--tg-theme-text-color, inherit)',
            defaultIcon: null,
        },
        info: {
            iconBg: 'rgba(36, 129, 204, 0.14)',
            iconColor: 'var(--tg-theme-link-color, #2481cc)',
            defaultIcon: LucideIcon({
                icon: LucideIcons.Info,
                size: 16,
                strokeWidth: 1.75,
                color: 'var(--tg-theme-link-color, #2481cc)',
            }),
        },
        success: {
            iconBg: 'rgba(16, 185, 129, 0.14)',
            iconColor: '#10b981',
            defaultIcon: LucideIcon({
                icon: LucideIcons.CircleCheck,
                size: 16,
                strokeWidth: 1.75,
                color: '#10b981',
            }),
        },
        warning: {
            iconBg: 'rgba(245, 158, 11, 0.14)',
            iconColor: '#f59e0b',
            defaultIcon: LucideIcon({
                icon: LucideIcons.TriangleAlert,
                size: 16,
                strokeWidth: 1.75,
                color: '#f59e0b',
            }),
        },
        destructive: {
            iconBg: 'rgba(239, 68, 68, 0.14)',
            iconColor: 'var(--tg-theme-destructive-text-color, #ef4444)',
            defaultIcon: LucideIcon({
                icon: LucideIcons.CircleAlert,
                size: 16,
                strokeWidth: 1.75,
                color: 'var(--tg-theme-destructive-text-color, #ef4444)',
            }),
        },
    }[variant];

    const currentIcon = icon ?? variantStyles.defaultIcon;

    return (
        <div
            id={id}
            class={`tg-alert tg-alert-${variant} ${className}`.trim()}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 14,
                background: 'var(--tg-theme-section-bg-color, var(--tg-theme-bg-color, #ffffff))',
                border: '1px solid var(--tg-theme-section-separator-color, rgba(120, 120, 128, 0.16))',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                color: 'var(--tg-theme-text-color, inherit)',
                width: '100%',
                boxSizing: 'border-box',
                ...style,
            }}
            {...dataAttrs}
        >
            {currentIcon && (
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: variantStyles.iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    {currentIcon}
                </div>
            )}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    flex: 1,
                }}
            >
                {title && (
                    <div
                        style={{
                            fontWeight: 600,
                            fontSize: 13.5,
                            letterSpacing: '-0.1px',
                            color: 'var(--tg-theme-text-color, inherit)',
                        }}
                    >
                        {title}
                    </div>
                )}
                {description && (
                    <div
                        style={{
                            fontSize: 12.5,
                            fontWeight: 400,
                            color: 'var(--tg-theme-subtitle-text-color, var(--tg-theme-text-color, inherit))',
                            opacity: 0.75,
                            lineHeight: 1.38,
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
    <div style={{ fontWeight: 600, fontSize: 13.5, letterSpacing: '-0.1px', marginBottom: 2 }}>
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
            fontSize: 12.5,
            fontWeight: 400,
            color: 'var(--tg-theme-subtitle-text-color, var(--tg-theme-text-color, inherit))',
            opacity: 0.75,
            lineHeight: 1.38,
        }}
    >
        {children}
    </div>
);
