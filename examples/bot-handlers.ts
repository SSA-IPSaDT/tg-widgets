import { Bot, Context, InlineKeyboard } from 'grammy';
import { inspectWidgetSizeAsync, type WidgetsFlavor } from '../src';
import { cryptoScreen, profileScreen, screens, tournamentScreen } from './index';

export type BotContext = Context & WidgetsFlavor<typeof screens>;

/**
 * Generates technical caption detailing widget size against the 4096-byte limit.
 */
export const getWidgetCaption = async (
    screenId: keyof typeof screens,
    props: unknown,
): Promise<string> => {
    const screen = screens[screenId];
    const html = screen.component(props as never);
    const report = await inspectWidgetSizeAsync(html);
    const pct = ((report.compressedByteLength / report.maxAllowed) * 100).toFixed(1);
    const free = report.maxAllowed - report.compressedByteLength;

    return (
        `📊 *Widget Size:* ${report.compressedByteLength} / ${report.maxAllowed} B (${pct}%) | Free: ${free} B\n` +
        `📄 *Raw HTML:* ${report.byteLength} B`
    );
};

/**
 * Registers all showcase bot commands and inline callback queries.
 */
export function registerBotHandlers(bot: Bot<BotContext>, isTestEnv: boolean): void {
    bot.command('start', async (ctx) => {
        const keyboard = new InlineKeyboard()
            .text('📖 Accordion (details)', 'show_accordion')
            .text('🎛️ Form Controls', 'show_controls')
            .row()
            .text('👤 Profile & Fallback', 'show_profile')
            .text('♟️ Chess Tournament', 'show_tournament')
            .row()
            .text('💎 TON Wallet', 'show_crypto')
            .text('🛍️ E-Commerce Cart', 'show_ecommerce')
            .row()
            .text('🔔 Alerts & Badges', 'show_alerts')
            .text('💳 Cards & Metrics', 'show_cards')
            .row()
            .text('🗳️ Live Poll', 'show_poll')
            .text('📊 Data Table', 'show_table')
            .row()
            .text('🔢 Interactive Counter', 'show_counter');

        const envInfo = isTestEnv ? ' 🧪 *(Telegram Test DC)*' : '';

        await ctx.reply(
            `👋 *@ipsadt/tg-widgets Showcase (Bot API 10.4)*${envInfo}\n\n` +
                'Select a component below to test interactive Telegram Widgets.\n' +
                'Each message includes precise byte-level compression diagnostics.',
            {
                parse_mode: 'Markdown',
                reply_markup: keyboard,
            },
        );
    });

    bot.command('accordion', async (ctx) => {
        const props = {};
        await ctx.widgets.reply('accordion', {
            props,
            caption: await getWidgetCaption('accordion', props),
        });
    });

    bot.command('controls', async (ctx) => {
        const props = {
            notifications: true,
            newsletter: false,
            plan: 'pro',
            tickets: 2,
        };
        await ctx.widgets.reply('controls', {
            props,
            caption: await getWidgetCaption('controls', props),
        });
    });

    bot.command('table', async (ctx) => {
        const props = {};
        await ctx.widgets.reply('table', {
            props,
            caption: await getWidgetCaption('table', props),
        });
    });

    bot.command('alerts', async (ctx) => {
        const props = {};
        await ctx.widgets.reply('alerts', {
            props,
            caption: await getWidgetCaption('alerts', props),
        });
    });

    bot.command('cards', async (ctx) => {
        const props = {};
        await ctx.widgets.reply('cards', {
            props,
            caption: await getWidgetCaption('cards', props),
        });
    });

    bot.command('counter', async (ctx) => {
        const props = { count: 0 };
        await ctx.widgets.reply('counter', {
            props,
            caption: await getWidgetCaption('counter', props),
        });
    });

    bot.command('poll', async (ctx) => {
        const props = {
            votes: { grammy: 48, telegraf: 21, aiogram: 35 },
            userVote: 'grammy' as const,
        };
        await ctx.widgets.reply('poll', {
            props,
            caption: await getWidgetCaption('poll', props),
        });
    });

    bot.command('ecommerce', async (ctx) => {
        const props = { size: 42, quantity: 1, pricePerUnit: 120 };
        await ctx.widgets.reply('ecommerce', {
            props,
            caption: await getWidgetCaption('ecommerce', props),
        });
    });

    bot.command('profile', async (ctx) => {
        const props = profileScreen.initialState();
        await ctx.widgets.reply('profile', {
            props,
            caption: await getWidgetCaption('profile', props),
        });
    });

    bot.command(['tournament', 'chess'], async (ctx) => {
        const props = tournamentScreen.initialState();
        await ctx.widgets.reply('tournament', {
            props,
            caption: await getWidgetCaption('tournament', props),
        });
    });

    bot.command(['crypto', 'wallet'], async (ctx) => {
        const props = cryptoScreen.initialState();
        await ctx.widgets.reply('crypto', {
            props,
            caption: await getWidgetCaption('crypto', props),
        });
    });

    const simpleCallbackScreens = [
        'accordion',
        'controls',
        'table',
        'alerts',
        'cards',
        'counter',
        'poll',
        'ecommerce',
        'profile',
        'tournament',
        'crypto',
    ] as const;

    for (const screenId of simpleCallbackScreens) {
        bot.callbackQuery(`show_${screenId}`, async (ctx) => {
            await ctx.answerCallbackQuery();
            let props: any = {};
            if (screenId === 'controls') {
                props = { notifications: true, newsletter: false, plan: 'pro', tickets: 2 };
            } else if (screenId === 'counter') {
                props = { count: 0 };
            } else if (screenId === 'poll') {
                props = { votes: { grammy: 48, telegraf: 21, aiogram: 35 }, userVote: 'grammy' };
            } else if (screenId === 'ecommerce') {
                props = { size: 42, quantity: 1, pricePerUnit: 120 };
            } else if (screenId === 'profile') {
                props = profileScreen.initialState();
            } else if (screenId === 'tournament') {
                props = tournamentScreen.initialState();
            } else if (screenId === 'crypto') {
                props = cryptoScreen.initialState();
            }
            await ctx.widgets.send(screenId, {
                props,
                caption: await getWidgetCaption(screenId, props),
            });
        });
    }
}
