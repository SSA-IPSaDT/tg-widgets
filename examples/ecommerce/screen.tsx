import { defineWidgetScreen, type WidgetActionContext } from '../../src';
import { EcommerceProductView } from './view';

export interface EcommerceState {
    size: number;
    quantity: number;
    pricePerUnit: number;
}

export * from './client';
export * from './view';

/**
 * E-commerce mini product card screen with interactive size selector, quantity stepper,
 * dynamic total recalculation, and checkout action.
 */
export const ecommerceScreen = defineWidgetScreen({
    id: 'ecommerce',
    component: EcommerceProductView,
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
