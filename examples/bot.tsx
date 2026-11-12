import { Bot, Context, InlineKeyboard } from 'grammy';
import { createTelegramWidgetsPlugin, type WidgetsFlavor } from '../src';

// Импорт модульных экранов из соответствующих директорий
import { accordionScreen } from './accordion/screen';
import { alertsScreen } from './alerts/screen';
import { cardsScreen } from './cards/screen';
import { controlsScreen } from './controls/screen';
import { counterScreen } from './counter/screen';
import { tableScreen } from './table/screen';

// Реестр поддерживаемых экранов
const screens = {
    accordion: accordionScreen,
    controls: controlsScreen,
    table: tableScreen,
    alerts: alertsScreen,
    cards: cardsScreen,
    counter: counterScreen,
};

type BotContext = Context & WidgetsFlavor<typeof screens>;

// Конфигурация окружения
const token = process.env.BOT_TOKEN;
const isTestEnv =
    process.env.TELEGRAM_TEST_ENV === 'true' ||
    process.env.USE_TEST_SERVER === 'true';
const apiRoot = process.env.BOT_API_ROOT;

if (!token) {
    console.error('❌ Пожалуйста, укажите переменную окружения BOT_TOKEN в файле .env или CLI!');
    console.error('Пример запуска:');
    console.error('  BOT_TOKEN=123456:ABC-DEF bun run examples/bot.tsx');
    console.error('Для тестирования на тестовом сервере Telegram (Test DC):');
    console.error('  TELEGRAM_TEST_ENV=true BOT_TOKEN=... bun run examples/bot.tsx');
    process.exit(1);
}

// Инициализация Telegram-бота с поддержкой Test DC
const bot = new Bot<BotContext>(token, {
    client: {
        environment: isTestEnv ? 'test' : 'prod',
        apiRoot: apiRoot || undefined,
    },
});

// Подключение плагина интерактивных виджетов
const widgets = createTelegramWidgetsPlugin({ screens });
bot.use(widgets.middleware);

// Команда /start
bot.command('start', async (ctx) => {
    const keyboard = new InlineKeyboard()
        .text('📖 Аккордеон (details)', 'show_accordion')
        .text('🎛️ Контролы (switch/chk)', 'show_controls')
        .row()
        .text('📊 Таблица чека', 'show_table')
        .text('🔔 Алерты', 'show_alerts')
        .row()
        .text('💳 Карточки и метрики', 'show_cards')
        .text('🔢 Живой счётчик', 'show_counter');

    const envInfo = isTestEnv ? ' 🧪 *(Telegram Test DC)*' : '';

    await ctx.reply(
        `👋 *Демонстрация @ipsadt/tg-widgets (Bot API 10.4)*${envInfo}\n\n` +
            'Выберите интересующий компонент для тестирования в Telegram:',
        {
            parse_mode: 'Markdown',
            reply_markup: keyboard,
        },
    );
});

// Команды для прямого вызова каждого экрана
bot.command('accordion', async (ctx) => {
    await ctx.widgets.reply('accordion', { props: {} });
});

bot.command('controls', async (ctx) => {
    await ctx.widgets.reply('controls', {
        props: {
            notifications: true,
            newsletter: false,
            plan: 'pro',
            tickets: 2,
        },
    });
});

bot.command('table', async (ctx) => {
    await ctx.widgets.reply('table', { props: {} });
});

bot.command('alerts', async (ctx) => {
    await ctx.widgets.reply('alerts', { props: {} });
});

bot.command('cards', async (ctx) => {
    await ctx.widgets.reply('cards', { props: {} });
});

bot.command('counter', async (ctx) => {
    await ctx.widgets.reply('counter', { props: { count: 0 } });
});

// Обработка нажатий инлайн-кнопок меню
bot.callbackQuery('show_accordion', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.widgets.send('accordion', { props: {} });
});

bot.callbackQuery('show_controls', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.widgets.send('controls', {
        props: {
            notifications: true,
            newsletter: false,
            plan: 'pro',
            tickets: 2,
        },
    });
});

bot.callbackQuery('show_table', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.widgets.send('table', { props: {} });
});

bot.callbackQuery('show_alerts', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.widgets.send('alerts', { props: {} });
});

bot.callbackQuery('show_cards', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.widgets.send('cards', { props: {} });
});

bot.callbackQuery('show_counter', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.widgets.send('counter', { props: { count: 0 } });
});

console.log('🚀 Бот с интерактивными виджетами успешно инициализирован!');
console.log(`🌐 Окружение Telegram: ${isTestEnv ? '🧪 TEST SERVER (Test DC)' : '🟢 PRODUCTION'}`);
if (apiRoot) {
    console.log(`🔗 API Root: ${apiRoot}`);
}

bot.start();
