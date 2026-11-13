import { h } from '../jsx';

/**
 * Props for the Switch / Toggle component.
 */
export interface SwitchProps {
    /** Unique DOM element identifier. */
    id?: string;
    /** Whether switch toggle is ON. */
    checked?: boolean;
    /** Whether switch is disabled. */
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
 * Switch / Toggle component for Telegram Widgets.
 * Features GPU-accelerated 120ms transitions and instant tactile `:active` state.
 *
 * @example
 * <Switch id="notify" checked={true} label="Notifications" description="Receive instant updates" />
 */
export const Switch = ({
    id,
    checked = false,
    disabled = false,
    label,
    description,
    action,
    style,
    className = '',
    ...dataAttrs
}: SwitchProps): string => {
    return (
        <button
            type="button"
            id={id}
            data-action={action}
            disabled={disabled}
            class={`tg-switch ${className}`.trim()}
            style={style}
            {...dataAttrs}
        >
            {(label || description) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {label && <span style={{ fontWeight: 500, fontSize: 14 }}>{label}</span>}
                    {description && <span class="tg-description">{description}</span>}
                </div>
            )}
            <div class={`tg-switch-track ${checked ? 'active' : ''}`.trim()}>
                <div class="tg-switch-thumb" />
            </div>
        </button>
    );
};

/**
 * Alias for Switch representing a toggle control.
 */
export const Toggle: (props: SwitchProps) => string = Switch;
