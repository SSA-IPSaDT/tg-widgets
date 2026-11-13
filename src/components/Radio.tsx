import { h } from '../jsx';

/**
 * Props for the Radio component.
 */
export interface RadioProps {
    /** Unique DOM element identifier. */
    id?: string;
    /** Form value of this radio option. */
    value?: string;
    /** Whether this radio option is selected. */
    checked?: boolean;
    /** Whether interaction is disabled. */
    disabled?: boolean;
    /** Primary label text or element. */
    label?: unknown;
    /** Secondary descriptive hint text. */
    description?: unknown;
    /** Action name or payload triggered on click. */
    action?: string;
    /** Custom CSS styles. */
    style?: Record<string, string | number | undefined | null>;
    /** Additional CSS class names. */
    className?: string;
    /** Data attributes passed to root button element. */
    [key: `data-${string}`]: string | undefined;
}

/**
 * Interactive Radio button control for Telegram Widgets (QuickJS Profile 1 compliant).
 * Renders lightweight vector SVG circles without prohibited `<input>` tags.
 *
 * @example
 * <Radio id="plan-pro" value="pro" checked={true} label="Pro Plan" description="Full access" />
 */
export const Radio = ({
    id,
    value,
    checked = false,
    disabled = false,
    label,
    description,
    action,
    style,
    className = '',
    ...dataAttrs
}: RadioProps): string => {
    const radioIcon = checked ? (
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
            <circle
                cx="10"
                cy="10"
                r="9"
                stroke="var(--tg-theme-button-color, #2481cc)"
                strokeWidth="2"
            />
            <circle cx="10" cy="10" r="5" fill="var(--tg-theme-button-color, #2481cc)" />
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
            <circle
                cx="10"
                cy="10"
                r="9"
                stroke="var(--tg-theme-hint-color, rgba(120, 120, 128, 0.4))"
                strokeWidth="1.5"
            />
        </svg>
    );

    return (
        <button
            type="button"
            id={id}
            data-value={value}
            data-action={action}
            disabled={disabled}
            class={`tg-radio ${className}`.trim()}
            style={{
                ...(description ? { alignItems: 'flex-start' } : {}),
                ...style,
            }}
            {...dataAttrs}
        >
            {radioIcon}
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

/**
 * Props for the RadioGroup container component.
 */
export interface RadioGroupProps {
    /** Unique DOM element identifier. */
    id?: string;
    /** Vertical spacing between radio buttons in px. */
    gap?: number;
    /** Custom CSS styles. */
    style?: Record<string, string | number | undefined | null>;
    /** Additional CSS class names. */
    className?: string;
    /** Radio elements inside this group. */
    children?: unknown;
}

/**
 * Container component for grouping Radio buttons with consistent vertical spacing.
 *
 * @param props - RadioGroup configuration props.
 * @returns Rendered HTML string.
 */
export const RadioGroup = ({
    id,
    gap = 8,
    style,
    className = '',
    children,
}: RadioGroupProps): string => {
    return (
        <div
            id={id}
            class={`tg-radio-group ${className}`.trim()}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap,
                width: '100%',
                ...style,
            }}
        >
            {children}
        </div>
    );
};
