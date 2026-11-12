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
            bg: 'var(--tg-theme-secondary-bg-color, #f4f4f5)',
            border: '1px solid rgba(120, 120, 128, 0.20)',
            title: 'var(--tg-theme-text-color, #18181b)',
            desc: 'var(--tg-theme-text-color, #1e293b)',
            defaultIcon: null,
        },
        info: {
            bg: 'linear-gradient(rgba(36, 129, 204, 0.10), rgba(36, 129, 204, 0.10)), var(--tg-theme-bg-color, #ffffff)',
            border: '1px solid rgba(36, 129, 204, 0.30)',
            title: '#1d70b8',
            desc: 'var(--tg-theme-text-color, #1e293b)',
            defaultIcon: LucideIcon({
                icon: LucideIcons.Info,
                size: 18,
                strokeWidth: 1.75,
                color: '#1d70b8',
            }),
        },
        success: {
            bg: 'linear-gradient(rgba(16, 185, 129, 0.10), rgba(16, 185, 129, 0.10)), var(--tg-theme-bg-color, #ffffff)',
            border: '1px solid rgba(16, 185, 129, 0.30)',
            title: '#059669',
            desc: 'var(--tg-theme-text-color, #1e293b)',
            defaultIcon: LucideIcon({
                icon: LucideIcons.CircleCheck,
                size: 18,
                strokeWidth: 1.75,
                color: '#059669',
            }),
        },
        warning: {
            bg: 'linear-gradient(rgba(245, 158, 11, 0.10), rgba(245, 158, 11, 0.10)), var(--tg-theme-bg-color, #ffffff)',
            border: '1px solid rgba(245, 158, 11, 0.32)',
            title: '#b45309',
            desc: 'var(--tg-theme-text-color, #1e293b)',
            defaultIcon: LucideIcon({
                icon: LucideIcons.TriangleAlert,
                size: 18,
                strokeWidth: 1.75,
                color: '#b45309',
            }),
        },
        destructive: {
            bg: 'linear-gradient(rgba(239, 68, 68, 0.10), rgba(239, 68, 68, 0.10)), var(--tg-theme-bg-color, #ffffff)',
            border: '1px solid rgba(239, 68, 68, 0.30)',
            title: '#dc2626',
            desc: 'var(--tg-theme-text-color, #1e293b)',
            defaultIcon: LucideIcon({
                icon: LucideIcons.CircleAlert,
                size: 18,
                strokeWidth: 1.75,
                color: '#dc2626',
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
                gap: 10,
                padding: '11px 13px',
                borderRadius: 12,
                background: variantStyles.bg,
                border: variantStyles.border,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
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
                            fontSize: 13.5,
                            letterSpacing: '-0.1px',
                            color:
                                variant !== 'default'
                                    ? variantStyles.title
                                    : 'inherit',
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
                            color: variantStyles.desc,
                            opacity: 0.85,
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
            color: 'var(--tg-theme-text-color, #1e293b)',
            opacity: 0.85,
            lineHeight: 1.4,
        }}
    >
        {children}
    </div>
);
