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
    const defaultIcons = {
        default: null,
        info: LucideIcon({
            icon: LucideIcons.Info,
            size: 16,
            strokeWidth: 2,
            color: 'var(--tg-theme-link-color, #2481cc)',
        }),
        success: LucideIcon({
            icon: LucideIcons.CircleCheck,
            size: 16,
            strokeWidth: 2,
            color: '#10b981',
        }),
        warning: LucideIcon({
            icon: LucideIcons.TriangleAlert,
            size: 16,
            strokeWidth: 2,
            color: '#f59e0b',
        }),
        destructive: LucideIcon({
            icon: LucideIcons.CircleAlert,
            size: 16,
            strokeWidth: 2,
            color: 'var(--tg-theme-destructive-text-color, #ef4444)',
        }),
    };

    const currentIcon = icon ?? defaultIcons[variant];

    return (
        <div
            id={id}
            class={`tg-alert tg-alert-${variant} ${className}`.trim()}
            style={{
                border: '1px solid',
                ...style,
            }}
            {...dataAttrs}
        >
            {currentIcon && (
                <div class="tg-alert-icon">
                    {currentIcon}
                </div>
            )}
            <div class="tg-alert-body">
                {title && <div class="tg-alert-title">{title}</div>}
                {description && (
                    <div class="tg-alert-desc" style={{ fontWeight: 500 }}>
                        {description}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};

export const AlertTitle = ({ children }: { children?: unknown }): string => (
    <div class="tg-alert-title">
        {children}
    </div>
);

export const AlertDescription = ({
    children,
}: {
    children?: unknown;
}): string => (
    <div class="tg-alert-desc" style={{ fontWeight: 500 }}>
        {children}
    </div>
);
