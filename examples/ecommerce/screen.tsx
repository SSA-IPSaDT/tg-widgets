import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    defineWidgetScreen,
    Divider,
    h,
    LucideIcon,
    LucideIcons,
    Script,
    WidgetActionContext,
    WidgetLayout,
} from '../../src';

/**
 * State contract for the e-commerce product cart widget.
 */
export interface EcommerceState {
    size: number;
    quantity: number;
    pricePerUnit: number;
}

/**
 * Client-side script handling size selection, quantity calculation, and checkout feedback.
 */
const ecommerceClientScript = (initial: EcommerceState) => {
    const widget = window.TelegramWidget;
    let state = { ...initial };
    const toast = document.getElementById('ecom-toast');

    const updateEcomUI = () => {
        // Update size option buttons
        const availableSizes = [41, 42, 43, 44];
        for (const sizeNumber of availableSizes) {
            const sizeButton = document.getElementById(`size-${sizeNumber}`);
            if (sizeButton) {
                if (state.size === sizeNumber) {
                    sizeButton.style.background = 'var(--tg-theme-button-color, #2481cc)';
                    sizeButton.style.color = '#ffffff';
                    sizeButton.style.borderColor = 'var(--tg-theme-button-color, #2481cc)';
                } else {
                    sizeButton.style.background = 'transparent';
                    sizeButton.style.color = 'var(--tg-theme-text-color, inherit)';
                    sizeButton.style.borderColor = 'rgba(120, 120, 128, 0.24)';
                }
            }
        }

        // Update quantity and total price
        const quantityElement = document.getElementById('ecom-qty');
        const totalPriceElement = document.getElementById('ecom-total');
        if (quantityElement) quantityElement.textContent = String(state.quantity);
        if (totalPriceElement) {
            totalPriceElement.textContent = `$${(state.quantity * state.pricePerUnit).toFixed(2)}`;
        }
    };

    const syncState = () => {
        try {
            if (widget?.chatData) {
                const parsedData = JSON.parse(widget.chatData);
                if (parsedData && typeof parsedData === 'object') {
                    state = { ...state, ...parsedData };
                    updateEcomUI();
                }
            }
        } catch {
            // ignore JSON parse errors
        }
    };

    syncState();
    widget?.onEvent?.('chatDataChanged', syncState);

    // Size button listeners
    [41, 42, 43, 44].forEach((sizeNumber) => {
        document.getElementById(`size-${sizeNumber}`)?.addEventListener('click', () => {
            widget?.HapticFeedback?.selectionChanged?.();
            state.size = sizeNumber;
            updateEcomUI();
            widget?.request?.(`setSize:${sizeNumber}`);
        });
    });

    // Quantity button listeners
    document.getElementById('ecom-minus')?.addEventListener('click', () => {
        if (state.quantity > 1) {
            widget?.HapticFeedback?.impactOccurred?.('light');
            state.quantity--;
            updateEcomUI();
            widget?.request?.('qtyMinus');
        }
    });

    document.getElementById('ecom-plus')?.addEventListener('click', () => {
        if (state.quantity < 5) {
            widget?.HapticFeedback?.impactOccurred?.('light');
            state.quantity++;
            updateEcomUI();
            widget?.request?.('qtyPlus');
        }
    });

    // Checkout button listener
    document.getElementById('btn-checkout')?.addEventListener('click', () => {
        widget?.HapticFeedback?.notificationOccurred?.('success');
        if (toast) {
            toast.textContent = `🎉 Order placed! Size: ${state.size}, ${state.quantity} pair(s) for $${(state.quantity * state.pricePerUnit).toFixed(2)}`;
            toast.style.display = 'block';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 3500);
        }
        widget?.request?.('checkout');
    });
};

/**
 * E-commerce mini product card screen with interactive size selector, quantity stepper,
 * dynamic total recalculation, and checkout action.
 *
 * @example
 * ```tsx
 * import { ecommerceScreen } from './ecommerce/screen';
 *
 * await bot.api.sendMessage(chatId, 'Product', {
 *   reply_markup: {
 *     inline_keyboard: [[{
 *       text: 'Buy Shoes',
 *       callback_data: 'open_ecommerce'
 *     }]]
 *   }
 * });
 * ```
 */
export const ecommerceScreen = defineWidgetScreen({
    id: 'ecommerce',
    component: (props: EcommerceState) => {
        const sizes = [41, 42, 43, 44];
        const total = (props.quantity * props.pricePerUnit).toFixed(2);

        return (
            <WidgetLayout fullWidth padding="6px 8px">
                <Card fullWidth style={{ position: 'relative' }}>
                    <CardHeader>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <CardTitle>HyperSpeed Running Shoes</CardTitle>
                            <Badge variant="success" icon={LucideIcon({ icon: LucideIcons.Check, size: 15, strokeWidth: 2.2 })} />
                        </div>
                        <CardDescription>
                            Authentic performance footwear with express delivery
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Size selection */}
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tg-theme-text-color, #111827)', opacity: 0.65, marginBottom: 6 }}>
                                Select Size (EU):
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {sizes.map((s) => {
                                    const active = props.size === s;
                                    return (
                                        <button
                                            type="button"
                                            id={`size-${s}`}
                                            style={{
                                                flex: 1,
                                                padding: '6px 0',
                                                border: active ? '1px solid var(--tg-theme-button-color, #2481cc)' : '1px solid rgba(120, 120, 128, 0.24)',
                                                borderRadius: 8,
                                                background: active ? 'var(--tg-theme-button-color, #2481cc)' : 'transparent',
                                                color: active ? '#ffffff' : 'var(--tg-theme-text-color, inherit)',
                                                fontWeight: 600,
                                                fontSize: 13,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {s}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <Divider />

                        {/* Quantity and unit pricing */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 500 }}>
                                    Quantity
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--tg-theme-text-color, #111827)', opacity: 0.65 }}>
                                    ${props.pricePerUnit} / pair
                                </div>
                            </div>
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
                                <span id="ecom-qty" style={{ minWidth: 28, textAlign: 'center', fontWeight: 600, fontSize: 14 }}>
                                    {props.quantity}
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
                        </div>

                        <Divider />

                        {/* Order total */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 14, fontWeight: 600 }}>Total:</span>
                            <span id="ecom-total" style={{ fontSize: 20, fontWeight: 800, color: 'var(--tg-theme-link-color, var(--tg-theme-text-color, #2481cc))' }}>
                                ${total}
                            </span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            id="btn-checkout"
                            variant="primary"
                            fullWidth
                            size="md"
                            icon={LucideIcon({
                                icon: LucideIcons.ShoppingBag,
                                size: 16,
                                color: '#ffffff',
                                style: { marginRight: 6 },
                            })}
                        >
                            Place Order
                        </Button>
                    </CardFooter>

                    {/* Order confirmation toast */}
                    <div
                        id="ecom-toast"
                        style={{
                            display: 'none',
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            right: 10,
                            background: '#10b981',
                            color: '#ffffff',
                            padding: '12px 14px',
                            borderRadius: 10,
                            fontSize: 12,
                            fontWeight: 600,
                            textAlign: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                            zIndex: 10,
                        }}
                    />
                </Card>
                <Script fn={ecommerceClientScript} args={[props]} />
            </WidgetLayout>
        );
    },
    initialState: (props?: Partial<EcommerceState>): EcommerceState => ({
        size: props?.size ?? 42,
        quantity: props?.quantity ?? 1,
        pricePerUnit: props?.pricePerUnit ?? 120,
    }),
    actions: {
        setSize: async (ctx: WidgetActionContext<EcommerceState>, payload?: unknown) => {
            const size = Number(payload ?? 42);
            const next = { ...ctx.state, size };
            await ctx.setState(next);
            return next;
        },
        qtyPlus: async (ctx: WidgetActionContext<EcommerceState>) => {
            const next = { ...ctx.state, quantity: Math.min(5, ctx.state.quantity + 1) };
            await ctx.setState(next);
            return next;
        },
        qtyMinus: async (ctx: WidgetActionContext<EcommerceState>) => {
            const next = { ...ctx.state, quantity: Math.max(1, ctx.state.quantity - 1) };
            await ctx.setState(next);
            return next;
        },
        checkout: async (ctx: WidgetActionContext<EcommerceState>) => {
            await ctx.answer('ORDER_PLACED');
            return { ok: true, orderId: Date.now() };
        },
    },
});
