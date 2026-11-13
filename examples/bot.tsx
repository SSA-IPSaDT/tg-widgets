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

// Register Telegram widgets plugin with flexible configuration:
// - mode: 'dev' on Telegram Test DC for readable JSON, 'prod' in production
// - codec: 'dev' preserves full key names for maximum compatibility and transparent debugging
// - sizeLimit: enforces Telegram's 4096-byte deflate limit
// - storage: in-memory LRU cache with 24h TTL
const widgets = createTelegramWidgetsPlugin({
    screens,
    mode: isTestEnv ? 'dev' : 'prod',
    codec: 'dev',
    minifier: 'terser',
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

// Register command and callback query handlers
registerBotHandlers(bot, isTestEnv);

console.log('🚀 Telegram Widgets Bot successfully initialized!');
console.log(`🌐 Telegram Environment: ${isTestEnv ? '🧪 TEST SERVER (Test DC)' : '🟢 PRODUCTION'}`);
if (apiRoot) {
    console.log(`🔗 API Root: ${apiRoot}`);
}

bot.start();
