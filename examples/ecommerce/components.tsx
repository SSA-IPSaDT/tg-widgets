import { h, LucideIcon, LucideIcons } from '../../src';

export interface SizePickerProps {
    sizes: number[];
    selectedSize: number;
}

export const SizePicker = ({ sizes, selectedSize }: SizePickerProps) => (
    <div>
        <div
            style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--tg-theme-text-color, #111827)',
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
                        style={{
                            flex: 1,
                            padding: '6px 0',
                            border: active
                                ? '1px solid var(--tg-theme-button-color, #2481cc)'
                                : '1px solid rgba(120, 120, 128, 0.24)',
                            borderRadius: 12,
                            background: active
                                ? 'var(--tg-theme-button-color, #2481cc)'
                                : 'transparent',
                            color: active ? '#ffffff' : 'var(--tg-theme-text-color, inherit)',
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: 'pointer',
                            aspectRatio: '2 / 1',
                        }}
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

export const QuantityCounter = ({ quantity }: QuantityCounterProps) => (
    <div
        style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--tg-theme-secondary-bg-color, rgba(120, 120, 128, 0.14))',
            borderRadius: 8,
            padding: 3,
            gap: 4,
            flexShrink: 0,
        }}
    >
        <button
            type="button"
            id="ecom-minus"
            style={{
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
                background: 'var(--tg-theme-section-bg-color, var(--tg-theme-bg-color, #ffffff))',
                color: 'var(--tg-theme-text-color, inherit)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 0,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
                cursor: 'pointer',
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
            id="ecom-qty"
            style={{
                minWidth: 28,
                textAlign: 'center',
                fontWeight: 600,
                fontSize: 14,
            }}
        >
            {quantity}
        </span>
        <button
            type="button"
            id="ecom-plus"
            style={{
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
                background: 'var(--tg-theme-section-bg-color, var(--tg-theme-bg-color, #ffffff))',
                color: 'var(--tg-theme-text-color, inherit)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 0,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
                cursor: 'pointer',
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
