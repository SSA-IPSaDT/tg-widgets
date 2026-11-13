/**
 * Telegram Widgets Checkbox Control Component.
 *
 * @module components/Checkbox
 */

import { h } from '../jsx';

/**
 * Properties for the Checkbox component.
 */
export interface CheckboxProps {
    /**
     * Unique HTML element ID.
     */
    id?: string;
    /**
     * Checked state toggle.
     * @default false
     */
    checked?: boolean;
    /**
     * Whether the control is disabled.
     * @default false
     */
    disabled?: boolean;
    /**
     * Primary label text or element.
     */
    label?: unknown;
    /**
     * Secondary description text.
     */
    description?: unknown;
    /**
     * Action string dispatched via data-action on change.
     */
    action?: string;
    /**
     * Custom inline style overrides.
     */
    style?: Record<string, string | number | undefined | null>;
    /**
     * Custom CSS class names.
     */
    className?: string;
    /**
     * Arbitrary data-* attributes.
     */
    [key: `data-${string}`]: string | undefined;
}

/**
 * Interactive Checkbox control for Telegram Widgets (QuickJS Profile 1 compliant).
 * Renders lightweight vector SVG checkmarks without prohibited `<input>` tags.
 *
 * @param props Checkbox properties.
 * @returns Rendered HTML button element.
 *
 * @example
 * <Checkbox id="chk-terms" checked={true} label="Accept Terms" description="I agree to terms of service" />
 */
export const Checkbox = ({
    id,
    checked = false,
    disabled = false,
    label,
    description,
    action,
    style,
    className = '',
    ...dataAttrs
}: CheckboxProps): string => {
    const boxIcon = checked ? (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            style={{
                flexShrink: 0,
                marginTop: description ? 2 : 0,
            }}
        >
            <rect width="20" height="20" rx="5" fill="var(--tg-theme-button-color, #2481cc)" />
            <path
                d="M5.5 10.5L8.5 13.5L14.5 7"
                stroke="var(--tg-theme-button-text-color, #ffffff)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    ) : (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            style={{
                flexShrink: 0,
                marginTop: description ? 2 : 0,
            }}
        >
            <rect
                x="1"
                y="1"
                width="18"
                height="18"
                rx="5"
                stroke="var(--tg-theme-hint-color, rgba(120, 120, 128, 0.4))"
                strokeWidth="1.5"
            />
        </svg>
    );

    return (
        <button
            type="button"
            id={id}
            data-action={action}
            disabled={disabled}
            class={`tg-checkbox ${className}`.trim()}
            style={{
                ...(description ? { alignItems: 'flex-start' } : {}),
                ...style,
            }}
            {...dataAttrs}
        >
            {boxIcon}
            {(label || description) && (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    {label && <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>}
                    {description && <span class="tg-description">{description}</span>}
                </div>
            )}
        </button>
    );
};
