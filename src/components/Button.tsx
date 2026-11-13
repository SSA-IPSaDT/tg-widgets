/**
 * Telegram Widgets Button Component.
 *
 * @module components/Button
 */

import { h } from '../jsx';

/**
 * Properties for the Button component.
 */
export interface ButtonProps {
    /**
     * Unique HTML element ID.
     */
    id?: string;
    /**
     * Visual style variant ('primary', 'secondary', 'destructive', 'outline', or 'ghost').
     * @default 'primary'
     */
    variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
    /**
     * Button dimension size ('sm', 'md', or 'lg').
     * @default 'md'
     */
    size?: 'sm' | 'md' | 'lg';
    /**
     * Custom border radius in pixels.
     */
    radius?: number;
    /**
     * When true, expands button to fill 100% of parent width.
     * @default false
     */
    fullWidth?: boolean;
    /**
     * When true, disables clicks and dims button opacity.
     * @default false
     */
    disabled?: boolean;
    /**
     * When true, renders an animated loading spinner inside the button.
     * @default false
     */
    loading?: boolean;
    /**
     * Action string dispatched via data-action on click.
     */
    action?: string;
    /**
     * Optional icon element or SVG rendered preceding the label.
     */
    icon?: unknown;
    /**
     * Custom inline style overrides.
     */
    style?: Record<string, string | number | undefined | null>;
    /**
     * Custom CSS class names.
     */
    className?: string;
    /**
     * Child elements or text label.
     */
    children?: unknown;
    /**
     * Arbitrary data-* attributes.
     */
    [key: `data-${string}`]: string | undefined;
}

/**
 * Renders an official Telegram interactive button adhering to Telegram UI design tokens.
 *
 * @param props Button properties.
 * @returns Rendered HTML button element.
 */
export const Button = ({
    id,
    action,
    variant = 'primary',
    size = 'md',
    radius,
    fullWidth = false,
    disabled = false,
    loading = false,
    icon,
    style,
    className = '',
    children,
    ...dataAttrs
}: ButtonProps): string => {
    const fullClass = fullWidth ? 'tg-btn-full' : '';
    const overrides: Record<string, string | number | undefined | null> = {
        ...(radius !== undefined ? { borderRadius: radius } : {}),
        ...(disabled || loading ? { cursor: 'default', opacity: 0.6 } : {}),
        ...style,
    };

    return (
        <button
            id={id}
            data-action={action}
            class={`tg-btn tg-btn-${variant} tg-btn-${size} ${fullClass} ${className}`.trim()}
            style={Object.keys(overrides).length > 0 ? overrides : undefined}
            disabled={disabled || loading}
            {...dataAttrs}
        >
            {loading ? (
                <span
                    style={{
                        display: 'inline-block',
                        width: 14,
                        height: 14,
                        border: '2px solid currentColor',
                        borderRightColor: 'transparent',
                        borderRadius: '50%',
                    }}
                />
            ) : (
                icon
            )}
            {children}
        </button>
    );
};
