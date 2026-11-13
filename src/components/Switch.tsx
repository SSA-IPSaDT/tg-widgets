import { h } from '../jsx';

export interface SwitchProps {
    id?: string;
    checked?: boolean;
    disabled?: boolean;
    label?: unknown;
    description?: unknown;
    action?: string;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
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

export const Toggle = Switch;
