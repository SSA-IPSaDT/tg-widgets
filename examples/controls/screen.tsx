import { defineWidgetScreen, type WidgetActionContext } from '../../src';
import { ControlsView } from './view';

export interface ControlsState {
    notify: boolean;
    news: boolean;
    plan: string;
    tickets: number;
}

export * from './client';
export * from './view';

/**
 * Controls widget screen demonstrating Switch, Checkbox, RadioGroup, and Stepper
 * components with client-side optimistic UI updates and haptic feedback.
 */
export const controlsScreen = defineWidgetScreen({
    id: 'controls',
    component: ControlsView,
    initialState: (props?: Partial<ControlsState>): ControlsState => ({
        notify: props?.notify ?? true,
        news: props?.news ?? false,
        plan: props?.plan ?? 'pro',
        tickets: props?.tickets ?? 2,
    }),
    actions: {
        toggleNotify: async (ctx: WidgetActionContext<ControlsState>, payload?: unknown) => {
            const nextVal = typeof payload === 'boolean' ? payload : !ctx.state.notify;
            const next = {
                ...ctx.state,
                notify: nextVal,
            };
            await ctx.setState(next);
            return next;
        },
        toggleNews: async (ctx: WidgetActionContext<ControlsState>, payload?: unknown) => {
            const nextVal = typeof payload === 'boolean' ? payload : !ctx.state.news;
            const next = { ...ctx.state, news: nextVal };
            await ctx.setState(next);
            return next;
        },
        ticketPlus: async (ctx: WidgetActionContext<ControlsState>) => {
            const next = {
                ...ctx.state,
                tickets: Math.min(10, ctx.state.tickets + 1),
            };
            await ctx.setState(next);
            return next;
        },
        ticketMinus: async (ctx: WidgetActionContext<ControlsState>) => {
            const next = {
                ...ctx.state,
                tickets: Math.max(1, ctx.state.tickets - 1),
            };
            await ctx.setState(next);
            return next;
        },
        setPlan: async (ctx: WidgetActionContext<ControlsState>, payload?: unknown) => {
            const next = { ...ctx.state, plan: String(payload ?? 'basic') };
            await ctx.setState(next);
            return next;
        },
    },
});
