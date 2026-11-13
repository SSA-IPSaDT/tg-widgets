import { h } from '../jsx';
import { LucideIcon, LucideIcons } from './LucideIcon';

/**
 * Props for the Stepper component.
 */
export interface StepperProps {
    /** Unique DOM element identifier. */
    id?: string;
    /** Current numeric value. */
    value: number;
    /** Minimum allowable value. Decrement is disabled when value <= min. */
    min?: number;
    /** Maximum allowable value. Increment is disabled when value >= max. */
    max?: number;
    /** Step increment/decrement amount. */
    step?: number;
    /** Whether the entire stepper is disabled. */
    disabled?: boolean;
    /** Action string fired when decrement button is pressed. Default 'decrement'. */
    decrementAction?: string;
    /** Action string fired when increment button is pressed. Default 'increment'. */
    incrementAction?: string;
    /** Custom CSS styles. */
    style?: Record<string, string | number | undefined | null>;
    /** Additional CSS class names. */
    className?: string;
    /** Data attributes passed to root container. */
    [key: `data-${string}`]: string | undefined;
}

/**
 * Numeric Stepper component with distortion-proof square buttons.
 * Serves as the primary integer increment/decrement control in Telegram Widgets.
 *
 * @example
 * <Stepper id="tickets" value={2} min={1} max={10} decrementAction="minus" incrementAction="plus" />
 */
export const Stepper = ({
    id,
    value,
    min,
    max,
    decrementAction = 'decrement',
    incrementAction = 'increment',
    disabled = false,
    style,
    className = '',
    ...dataAttrs
}: StepperProps): string => {
    const isMin = min !== undefined && value <= min;
    const isMax = max !== undefined && value >= max;

    return (
        <div id={id} class={`tg-stepper ${className}`.trim()} style={style} {...dataAttrs}>
            <button
                type="button"
                data-action={decrementAction || undefined}
                disabled={disabled || isMin}
                class="tg-stepper-btn"
            >
                {LucideIcon({
                    icon: LucideIcons.Minus,
                    size: 14,
                    strokeWidth: 2.2,
                })}
            </button>
            <span class="tg-stepper-val">{value}</span>
            <button
                type="button"
                data-action={incrementAction || undefined}
                disabled={disabled || isMax}
                class="tg-stepper-btn"
            >
                {LucideIcon({
                    icon: LucideIcons.Plus,
                    size: 14,
                    strokeWidth: 2.2,
                })}
            </button>
        </div>
    );
};
