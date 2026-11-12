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
            bg: 'var(--tg-theme-secondary-bg-color, rgba(120, 120, 128, 0.12))',
            border: '1px solid var(--tg-theme-section-separator-color, rgba(120, 120, 128, 0.20))',
            iconBg: 'rgba(120, 120, 128, 0.16)',
            iconColor: 'var(--tg-theme-text-color, inherit)',
            defaultIcon: null,
        },
        info: {
            bg: 'rgba(36, 129, 204, 0.10)',
            border: '1px solid rgba(36, 129, 204, 0.28)',
            iconBg: 'rgba(36, 129, 204, 0.18)',
            iconColor: 'var(--tg-theme-link-color, #2481cc)',
            defaultIcon: LucideIcon({
                icon: LucideIcons.Info,
                size: 16,
                strokeWidth: 2,
                color: 'var(--tg-theme-link-color, #2481cc)',
            }),
        },
        success: {
            bg: 'rgba(16, 185, 129, 0.10)',
            border: '1px solid rgba(16, 185, 129, 0.28)',
            iconBg: 'rgba(16, 185, 129, 0.18)',
            iconColor: '#10b981',
            defaultIcon: LucideIcon({
                icon: LucideIcons.CircleCheck,
                size: 16,
                strokeWidth: 2,
                color: '#10b981',
            }),
        },
        warning: {
            bg: 'rgba(245, 158, 11, 0.10)',
            border: '1px solid rgba(245, 158, 11, 0.28)',
            iconBg: 'rgba(245, 158, 11, 0.18)',
            iconColor: '#f59e0b',
            defaultIcon: LucideIcon({
                icon: LucideIcons.TriangleAlert,
                size: 16,
                strokeWidth: 2,
                color: '#f59e0b',
            }),
        },
        destructive: {
            bg: 'rgba(239, 68, 68, 0.10)',
            border: '1px solid rgba(239, 68, 68, 0.28)',
            iconBg: 'rgba(239, 68, 68, 0.18)',
            iconColor: 'var(--tg-theme-destructive-text-color, #ef4444)',
            defaultIcon: LucideIcon({
                icon: LucideIcons.CircleAlert,
                size: 16,
                strokeWidth: 2,
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
                alignItems: 'flex-start',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 'var(--tg-radius-md, 14px)',
                background: variantStyles.bg,
                border: variantStyles.border,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
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
                        marginTop: 1,
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
                            fontSize: 14,
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
                            fontSize: 13,
                            fontWeight: 500,
                            color: 'var(--tg-theme-text-color, inherit)',
                            opacity: 0.90,
                            lineHeight: 1.4,
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
    <div
        style={{
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: '-0.1px',
            marginBottom: 2,
            color: 'var(--tg-theme-text-color, inherit)',
        }}
    >
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
            fontSize: 13,
            fontWeight: 400,
            color: 'var(--tg-theme-text-color, inherit)',
            opacity: 0.90,
            lineHeight: 1.4,
        }}
    >
        {children}
    </div>
);
