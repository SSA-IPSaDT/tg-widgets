import { describe, expect, test } from 'bun:test';

import type { Context } from 'grammy';

import {
    Avatar,
    Badge,
    Button,
    Card,
    Checkbox,
    ChevronRightIcon,
    createTelegramWidgetsPlugin,
    defineWidgetScreen,
    Divider,
    formatStyle,
    h,
    Input,
    inspectWidgetSize,
    List,
    ListItem,
    ProgressBar,
    Radio,
    RadioGroup,
    renderWidget,
    SegmentedControl,
    Skeleton,
    Switch,
    Typography,
    type WidgetActionContext,
    WidgetLayout,
    type WidgetsFlavor,
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

    test('renders Telegram native UI components correctly', () => {
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

        const card = Card({
            header: 'Header',
            footer: 'Footer',
            children: 'Card Content',
        });
        expect(card).toContain('Card Content');
        expect(card).toContain('Header');
        expect(card).toContain('Footer');

        const input = Input({
            id: 'username',
            placeholder: 'Enter name',
            label: 'Your Name',
            error: 'Invalid username',
        });
        expect(input).toContain('placeholder="Enter name"');
        expect(input).toContain('Your Name');
        expect(input).toContain('Invalid username');

        const chk = Checkbox({
            id: 'agree',
            label: 'I agree',
            description: 'Terms of service',
        });
        expect(chk).toContain('type="checkbox"');
        expect(chk).toContain('I agree');
        expect(chk).toContain('Terms of service');

        const radio = Radio({
            id: 'opt1',
            name: 'choice',
            value: 'v1',
            label: 'Option 1',
        });
        expect(radio).toContain('type="radio"');
        expect(radio).toContain('Option 1');

        const radioGroup = RadioGroup({ children: radio });
        expect(radioGroup).toContain('tg-radio-group');

        const sw = Switch({ id: 'notifications', label: 'Alerts' });
        expect(sw).toContain('tg-switch-wrapper');
        expect(sw).toContain('Alerts');

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

        const layout = WidgetLayout({ children: 'Body' });
        expect(layout).toContain('tg-widget-root');
    });

    test('inspectWidgetSize and renderWidget check deflate compression limits', () => {
        const report = inspectWidgetSize('<div>Hello Widget</div>');
        expect(report.html).toContain('<!DOCTYPE html>');
        expect(report.html).toContain('<div>Hello Widget</div>');
        expect(report.byteLength).toBeGreaterThan(0);
        expect(report.compressedByteLength).toBeGreaterThan(0);
        expect(report.compressedByteLength).toBeLessThanOrEqual(4096);
        expect(report.isValid).toBe(true);

        const html = renderWidget('<div>Test</div>');
        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toContain('<div>Test</div>');
    });

    test('plugin sends widget, answers actions, and supports reply and update', async () => {
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
                ) => {
                    const next = {
                        count: ctx.state.count + 1,
                    };
                    await ctx.setState(next);
                    return next;
                },
            },
        });

        const plugin = createTelegramWidgetsPlugin({
            screens: {
                counter: testScreen,
            },
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

        // Send screen
        await ctx.widgets.send('counter', {
            chatId: 100,
            props: { initial: 5 },
        });

        expect(sentParams?.chat_id).toBe(100);
        const chatData = JSON.parse(sentParams?.chat_data as string);
        expect(chatData.count).toBe(5);
        expect(chatData.__screen).toBe('counter');

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

        // Simulate incoming widget_query update
        const queryCtx = {
            update: {
                widget_query: {
                    id: 'q-1',
                    data: 'increment',
                    chat: { id: 100 },
                    message: {
                        message_id: 200,
                        chat: { id: 100 },
                        chat_data: JSON.stringify({
                            __screen: 'counter',
                            count: 5,
                        }),
                    },
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
        expect(updatedState.count).toBe(43);
        expect(updatedState.__screen).toBe('counter');
    });

    test('cross-runtime entrypoints (mod.ts, jsx-runtime, jsx-dev-runtime) export all required primitives', async () => {
        const mod = await import('../mod');
        expect(mod.WidgetLayout).toBeDefined();
        expect(mod.Button).toBeDefined();
        expect(mod.Card).toBeDefined();
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
});
