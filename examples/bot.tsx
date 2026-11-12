import { Bot, Context, InlineKeyboard } from 'grammy';

import {
    Accordion,
    AccordionItem,
    Alert,
    AlertDescription,
    AlertTitle,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Checkbox,
    Collapsible,
    createTelegramWidgetsPlugin,
    defineWidgetScreen,
    Divider,
    h,
    Input,
    ProgressBar,
    Radio,
    RadioGroup,
    Script,
    SegmentedControl,
    Stepper,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
    Typography,
    type WidgetActionContext,
    WidgetLayout,
    type WidgetsFlavor,
} from '../src';

// ==========================================
// 1. Экран Аккордеона (<details> / <summary>)
// ==========================================
const accordionScreen = defineWidgetScreen({
    id: 'accordion',
    component: () => (
        <WidgetLayout safeArea>
            <Card>
                <CardHeader>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <CardTitle>Частые вопросы</CardTitle>
                        <Badge variant="accent">Profile 1</Badge>
                    </div>
                    <CardDescription>
                        Тестирование нативного элемента &lt;details&gt; в
                        виджетах Telegram
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion>
                        <AccordionItem
                            title="Как работают HTML-виджеты?"
                            open={true}
                        >
                            Виджеты рендерятся прямо внутри баббла сообщения с
                            помощью встроенной песочницы QuickJS на клиенте
                            Telegram.
                        </AccordionItem>
                        <AccordionItem title="Нужен ли интернет для рендера?">
                            Нет, код виджета фиксируется в сообщении при
                            отправке и отрисовывается мгновенно в офлайне.
                        </AccordionItem>
                        <Collapsible title="Как виджет общается с ботом?">
                            Через вызов TelegramWidget.request(), который
                            доставляет компактный запрос до 64 байт в виде
                            update.widget_query.
                        </Collapsible>
                    </Accordion>
                </CardContent>
                <CardFooter>
                    <span
                        style={{
                            fontSize: 11,
                            color: 'var(--tg-theme-hint-color, #888)',
                        }}
                    >
                        Нажмите на любой пункт, чтобы раскрыть
                    </span>
                </CardFooter>
            </Card>
        </WidgetLayout>
    ),
    initialState: () => ({}),
});

// ==========================================
// 2. Экран Элементов управления (Controls)
// ==========================================
interface ControlsState {
    notifications: boolean;
    newsletter: boolean;
    plan: string;
    tickets: number;
}

const controlsScreen = defineWidgetScreen({
    id: 'controls',
    component: (props: ControlsState) => (
        <WidgetLayout safeArea>
            <Card>
                <CardHeader>
                    <CardTitle>Настройки подписки</CardTitle>
                    <CardDescription>
                        Чекбоксы, переключатели и степпер без тега &lt;input&gt;
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                        }}
                    >
                        {/* Switch */}
                        <Switch
                            id="toggle-notify"
                            checked={props.notifications}
                            action="toggleNotifications"
                            label="Уведомления"
                            description="Получать сообщения о важных событиях"
                        />

                        <Divider />

                        {/* Checkbox */}
                        <Checkbox
                            id="chk-newsletter"
                            checked={props.newsletter}
                            action="toggleNewsletter"
                            label="Дайджест обновлений"
                            description="Еженедельная рассылка новостей"
                        />

                        <Divider />

                        {/* Stepper */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 500 }}>
                                    Количество мест
                                </div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: 'var(--tg-theme-hint-color, #888)',
                                    }}
                                >
                                    Билеты на мероприятие
                                </div>
                            </div>
                            <Stepper
                                id="stepper-tickets"
                                value={props.tickets}
                                min={1}
                                max={10}
                                decrementAction="ticketMinus"
                                incrementAction="ticketPlus"
                            />
                        </div>

                        <Divider />

                        {/* Radio buttons */}
                        <div>
                            <div
                                style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    marginBottom: 6,
                                }}
                            >
                                Тарифный план
                            </div>
                            <RadioGroup gap={6}>
                                <Radio
                                    id="plan-basic"
                                    value="basic"
                                    action="setPlan:basic"
                                    checked={props.plan === 'basic'}
                                    label="Базовый"
                                    description="Бесплатный доступ к основным функциям"
                                />
                                <Radio
                                    id="plan-pro"
                                    value="pro"
                                    action="setPlan:pro"
                                    checked={props.plan === 'pro'}
                                    label="Pro аккаунт"
                                    description="Приоритетная поддержка и расширенные лимиты"
                                />
                            </RadioGroup>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </WidgetLayout>
    ),
    initialState: (props?: Partial<ControlsState>): ControlsState => ({
        notifications: props?.notifications ?? true,
        newsletter: props?.newsletter ?? false,
        plan: props?.plan ?? 'pro',
        tickets: props?.tickets ?? 2,
    }),
    actions: {
        toggleNotifications: async (ctx: WidgetActionContext<ControlsState>) => {
            const next = {
                ...ctx.state,
                notifications: !ctx.state.notifications,
            };
            await ctx.setState(next);
            return next;
        },
        toggleNewsletter: async (ctx: WidgetActionContext<ControlsState>) => {
            const next = { ...ctx.state, newsletter: !ctx.state.newsletter };
            await ctx.setState(next);
            return next;
        },
        ticketPlus: async (ctx: WidgetActionContext<ControlsState>) => {
            const next = {
                ...ctx.state,
                tickets: Math.min(10, ctx.state.tickets + 1),
            };
            await ctx.setState(next);
            return next;
        },
        ticketMinus: async (ctx: WidgetActionContext<ControlsState>) => {
            const next = {
                ...ctx.state,
                tickets: Math.max(1, ctx.state.tickets - 1),
            };
            await ctx.setState(next);
            return next;
        },
        setPlan: async (
            ctx: WidgetActionContext<ControlsState>,
            payload?: unknown,
        ) => {
            const next = { ...ctx.state, plan: String(payload ?? 'basic') };
            await ctx.setState(next);
            return next;
        },
    },
});

// ==========================================
// 3. Экран Таблицы (Table & Receipts)
// ==========================================
const tableScreen = defineWidgetScreen({
    id: 'table',
    component: () => (
        <WidgetLayout safeArea>
            <Card>
                <CardHeader>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <CardTitle>Чек заказа #4096</CardTitle>
                        <Badge variant="success">Оплачено</Badge>
                    </div>
                    <CardDescription>
                        Пример нативной таблицы с границами
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Позиция</TableHead>
                                <TableHead align="center">Кол-во</TableHead>
                                <TableHead align="right">Сумма</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Пицца Маргарита</TableCell>
                                <TableCell align="center">2</TableCell>
                                <TableCell align="right">18.00 $</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Лимонад цитрусовый</TableCell>
                                <TableCell align="center">1</TableCell>
                                <TableCell align="right">4.50 $</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Соус тар-тар</TableCell>
                                <TableCell align="center">1</TableCell>
                                <TableCell align="right">1.50 $</TableCell>
                            </TableRow>
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colspan={2}>Итого к оплате</TableCell>
                                <TableCell align="right">24.00 $</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" fullWidth size="sm">
                        Скачать квитанцию
                    </Button>
                </CardFooter>
            </Card>
        </WidgetLayout>
    ),
    initialState: () => ({}),
});

// ==========================================
// 4. Экран Уведомлений (Alerts)
// ==========================================
const alertsScreen = defineWidgetScreen({
    id: 'alerts',
    component: () => (
        <WidgetLayout gap={8} safeArea>
            <Alert
                variant="info"
                title="Информация"
                description="Виджеты поддерживают цветовую палитру темы пользователя."
            />
            <Alert
                variant="success"
                title="Успешно сохранено"
                description="Ваши данные были синхронизированы с облаком."
            />
            <Alert
                variant="warning"
                title="Внимание"
                description="Размер сжатого виджета ограничен 4096 байтами."
            />
            <Alert
                variant="destructive"
                title="Критическая ошибка"
                description="Действие не может быть выполнено без авторизации."
            />
        </WidgetLayout>
    ),
    initialState: () => ({}),
});

// ==========================================
// 5. Экран Карточек (Cards & Compound components)
// ==========================================
const cardsScreen = defineWidgetScreen({
    id: 'cards',
    component: () => (
        <WidgetLayout gap={10} safeArea>
            <Card variant="default">
                <CardHeader>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <CardTitle>Аналитика аккаунта</CardTitle>
                        <Badge variant="accent">Pro</Badge>
                    </div>
                    <CardDescription>
                        Обзор активности за последние 30 дней
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                        }}
                    >
                        <Typography variant="title">14,820 TON</Typography>
                        <span
                            style={{
                                color: '#10b981',
                                fontWeight: 600,
                                fontSize: 13,
                            }}
                        >
                            +18.4% ↑
                        </span>
                    </div>
                    <ProgressBar percent={72} />
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 12,
                            color: 'var(--tg-theme-hint-color, #888)',
                        }}
                    >
                        <span>Лимит запросов</span>
                        <span>7,200 / 10,000</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="primary" fullWidth size="md">
                        Увеличить лимит
                    </Button>
                </CardFooter>
            </Card>

            <Card variant="outlined">
                <div style={{ fontSize: 13, fontWeight: 500 }}>
                    Поле быстрого действия:
                </div>
                <Input
                    placeholder="Нажмите для ввода заметки..."
                    action="promptNote"
                />
            </Card>
        </WidgetLayout>
    ),
    initialState: () => ({}),
});

// ==========================================
// 6. Экран Интерактивного Счётчика (Counter)
// ==========================================
interface CounterState {
    count: number;
}

const clientCounterScript = (args: { count: number }) => {
    const W = window.TelegramWidget;
    const btnInc = document.getElementById('btn-inc');
    const btnDec = document.getElementById('btn-dec');
    const valEl = document.getElementById('counter-val');

    btnInc?.addEventListener('click', () => {
        W?.HapticFeedback?.impactOccurred?.('light');
        W?.request?.('inc').then((res) => {
            if (res?.result && valEl) {
                const data = JSON.parse(res.result);
                valEl.textContent = String(data.count);
            }
        });
    });

    btnDec?.addEventListener('click', () => {
        W?.HapticFeedback?.impactOccurred?.('light');
        W?.request?.('dec').then((res) => {
            if (res?.result && valEl) {
                const data = JSON.parse(res.result);
                valEl.textContent = String(data.count);
            }
        });
    });
};

const counterScreen = defineWidgetScreen({
    id: 'counter',
    component: (props: CounterState) => (
        <WidgetLayout safeArea>
            <Card>
                <CardHeader>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <CardTitle>Живой счётчик</CardTitle>
                        <Badge variant="default">Client IIFE</Badge>
                    </div>
                    <CardDescription>
                        Клиентский скрипт отправляет запросы серверу через
                        W.request()
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '16px 0',
                            gap: 12,
                        }}
                    >
                        <div
                            id="counter-val"
                            style={{
                                fontSize: 48,
                                fontWeight: 800,
                                color: 'var(--tg-theme-button-color, #2481cc)',
                            }}
                        >
                            {props.count}
                        </div>
                        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                            <Button
                                id="btn-dec"
                                variant="secondary"
                                fullWidth
                                size="md"
                            >
                                −1
                            </Button>
                            <Button
                                id="btn-inc"
                                variant="primary"
                                fullWidth
                                size="md"
                            >
                                +1
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Script fn={clientCounterScript} args={[{ count: props.count }]} />
        </WidgetLayout>
    ),
    initialState: (props?: Partial<CounterState>): CounterState => ({
        count: props?.count ?? 0,
    }),
    actions: {
        inc: async (ctx: WidgetActionContext<CounterState>) => {
            const next = { count: ctx.state.count + 1 };
            await ctx.setState(next);
            return next;
        },
        dec: async (ctx: WidgetActionContext<CounterState>) => {
            const next = { count: ctx.state.count - 1 };
            await ctx.setState(next);
            return next;
        },
    },
});

// ==========================================
// Регистрация экранов и запуск бота
// ==========================================
const screens = {
    accordion: accordionScreen,
    controls: controlsScreen,
    table: tableScreen,
    alerts: alertsScreen,
    cards: cardsScreen,
    counter: counterScreen,
};

type BotContext = Context & WidgetsFlavor<typeof screens>;

const token = process.env.BOT_TOKEN;
if (!token) {
    console.error('❌ Пожалуйста, задайте переменную окружения BOT_TOKEN!');
    console.error('Пример запуска:');
    console.error('  BOT_TOKEN=123456:ABC-DEF bun run examples/bot.tsx');
    process.exit(1);
}

const bot = new Bot<BotContext>(token);

// Регистрация плагина виджетов
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

    await ctx.reply(
        '👋 *Демонстрация @ipsadt/tg-widgets (Bot API 10.4)*\n\n' +
            'Выберите интересующий компонент для тестирования в Telegram:',
        {
            parse_mode: 'Markdown',
            reply_markup: keyboard,
        },
    );
});

// Команды для каждого экрана
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

// Обработка нажатий кнопок меню
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

console.log('🚀 Бот с интерактивными виджетами успешно запущен!');
bot.start();
