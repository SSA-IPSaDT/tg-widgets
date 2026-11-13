import { defineWidgetScreen, WidgetActionContext } from '../../src';
import { CardsView } from './view';

export { cardsClientScript, CardsView } from './view';

/**
 * State contract for the cards widget.
 */
export type CardsState = Record<string, never>;

/**
 * Metric cards screen featuring balance summaries, progress bars, and quick actions.
 * Demonstrates shadcn/ui compound card architecture inside Telegram bubbles.
 *
 * @example
 * await ctx.widgets.reply('cards', { props: {} });
 */
export const cardsScreen = defineWidgetScreen({
    id: 'cards',
    component: CardsView,
    initialState: () => ({}),
    actions: {
        statement: async (ctx: WidgetActionContext<Record<string, unknown>>) => {
            return ctx.answer({
                text: '📄 Generating account statement...',
                show_alert: false,
            });
        },
        topup: async (ctx: WidgetActionContext<Record<string, unknown>>) => {
            return ctx.answer({
                text: '💳 Opening payment gateway...',
                show_alert: false,
            });
        },
    },
});
