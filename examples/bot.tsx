import { Bot, Context, InlineKeyboard } from 'grammy';
import {
    createTelegramWidgetsPlugin,
    inspectWidgetSize,
    type WidgetsFlavor,
} from '../src';

// Импорт модульных экранов из соответствующих директорий
import { accordionScreen } from './accordion/screen';
import { alertsScreen } from './alerts/screen';
import { cardsScreen } from './cards/screen';
import { controlsScreen } from './controls/screen';
import { counterScreen } from './counter/screen';
import { ecommerceScreen } from './ecommerce/screen';
import { pollScreen } from './poll/screen';
import { tableScreen } from './table/screen';

// Реестр поддерживаемых экранов
const screens = {
    accordion: accordionScreen,
    controls: controlsScreen,
    table: tableScreen,
    alerts: alertsScreen,
    cards: cardsScreen,
    counter: counterScreen,
    poll: pollScreen,
    ecommerce: ecommerceScreen,
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

/**
 * Формирует техническую сводку по размеру сжатого виджета относительно лимита 4096 байт
 */
const getWidgetCaption = (
    screenId: keyof typeof screens,
    props: unknown,
): string => {
    const screen = screens[screenId];
    const html = screen.component(props as never);
    const report = inspectWidgetSize(html);
    const pct = ((report.compressedByteLength / report.maxAllowed) * 100).toFixed(1);
    const free = report.maxAllowed - report.compressedByteLength;

    return (
        `📊 *Размер виджета:* ${report.compressedByteLength} / ${report.maxAllowed} Б (${pct}%) | Свободно: ${free} Б\n` +
        `📄 *Исходный HTML:* ${report.byteLength} Б`
    );
};

// Команда /start
bot.command('start', async (ctx) => {
    const keyboard = new InlineKeyboard()
        .text('📖 Аккордеон (details)', 'show_accordion')
        .text('🎛️ Контролы (switch/chk)', 'show_controls')
        .row()
        .text('📊 Таблица чека', 'show_table')
        .text('🔔 Алерты (Lucide)', 'show_alerts')
        .row()
        .text('💳 Карточки и метрики', 'show_cards')
        .text('🔢 Живой счётчик', 'show_counter')
        .row()
        .text('🗳️ Живой опрос', 'show_poll')
        .text('🛍️ Корзина товаров', 'show_ecommerce');

    const envInfo = isTestEnv ? ' 🧪 *(Telegram Test DC)*' : '';

    await ctx.reply(
        `👋 *Демонстрация @ipsadt/tg-widgets (Bot API 10.4)*${envInfo}\n\n` +
            'Выберите интересующий компонент для тестирования в Telegram.\n' +
            'Каждое сообщение подписано точной технической сводкой занимаемого объема в байтах.',
        {
            parse_mode: 'Markdown',
            reply_markup: keyboard,
        },
    );
});

// Команды для прямого вызова каждого экрана с технической сводкой в caption
bot.command('accordion', async (ctx) => {
    const props = {};
    await ctx.widgets.reply('accordion', {
        props,
        caption: getWidgetCaption('accordion', props),
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
        caption: getWidgetCaption('controls', props),
    });
});

bot.command('table', async (ctx) => {
    const props = {};
    await ctx.widgets.reply('table', {
        props,
        caption: getWidgetCaption('table', props),
    });
});

bot.command('alerts', async (ctx) => {
    const props = {};
    await ctx.widgets.reply('alerts', {
        props,
        caption: getWidgetCaption('alerts', props),
    });
});

bot.command('cards', async (ctx) => {
    const props = {};
    await ctx.widgets.reply('cards', {
        props,
        caption: getWidgetCaption('cards', props),
    });
});

bot.command('counter', async (ctx) => {
    const props = { count: 0 };
    await ctx.widgets.reply('counter', {
        props,
        caption: getWidgetCaption('counter', props),
    });
});

bot.command('poll', async (ctx) => {
    const props = {
        votes: { grammy: 48, telegraf: 21, aiogram: 35 },
        userVote: 'grammy' as const,
    };
    await ctx.widgets.reply('poll', {
        props,
        caption: getWidgetCaption('poll', props),
    });
});

bot.command('ecommerce', async (ctx) => {
    const props = { size: 42, quantity: 1, pricePerUnit: 120 };
    await ctx.widgets.reply('ecommerce', {
        props,
        caption: getWidgetCaption('ecommerce', props),
    });
});

// Обработка нажатий инлайн-кнопок меню
bot.callbackQuery('show_accordion', async (ctx) => {
    await ctx.answerCallbackQuery();
    const props = {};
    await ctx.widgets.send('accordion', {
        props,
        caption: getWidgetCaption('accordion', props),
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
        caption: getWidgetCaption('controls', props),
    });
});

bot.callbackQuery('show_table', async (ctx) => {
    await ctx.answerCallbackQuery();
    const props = {};
    await ctx.widgets.send('table', {
        props,
        caption: getWidgetCaption('table', props),
    });
});

bot.callbackQuery('show_alerts', async (ctx) => {
    await ctx.answerCallbackQuery();
    const props = {};
    await ctx.widgets.send('alerts', {
        props,
        caption: getWidgetCaption('alerts', props),
    });
});

bot.callbackQuery('show_cards', async (ctx) => {
    await ctx.answerCallbackQuery();
    const props = {};
    await ctx.widgets.send('cards', {
        props,
        caption: getWidgetCaption('cards', props),
    });
});

bot.callbackQuery('show_counter', async (ctx) => {
    await ctx.answerCallbackQuery();
    const props = { count: 0 };
    await ctx.widgets.send('counter', {
        props,
        caption: getWidgetCaption('counter', props),
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
        caption: getWidgetCaption('poll', props),
    });
});

bot.callbackQuery('show_ecommerce', async (ctx) => {
    await ctx.answerCallbackQuery();
    const props = { size: 42, quantity: 1, pricePerUnit: 120 };
    await ctx.widgets.send('ecommerce', {
        props,
        caption: getWidgetCaption('ecommerce', props),
    });
});

console.log('🚀 Бот с интерактивными виджетами успешно инициализирован!');
console.log(`🌐 Окружение Telegram: ${isTestEnv ? '🧪 TEST SERVER (Test DC)' : '🟢 PRODUCTION'}`);
if (apiRoot) {
    console.log(`🔗 API Root: ${apiRoot}`);
}

bot.start();
