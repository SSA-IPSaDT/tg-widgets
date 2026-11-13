import { defineWidgetScreen, type WidgetActionContext } from '../../src';
import { ControlsView } from './view';

export interface ControlsState {
    notify: boolean;
    news: boolean;
    plan: string;
    tickets: number;
    notifications?: boolean;
    newsletter?: boolean;
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
    initialState: (props?: Partial<ControlsState>): ControlsState => {
        const notify = props?.notify ?? props?.notifications ?? true;
        const news = props?.news ?? props?.newsletter ?? false;
        return {
            notify,
            news,
            notifications: notify,
            newsletter: news,
            plan: props?.plan ?? 'pro',
            tickets: props?.tickets ?? 2,
        };
    },
    actions: {
        toggleNotify: async (ctx: WidgetActionContext<ControlsState>, payload?: unknown) => {
            const current = ctx.state.notify ?? ctx.state.notifications ?? true;
            const nextVal = typeof payload === 'boolean' ? payload : !current;
            const next = {
                ...ctx.state,
                notify: nextVal,
                notifications: nextVal,
            };
            await ctx.setState(next);
            return next;
        },
        toggleNews: async (ctx: WidgetActionContext<ControlsState>, payload?: unknown) => {
            const current = ctx.state.news ?? ctx.state.newsletter ?? false;
            const nextVal = typeof payload === 'boolean' ? payload : !current;
            const next = {
                ...ctx.state,
                news: nextVal,
                newsletter: nextVal,
            };
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
