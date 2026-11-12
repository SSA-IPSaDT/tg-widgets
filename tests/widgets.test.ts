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
    defineWidgetScreen,
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
});
