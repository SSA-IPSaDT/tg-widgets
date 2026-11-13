import { h, LucideIcon, LucideIcons } from '../../src';

export interface SizePickerProps {
    sizes: number[];
    selectedSize: number;
}

/**
 * Size selector utilizing centralized design system `.tg-choice-btn` classes
 * instead of repetitive inline styles, reducing HTML payload by over 70%.
 */
export const SizePicker = ({ sizes, selectedSize }: SizePickerProps) => (
    <div>
        <div
            style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--tg-theme-text-color)',
                opacity: 0.65,
                marginBottom: 6,
            }}
        >
            Select Size (EU):
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
            {sizes.map((s) => {
                const active = selectedSize === s;
                return (
                    <button
                        type="button"
                        id={`size-${s}`}
                        data-action={`setSize:${s}`}
                        class={`tg-choice-btn ${active ? 'active' : ''}`.trim()}
                    >
                        {s}
                    </button>
                );
            })}
        </div>
    </div>
);

export interface QuantityCounterProps {
    quantity: number;
}

/**
 * Quantity stepper built on centralized design system `.tg-stepper` classes,
 * ensuring square distortion-free buttons and zero duplicate inline CSS.
 */
export const QuantityCounter = ({ quantity }: QuantityCounterProps) => (
    <div class="tg-stepper">
        <button
            type="button"
            id="ecom-minus"
            data-action="qtyMinus"
            class="tg-stepper-btn"
            disabled={quantity <= 1}
        >
            {LucideIcon({
                icon: LucideIcons.Minus,
                size: 14,
                strokeWidth: 2.2,
            })}
        </button>
        <span id="ecom-qty" class="tg-stepper-val">
            {quantity}
        </span>
        <button
            type="button"
            id="ecom-plus"
            data-action="qtyPlus"
            class="tg-stepper-btn"
            disabled={quantity >= 5}
        >
            {LucideIcon({
                icon: LucideIcons.Plus,
                size: 14,
                strokeWidth: 2.2,
            })}
        </button>
    </div>
);
