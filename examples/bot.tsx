import { Bot } from 'grammy';
import { createTelegramWidgetsPlugin } from '../src';
import { type BotContext, registerBotHandlers } from './bot-handlers';
import { screens } from './index';

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

// Register Telegram widgets plugin with maximum compression enabled:
// - mode: 'prod' enables full minification pipeline (HTML, CSS, JS)
// - codec: 'prod' enables dictionary key compression in chat_data
// - minifier: terser with PurgeCSS, style hoisting, and multi-pass JS minification
// - sizeLimit: enforces Telegram's 4096-byte deflate limit with automatic inspection logging
const widgets = createTelegramWidgetsPlugin({
    screens,
    mode: 'prod',
    codec: 'prod',
    minifier: {
        enabled: true,
        engine: 'terser',
        hoistStyles: true,
        purgeCss: true,
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        sortAttributes: true,
        sortClassName: true,
        collapseBooleanAttributes: true,
        minifyCSS: { level: 2 },
        minifyJS: {
            mangle: { toplevel: true },
            compress: { passes: 3, unsafe: true },
        },
    },
    logger: 'debug',
    sizeLimit: {
        maxBytes: 4096,
        onExceeded: isTestEnv ? 'warn' : 'error',
        autoInspect: true,
    },
    storage: {
        defaultTtlSeconds: 86400,
        maxEntries: 2000,
    },
});
bot.use(widgets.middleware);

// Register command and callback query handlers
registerBotHandlers(bot, isTestEnv);

// Global error handling to ensure bot resilience against network or runtime failures
bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`❌ [bot.catch] Error handling update ${ctx?.update?.update_id}:`, err.error);
});

process.on('unhandledRejection', (reason) => {
    console.error('⚠️ [process] Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('💥 [process] Uncaught Exception:', err);
});

console.log('🚀 Telegram Widgets Bot successfully initialized!');
console.log(`🌐 Telegram Environment: ${isTestEnv ? '🧪 TEST SERVER (Test DC)' : '🟢 PRODUCTION'}`);
if (apiRoot) {
    console.log(`🔗 API Root: ${apiRoot}`);
}

bot.start();
