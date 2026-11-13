import { describe, expect, test } from 'bun:test';

import type { Context } from 'grammy';

import {
    Accordion,
    AccordionItem,
    Alert,
    AlertDescription,
    AlertTitle,
    Avatar,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Checkbox,
    ChevronRightIcon,
    Collapsible,
    createTelegramWidgetsPlugin,
    decodeWidgetAction,
    defineClientWidgetScreen,
    defineDynamicWidgetScreen,
    defineStaticWidgetScreen,
    defineWidgetScreen,
    DescriptionText,
    Divider,
    encodeWidgetAction,
    formatStyle,
    h,
    inspectWidgetSize,
    inspectWidgetSizeAsync,
    List,
    ListItem,
    LucideIcon,
    LucideIcons,
    MemoryWidgetsStorage,
    minifyHtml,
    minifyHtmlSync,
    ProgressBar,
    Radio,
    RadioGroup,
    renderWidget,
    renderWidgetAsync,
    SegmentedControl,
    Skeleton,
    Stepper,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Typography,
    validateWidgetActionData,
    type WidgetActionContext,
    WidgetLayout,
    type WidgetsFlavor,
    type WidgetsStorage,
    compressKeys,
    decompressKeys,
    packPayload,
    unpackPayload,
    packState,
    unpackState,
    encodeCompressedWidgetAction,
    registerCodecKeys,
    getWidgetScreenType,
} from '../src';

describe('@ipsadt/tg-widgets', () => {
    test('h() converts style objects to clean inline CSS', () => {
        const style = {
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: '10px 14px',
            opacity: 0.8,
        };

        const css = formatStyle(style);
        expect(css).toBe(
            'display:flex;flex-direction:column;gap:12px;padding:10px 14px;opacity:0.8',
        );

        const html = h('div', { style, className: 'my-box' }, 'Hello World');
        expect(html).toBe(
            `<div style="${css}" class="my-box">Hello World</div>`,
        );
    });

    test('renders Telegram native and Profile 1 UI components correctly without input tags', () => {
        const btn = Button({
            id: 'btn-1',
            variant: 'primary',
            children: 'Click me',
        });
        expect(btn).toContain('Click me');
        expect(btn).toContain('tg-btn-primary');

        const badge = Badge({ variant: 'accent', dot: true, children: 'New' });
        expect(badge).toContain('New');
        expect(badge).toContain('tg-badge');
        expect(badge).toContain('tg-badge-accent');
        expect(badge).toContain('border-radius:50%');

        const pulseBadge = Badge({ variant: 'success', pulse: true, children: 'Live' });
        expect(pulseBadge).toContain('tg-badge-pulse');
        expect(pulseBadge).toContain('Live');

        const iconBadge = Badge({
            variant: 'accent',
            icon: LucideIcon({ icon: LucideIcons.Flame, size: 13 }),
        });
        expect(iconBadge).toContain('tg-badge');
        expect(iconBadge).toContain('svg');

        const card = Card({
            header: 'Header',
            footer: 'Footer',
            children: 'Card Content',
        });
        expect(card).toContain('Card Content');
        expect(card).toContain('Header');
        expect(card).toContain('Footer');

        // Card compound syntax
        const compoundCard = Card({
            children: [
                CardHeader({
                    children: [
                        CardTitle({ children: 'Compound Title' }),
                        CardDescription({ children: 'Compound Subtitle' }),
                    ],
                }),
                CardContent({ children: 'Main content' }),
                CardFooter({ children: 'Footer info' }),
            ],
        });
        expect(compoundCard).toContain('Compound Title');
        expect(compoundCard).toContain('Compound Subtitle');
        expect(compoundCard).toContain('Main content');
        expect(compoundCard).toContain('Footer info');

        const stepper = Stepper({ id: 'count', value: 3, min: 0, max: 10 });
        expect(stepper).toContain('tg-stepper');
        expect(stepper).toContain('3');
        expect(stepper).toContain('data-action="decrement"');
        expect(stepper).toContain('data-action="increment"');
        expect(stepper).toContain('svg');

        const chk = Checkbox({
            id: 'agree',
            label: 'I agree',
            description: 'Terms of service',
            checked: true,
        });
        expect(chk).toContain('tg-checkbox');
        expect(chk).toContain('I agree');
        expect(chk).toContain('Terms of service');
        expect(chk).toContain('svg');
        expect(chk).not.toContain('<input'); // Profile 1 compliant!

        const radio = Radio({
            id: 'opt1',
            value: 'v1',
            label: 'Option 1',
            checked: true,
        });
        expect(radio).toContain('tg-radio');
        expect(radio).toContain('Option 1');
        expect(radio).toContain('svg');
        expect(radio).not.toContain('<input'); // Profile 1 compliant!

        const radioGroup = RadioGroup({ children: radio });
        expect(radioGroup).toContain('tg-radio-group');

        const sw = Switch({ id: 'notifications', label: 'Alerts', checked: true });
        expect(sw).toContain('tg-switch');
        expect(sw).toContain('tg-switch-track');
        expect(sw).toContain('tg-switch-thumb');
        expect(sw).toContain('Alerts');
        expect(sw).not.toContain('<input'); // Profile 1 compliant!

        const alert = Alert({
            variant: 'destructive',
            title: 'Error Title',
            description: 'Something failed',
            children: [
                AlertTitle({ children: 'Compound Alert Title' }),
                AlertDescription({ children: 'Compound Alert Desc' }),
            ],
        });
        expect(alert).toContain('tg-alert');
        expect(alert).toContain('tg-alert-destructive');
        expect(alert).toContain('Error Title');
        expect(alert).toContain('Something failed');
        expect(alert).toContain('Compound Alert Title');
        expect(alert).toContain('Compound Alert Desc');

        const table = Table({
            children: [
                TableHeader({
                    children: TableRow({
                        children: [
                            TableHead({ children: 'Item' }),
                            TableHead({ children: 'Price', align: 'right' }),
                        ],
                    }),
                }),
                TableBody({
                    children: TableRow({
                        children: [
                            TableCell({ children: 'Burger' }),
                            TableCell({ children: '$10', align: 'right' }),
                        ],
                    }),
                }),
            ],
        });
        expect(table).toContain('tg-table');
        expect(table).toContain('Burger');
        expect(table).toContain('$10');

        const accordion = Accordion({
            children: [
                AccordionItem({ title: 'FAQ 1', children: 'Answer 1', open: true }),
                Collapsible({ title: 'FAQ 2', children: 'Answer 2' }),
            ],
        });
        expect(accordion).toContain('tg-accordion');
        expect(accordion).toContain('<details');
        expect(accordion).toContain('<summary');
        expect(accordion).toContain('FAQ 1');
        expect(accordion).toContain('Answer 1');

        const bar = ProgressBar({ percent: 50 });
        expect(bar).toContain('width:50%');

        const avatar = Avatar({ fallback: 'AB', size: 'lg' });
        expect(avatar).toContain('AB');
        expect(avatar).toContain('tg-avatar-lg');

        const listItem = ListItem({
            title: 'Item Title',
            subtitle: 'Sub detail',
            chevron: true,
        });
        expect(listItem).toContain('Item Title');
        expect(listItem).toContain('Sub detail');
        expect(listItem).toContain('svg');

        const list = List({ children: listItem });
        expect(list).toContain('tg-list');

        const divider = Divider({ inset: 16 });
        expect(divider).toContain('margin-left:16px');

        const typography = Typography({
            variant: 'headline',
            color: 'accent',
            children: 'Title text',
        });
        expect(typography).toContain('Title text');
        expect(typography).toContain('tg-text-headline');

        const skeleton = Skeleton({ width: 100, height: 20 });
        expect(skeleton).toContain('tg-skeleton');

        const chevron = ChevronRightIcon({ size: 24 });
        expect(chevron).toContain('width="24"');

        const seg = SegmentedControl({
            items: [{ id: '1', label: 'Tab 1' }],
        });
        expect(seg).toContain('tg-segmented-control');
        expect(seg).toContain('Tab 1');

        const layout = WidgetLayout({ children: 'Body', safeArea: true });
        expect(layout).toContain('tg-widget-root');
        expect(layout).toContain('env(safe-area-inset-bottom');
    });

    test('inspectWidgetSize and renderWidget check deflate compression limits', async () => {
        const report = inspectWidgetSize('<div>Hello Widget</div>');
        expect(report.html).toContain('<!DOCTYPE html>');
        expect(report.html).toContain('<div>Hello Widget</div>');
        expect(report.byteLength).toBeGreaterThan(0);
        expect(report.compressedByteLength).toBeGreaterThan(0);
        expect(report.compressedByteLength).toBeLessThanOrEqual(4096);
        expect(report.isValid).toBe(true);

        const asyncReport = await inspectWidgetSizeAsync('<div>Hello Widget Async</div>');
        expect(asyncReport.html.toLowerCase()).toContain('<!doctype html>');
        expect(asyncReport.html).toContain('<div>Hello Widget Async</div>');
        expect(asyncReport.isValid).toBe(true);

        const html = renderWidget('<div>Test</div>');
        expect(html.toLowerCase()).toContain('<!doctype html>');
        expect(html).toContain('<div>Test</div>');

        const asyncHtml = await renderWidgetAsync('<div>Test Async</div>');
        expect(asyncHtml.toLowerCase()).toContain('<!doctype html>');
        expect(asyncHtml).toContain('<div>Test Async</div>');
    });

    test('encodeWidgetAction and decodeWidgetAction handle 64-byte Telegram limit', () => {
        expect(encodeWidgetAction('increment')).toBe('increment');
        expect(encodeWidgetAction('set', 42)).toBe('set:42');
        expect(encodeWidgetAction('toggle', true)).toBe('toggle:true');
        expect(encodeWidgetAction('open', { id: 'x' })).toBe('open:{"id":"x"}');

        expect(validateWidgetActionData('increment')).toBe(true);
        expect(validateWidgetActionData('a'.repeat(64))).toBe(true);
        expect(validateWidgetActionData('a'.repeat(65))).toBe(false);
        expect(validateWidgetActionData('')).toBe(false);

        expect(decodeWidgetAction('increment')).toEqual({
            action: 'increment',
            payload: undefined,
        });
        expect(decodeWidgetAction('set:42')).toEqual({
            action: 'set',
            payload: 42,
        });
        expect(decodeWidgetAction('flag:true')).toEqual({
            action: 'flag',
            payload: true,
        });
        expect(decodeWidgetAction('flag:false')).toEqual({
            action: 'flag',
            payload: false,
        });
        expect(decodeWidgetAction('msg:hello')).toEqual({
            action: 'msg',
            payload: 'hello',
        });
        expect(decodeWidgetAction('{"action":"vote","payload":{"id":1}}')).toEqual(
            { action: 'vote', payload: { id: 1 } },
        );
    });

    test('MemoryWidgetsStorage supports LRU eviction and TTL', async () => {
        const storage = new MemoryWidgetsStorage({
            maxEntries: 2,
            defaultTtlSeconds: 1,
        });

        storage.set('k1', { screenId: 's1', state: { v: 1 }, updatedAt: 100 });
        storage.set('k2', { screenId: 's2', state: { v: 2 }, updatedAt: 200 });
        expect(storage.get('k1')?.state).toEqual({ v: 1 });

        // k1 is touched, so k2 should be evicted when k3 is added
        storage.set('k3', { screenId: 's3', state: { v: 3 }, updatedAt: 300 });
        expect(storage.has('k1')).toBe(true);
        expect(storage.has('k2')).toBe(false);
        expect(storage.has('k3')).toBe(true);

        // Test delete
        storage.delete('k1');
        expect(storage.has('k1')).toBe(false);

        // Test TTL
        storage.set('k4', { screenId: 's4', state: { v: 4 }, updatedAt: 400 }, 0.05);
        expect(storage.has('k4')).toBe(true);
        await new Promise((res) => setTimeout(res, 60));
        expect(storage.get('k4')).toBeUndefined();
    });

    test('plugin sends widget, answers actions, and supports pluggable storage', async () => {
        const testScreen = defineWidgetScreen({
            id: 'counter',
            component: (props: { initial: number }) =>
                `<div>Count: ${props.initial}</div>`,
            initialState: (props: { initial: number }) => ({
                count: props.initial,
            }),
            actions: {
                increment: async (
                    ctx: WidgetActionContext<{ count: number }>,
                    payload?: unknown,
                ) => {
                    const step = typeof payload === 'number' ? payload : 1;
                    const next = {
                        count: ctx.state.count + step,
                    };
                    await ctx.setState(next);
                    return next;
                },
            },
        });

        const customStorage: WidgetsStorage = new MemoryWidgetsStorage();

        const plugin = createTelegramWidgetsPlugin({
            screens: {
                counter: testScreen,
            },
            storage: customStorage,
        });

        let sentParams: Record<string, unknown> | undefined;
        let editedParams: Record<string, unknown> | undefined;
        let answeredParams: Record<string, unknown> | undefined;

        const ctx = {
            chat: { id: 100 },
            msg: { message_id: 55 },
            api: {
                raw: {
                    sendWidget: async (params: Record<string, unknown>) => {
                        sentParams = params;
                        return { message_id: 200 };
                    },
                    editMessageWidgetData: async (
                        params: Record<string, unknown>,
                    ) => {
                        editedParams = params;
                        return true;
                    },
                    answerWidgetQuery: async (
                        params: Record<string, unknown>,
                    ) => {
                        answeredParams = params;
                        return true;
                    },
                },
            },
        } as unknown as Context & WidgetsFlavor<{ counter: typeof testScreen }>;

        // Initialize middleware
        await plugin.middleware(ctx, async () => {});

        // Test render method
        const renderReport = ctx.widgets.render('counter', { initial: 10 });
        expect(renderReport.html).toContain('Count: 10');
        expect(renderReport.isValid).toBe(true);

        // Test getScreen method
        expect(ctx.widgets.getScreen('counter')).toBeDefined();
        expect(ctx.widgets.getScreen('unknown')).toBeUndefined();

        // Send screen with caption
        await ctx.widgets.send('counter', {
            chatId: 100,
            props: { initial: 5 },
            caption: '📊 *Size info*',
        });

        expect(sentParams?.chat_id).toBe(100);
        expect(sentParams?.parse_mode).toBe('Markdown');
        const chatData = JSON.parse(sentParams?.chat_data as string);
        expect(chatData.count).toBe(5);
        expect(chatData.__screen).toBe('counter');

        // Verify storage received the record
        const stored = await customStorage.get('100:200');
        expect(stored?.screenId).toBe('counter');
        expect((stored?.state as { count: number }).count).toBe(5);

        // Test reply helper
        await ctx.widgets.reply('counter', {
            props: { initial: 7 },
        });
        expect(sentParams?.chat_id).toBe(100);

        // Test update method
        await ctx.widgets.update(200, 'counter', {
            state: { count: 42 },
        });
        expect(editedParams?.chat_id).toBe(100);
        expect(editedParams?.message_id).toBe(200);
        const updatedManualState = JSON.parse(
            editedParams?.chat_data as string,
        );
        expect(updatedManualState.count).toBe(42);

        // Verify storage updated
        const updatedStored = await customStorage.get('100:200');
        expect((updatedStored?.state as { count: number }).count).toBe(42);

        // Simulate incoming official Telegram 10.4 WidgetQuery (without query.message)
        const queryCtx = {
            update: {
                widget_query: {
                    id: 'q-1',
                    data: 'increment:3',
                    chat: { id: 100, type: 'private' },
                    message_id: 200,
                    chat_instance: 'instance-abc',
                    from: { id: 1, first_name: 'Test' },
                },
            },
            api: ctx.api,
        } as unknown as Context & WidgetsFlavor<{ counter: typeof testScreen }>;

        await plugin.middleware(queryCtx, async () => {});

        expect(answeredParams?.widget_query_id).toBe('q-1');
        expect(editedParams?.chat_id).toBe(100);
        expect(editedParams?.message_id).toBe(200);

        const updatedState = JSON.parse(editedParams?.chat_data as string);
        expect(updatedState.count).toBe(45); // 42 + 3
        expect(updatedState.__screen).toBe('counter');
    });

    test('plugin merges state shallowly and passes full state on answer() to prevent toggle desync', async () => {
        interface ProfileState {
            notifications: boolean;
            sound: boolean;
            name: string;
        }

        const profileScreen = defineWidgetScreen({
            id: 'prof',
            component: () => '<div>Profile</div>',
            initialState: () => ({
                notifications: true,
                sound: false,
                name: 'Alex',
            }),
            actions: {
                toggleNotify: async (ctx: WidgetActionContext<ProfileState>) => {
                    await ctx.setState({ notifications: !ctx.state.notifications });
                    return ctx.answer();
                },
                toggleSound: async (ctx: WidgetActionContext<ProfileState>) => {
                    await ctx.setState({ sound: !ctx.state.sound });
                    return ctx.answer();
                },
            },
        });

        const storage = new MemoryWidgetsStorage();
        const plugin = createTelegramWidgetsPlugin({
            screens: { prof: profileScreen },
            storage,
        });

        let answeredData: string | undefined;
        let editedChatData: string | undefined;

        const fakeApi = {
            raw: {
                sendWidget: async () => ({ message_id: 300 }),
                editMessageWidgetData: async (p: { chat_data?: string }) => {
                    editedChatData = p.chat_data;
                    return true;
                },
                answerWidgetQuery: async (p: { data?: string }) => {
                    answeredData = p.data;
                    return true;
                },
            },
        };

        const ctx = {
            chat: { id: 777 },
            api: fakeApi,
        } as unknown as Context & WidgetsFlavor<{ prof: typeof profileScreen }>;

        await plugin.middleware(ctx, async () => {});

        // Send screen
        await ctx.widgets.send('prof', {
            chatId: 777,
            props: undefined,
        });

        // 1. Toggle notify
        const queryCtx1 = {
            update: {
                widget_query: {
                    id: 'q-toggle-1',
                    data: 'toggleNotify',
                    chat: { id: 777, type: 'private' },
                    message_id: 300,
                    chat_instance: 'inst',
                    from: { id: 1, first_name: 'Alex' },
                },
            },
            api: fakeApi,
        } as unknown as Context & WidgetsFlavor<{ prof: typeof profileScreen }>;

        await plugin.middleware(queryCtx1, async () => {});

        const stateAfterFirst = JSON.parse(editedChatData!);
        expect(stateAfterFirst.notifications).toBe(false);
        expect(stateAfterFirst.sound).toBe(false); // Preserved!
        expect(stateAfterFirst.name).toBe('Alex'); // Preserved!
        expect(JSON.parse(answeredData!).notifications).toBe(false);

        // 2. Toggle sound without losing notifications=false
        const queryCtx2 = {
            update: {
                widget_query: {
                    id: 'q-toggle-2',
                    data: 'toggleSound',
                    chat: { id: 777, type: 'private' },
                    message_id: 300,
                    chat_instance: 'inst',
                    from: { id: 1, first_name: 'Alex' },
                },
            },
            api: fakeApi,
        } as unknown as Context & WidgetsFlavor<{ prof: typeof profileScreen }>;

        await plugin.middleware(queryCtx2, async () => {});

        const stateAfterSecond = JSON.parse(editedChatData!);
        expect(stateAfterSecond.notifications).toBe(false); // Preserved!
        expect(stateAfterSecond.sound).toBe(true);
        expect(stateAfterSecond.name).toBe('Alex'); // Preserved!
        expect(JSON.parse(answeredData!).sound).toBe(true);
    });

    test('cross-runtime entrypoints (mod.ts, jsx-runtime, jsx-dev-runtime) export all required primitives', async () => {
        const mod = await import('../mod');
        expect(mod.WidgetLayout).toBeDefined();
        expect(mod.Button).toBeDefined();
        expect(mod.Card).toBeDefined();
        expect(mod.Alert).toBeDefined();
        expect(mod.Table).toBeDefined();
        expect(mod.Accordion).toBeDefined();
        expect(mod.Stepper).toBeDefined();
        expect(mod.MemoryWidgetsStorage).toBeDefined();
        expect(mod.encodeWidgetAction).toBeDefined();
        expect(mod.decodeWidgetAction).toBeDefined();
        expect(mod.jsx).toBeDefined();
        expect(mod.jsxDEV).toBeDefined();
        expect(mod.Fragment).toBeDefined();

        const jsxRuntime = await import('../src/jsx-runtime');
        expect(jsxRuntime.jsx).toBeDefined();
        expect(jsxRuntime.jsxs).toBeDefined();
        expect(jsxRuntime.Fragment).toBeDefined();

        const jsxDevRuntime = await import('../src/jsx-dev-runtime');
        expect(jsxDevRuntime.jsxDEV).toBeDefined();
        expect(jsxDevRuntime.Fragment).toBeDefined();
    });

    test('LucideIcon renders SVG icons with custom size and colors', () => {
        const svg = LucideIcon({
            icon: LucideIcons.Info,
            size: 20,
            color: '#2481cc',
            className: 'custom-icon',
        });
        expect(svg).toContain('<svg');
        expect(svg).toContain('width="20"');
        expect(svg).toContain('height="20"');
        expect(svg).toContain('stroke-width="1.75"');
        expect(svg).toContain('stroke="#2481cc"');
        expect(svg).toContain('class="lucide lucide-info custom-icon"');

        // Alert integration
        const infoAlert = Alert({ variant: 'info', title: 'With Lucide' });
        expect(infoAlert).toContain('lucide-info');

        expect(LucideIcons.Trophy).toBeDefined();
        expect(LucideIcons.Crown).toBeDefined();
        expect(LucideIcons.Shield).toBeDefined();
        expect(LucideIcons.Sliders).toBeDefined();
    });

    test('minifyHtml and renderWidget compress HTML and CSS aggressively', async () => {
        const raw = `
            <div   class="card"   style="margin: 0px; padding: 10px 14px ; color: #ffffff;" >
                <!-- Some comment -->
                <p>Hello   World</p>
            </div>
        `;
        const minified = await minifyHtml(raw);
        expect(minified).not.toContain('<!--');
        expect(minified).not.toContain('margin: 0px');
        expect(minified).toContain('#fff');

        const syncMinified = minifyHtmlSync(raw);
        expect(syncMinified).not.toContain('<!--');
        expect(syncMinified).not.toContain('> <');

        const rendered = renderWidget('<div>Hello</div>');
        expect(rendered.toLowerCase()).toContain('<!doctype html>');
        expect(rendered).not.toContain('> <');

        const asyncRendered = await renderWidgetAsync('<div>Hello Async</div>');
        expect(asyncRendered.toLowerCase()).toContain('<!doctype html>');
        expect(asyncRendered).toContain('<div>Hello Async</div>');
    });

    test('WidgetLayout supports expand, fullWidth and fullHeight props', () => {
        const expandedLayout = WidgetLayout({
            expand: true,
            children: Card({ fullWidth: true, fullHeight: true, children: 'Expanded Card' }),
        });
        expect(expandedLayout).toContain('padding:0');
        expect(expandedLayout).toContain('width:100%');
        expect(expandedLayout).toContain('height:100%');
        expect(expandedLayout).toContain('flex:1');
    });

    test('WidgetLayout supports design token border radius system', () => {
        const layoutWithPreset = WidgetLayout({
            radius: 'lg',
            children: 'Test',
        });
        expect(layoutWithPreset).toContain('--tg-radius-lg:18px');
        expect(layoutWithPreset).toContain('--tg-radius-sm:10px');

        const layoutWithNumeric = WidgetLayout({
            radius: 20,
            children: 'Test',
        });
        expect(layoutWithNumeric).toContain('--tg-radius-lg:20px');
        expect(layoutWithNumeric).toContain('--tg-radius-sm:10px');
        expect(layoutWithNumeric).toContain('--tg-radius-xs:5px');
    });

    test('Badge renders strictly square dimensions when icon is provided via JSX', () => {
        const jsxBadge = h(Badge, {
            variant: 'accent',
            icon: LucideIcon({ icon: LucideIcons.HelpCircle, size: 15 }),
        });
        expect(jsxBadge).toContain('tg-badge-square');
        expect(jsxBadge).toContain('width:26px');
        expect(jsxBadge).toContain('height:26px');
        expect(jsxBadge).toContain('aspect-ratio:1 / 1');
        expect(jsxBadge).toContain('padding:0px');
    });

    test('Alert renders clean uniform border with variant accent color without white default rim', () => {
        const infoAlert = Alert({
            variant: 'info',
            title: 'Info Alert',
            description: 'Uniform border',
        });
        expect(infoAlert).not.toContain('border-left:4px');
        expect(infoAlert).toContain('border:1px solid rgba(36, 129, 204, 0.28)');
        expect(infoAlert).not.toContain('border:1px solid;');
        expect(infoAlert).toContain('font-weight:500');

        const warningAlert = Alert({
            variant: 'warning',
            title: 'Warning Alert',
        });
        expect(warningAlert).toContain('border:1px solid rgba(245, 158, 11, 0.28)');

        const destructiveAlert = Alert({
            variant: 'destructive',
            title: 'Destructive Alert',
        });
        expect(destructiveAlert).toContain('border:1px solid rgba(239, 68, 68, 0.28)');
    });

    test('DescriptionText renders unified typography with font-weight 500', () => {
        const desc = DescriptionText({ children: 'Unified subtitle text' });
        expect(desc).toContain('tg-description');
        expect(desc).toContain('font-weight:500');
        expect(desc).toContain('Unified subtitle text');
    });

    test('bidirectional codec compresses object keys down to single letters and decompresses transparently', () => {
        const verboseState = {
            notifications: true,
            soundEffects: false,
            privateMode: true,
            count: 42,
            plan: 'pro',
            tickets: 3,
        };

        // 1. Key compression
        const compressed = compressKeys(verboseState) as Record<string, unknown>;
        expect(compressed.o).toBe(true);  // notifications -> o
        expect(compressed.e).toBe(false); // soundEffects -> e
        expect(compressed.m).toBe(true);  // privateMode -> m
        expect(compressed.c).toBe(42);    // count -> c
        expect(compressed.l).toBe('pro'); // plan -> l
        expect(compressed.k).toBe(3);     // tickets -> k
        expect(compressed.notifications).toBeUndefined();

        // 2. Transparent decompression
        const restored = decompressKeys(compressed);
        expect(restored).toEqual(verboseState);

        // 3. State packing & unpacking for chat_data
        const packed = packState('profile', verboseState);
        expect(packed).toContain('"_s":"profile"');
        expect(packed).toContain('"o":true');
        expect(packed).toContain('"m":true');
        expect(packed.length).toBeLessThan(JSON.stringify({ ...verboseState, __screen: 'profile' }).length);

        const unpacked = unpackState(packed);
        expect(unpacked.screenId).toBe('profile');
        expect(unpacked.state).toEqual(verboseState);

        // 4. Action encoding with compression
        const actionStr = encodeCompressedWidgetAction('toggle', { setting: 'notifications', enabled: true });
        expect(actionStr).toBe('toggle:{"g":"notifications","b":true}');
        expect(validateWidgetActionData(actionStr)).toBe(true);

        const decoded = decodeWidgetAction(actionStr);
        expect(decoded.action).toBe('toggle');
        expect(decoded.payload).toEqual({ setting: 'notifications', enabled: true });

        // 5. Short JSON action format: {"a":"vote","p":{"i":1}}
        const shortDecoded = decodeWidgetAction('{"a":"vote","p":{"i":1}}');
        expect(shortDecoded.action).toBe('vote');
        expect(shortDecoded.payload).toEqual({ id: 1 });

        // 6. Generic payload pack & unpack
        const genericObj = { action: 'refresh', data: { timestamp: 12345 } };
        const genericPacked = packPayload(genericObj);
        expect(genericPacked).toContain('"a":"refresh"');
        expect(genericPacked).toContain('"d":');
        const genericUnpacked = unpackPayload<typeof genericObj>(genericPacked);
        expect(genericUnpacked).toEqual(genericObj);

        // 7. Custom domain key registration
        registerCodecKeys({ customField: 'cf' });
        const customPacked = packPayload({ customField: 'hello' });
        expect(customPacked).toBe('{"cf":"hello"}');
        const customUnpacked = unpackPayload(customPacked);
        expect(customUnpacked).toEqual({ customField: 'hello' });
    });

    test('createTelegramWidgetsPlugin supports full configuration: mode, codec {prod, dev}, minifier, sizeLimit, storage shortcuts, defaults', async () => {
        const dummyScreen = defineWidgetScreen({
            id: 'settings',
            component: (props: { plan: string }) =>
                `<div class="tg-settings">Plan: ${props.plan}</div>`,
            initialState: (props: { plan: string }) => ({
                plan: props.plan,
                notifications: true,
            }),
            actions: {
                toggle: async (ctx: WidgetActionContext<{ plan: string; notifications: boolean }>) => {
                    const next = { ...ctx.state, notifications: !ctx.state.notifications };
                    await ctx.setState(next);
                    return next;
                },
            },
        });

        // 1. Test 'dev' mode defaults: uncompressed codec keys, raw readable HTML
        const devPlugin = createTelegramWidgetsPlugin({
            screens: { settings: dummyScreen },
            mode: 'dev',
            debug: true,
        });

        expect(devPlugin.config.mode).toBe('dev');
        expect(devPlugin.config.codec.enabled).toBe(false);
        expect(devPlugin.config.codec.mode).toBe('dev');
        expect(devPlugin.config.minifier.enabled).toBe(false);
        expect(devPlugin.config.debug).toBe(true);

        let sentParams: Record<string, unknown> | undefined;
        let mockApi = {
            raw: {
                sendWidget: async (params: Record<string, unknown>) => {
                    sentParams = params;
                    return { message_id: 101 };
                },
                editMessageWidgetData: async () => true,
                answerWidgetQuery: async () => true,
            },
        };

        const devCtx = {
            chat: { id: 777 },
            api: mockApi,
        } as unknown as Context & WidgetsFlavor<{ settings: typeof dummyScreen }>;

        await devPlugin.middleware(devCtx, async () => {});

        // Send in dev mode: chat_data should have full readable keys ("notifications", "plan", "__screen")
        await devCtx.widgets.send('settings', {
            props: { plan: 'pro' },
        });

        expect(sentParams).toBeDefined();
        const devChatData = JSON.parse(sentParams?.chat_data as string);
        expect(devChatData.notifications).toBe(true);
        expect(devChatData.plan).toBe('pro');
        expect(devChatData.__screen).toBe('settings');
        // Unminified HTML in dev mode contains comments/original format
        expect(sentParams?.html).toContain('Plan: pro');

        // 2. Test 'prod' mode with codec minification: compressed keys ("o", "l", "_s")
        const prodPlugin = createTelegramWidgetsPlugin({
            screens: { settings: dummyScreen },
            mode: 'prod',
            codec: 'prod',
            minifier: 'fast',
            sizeLimit: {
                maxBytes: 4096,
                onExceeded: 'error',
            },
            defaults: {
                width: 2,
                height: 3,
                parseMode: 'HTML',
            },
            storage: {
                defaultTtlSeconds: 120,
                maxEntries: 10,
            },
        });

        expect(prodPlugin.config.mode).toBe('prod');
        expect(prodPlugin.config.codec.enabled).toBe(true);
        expect(prodPlugin.config.codec.mode).toBe('prod');
        expect(prodPlugin.config.minifier.enabled).toBe(true);
        expect(prodPlugin.config.minifier.engine).toBe('fast');
        expect(prodPlugin.config.defaults.width).toBe(2);
        expect(prodPlugin.config.defaults.parseMode).toBe('HTML');

        const prodCtx = {
            chat: { id: 777 },
            api: mockApi,
        } as unknown as Context & WidgetsFlavor<{ settings: typeof dummyScreen }>;

        await prodPlugin.middleware(prodCtx, async () => {});

        await prodCtx.widgets.send('settings', {
            props: { plan: 'pro' },
        });

        const prodChatData = JSON.parse(sentParams?.chat_data as string);
        expect(prodChatData.o).toBe(true);       // notifications -> o
        expect(prodChatData.l).toBe('pro');      // plan -> l
        expect(prodChatData._s).toBe('settings'); // __screen -> _s
        expect(prodChatData.notifications).toBeUndefined();
        expect(sentParams?.width).toBe(2);
        expect(sentParams?.height).toBe(3);
        expect(sentParams?.parse_mode).toBe('HTML');

        // 3. Test codec customKeys dictionary
        const customPlugin = createTelegramWidgetsPlugin({
            screens: { settings: dummyScreen },
            codec: {
                mode: 'prod',
                customKeys: { userScore: 'us' },
            },
        });
        expect(customPlugin.config.codec.customKeys).toEqual({ userScore: 'us' });

        // 4. Test sizeLimit validation onExceeded: 'error'
        const strictPlugin = createTelegramWidgetsPlugin({
            screens: { settings: dummyScreen },
            sizeLimit: {
                maxBytes: 20, // artificially tiny
                onExceeded: 'error',
            },
        });

        const strictCtx = {
            chat: { id: 777 },
            api: mockApi,
        } as unknown as Context & WidgetsFlavor<{ settings: typeof dummyScreen }>;

        await strictPlugin.middleware(strictCtx, async () => {});

        expect(
            strictCtx.widgets.send('settings', { props: { plan: 'pro' } }),
        ).rejects.toThrow(/exceeds maximum limit/);

        // 5. Test sizeLimit validation onExceeded: 'warn' (does not throw)
        let warnLogged = false;
        const warnPlugin = createTelegramWidgetsPlugin({
            screens: { settings: dummyScreen },
            sizeLimit: {
                maxBytes: 20,
                onExceeded: 'warn',
            },
            logger: {
                info: () => {},
                warn: (msg) => {
                    if (msg.includes('exceeds maximum limit')) warnLogged = true;
                },
                error: () => {},
            },
        });

        const warnCtx = {
            chat: { id: 777 },
            api: mockApi,
        } as unknown as Context & WidgetsFlavor<{ settings: typeof dummyScreen }>;

        await warnPlugin.middleware(warnCtx, async () => {});
        await warnCtx.widgets.send('settings', { props: { plan: 'pro' } });
        expect(warnLogged).toBe(true);

        // 6. Test storage config object auto-creates MemoryWidgetsStorage
        const storagePlugin = createTelegramWidgetsPlugin({
            screens: { settings: dummyScreen },
            storage: { defaultTtlSeconds: 50, maxEntries: 25 },
        });
        expect(storagePlugin.storage).toBeInstanceOf(MemoryWidgetsStorage);

        // 7. Test inspect helper on controller
        const inspectReport = await prodCtx.widgets.inspect('settings', { plan: 'pro' });
        expect(inspectReport.html).toContain('Plan: pro');
        expect(inspectReport.compressedByteLength).toBeGreaterThan(0);
        expect(inspectReport.maxAllowed).toBe(4096);
    });

    test('supports static, client-interactive, and dynamic screen paradigms with optimized execution', async () => {
        // 1. Paradigm identification & auto-inference
        const staticScreen = defineStaticWidgetScreen({
            id: 'static_notice',
            component: () => '<div>Static Notice</div>',
        });
        expect(staticScreen.type).toBe('static');
        expect(getWidgetScreenType(staticScreen)).toBe('static');

        const clientScreen = defineClientWidgetScreen({
            id: 'client_faq',
            component: () => '<details><summary>FAQ</summary>Content</details>',
            initialState: () => ({ tab: 'faq' }),
        });
        expect(clientScreen.type).toBe('client');
        expect(getWidgetScreenType(clientScreen)).toBe('client');

        const dynamicScreen = defineDynamicWidgetScreen({
            id: 'dynamic_counter',
            component: () => '<div>Counter</div>',
            initialState: () => ({ value: 10 }),
            actions: {
                increment: async (ctx: WidgetActionContext<{ value: number }>) => {
                    await ctx.setState({ value: ctx.state.value + 1 });
                    return ctx.state;
                },
            },
        });
        expect(dynamicScreen.type).toBe('dynamic');
        expect(getWidgetScreenType(dynamicScreen)).toBe('dynamic');

        // Auto-inference with defineWidgetScreen
        const inferredStatic = defineWidgetScreen({
            id: 'inferred_static',
            component: () => '<div>Simple Text</div>',
        });
        expect(inferredStatic.type).toBe('static');

        const inferredClient = defineWidgetScreen({
            id: 'inferred_client',
            component: () => '<div>Client only</div>',
            initialState: () => ({ localTab: 1 }),
        });
        expect(inferredClient.type).toBe('client');

        const inferredDynamic = defineWidgetScreen({
            id: 'inferred_dynamic',
            component: () => '<div>Dynamic</div>',
            initialState: () => ({ count: 0 }),
            actions: {
                ping: () => 'pong',
            },
        });
        expect(inferredDynamic.type).toBe('dynamic');

        // Explicit override
        const explicitOverride = defineWidgetScreen({
            type: 'client',
            id: 'override',
            component: () => '<div>Override</div>',
        });
        expect(explicitOverride.type).toBe('client');

        // 2. Test send behavior for each screen type
        const sentCalls: Record<string, unknown>[] = [];
        let nextMsgId = 200;

        const mockApi = {
            raw: {
                sendWidget: async (params: Record<string, unknown>) => {
                    nextMsgId++;
                    sentCalls.push({ ...params, message_id: nextMsgId });
                    return { message_id: nextMsgId };
                },
                answerWidgetQuery: async (params: Record<string, unknown>) => params,
                editMessageWidgetData: async (params: Record<string, unknown>) => params,
            },
        };

        const plugin = createTelegramWidgetsPlugin({
            screens: {
                notice: staticScreen,
                faq: clientScreen,
                counter: dynamicScreen,
            },
        });

        const ctx = {
            chat: { id: 888 },
            api: mockApi,
        } as unknown as Context &
            WidgetsFlavor<{
                notice: typeof staticScreen;
                faq: typeof clientScreen;
                counter: typeof dynamicScreen;
            }>;

        await plugin.middleware(ctx, async () => {});

        // A. Send static screen:
        // - allow_queries must be false
        // - chat_data must be undefined
        // - storage.get must return undefined (storage allocation skipped)
        await ctx.widgets.send('notice', {});
        const staticCall = sentCalls.find((c) => c.message_id === 201)!;
        expect(staticCall.allow_queries).toBe(false);
        expect(staticCall.chat_data).toBeUndefined();
        const staticRecord = await plugin.storage.get('888:201');
        expect(staticRecord).toBeUndefined();

        // B. Send client-interactive screen:
        // - allow_queries must be false
        // - chat_data contains initial state for client scripts
        // - storage.get must return undefined (storage allocation skipped)
        await ctx.widgets.send('faq', {});
        const clientCall = sentCalls.find((c) => c.message_id === 202)!;
        expect(clientCall.allow_queries).toBe(false);
        expect(clientCall.chat_data).toContain('faq');
        const clientRecord = await plugin.storage.get('888:202');
        expect(clientRecord).toBeUndefined();

        // C. Send dynamic screen:
        // - allow_queries must be true
        // - chat_data contains serialized state
        // - storage.get must contain state (saved)
        await ctx.widgets.send('counter', {});
        const dynamicCall = sentCalls.find((c) => c.message_id === 203)!;
        expect(dynamicCall.allow_queries).toBe(true);
        expect(dynamicCall.chat_data).toContain('10');
        const dynamicRecord = await plugin.storage.get('888:203');
        expect(dynamicRecord).toBeDefined();
        expect(dynamicRecord?.state).toEqual({ value: 10 });

        // 3. Test incoming widget_query for non-interactive vs dynamic screens
        let answeredQueryData: string | undefined;
        mockApi.raw.answerWidgetQuery = async (params: any) => {
            answeredQueryData = params.data;
            return params;
        };

        // Query arrives for static screen (malicious or forced client request)
        // Manually place a record pointing to static screen
        await plugin.storage.set('888:201', {
            screenId: 'notice',
            state: {},
            updatedAt: Date.now(),
        });

        const staticQueryCtx = {
            chat: { id: 888 },
            api: mockApi,
            update: {
                widget_query: {
                    id: 'q1',
                    chat: { id: 888 },
                    message_id: 201,
                    from: { id: 1, first_name: 'Tester' },
                    chat_instance: 'inst_1',
                    data: 'click',
                },
            },
        } as unknown as Context & WidgetsFlavor<{ notice: typeof staticScreen }>;

        await plugin.middleware(staticQueryCtx, async () => {});
        expect(answeredQueryData).toContain('NON_INTERACTIVE_SCREEN');

        // Query arrives for dynamic screen
        const dynamicQueryCtx = {
            chat: { id: 888 },
            api: mockApi,
            update: {
                widget_query: {
                    id: 'q2',
                    chat: { id: 888 },
                    message_id: 203,
                    from: { id: 1, first_name: 'Tester' },
                    chat_instance: 'inst_2',
                    data: 'increment',
                },
            },
        } as unknown as Context & WidgetsFlavor<{ counter: typeof dynamicScreen }>;

        await plugin.middleware(dynamicQueryCtx, async () => {});
        expect(answeredQueryData).toContain('11');
        const updatedDynamicRecord = await plugin.storage.get('888:203');
        expect(updatedDynamicRecord?.state).toEqual({ value: 11 });
    });
});
