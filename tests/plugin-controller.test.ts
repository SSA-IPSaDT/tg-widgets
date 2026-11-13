import { describe, expect, it } from 'bun:test';
import {
    createTelegramWidgetsPlugin,
    createWidgetsPlugin,
    createBubblesPlugin,
    type WidgetsLogger,
} from '../src/plugin';
import {
    defineStaticWidgetScreen,
    defineDynamicWidgetScreen,
} from '../src/screen';
import { MemoryWidgetsStorage } from '../src/storage';

describe('Plugin Controller Module', () => {
    const dummyStaticScreen = defineStaticWidgetScreen<{ heading?: string }>({
        id: 'hero',
        component: ({ heading } = {}) => `<div class="hero"><h1>${heading ?? 'Default'}</h1></div>`,
    });

    const dummyDynamicScreen = defineDynamicWidgetScreen<{ initial?: number }, { count: number }>({
        id: 'stepper',
        component: () => '<div class="stepper">Stepper Widget</div>',
        initialState: (props) => ({ count: props?.initial ?? 0 }),
        actions: {
            inc: async (actCtx) => {
                await actCtx.setState({ count: actCtx.state.count + 1 });
            },
        },
    });

    describe('Plugin Configuration Resolution', () => {
        it('resolves production preset defaults correctly', () => {
            const plugin = createTelegramWidgetsPlugin({
                screens: { hero: dummyStaticScreen },
                mode: 'prod',
            });

            expect(plugin.config.mode).toBe('prod');
            expect(plugin.config.codec.mode).toBe('prod');
            expect(plugin.config.codec.compressState).toBe(true);
            expect(plugin.config.codec.compressAnswer).toBe(true);
            expect(plugin.config.minifier.enabled).toBe(true);
            expect(plugin.config.minifier.engine).toBe('terser');
            expect(plugin.config.sizeLimit.maxBytes).toBe(4096);
            expect(plugin.config.sizeLimit.onExceeded).toBe('error');
        });

        it('resolves development preset defaults correctly', () => {
            const plugin = createTelegramWidgetsPlugin({
                screens: { hero: dummyStaticScreen },
                mode: 'dev',
            });

            expect(plugin.config.mode).toBe('dev');
            expect(plugin.config.codec.mode).toBe('dev');
            expect(plugin.config.codec.compressState).toBe(false);
            expect(plugin.config.codec.compressAnswer).toBe(false);
            expect(plugin.config.minifier.enabled).toBe(false);
            expect(plugin.config.minifier.engine).toBe('none');
            expect(plugin.config.sizeLimit.onExceeded).toBe('warn');
        });

        it('resolves custom codec, minifier, and sizeLimit overrides', () => {
            const plugin = createTelegramWidgetsPlugin({
                screens: { hero: dummyStaticScreen },
                mode: 'dev',
                codec: {
                    mode: 'prod',
                    customKeys: { userTier: 'ut', checkoutPrice: 'cp' },
                    compressState: true,
                    compressAnswer: true,
                    injectClientSnippet: true,
                },
                minifier: 'fast',
                sizeLimit: {
                    maxBytes: 2048,
                    onExceeded: 'ignore',
                    autoInspect: true,
                },
                defaults: {
                    width: 2,
                    height: 1,
                    allowQueries: true,
                    parseMode: 'HTML',
                },
            });

            expect(plugin.config.codec.mode).toBe('prod');
            expect(plugin.config.codec.customKeys).toEqual({ userTier: 'ut', checkoutPrice: 'cp' });
            expect(plugin.config.codec.injectClientSnippet).toBe(true);
            expect(plugin.config.minifier.engine).toBe('fast');
            expect(plugin.config.sizeLimit.maxBytes).toBe(2048);
            expect(plugin.config.sizeLimit.onExceeded).toBe('ignore');
            expect(plugin.config.sizeLimit.autoInspect).toBe(true);
            expect(plugin.config.defaults.width).toBe(2);
            expect(plugin.config.defaults.height).toBe(1);
            expect(plugin.config.defaults.parseMode).toBe('HTML');
        });

        it('supports storage options shortcut to instantiate MemoryWidgetsStorage', () => {
            const plugin = createTelegramWidgetsPlugin({
                screens: { hero: dummyStaticScreen },
                storage: { defaultTtlSeconds: 1800, maxEntries: 250 },
            });

            expect(plugin.storage).toBeInstanceOf(MemoryWidgetsStorage);
        });

        it('allows custom logger injection and silent logging', () => {
            const logs: string[] = [];
            const customLogger: WidgetsLogger = {
                info: (msg) => logs.push(`INFO: ${msg}`),
                warn: (msg) => logs.push(`WARN: ${msg}`),
                error: (msg) => logs.push(`ERROR: ${msg}`),
            };

            const plugin = createTelegramWidgetsPlugin({
                screens: { hero: dummyStaticScreen },
                logger: customLogger,
                debug: true,
            });
            expect(plugin).toBeDefined();

            const silentPlugin = createTelegramWidgetsPlugin({
                screens: { hero: dummyStaticScreen },
                logger: 'silent',
            });
            expect(silentPlugin).toBeDefined();
        });
    });

    describe('Controller Execution: send, reply, and update', () => {
        const createMockContext = (overrides?: Record<string, unknown>) => {
            const sentCalls: Array<Record<string, unknown>> = [];
            const editedCalls: Array<Record<string, unknown>> = [];

            const mockRawApi = {
                sendWidget: async (params: Record<string, unknown>) => {
                    sentCalls.push(params);
                    return { message_id: 888, ...params };
                },
                editMessageWidgetData: async (params: Record<string, unknown>) => {
                    editedCalls.push(params);
                    return { ok: true };
                },
                answerWidgetQuery: async () => ({ ok: true }),
            };

            const ctx = {
                chat: { id: 12345 },
                msg: { message_id: 555 },
                api: { raw: mockRawApi },
                update: {},
                ...overrides,
            };

            return { ctx, sentCalls, editedCalls };
        };

        it('ctx.widgets.send delivers widget with resolved properties', async () => {
            const { ctx, sentCalls } = createMockContext();
            const storage = new MemoryWidgetsStorage();

            const plugin = createTelegramWidgetsPlugin({
                screens: { hero: dummyStaticScreen, stepper: dummyDynamicScreen },
                storage,
                defaults: { width: 3, height: 2, parseMode: 'Markdown' },
            });

            await plugin.middleware(ctx as never, async () => {});

            const res = await (ctx as any).widgets.send('hero', {
                props: { heading: 'Welcome' },
                caption: 'Welcome caption',
            });

            expect(res.message_id).toBe(888);
            expect(sentCalls.length).toBe(1);
            expect(sentCalls[0].chat_id).toBe(12345);
            expect(sentCalls[0].width).toBe(3);
            expect(sentCalls[0].height).toBe(2);
            expect(sentCalls[0].caption).toBe('Welcome caption');
            expect(sentCalls[0].parse_mode).toBe('Markdown');
            expect(sentCalls[0].html).toContain('Welcome');
        });

        it('ctx.widgets.send supports overriding chatId explicitly', async () => {
            const { ctx, sentCalls } = createMockContext();
            const plugin = createTelegramWidgetsPlugin({
                screens: { hero: dummyStaticScreen },
            });

            await plugin.middleware(ctx as never, async () => {});

            await (ctx as any).widgets.send('hero', {
                chatId: 999999,
            });

            expect(sentCalls[0].chat_id).toBe(999999);
        });

        it('throws error when screen is not found or chatId cannot be resolved', async () => {
            const { ctx } = createMockContext();
            const plugin = createTelegramWidgetsPlugin({
                screens: { hero: dummyStaticScreen },
            });

            await plugin.middleware(ctx as never, async () => {});

            await expect((ctx as any).widgets.send('nonexistent', {})).rejects.toThrow(
                /Screen "nonexistent" not found/,
            );

            // Context without chat id
            const noChatCtx = createMockContext({ chat: undefined }).ctx;
            await plugin.middleware(noChatCtx as never, async () => {});

            await expect((noChatCtx as any).widgets.send('hero', {})).rejects.toThrow(
                /Cannot determine target chat_id/,
            );
        });

        it('ctx.widgets.reply injects reply_parameters referencing current message', async () => {
            const { ctx, sentCalls } = createMockContext();
            const plugin = createTelegramWidgetsPlugin({
                screens: { hero: dummyStaticScreen },
            });

            await plugin.middleware(ctx as never, async () => {});

            await (ctx as any).widgets.reply('hero', {});

            expect(sentCalls.length).toBe(1);
            expect(sentCalls[0].reply_parameters).toEqual({ message_id: 555 });
        });

        it('ctx.widgets.update sends updated chat_data and updates storage', async () => {
            const { ctx, editedCalls } = createMockContext();
            const storage = new MemoryWidgetsStorage();

            const plugin = createTelegramWidgetsPlugin({
                screens: { stepper: dummyDynamicScreen },
                storage,
                mode: 'dev',
            });

            await plugin.middleware(ctx as never, async () => {});

            // Initialize storage record
            storage.set('12345:888', {
                screenId: 'stepper',
                state: { count: 0 },
                updatedAt: Date.now(),
            });

            await (ctx as any).widgets.update(888, 'stepper', {
                state: { count: 15 },
            });

            expect(editedCalls.length).toBe(1);
            expect(editedCalls[0].chat_id).toBe(12345);
            expect(editedCalls[0].message_id).toBe(888);
            expect(editedCalls[0].chat_data).toContain('15');

            const updatedStorage = storage.get('12345:888');
            expect(updatedStorage?.state).toEqual({ count: 15 });
        });
    });

    describe('Controller Inspection & Size Validation', () => {
        it('inspects size synchronously and asynchronously via render and inspect', async () => {
            const plugin = createTelegramWidgetsPlugin({
                screens: { hero: dummyStaticScreen },
                mode: 'prod',
            });

            const { ctx } = {
                ctx: {
                    chat: { id: 1 },
                    api: { raw: {} },
                    update: {},
                },
            };

            await plugin.middleware(ctx as never, async () => {});

            const syncReport = (ctx as any).widgets.render('hero', { heading: 'Inspect Me' });
            expect(syncReport.byteLength).toBeGreaterThan(0);
            expect(syncReport.compressedByteLength).toBeGreaterThan(0);
            expect(syncReport.isValid).toBe(true);

            const asyncReport = await (ctx as any).widgets.renderAsync('hero', { heading: 'Inspect Me' });
            expect(asyncReport.isValid).toBe(true);

            const inspectReport = await (ctx as any).widgets.inspect('hero', { heading: 'Inspect Me' });
            expect(inspectReport.maxAllowed).toBe(4096);
            expect(inspectReport.isValid).toBe(true);
        });

        it('triggers onExceeded error when compressed size exceeds custom limit', async () => {
            const oversizedScreen = defineStaticWidgetScreen({
                id: 'huge',
                // Generate uncompressible content exceeding 300 bytes
                component: () => `<div>${Array.from({ length: 500 }, (_, i) => `<i>${(i * 997) % 1000}</i>`).join('')}</div>`,
            });

            const sentCalls: Array<unknown> = [];
            const plugin = createTelegramWidgetsPlugin({
                screens: { huge: oversizedScreen },
                sizeLimit: {
                    maxBytes: 150,
                    onExceeded: 'error',
                },
            });

            const ctx = {
                chat: { id: 10 },
                api: {
                    raw: {
                        sendWidget: async (p: unknown) => {
                            sentCalls.push(p);
                            return { message_id: 1 };
                        },
                    },
                },
                update: {},
            };

            await plugin.middleware(ctx as never, async () => {});

            await expect((ctx as any).widgets.send('huge', {})).rejects.toThrow(
                /exceeds maximum limit \(150 B\)/,
            );
            expect(sentCalls.length).toBe(0);
        });

        it('triggers custom callback when size limit is exceeded', async () => {
            let callbackReport: unknown = null;

            const oversizedScreen = defineStaticWidgetScreen({
                id: 'huge-cb',
                component: () => `<div>${Array.from({ length: 400 }, (_, i) => `<b>${(i * 31) % 99}</b>`).join('')}</div>`,
            });

            const plugin = createTelegramWidgetsPlugin({
                screens: { hugeCb: oversizedScreen },
                sizeLimit: {
                    maxBytes: 100,
                    onExceeded: (report) => {
                        callbackReport = report;
                    },
                },
            });

            const ctx = {
                chat: { id: 10 },
                api: {
                    raw: {
                        sendWidget: async () => ({ message_id: 1 }),
                    },
                },
                update: {},
            };

            await plugin.middleware(ctx as never, async () => {});

            await (ctx as any).widgets.send('hugeCb', {});
            expect(callbackReport).toBeDefined();
            expect((callbackReport as any).compressedByteLength).toBeGreaterThan(100);
        });
    });

    describe('Aliases and Controller access', () => {
        it('provides identical functionality via ctx.bubbles and plugin aliases', async () => {
            const plugin = createWidgetsPlugin({
                screens: { hero: dummyStaticScreen },
            });

            const bubblePlugin = createBubblesPlugin({
                screens: { hero: dummyStaticScreen },
            });

            expect(plugin.screens).toBeDefined();
            expect(bubblePlugin.screens).toBeDefined();

            const ctx = {
                chat: { id: 444 },
                api: {
                    raw: {
                        sendWidget: async () => ({ message_id: 999 }),
                    },
                },
                update: {},
            };

            await plugin.middleware(ctx as never, async () => {});

            expect((ctx as any).widgets).toBe((ctx as any).bubbles);
            const screen = (ctx as any).bubbles.getScreen('hero');
            expect(screen?.id).toBe('hero');
        });
    });
});
