import { defineWidgetScreen, WidgetActionContext } from '../../src';
import { PollView } from './view';

export { pollClientScript } from './client';
export { PollView } from './view';

/**
 * State contract for the interactive community poll widget.
 */
export interface PollState {
    votes: {
        grammy: number;
        telegraf: number;
        aiogram: number;
    };
    userVote?: 'grammy' | 'telegraf' | 'aiogram';
}

/**
 * Community poll widget screen featuring interactive voting options, live progress bars,
 * haptic feedback, and server synchronization via `window.TelegramWidget.request()`.
 *
 * @example
 * ```tsx
 * import { pollScreen } from './poll/screen';
 *
 * await bot.api.sendMessage(chatId, 'Poll', {
 *   reply_markup: {
 *     inline_keyboard: [[{
 *       text: 'Vote Now',
 *       callback_data: 'open_poll'
 *     }]]
 *   }
 * });
 * ```
 */
export const pollScreen = defineWidgetScreen({
    id: 'poll',
    component: PollView,
    initialState: (props?: Partial<PollState>): PollState => ({
        votes: props?.votes ?? {
            grammy: 48,
            telegraf: 21,
            aiogram: 35,
        },
        userVote: props?.userVote ?? 'grammy',
    }),
    actions: {
        vote: async (ctx: WidgetActionContext<PollState>, payload?: unknown) => {
            const choice = String(payload) as 'grammy' | 'telegraf' | 'aiogram';
            const state = { ...ctx.state };
            if (state.userVote && state.userVote !== choice) {
                state.votes[state.userVote] = Math.max(0, state.votes[state.userVote] - 1);
            }
            if (state.userVote !== choice) {
                state.votes[choice] = (state.votes[choice] ?? 0) + 1;
                state.userVote = choice;
            }
            await ctx.setState(state);
            return state;
        },
    },
});
