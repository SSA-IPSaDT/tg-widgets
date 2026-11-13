import { h } from '../jsx';
import { ChevronRightIcon } from './Icon';

/**
 * Props for the List container component.
 */
export interface ListProps {
    /** Visual style variant: card with background and rounded corners, or plain transparent list. */
    variant?: 'card' | 'plain';
    /** List items or content elements. */
    children?: unknown;
    /** Custom CSS styles. */
    style?: Record<string, string | number | undefined | null>;
    /** Additional CSS class names. */
    className?: string;
}

/**
 * List container for grouping vertical list items.
 *
 * @param props - List container configuration props.
 * @returns Rendered HTML string.
 */
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

/**
 * Props for the ListItem component.
 */
export interface ListItemProps {
    /** Unique DOM element identifier. */
    id?: string;
    /** Left slot element (typically an avatar or icon). */
    left?: unknown;
    /** Primary title text or element. */
    title: unknown;
    /** Secondary descriptive subtitle text or element. */
    subtitle?: unknown;
    /** Right slot element (e.g. badge, value, or accessory). */
    right?: unknown;
    /** Whether to show a right chevron arrow. */
    chevron?: boolean;
    /** Whether item has interactive hover/pointer states. */
    interactive?: boolean;
    /** Whether interaction is disabled. */
    disabled?: boolean;
    /** Custom CSS styles. */
    style?: Record<string, string | number | undefined | null>;
    /** Additional CSS class names. */
    className?: string;
    /** Data attributes passed to root element. */
    [key: `data-${string}`]: string | undefined;
}

/**
 * Individual item row inside a List container.
 *
 * @param props - List item configuration props.
 * @returns Rendered HTML string.
 */
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
