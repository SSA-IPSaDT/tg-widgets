/**
 * Telegram Widgets Card & Section Component.
 *
 * @module components/Card
 */

import { h } from '../jsx';

/**
 * Properties for the Card component.
 */
export interface CardProps {
    /**
     * Unique HTML element ID.
     */
    id?: string;
    /**
     * Visual style variant ('default', 'section', 'secondary', 'outlined', or 'inset').
     * @default 'default'
     */
    variant?: 'default' | 'section' | 'secondary' | 'outlined' | 'inset';
    /**
     * Custom corner radius in pixels.
     */
    radius?: number;
    /**
     * Flexbox gap between children in pixels.
     * @default 8
     */
    gap?: number;
    /**
     * When true, spans 100% width of parent container.
     * @default true
     */
    fullWidth?: boolean;
    /**
     * When true, expands vertically to fill available flex height.
     * @default false
     */
    fullHeight?: boolean;
    /**
     * Optional uppercase section header text or element.
     */
    header?: unknown;
    /**
     * Optional small caption footer text or element.
     */
    footer?: unknown;
    /**
     * Custom inline style overrides.
     */
    style?: Record<string, string | number | undefined | null>;
    /**
     * Custom CSS class names.
     */
    className?: string;
    /**
     * Child elements.
     */
    children?: unknown;
    /**
     * Arbitrary data-* attributes.
     */
    [key: `data-${string}`]: string | undefined;
}

/**
 * Container card component for grouping related information and interactive widgets.
 *
 * @param props Card properties.
 * @returns Rendered HTML div element.
 */
export const Card = ({
    id,
    variant = 'default',
    radius,
    gap = 8,
    fullWidth = true,
    fullHeight = false,
    header,
    footer,
    style,
    className = '',
    children,
    ...dataAttrs
}: CardProps): string => {
    const overrides: Record<string, string | number | undefined | null> = {
        ...(radius !== undefined ? { borderRadius: radius } : {}),
        ...(gap !== 8 ? { gap } : {}),
        ...(!fullWidth ? { width: 'auto' } : {}),
        ...(fullHeight ? { height: '100%', flex: 1 } : {}),
        ...style,
    };

    return (
        <div
            id={id}
            class={`tg-card tg-card-${variant} ${className}`.trim()}
            style={Object.keys(overrides).length > 0 ? overrides : undefined}
            {...dataAttrs}
        >
            {header && (
                <div
                    style={{
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        color: 'var(--tg-theme-section-header-text-color, var(--tg-theme-subtitle-text-color, var(--tg-theme-text-color, #111827)))',
                        opacity: 0.7,
                    }}
                >
                    {header}
                </div>
            )}
            {children}
            {footer && (
                <div
                    style={{
                        fontSize: 11.5,
                        color: 'var(--tg-theme-subtitle-text-color, var(--tg-theme-text-color, #111827))',
                        opacity: 0.7,
                        marginTop: 4,
                    }}
                >
                    {footer}
                </div>
            )}
        </div>
    );
};

/**
 * Section container alias for Card.
 */
export const Section: (props: CardProps) => string = Card;

/**
 * Header container element for Card layouts.
 *
 * @param props Subcomponent properties.
 * @returns Rendered HTML div element.
 */
export const CardHeader = ({
    children,
    style,
    className = '',
}: {
    /**
     * Child elements.
     */
    children?: unknown;
    /**
     * Custom style overrides.
     */
    style?: Record<string, string | number | undefined | null>;
    /**
     * Custom CSS class name.
     */
    className?: string;
}): string => (
    <div class={`tg-card-header ${className}`.trim()} style={style}>
        {children}
    </div>
);

/**
 * Primary title typography for Card layouts.
 *
 * @param props Subcomponent properties.
 * @returns Rendered HTML div element.
 */
export const CardTitle = ({
    children,
    style,
    className = '',
}: {
    /**
     * Child elements.
     */
    children?: unknown;
    /**
     * Custom style overrides.
     */
    style?: Record<string, string | number | undefined | null>;
    /**
     * Custom CSS class name.
     */
    className?: string;
}): string => (
    <div class={`tg-card-title ${className}`.trim()} style={style}>
        {children}
    </div>
);

/**
 * Subtitle and description typography for Card layouts.
 *
 * @param props Subcomponent properties.
 * @returns Rendered HTML div element.
 */
export const CardDescription = ({
    children,
    style,
    className = '',
}: {
    /**
     * Child elements.
     */
    children?: unknown;
    /**
     * Custom style overrides.
     */
    style?: Record<string, string | number | undefined | null>;
    /**
     * Custom CSS class name.
     */
    className?: string;
}): string => (
    <div class={`tg-description ${className}`.trim()} style={style}>
        {children}
    </div>
);

/**
 * Main content body for Card layouts.
 *
 * @param props Subcomponent properties.
 * @returns Rendered HTML div element.
 */
export const CardContent = ({
    children,
    style,
    className = '',
}: {
    /**
     * Child elements.
     */
    children?: unknown;
    /**
     * Custom style overrides.
     */
    style?: Record<string, string | number | undefined | null>;
    /**
     * Custom CSS class name.
     */
    className?: string;
}): string => (
    <div class={`tg-card-content ${className}`.trim()} style={style}>
        {children}
    </div>
);

/**
 * Footer action row for Card layouts.
 *
 * @param props Subcomponent properties.
 * @returns Rendered HTML div element.
 */
export const CardFooter = ({
    children,
    style,
    className = '',
}: {
    /**
     * Child elements.
     */
    children?: unknown;
    /**
     * Custom style overrides.
     */
    style?: Record<string, string | number | undefined | null>;
    /**
     * Custom CSS class name.
     */
    className?: string;
}): string => (
    <div class={`tg-card-footer ${className}`.trim()} style={style}>
        {children}
    </div>
);
