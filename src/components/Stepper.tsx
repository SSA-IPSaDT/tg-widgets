import { h } from '../jsx';
import { LucideIcon, LucideIcons } from './LucideIcon';

export interface StepperProps {
    id?: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    decrementAction?: string;
    incrementAction?: string;
    style?: Record<string, string | number | undefined | null>;
    className?: string;
    [key: `data-${string}`]: string | undefined;
}

/**
 * Числовой степпер (Stepper) с квадратными контролами и защитой от деформации flexbox.
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
        <div
            id={id}
            class={`tg-stepper ${className}`.trim()}
            style={style}
            {...dataAttrs}
        >
            <button
                type="button"
                data-action={decrementAction}
                disabled={disabled || isMin}
                class="tg-stepper-btn"
            >
                {LucideIcon({
                    icon: LucideIcons.Minus,
                    size: 14,
                    strokeWidth: 2.2,
                })}
            </button>
            <span class="tg-stepper-val">
                {value}
            </span>
            <button
                type="button"
                data-action={incrementAction}
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
