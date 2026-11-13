import { h } from '../jsx';
import { ChevronRightIcon } from './Icon';

export interface ListProps {
    variant?: 'card' | 'plain';
    children?: unknown;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
}

export const List = ({ variant = 'card', children, style, className = '' }: ListProps): string => {
    const isCard = variant === 'card';
    return (
        <div
            class={`tg-list tg-list-${variant} ${className}`}
            style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: isCard ? 10 : 0,
                background: isCard
                    ? 'var(--tg-theme-secondary-bg-color, rgba(0, 0, 0, 0.04))'
                    : 'transparent',
                overflow: 'hidden',
                ...style,
            }}
        >
            {children}
        </div>
    );
};

export interface ListItemProps {
    id?: string;
    left?: unknown;
    title: unknown;
    subtitle?: unknown;
    right?: unknown;
    chevron?: boolean;
    interactive?: boolean;
    disabled?: boolean;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
    [key: `data-${string}`]: string | undefined;
}

export const ListItem = ({
    id,
    left,
    title,
    subtitle,
    right,
    chevron = false,
    interactive = false,
    disabled = false,
    style,
    className = '',
    ...dataAttrs
}: ListItemProps): string => {
    return (
        <div
            id={id}
            class={`tg-list-item ${className}`}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                cursor: interactive && !disabled ? 'pointer' : 'default',
                opacity: disabled ? 0.6 : 1,
                borderBottom: '1px solid rgba(120, 120, 128, 0.1)',
                transition: 'background-color 0.15s ease',
                ...style,
            }}
            {...dataAttrs}
        >
            {left && <div style={{ flexShrink: 0, display: 'flex' }}>{left}</div>}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    flex: 1,
                    minWidth: 0,
                }}
            >
                <div
                    style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: 'var(--tg-theme-text-color, inherit)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {title}
                </div>
                {subtitle && (
                    <div
                        style={{
                            fontSize: 12,
                            color: 'var(--tg-theme-hint-color, #888888)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {subtitle}
                    </div>
                )}
            </div>
            {(right || chevron) && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        flexShrink: 0,
                        color: 'var(--tg-theme-hint-color, #888888)',
                        fontSize: 13,
                    }}
                >
                    {right}
                    {chevron && <ChevronRightIcon size={16} />}
                </div>
            )}
        </div>
    );
};
