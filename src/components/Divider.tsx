/**
 * Telegram Widgets Divider & Separator Component.
 *
 * @module components/Divider
 */

import { h } from '../jsx';

/**
 * Properties for the Divider component.
 */
export interface DividerProps {
    /**
     * Optional inset indent in pixels or boolean toggle for default list indent (16px).
     * @default false
     */
    inset?: number | boolean;
    /**
     * Custom line color in hex or CSS color format.
     */
    color?: string;
    /**
     * Custom inline style overrides.
     */
    style?: Record<string, string | number | undefined | null>;
    /**
     * Custom CSS class names.
     */
    className?: string;
}

/**
 * Renders a subtle hairline horizontal divider adhering to Telegram theme separator tokens.
 *
 * @param props Divider properties.
 * @returns Rendered HTML hr element.
 */
export const Divider = ({ inset = false, color, style, className = '' }: DividerProps): string => {
    const marginLeft = typeof inset === 'number' ? inset : inset ? 16 : 0;
    const customStyle: Record<string, string | number | undefined | null> = {
        ...(marginLeft > 0 ? { marginLeft } : {}),
        ...(color && color !== 'rgba(120, 120, 128, 0.14)' ? { backgroundColor: color } : {}),
        ...style,
    };

    return (
        <hr
            class={`tg-divider ${className}`.trim()}
            style={Object.keys(customStyle).length > 0 ? customStyle : undefined}
        />
    );
};

/**
 * Separator alias for Divider.
 */
export const Separator: (props: DividerProps) => string = Divider;
