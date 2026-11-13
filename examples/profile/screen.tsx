import { defineWidgetScreen, type WidgetActionContext } from '../../src';
import { ProfileView } from './view';

export { profileClientScript } from './client';
export { ProfileView } from './view';

/**
 * State contract for the user profile widget.
 */
export interface ProfileState {
    name: string;
    username: string;
    notifications: boolean;
    privateMode: boolean;
    soundEffects: boolean;
}

/**
 * User profile screen featuring avatar header, interactive preferences switches,
 * experimental feature alert, and fallback to classic text messages.
 *
 * @example
 * ```tsx
 * import { profileScreen } from './profile/screen';
 *
 * await bot.api.sendMessage(chatId, 'Profile', {
 *   reply_markup: {
 *     inline_keyboard: [[{
 *       text: 'Open Profile',
 *       callback_data: 'open_profile'
 *     }]]
 *   }
 * });
 * ```
 */
export const profileScreen = defineWidgetScreen({
    id: 'profile',
    component: ProfileView,
    initialState: () => ({
        name: 'Alex Smirnov',
        username: '@alex_dev',
        notifications: true,
        privateMode: false,
        soundEffects: true,
    }),
    actions: {
        toggleProfileNotify: async (ctx: WidgetActionContext<ProfileState>, payload?: unknown) => {
            const nextVal = typeof payload === 'boolean' ? payload : !ctx.state.notifications;
            const next = { ...ctx.state, notifications: nextVal };
            await ctx.setState(next);
            return next;
        },
        toggleProfilePrivate: async (ctx: WidgetActionContext<ProfileState>, payload?: unknown) => {
            const nextVal = typeof payload === 'boolean' ? payload : !ctx.state.privateMode;
            const next = { ...ctx.state, privateMode: nextVal };
            await ctx.setState(next);
            return next;
        },
        toggleProfileSound: async (ctx: WidgetActionContext<ProfileState>, payload?: unknown) => {
            const nextVal = typeof payload === 'boolean' ? payload : !ctx.state.soundEffects;
            const next = { ...ctx.state, soundEffects: nextVal };
            await ctx.setState(next);
            return next;
        },
        fallbackToText: async (ctx: WidgetActionContext<ProfileState>) => {
            if (ctx.chatId && ctx.messageId) {
                try {
                    await (ctx.rawApi as any).editMessageText?.({
                        chat_id: ctx.chatId,
                        message_id: ctx.messageId,
                        text:
                            `👤 *User Profile (Text Mode)*\n\n` +
                            `*Name:* ${ctx.state.name}\n` +
                            `*Username:* ${ctx.state.username}\n\n` +
                            `🔔 *Notifications:* ${ctx.state.notifications ? 'Enabled' : 'Disabled'}\n` +
                            `🔒 *Private Mode:* ${ctx.state.privateMode ? 'Enabled' : 'Disabled'}\n` +
                            `🔊 *Sound Effects:* ${ctx.state.soundEffects ? 'Enabled' : 'Disabled'}\n\n` +
                            `_Message switched to classic text view._`,
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: '📱 Return to Widget View',
                                        callback_data: 'show_profile',
                                    },
                                ],
                            ],
                        },
                    });
                } catch {
                    // ignore if already edited
                }
            }
            return ctx.answer({
                text: 'Switched to plain text view',
            });
        },
    },
});
