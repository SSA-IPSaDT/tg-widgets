import { Bot, Context, InlineKeyboard } from 'grammy';
import { createTelegramWidgetsPlugin, inspectWidgetSizeAsync, type WidgetsFlavor } from '../src';
import { cryptoScreen, profileScreen, screens, tournamentScreen } from './index';

type BotContext = Context & WidgetsFlavor<typeof screens>;

// Environment configuration
const token = process.env.BOT_TOKEN;
const isTestEnv =
    process.env.TELEGRAM_TEST_ENV === 'true' || process.env.USE_TEST_SERVER === 'true';
const apiRoot = process.env.BOT_API_ROOT;

if (!token) {
    console.error('❌ Please specify BOT_TOKEN in your environment variables or .env file!');
    console.error('Run example:');
    console.error('  BOT_TOKEN=123456:ABC-DEF bun run examples/bot.tsx');
    console.error('To test on the Telegram Test DC:');
    console.error('  TELEGRAM_TEST_ENV=true BOT_TOKEN=... bun run examples/bot.tsx');
    process.exit(1);
}

// Initialize Telegram bot with optional Test DC support
const bot = new Bot<BotContext>(token, {
    client: {
        environment: isTestEnv ? 'test' : 'prod',
        apiRoot: apiRoot || undefined,
    },
});

// Register Telegram widgets plugin with flexible configuration:
// - mode: 'dev' on Telegram Test DC for readable JSON, 'prod' in production
// - codec: 'dev' preserves full key names; 'prod' minimizes object keys to 1-2 letters
// - sizeLimit: enforces Telegram's 4096-byte deflate limit
// - storage: in-memory LRU cache with 24h TTL
const widgets = createTelegramWidgetsPlugin({
    screens,
    mode: isTestEnv ? 'dev' : 'prod',
    codec: isTestEnv ? 'dev' : 'prod',
    sizeLimit: {
        maxBytes: 4096,
        onExceeded: isTestEnv ? 'warn' : 'error',
    },
    storage: {
        defaultTtlSeconds: 86400,
        maxEntries: 2000,
    },
});
bot.use(widgets.middleware);

/**
 * Generates technical caption detailing widget size against the 4096-byte limit
 * using the industrial html-minifier-terser compressor.
 */
const getWidgetCaption = async (
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

// Command: /start
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

// Commands for direct screen dispatch with compression metrics in caption
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

// Inline keyboard callback query handlers
bot.callbackQuery('show_accordion', async (ctx) => {
    await ctx.answerCallbackQuery();
    const props = {};
    await ctx.widgets.send('accordion', {
        props,
        caption: await getWidgetCaption('accordion', props),
    });
});

bot.callbackQuery('show_controls', async (ctx) => {
    await ctx.answerCallbackQuery();
    const props = {
        notifications: true,
        newsletter: false,
        plan: 'pro',
        tickets: 2,
    };
    await ctx.widgets.send('controls', {
        props,
        caption: await getWidgetCaption('controls', props),
    });
});

bot.callbackQuery('show_profile', async (ctx) => {
    await ctx.answerCallbackQuery();
    const props = profileScreen.initialState();
    await ctx.widgets.send('profile', {
        props,
        caption: await getWidgetCaption('profile', props),
    });
});

bot.callbackQuery('show_tournament', async (ctx) => {
    await ctx.answerCallbackQuery();
    const props = tournamentScreen.initialState();
    await ctx.widgets.send('tournament', {
        props,
        caption: await getWidgetCaption('tournament', props),
    });
});

bot.callbackQuery('show_crypto', async (ctx) => {
    await ctx.answerCallbackQuery();
    const props = cryptoScreen.initialState();
    await ctx.widgets.send('crypto', {
        props,
        caption: await getWidgetCaption('crypto', props),
    });
});

bot.callbackQuery('show_table', async (ctx) => {
    await ctx.answerCallbackQuery();
    const props = {};
    await ctx.widgets.send('table', {
        props,
        caption: await getWidgetCaption('table', props),
    });
});

bot.callbackQuery('show_alerts', async (ctx) => {
    await ctx.answerCallbackQuery();
    const props = {};
    await ctx.widgets.send('alerts', {
        props,
        caption: await getWidgetCaption('alerts', props),
    });
});

bot.callbackQuery('show_cards', async (ctx) => {
    await ctx.answerCallbackQuery();
    const props = {};
    await ctx.widgets.send('cards', {
        props,
        caption: await getWidgetCaption('cards', props),
    });
});

bot.callbackQuery('show_counter', async (ctx) => {
    await ctx.answerCallbackQuery();
    const props = { count: 0 };
    await ctx.widgets.send('counter', {
        props,
        caption: await getWidgetCaption('counter', props),
    });
});

bot.callbackQuery('show_poll', async (ctx) => {
    await ctx.answerCallbackQuery();
    const props = {
        votes: { grammy: 48, telegraf: 21, aiogram: 35 },
        userVote: 'grammy' as const,
    };
    await ctx.widgets.send('poll', {
        props,
        caption: await getWidgetCaption('poll', props),
    });
});

bot.callbackQuery('show_ecommerce', async (ctx) => {
    await ctx.answerCallbackQuery();
    const props = { size: 42, quantity: 1, pricePerUnit: 120 };
    await ctx.widgets.send('ecommerce', {
        props,
        caption: await getWidgetCaption('ecommerce', props),
    });
});

console.log('🚀 Telegram Widgets Bot successfully initialized!');
console.log(`🌐 Telegram Environment: ${isTestEnv ? '🧪 TEST SERVER (Test DC)' : '🟢 PRODUCTION'}`);
if (apiRoot) {
    console.log(`🔗 API Root: ${apiRoot}`);
}

bot.start();
