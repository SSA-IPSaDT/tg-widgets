import { describe, expect, it } from 'bun:test';
import {
    defineStaticWidgetScreen,
    defineStaticBubbleScreen,
    defineClientWidgetScreen,
    defineClientBubbleScreen,
    defineDynamicWidgetScreen,
    defineDynamicBubbleScreen,
    defineWidgetScreen,
    defineBubbleScreen,
    getWidgetScreenType,
    getBubbleScreenType,
} from '../src/screen';
import { createTelegramWidgetsPlugin } from '../src/plugin';
import { MemoryWidgetsStorage } from '../src/storage';

describe('Screen Paradigms Module', () => {
    describe('Type Inference & Definition Helpers', () => {
        it('should correctly infer screen paradigms with getWidgetScreenType and getBubbleScreenType', () => {
            const staticScreen = {
                id: 'static-demo',
                component: () => '<div>Static Content</div>',
            };
            expect(getWidgetScreenType(staticScreen as never)).toBe('static');
            expect(getBubbleScreenType(staticScreen as never)).toBe('static');

            const clientScreen = {
                id: 'client-demo',
                component: () => '<div>Client Content</div>',
                initialState: () => ({ tab: 1 }),
            };
            expect(getWidgetScreenType(clientScreen as never)).toBe('client');

            const dynamicScreen = {
                id: 'dynamic-demo',
                component: () => '<div>Dynamic Content</div>',
                initialState: () => ({ count: 0 }),
                actions: {
                    increment: async () => {},
                },
            };
            expect(getWidgetScreenType(dynamicScreen as never)).toBe('dynamic');

            const explicitOverride = {
                type: 'static' as const,
                id: 'explicit-static',
                component: () => '<div>Override</div>',
                actions: { dummy: async () => {} },
            };
            expect(getWidgetScreenType(explicitOverride as never)).toBe('static');
        });

        it('defineStaticWidgetScreen creates valid static screens', () => {
            const screen = defineStaticWidgetScreen<{ title: string }>({
                id: 'announcement',
                component: ({ title }) => `<h1>${title}</h1>`,
            });

            expect(screen.type).toBe('static');
            expect(screen.id).toBe('announcement');
            expect(screen.component({ title: 'Important' })).toBe('<h1>Important</h1>');

            const bubbleScreen = defineStaticBubbleScreen({
                id: 'bubble-static',
                component: () => '<div>Bubble</div>',
            });
            expect(bubbleScreen.type).toBe('static');
        });

        it('defineClientWidgetScreen creates valid client interactive screens', () => {
            const screen = defineClientWidgetScreen<{ defaultOpen: boolean }, { isOpen: boolean }>({
                id: 'accordion-widget',
                component: () => '<details><summary>Toggle</summary></details>',
                initialState: (props) => ({ isOpen: props?.defaultOpen ?? false }),
            });

            expect(screen.type).toBe('client');
            expect(screen.id).toBe('accordion-widget');
            expect(screen.initialState?.({ defaultOpen: true })).toEqual({ isOpen: true });

            const bubbleScreen = defineClientBubbleScreen({
                id: 'bubble-client',
                component: () => '<span>Client</span>',
            });
            expect(bubbleScreen.type).toBe('client');
        });

        it('defineDynamicWidgetScreen creates valid dynamic screens', () => {
            const incrementMock = async () => {};
            const screen = defineDynamicWidgetScreen<void, { count: number }>({
                id: 'counter-widget',
                component: () => '<button>Click</button>',
                initialState: () => ({ count: 0 }),
                actions: {
                    increment: incrementMock,
                },
            });

            expect(screen.type).toBe('dynamic');
            expect(screen.id).toBe('counter-widget');
            expect(screen.initialState()).toEqual({ count: 0 });
            expect(screen.actions.increment).toBe(incrementMock);

            const bubbleScreen = defineDynamicBubbleScreen({
                id: 'bubble-dyn',
                component: () => '<div>Dyn</div>',
                initialState: () => ({}),
                actions: {},
            });
            expect(bubbleScreen.type).toBe('dynamic');
        });

        it('defineWidgetScreen auto-infers appropriate screen type based on structure', () => {
            const inferredStatic = defineWidgetScreen({
                id: 'inf-static',
                component: () => '<p>Pure</p>',
            });
            expect(inferredStatic.type).toBe('static');

            const inferredClient = defineWidgetScreen({
                id: 'inf-client',
                component: () => '<p>Client</p>',
                initialState: () => ({ step: 1 }),
            });
            expect(inferredClient.type).toBe('client');

            const inferredDynamic = defineWidgetScreen({
                id: 'inf-dyn',
                component: () => '<p>Dyn</p>',
                initialState: () => ({ value: 10 }),
                actions: {
                    update: async () => {},
                },
            });
            expect(inferredDynamic.type).toBe('dynamic');

            // Explicit type override
            const explicit = defineWidgetScreen({
                type: 'client',
                id: 'explicit-client',
                component: () => '<p>Force client</p>',
            });
            expect(explicit.type).toBe('client');

            const bubbleScreen = defineBubbleScreen({
                id: 'bubble-universal',
                component: () => '<b>Uni</b>',
            });
            expect(bubbleScreen.type).toBe('static');
        });
    });

    describe('Execution & Delivery Optimization in Plugin', () => {
        const setupMockContext = (sentPayloads: Array<Record<string, unknown>>) => {
            const mockRawApi = {
                sendWidget: async (params: Record<string, unknown>) => {
                    sentPayloads.push(params);
                    return { message_id: 101, ...params };
                },
                editMessageWidgetData: async () => ({}),
                answerWidgetQuery: async () => ({}),
            };

            const ctx = {
                chat: { id: 777 },
                api: { raw: mockRawApi },
                update: {},
            };

            return { ctx, mockRawApi };
        };

        it('Static screen: disables allow_queries, omits chat_data, and bypasses storage', async () => {
            const sentPayloads: Array<Record<string, unknown>> = [];
            const storage = new MemoryWidgetsStorage();

            const staticScreen = defineStaticWidgetScreen({
                id: 'receipt-screen',
                component: () => '<div class="receipt">Invoice #123 Paid</div>',
            });

            const plugin = createTelegramWidgetsPlugin({
                screens: { receipt: staticScreen },
                storage,
                mode: 'prod',
            });

            const { ctx } = setupMockContext(sentPayloads);
            await plugin.middleware(ctx as never, async () => {});

            const res = await (ctx as any).widgets.send('receipt', {});
            expect(res.message_id).toBe(101);

            expect(sentPayloads.length).toBe(1);
            const sent = sentPayloads[0];

            // 1. allow_queries must be false
            expect(sent.allow_queries).toBe(false);

            // 2. chat_data must be undefined
            expect(sent.chat_data).toBeUndefined();

            // 3. Storage must be empty (bypassed)
            expect(storage.size).toBe(0);
        });

        it('Client screen: disables allow_queries, sets chat_data if provided, and bypasses storage', async () => {
            const sentPayloads: Array<Record<string, unknown>> = [];
            const storage = new MemoryWidgetsStorage();

            const clientScreen = defineClientWidgetScreen<void, { activeTab: string }>({
                id: 'tabs-screen',
                component: () => '<div class="tabs"><button>Tab 1</button></div>',
                initialState: () => ({ activeTab: 'home' }),
            });

            const plugin = createTelegramWidgetsPlugin({
                screens: { tabs: clientScreen },
                storage,
                mode: 'dev', // in dev mode, state is uncompressed JSON
            });

            const { ctx } = setupMockContext(sentPayloads);
            await plugin.middleware(ctx as never, async () => {});

            await (ctx as any).widgets.send('tabs', {});

            expect(sentPayloads.length).toBe(1);
            const sent = sentPayloads[0];

            // 1. allow_queries must be false
            expect(sent.allow_queries).toBe(false);

            // 2. chat_data must be initialized
            expect(sent.chat_data).toBeDefined();
            const parsed = JSON.parse(sent.chat_data as string);
            expect(parsed.activeTab).toBe('home');
            expect(parsed.__screen).toBe('tabs-screen');

            // 3. Storage must still be bypassed for client-only screens
            expect(storage.size).toBe(0);
        });

        it('Dynamic screen: enables allow_queries, packs chat_data, and saves state to storage', async () => {
            const sentPayloads: Array<Record<string, unknown>> = [];
            const storage = new MemoryWidgetsStorage();

            const dynamicScreen = defineDynamicWidgetScreen<void, { counter: number }>({
                id: 'clicker-screen',
                component: () => '<button>Vote</button>',
                initialState: () => ({ counter: 5 }),
                actions: {
                    vote: async (actCtx) => {
                        await actCtx.setState({ counter: actCtx.state.counter + 1 });
                    },
                },
            });

            const plugin = createTelegramWidgetsPlugin({
                screens: { clicker: dynamicScreen },
                storage,
                mode: 'dev',
            });

            const { ctx } = setupMockContext(sentPayloads);
            await plugin.middleware(ctx as never, async () => {});

            await (ctx as any).widgets.send('clicker', {});

            expect(sentPayloads.length).toBe(1);
            const sent = sentPayloads[0];

            // 1. allow_queries must be true
            expect(sent.allow_queries).toBe(true);

            // 2. chat_data must be present
            expect(sent.chat_data).toBeDefined();

            // 3. Storage must have saved the record for 777:101
            expect(storage.size).toBe(1);
            const saved = storage.get('777:101');
            expect(saved).toBeDefined();
            expect(saved?.screenId).toBe('clicker-screen');
            expect(saved?.state).toEqual({ counter: 5 });
        });

        it('Dynamic screen: honors skipStorage: true when explicitly requested', async () => {
            const sentPayloads: Array<Record<string, unknown>> = [];
            const storage = new MemoryWidgetsStorage();

            const dynamicScreen = defineDynamicWidgetScreen<void, { count: number }>({
                id: 'stateless-clicker',
                component: () => '<button>Tap</button>',
                initialState: () => ({ count: 0 }),
                actions: { tap: async () => {} },
            });

            const plugin = createTelegramWidgetsPlugin({
                screens: { dyn: dynamicScreen },
                storage,
            });

            const { ctx } = setupMockContext(sentPayloads);
            await plugin.middleware(ctx as never, async () => {});

            await (ctx as any).widgets.send('dyn', { skipStorage: true });

            expect(sentPayloads.length).toBe(1);
            expect(storage.size).toBe(0);
        });

        it('Static screen: allows explicitly setting allowQueries: true if user forces it', async () => {
            const sentPayloads: Array<Record<string, unknown>> = [];
            const staticScreen = defineStaticWidgetScreen({
                id: 'forced-screen',
                component: () => '<div>Static</div>',
            });

            const plugin = createTelegramWidgetsPlugin({
                screens: { forced: staticScreen },
            });

            const { ctx } = setupMockContext(sentPayloads);
            await plugin.middleware(ctx as never, async () => {});

            await (ctx as any).widgets.send('forced', { allowQueries: true });

            expect(sentPayloads.length).toBe(1);
            expect(sentPayloads[0].allow_queries).toBe(true);
        });
    });
});
