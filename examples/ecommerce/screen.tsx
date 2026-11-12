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

export interface EcommerceState {
    size: number;
    quantity: number;
    pricePerUnit: number;
}

const ecommerceClientScript = (initial: EcommerceState) => {
    const W = (window as unknown as { TelegramWidget?: any }).TelegramWidget;
    let state = { ...initial };
    const toast = document.getElementById('ecom-toast');

    const updateEcomUI = () => {
        // Обновление размеров
        const sizes = [41, 42, 43, 44];
        for (const s of sizes) {
            const el = document.getElementById(`size-${s}`);
            if (el) {
                if (state.size === s) {
                    el.style.background = 'var(--tg-theme-button-color, #2481cc)';
                    el.style.color = '#ffffff';
                    el.style.borderColor = 'var(--tg-theme-button-color, #2481cc)';
                } else {
                    el.style.background = 'transparent';
                    el.style.color = 'var(--tg-theme-text-color, inherit)';
                    el.style.borderColor = 'rgba(120, 120, 128, 0.24)';
                }
            }
        }

        // Обновление количества и суммы
        const qtyEl = document.getElementById('ecom-qty');
        const totalEl = document.getElementById('ecom-total');
        if (qtyEl) qtyEl.textContent = String(state.quantity);
        if (totalEl) {
            totalEl.textContent = `$${(state.quantity * state.pricePerUnit).toFixed(2)}`;
        }
    };

    // Слушатели размеров
    [41, 42, 43, 44].forEach((s) => {
        document.getElementById(`size-${s}`)?.addEventListener('click', () => {
            W?.HapticFeedback?.selectionChanged?.();
            state.size = s;
            updateEcomUI();
            W?.request?.(`setSize:${s}`);
        });
    });

    // Слушатели количества
    document.getElementById('ecom-minus')?.addEventListener('click', () => {
        if (state.quantity > 1) {
            W?.HapticFeedback?.impactOccurred?.('light');
            state.quantity--;
            updateEcomUI();
            W?.request?.('qtyMinus');
        }
    });

    document.getElementById('ecom-plus')?.addEventListener('click', () => {
        if (state.quantity < 5) {
            W?.HapticFeedback?.impactOccurred?.('light');
            state.quantity++;
            updateEcomUI();
            W?.request?.('qtyPlus');
        }
    });

    // Слушатель оформления заказа
    document.getElementById('btn-checkout')?.addEventListener('click', () => {
        W?.HapticFeedback?.notificationOccurred?.('success');
        if (toast) {
            toast.textContent = `🎉 Заказ оформлен! Размер: ${state.size}, ${state.quantity} шт. на $${(state.quantity * state.pricePerUnit).toFixed(2)}`;
            toast.style.display = 'block';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 3500);
        }
        W?.request?.('checkout');
    });
};

/**
 * Экран интерактивной корзины / заказа товара (E-Commerce)
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
                            <CardTitle>Кроссовки HyperSpeed</CardTitle>
                            <Badge variant="success">В наличии</Badge>
                        </div>
                        <CardDescription>
                            Оригинальная спортивная обувь с быстрой доставкой
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Выбор размера */}
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tg-theme-hint-color, #888)', marginBottom: 6 }}>
                                Выберите размер (EU):
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

                        {/* Количество и расчет суммы */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 500 }}>
                                    Количество
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--tg-theme-hint-color, #888)' }}>
                                    ${props.pricePerUnit} / пара
                                </div>
                            </div>
                            <div
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    background: 'rgba(120, 120, 128, 0.12)',
                                    borderRadius: 10,
                                    padding: 3,
                                    gap: 4,
                                }}
                            >
                                <button
                                    type="button"
                                    id="ecom-minus"
                                    style={{
                                        width: 28,
                                        height: 28,
                                        border: 'none',
                                        borderRadius: 7,
                                        background: 'var(--tg-theme-bg-color, #fff)',
                                        color: 'var(--tg-theme-text-color, inherit)',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                    }}
                                >
                                    −
                                </button>
                                <span id="ecom-qty" style={{ minWidth: 28, textAlign: 'center', fontWeight: 600, fontSize: 14 }}>
                                    {props.quantity}
                                </span>
                                <button
                                    type="button"
                                    id="ecom-plus"
                                    style={{
                                        width: 28,
                                        height: 28,
                                        border: 'none',
                                        borderRadius: 7,
                                        background: 'var(--tg-theme-bg-color, #fff)',
                                        color: 'var(--tg-theme-text-color, inherit)',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                    }}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <Divider />

                        {/* Итоговая сумма */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 14, fontWeight: 600 }}>Итого:</span>
                            <span id="ecom-total" style={{ fontSize: 20, fontWeight: 800, color: 'var(--tg-theme-button-color, #2481cc)' }}>
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
                            Оформить заказ
                        </Button>
                    </CardFooter>

                    {/* Всплывающее подтверждение заказа */}
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
