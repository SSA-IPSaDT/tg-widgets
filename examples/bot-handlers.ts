import { Bot, Context, InlineKeyboard } from 'grammy';
import { inspectWidgetSize, inspectWidgetSizeAsync, type WidgetsFlavor } from '../src';
import { cryptoScreen, profileScreen, screens, tournamentScreen } from './index';

export type BotContext = Context & WidgetsFlavor<typeof screens>;

/**
 * Returns canonical default props for each screen demo.
 */
const getDefaultProps = (screenId: string): any => {
    switch (screenId) {
        case 'controls':
            return { notify: true, news: false, plan: 'pro', tickets: 2 };
        case 'counter':
            return { count: 0 };
        case 'poll':
            return { votes: { grammy: 48, telegraf: 21, aiogram: 35 }, userVote: 'grammy' };
        case 'ecommerce':
            return { size: 42, quantity: 1, pricePerUnit: 120 };
        case 'profile':
            return profileScreen.initialState();
        case 'tournament':
            return tournamentScreen.initialState();
        case 'crypto':
            return cryptoScreen.initialState();
        default:
            return {};
    }
};

/**
 * Generates technical caption detailing widget size against the 4096-byte limit,
 * comparing uncompressed vs max-compressed size.
 */
export const getWidgetCaption = async (
    screenId: keyof typeof screens,
    props: unknown,
): Promise<string> => {
    const screen = screens[screenId];
    const rawHtml = screen.component(props as never);
    const uncompressed = inspectWidgetSize(rawHtml);
    const compressed = await inspectWidgetSizeAsync(rawHtml, {
        hoistStyles: true,
        purgeCss: true,
        minifyCSS: { level: 2 },
        minifyJS: { mangle: { toplevel: true }, compress: { passes: 3, unsafe: true } },
    });
    const savedHtml = uncompressed.byteLength - compressed.byteLength;
    const savedDeflate = uncompressed.compressedByteLength - compressed.compressedByteLength;
    const pct = ((savedDeflate / uncompressed.compressedByteLength) * 100).toFixed(1);
    const limitPct = ((compressed.compressedByteLength / 4096) * 100).toFixed(1);

    return (
        `⚡ *Max Compression (PurgeCSS + HoistStyles + Terser)*\n` +
        `📦 *Deflate:* ${compressed.compressedByteLength} / 4096 B (${limitPct}%) [raw: ${uncompressed.compressedByteLength} B, save: -${pct}%]\n` +
        `📄 *HTML:* ${compressed.byteLength} B (raw: ${uncompressed.byteLength} B, saved -${savedHtml} B)`
    );
};

const DEMO_SCREENS = [
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

    const replyScreen = async (ctx: BotContext, id: keyof typeof screens) => {
        const props = getDefaultProps(id);
        await ctx.widgets.reply(id as never, {
            props,
            caption: await getWidgetCaption(id, props),
        });
    };

    for (const screenId of DEMO_SCREENS) {
        bot.command(screenId, (ctx) => replyScreen(ctx, screenId));
    }
    bot.command('chess', (ctx) => replyScreen(ctx, 'tournament'));
    bot.command('wallet', (ctx) => replyScreen(ctx, 'crypto'));

    for (const screenId of DEMO_SCREENS) {
        bot.callbackQuery(`show_${screenId}`, async (ctx) => {
            await ctx.answerCallbackQuery();
            const props = getDefaultProps(screenId);
            await ctx.widgets.send(screenId, {
                props,
                caption: await getWidgetCaption(screenId, props),
            });
        });
    }
}
