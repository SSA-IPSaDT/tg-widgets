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

    const btnStyle: Record<string, string | number | undefined | null> = {
        flex: '0 0 28px',
        width: 28,
        height: 28,
        minWidth: 28,
        maxWidth: 28,
        minHeight: 28,
        maxHeight: 28,
        aspectRatio: '1 / 1',
        padding: 0,
        margin: 0,
        boxSizing: 'border-box',
        borderRadius: 6,
        border: '1px solid var(--tg-theme-section-separator-color, rgba(120, 120, 128, 0.16))',
        background:
            'var(--tg-theme-section-bg-color, var(--tg-theme-bg-color, #ffffff))',
        color: 'var(--tg-theme-text-color, inherit)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 0,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
        touchAction: 'manipulation',
    };

    return (
        <div
            id={id}
            class={`tg-stepper ${className}`.trim()}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                background:
                    'var(--tg-theme-secondary-bg-color, rgba(120, 120, 128, 0.14))',
                borderRadius: 8,
                padding: 3,
                gap: 4,
                flexShrink: 0,
                ...style,
            }}
            {...dataAttrs}
        >
            <button
                type="button"
                data-action={decrementAction}
                disabled={disabled || isMin}
                class="tg-stepper-btn"
                style={{
                    ...btnStyle,
                    cursor: disabled || isMin ? 'default' : 'pointer',
                    opacity: disabled || isMin ? 0.35 : 1,
                }}
            >
                {LucideIcon({
                    icon: LucideIcons.Minus,
                    size: 14,
                    strokeWidth: 2.2,
                    style: { display: 'block', margin: 'auto' },
                })}
            </button>
            <span
                style={{
                    minWidth: 28,
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: 14,
                    color: 'var(--tg-theme-text-color, inherit)',
                    userSelect: 'none',
                }}
            >
                {value}
            </span>
            <button
                type="button"
                data-action={incrementAction}
                disabled={disabled || isMax}
                class="tg-stepper-btn"
                style={{
                    ...btnStyle,
                    cursor: disabled || isMax ? 'default' : 'pointer',
                    opacity: disabled || isMax ? 0.35 : 1,
                }}
            >
                {LucideIcon({
                    icon: LucideIcons.Plus,
                    size: 14,
                    strokeWidth: 2.2,
                    style: { display: 'block', margin: 'auto' },
                })}
            </button>
        </div>
    );
};
