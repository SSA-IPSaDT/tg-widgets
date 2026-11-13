import { describe, expect, it } from 'bun:test';
import { createTelegramWidgetsPlugin } from '../src/plugin';
import { defineStaticWidgetScreen, defineDynamicWidgetScreen } from '../src/screen';
import { MemoryWidgetsStorage } from '../src/storage';

describe('Action Routing & widget_query Module', () => {
    const setupRouterTest = (options?: {
        screenActions?: Record<string, any>;
        initialState?: Record<string, unknown>;
        mode?: 'prod' | 'dev';
    }) => {
        const answeredQueries: Array<{ id: string; data?: string }> = [];
        const answeredCallbacks: Array<{ id: string; text?: string; show_alert?: boolean }> = [];
        const editedWidgetData: Array<Record<string, unknown>> = [];

        const mockRawApi = {
            sendWidget: async (params: Record<string, unknown>) => ({ message_id: 10, ...params }),
            editMessageWidgetData: async (params: Record<string, unknown>) => {
                editedWidgetData.push(params);
                return { ok: true };
            },
            answerWidgetQuery: async (params: { widget_query_id: string; data?: string }) => {
                answeredQueries.push({ id: params.widget_query_id, data: params.data });
                return { ok: true };
            },
            answerCallbackQuery: async (params: {
                callback_query_id: string;
                text?: string;
                show_alert?: boolean;
            }) => {
                answeredCallbacks.push({
                    id: params.callback_query_id,
                    text: params.text,
                    show_alert: params.show_alert,
                });
                return { ok: true };
            },
        };

        const storage = new MemoryWidgetsStorage();

        const dynamicScreen = defineDynamicWidgetScreen<void, any>({
            id: 'cart-screen',
            component: () => '<div>Cart</div>',
            initialState: () => options?.initialState ?? { items: 1, total: 100 },
            actions: options?.screenActions ?? {},
        });

        const staticScreen = defineStaticWidgetScreen({
            id: 'static-invoice',
            component: () => '<div>Invoice</div>',
        });

        const plugin = createTelegramWidgetsPlugin({
            screens: { cart: dynamicScreen, invoice: staticScreen },
            storage,
            mode: options?.mode ?? 'dev',
        });

        return {
            storage,
            mockRawApi,
            answeredQueries,
            answeredCallbacks,
            editedWidgetData,
            plugin,
        };
    };

    it('passes non-widget updates through next()', async () => {
        const { plugin } = setupRouterTest();
        let nextCalled = false;

        const ctx = {
            update: { message: { text: 'Hello' } },
            api: { raw: {} },
        };

        await plugin.middleware(ctx as never, async () => {
            nextCalled = true;
        });

        expect(nextCalled).toBe(true);
    });

    it('handles successful action execution and automatic state answering', async () => {
        let actionExecuted = false;

        const setup = setupRouterTest({
            initialState: { counter: 10 },
            screenActions: {
                increment: async (actCtx: any, payload: { amount: number }) => {
                    actionExecuted = true;
                    expect(actCtx.state.counter).toBe(10);
                    expect(payload.amount).toBe(5);
                    await actCtx.setState({ counter: actCtx.state.counter + payload.amount });
                },
            },
        });
        const storage = setup.storage;

        // Prepopulate storage for message 777:200
        storage.set('777:200', {
            screenId: 'cart-screen',
            state: { counter: 10 },
            updatedAt: Date.now(),
        });

        const ctx = {
            update: {
                widget_query: {
                    id: 'wq_123',
                    chat: { id: 777, type: 'private' },
                    message_id: 200,
                    chat_instance: 'instance_abc',
                    from: { id: 42, first_name: 'Alex' },
                    data: 'increment:{"amount":5}',
                },
            },
            api: { raw: setup.mockRawApi },
        };

        await setup.plugin.middleware(ctx as never, async () => {});

        expect(actionExecuted).toBe(true);
        expect(setup.answeredQueries.length).toBe(1);
        expect(setup.answeredQueries[0].id).toBe('wq_123');
        const answerData = JSON.parse(setup.answeredQueries[0].data!);
        expect(answerData.counter).toBe(15);

        // Verify editedMessageWidgetData was called
        expect(setup.editedWidgetData.length).toBe(1);
        expect(setup.editedWidgetData[0].chat_id).toBe(777);
        expect(setup.editedWidgetData[0].message_id).toBe(200);

        // Verify storage was updated
        const updated = storage.get('777:200');
        expect(updated?.state).toEqual({ counter: 15 });
    });

    it('supports custom explicit answer with alert notifications', async () => {
        const setup = setupRouterTest();
        const storage = setup.storage;

        storage.set('500:10', {
            screenId: 'cart-screen',
            state: { discountApplied: false },
            updatedAt: Date.now(),
        });

        const plugin = createTelegramWidgetsPlugin({
            screens: {
                cart: defineDynamicWidgetScreen({
                    id: 'cart-screen',
                    component: () => '<div>Cart</div>',
                    initialState: () => ({ discountApplied: false }),
                    actions: {
                        applyCoupon: async (actCtx) => {
                            await actCtx.setState({ discountApplied: true });
                            await actCtx.answer({
                                text: 'Coupon applied successfully!',
                                show_alert: true,
                                success: true,
                            });
                        },
                    },
                }),
            },
            storage,
            mode: 'dev',
        });

        const ctx = {
            update: {
                widget_query: {
                    id: 'q_coupon',
                    chat: { id: 500, type: 'private' },
                    message_id: 10,
                    chat_instance: 'inst_1',
                    from: { id: 99, first_name: 'User' },
                    data: 'applyCoupon',
                },
            },
            api: { raw: setup.mockRawApi },
        };

        await plugin.middleware(ctx as never, async () => {});

        expect(setup.answeredCallbacks.length).toBe(1);
        expect(setup.answeredCallbacks[0].id).toBe('q_coupon');
        expect(setup.answeredCallbacks[0].text).toBe('Coupon applied successfully!');
        expect(setup.answeredCallbacks[0].show_alert).toBe(true);

        expect(setup.answeredQueries.length).toBe(1);
        const parsed = JSON.parse(setup.answeredQueries[0].data!);
        expect(parsed.success).toBe(true);
    });

    it('returns MISSING_MESSAGE_CONTEXT error if query lacks identifiers', async () => {
        const setup = setupRouterTest();
        const plugin = createTelegramWidgetsPlugin({
            screens: {},
            storage: setup.storage,
        });

        const ctx = {
            update: {
                widget_query: {
                    id: 'q_broken',
                    chat_instance: 'inst_0',
                    from: { id: 1, first_name: 'NoChat' },
                    // chat and inline_message_id are missing!
                },
            },
            api: { raw: setup.mockRawApi },
        };

        await plugin.middleware(ctx as never, async () => {});

        expect(setup.answeredQueries.length).toBe(1);
        const res = JSON.parse(setup.answeredQueries[0].data!);
        expect(res.error).toBe('MISSING_MESSAGE_CONTEXT');
    });

    it('returns SCREEN_NOT_FOUND error when record is absent from storage and query data', async () => {
        const setup = setupRouterTest();
        const plugin = createTelegramWidgetsPlugin({
            screens: {},
            storage: setup.storage,
        });

        const ctx = {
            update: {
                widget_query: {
                    id: 'q_missing',
                    chat: { id: 100, type: 'private' },
                    message_id: 50,
                    chat_instance: 'inst',
                    from: { id: 1, first_name: 'User' },
                    data: 'someAction',
                },
            },
            api: { raw: setup.mockRawApi },
        };

        await plugin.middleware(ctx as never, async () => {});

        expect(setup.answeredQueries.length).toBe(1);
        const res = JSON.parse(setup.answeredQueries[0].data!);
        expect(res.error).toBe('SCREEN_NOT_FOUND');
    });

    it('recovers screenId and state from query data if missing in storage', async () => {
        const setup = setupRouterTest();
        let fallbackHandled = false;

        const dynamicScreen = defineDynamicWidgetScreen<void, { recovered: boolean }>({
            id: 'recovered-screen',
            component: () => '<div>Recovered</div>',
            initialState: () => ({ recovered: true }),
            actions: {
                doAction: async () => {
                    fallbackHandled = true;
                },
            },
        });

        const plugin = createTelegramWidgetsPlugin({
            screens: { recovered: dynamicScreen },
            storage: setup.storage, // Storage is empty!
        });

        const ctx = {
            update: {
                widget_query: {
                    id: 'q_recover',
                    chat: { id: 333, type: 'private' },
                    message_id: 44,
                    chat_instance: 'inst',
                    from: { id: 10, first_name: 'Jane' },
                    // Data embeds screen recovery as valid JSON action
                    data: JSON.stringify({ action: 'doAction', __screen: 'recovered-screen' }),
                },
            },
            api: { raw: setup.mockRawApi },
        };

        await plugin.middleware(ctx as never, async () => {});

        expect(fallbackHandled).toBe(true);
        expect(setup.answeredQueries.length).toBe(1);
    });

    it('returns NON_INTERACTIVE_SCREEN error for static screens receiving queries', async () => {
        const setup = setupRouterTest();
        const staticScreen = defineStaticWidgetScreen({
            id: 'static-screen',
            component: () => '<div>Static Screen</div>',
        });

        const plugin = createTelegramWidgetsPlugin({
            screens: { stat: staticScreen },
            storage: setup.storage,
        });

        // Simulate stored record pointing to static screen
        setup.storage.set('100:20', {
            screenId: 'static-screen',
            state: {},
            updatedAt: Date.now(),
        });

        const ctx = {
            update: {
                widget_query: {
                    id: 'q_static',
                    chat: { id: 100, type: 'private' },
                    message_id: 20,
                    chat_instance: 'inst',
                    from: { id: 5, first_name: 'Bob' },
                    data: 'click',
                },
            },
            api: { raw: setup.mockRawApi },
        };

        await plugin.middleware(ctx as never, async () => {});

        expect(setup.answeredQueries.length).toBe(1);
        const res = JSON.parse(setup.answeredQueries[0].data!);
        expect(res.error).toBe('NON_INTERACTIVE_SCREEN');
    });

    it('returns UNKNOWN_ACTION error when action name is not registered', async () => {
        const setup = setupRouterTest();
        const dynamicScreen = defineDynamicWidgetScreen({
            id: 'dyn-screen',
            component: () => '<div>Dyn</div>',
            initialState: () => ({}),
            actions: {
                knownAction: async () => {},
            },
        });

        const plugin = createTelegramWidgetsPlugin({
            screens: { dyn: dynamicScreen },
            storage: setup.storage,
        });

        setup.storage.set('100:30', {
            screenId: 'dyn-screen',
            state: {},
            updatedAt: Date.now(),
        });

        const ctx = {
            update: {
                widget_query: {
                    id: 'q_unknown',
                    chat: { id: 100, type: 'private' },
                    message_id: 30,
                    chat_instance: 'inst',
                    from: { id: 5, first_name: 'Bob' },
                    data: 'bogusAction',
                },
            },
            api: { raw: setup.mockRawApi },
        };

        await plugin.middleware(ctx as never, async () => {});

        expect(setup.answeredQueries.length).toBe(1);
        const res = JSON.parse(setup.answeredQueries[0].data!);
        expect(res.error).toBe('UNKNOWN_ACTION');
    });

    it('returns INTERNAL_ERROR when action handler throws', async () => {
        const setup = setupRouterTest();
        const dynamicScreen = defineDynamicWidgetScreen({
            id: 'crash-screen',
            component: () => '<div>Crash</div>',
            initialState: () => ({}),
            actions: {
                blowUp: async () => {
                    throw new Error('Database connection failed');
                },
            },
        });

        const plugin = createTelegramWidgetsPlugin({
            screens: { crash: dynamicScreen },
            storage: setup.storage,
            logger: 'silent',
        });

        setup.storage.set('100:40', {
            screenId: 'crash-screen',
            state: {},
            updatedAt: Date.now(),
        });

        const ctx = {
            update: {
                widget_query: {
                    id: 'q_crash',
                    chat: { id: 100, type: 'private' },
                    message_id: 40,
                    chat_instance: 'inst',
                    from: { id: 5, first_name: 'Bob' },
                    data: 'blowUp',
                },
            },
            api: { raw: setup.mockRawApi },
        };

        await plugin.middleware(ctx as never, async () => {});

        expect(setup.answeredQueries.length).toBe(1);
        const res = JSON.parse(setup.answeredQueries[0].data!);
        expect(res.error).toBe('INTERNAL_ERROR');
    });

    it('routes inline message widget queries with inline: prefix storage key', async () => {
        const setup = setupRouterTest();
        let inlineHandled = false;

        const dynamicScreen = defineDynamicWidgetScreen<void, { inlineCount: number }>({
            id: 'inline-screen',
            component: () => '<div>Inline</div>',
            initialState: () => ({ inlineCount: 1 }),
            actions: {
                inlineVote: async (actCtx) => {
                    inlineHandled = true;
                    await actCtx.setState({ inlineCount: actCtx.state.inlineCount + 1 });
                },
            },
        });

        const plugin = createTelegramWidgetsPlugin({
            screens: { inlineScr: dynamicScreen },
            storage: setup.storage,
            mode: 'dev',
        });

        setup.storage.set('inline:inline_msg_999', {
            screenId: 'inline-screen',
            state: { inlineCount: 1 },
            updatedAt: Date.now(),
        });

        const ctx = {
            update: {
                widget_query: {
                    id: 'q_inline',
                    inline_message_id: 'inline_msg_999',
                    chat_instance: 'inst',
                    from: { id: 7, first_name: 'InlineUser' },
                    data: 'inlineVote',
                },
            },
            api: { raw: setup.mockRawApi },
        };

        await plugin.middleware(ctx as never, async () => {});

        expect(inlineHandled).toBe(true);
        expect(setup.answeredQueries.length).toBe(1);
        expect(setup.editedWidgetData[0].inline_message_id).toBe('inline_msg_999');
        const stored = setup.storage.get('inline:inline_msg_999');
        expect(stored?.state).toEqual({ inlineCount: 2 });
    });

    it('serializes concurrent widget queries for the same storageKey in strict FIFO order', async () => {
        let executionOrder: number[] = [];
        const setup = setupRouterTest({
            initialState: { count: 0 },
            screenActions: {
                inc: async (actCtx: any) => {
                    const current = actCtx.state.count;
                    // Introduce artificial latency to simulate async storage/network I/O
                    await new Promise((r) => setTimeout(r, 10));
                    const next = current + 1;
                    executionOrder.push(next);
                    await actCtx.setState({ count: next });
                    return { count: next };
                },
            },
        });

        setup.storage.set('100:200', {
            screenId: 'cart-screen',
            state: { count: 0 },
            updatedAt: Date.now(),
        });

        const makeCtx = (queryId: string) => ({
            update: {
                widget_query: {
                    id: queryId,
                    chat: { id: 100 },
                    message_id: 200,
                    chat_instance: 'inst',
                    from: { id: 1, first_name: 'Alex' },
                    data: 'inc',
                },
            },
            api: { raw: setup.mockRawApi },
        });

        // Fire 5 concurrent queries simultaneously
        await Promise.all([
            setup.plugin.middleware(makeCtx('q1') as never, async () => {}),
            setup.plugin.middleware(makeCtx('q2') as never, async () => {}),
            setup.plugin.middleware(makeCtx('q3') as never, async () => {}),
            setup.plugin.middleware(makeCtx('q4') as never, async () => {}),
            setup.plugin.middleware(makeCtx('q5') as never, async () => {}),
        ]);

        expect(setup.answeredQueries.length).toBe(5);
        expect(executionOrder).toEqual([1, 2, 3, 4, 5]);
        const finalStored = setup.storage.get('100:200');
        expect(finalStored?.state).toEqual({ count: 5 });
    });

    it('supports idempotent toggle actions with explicit boolean payloads', async () => {
        const setup = setupRouterTest({
            initialState: { notifications: true, newsletter: true },
            screenActions: {
                toggleNotifications: async (actCtx: any, payload?: unknown) => {
                    const nextVal =
                        typeof payload === 'boolean' ? payload : !actCtx.state.notifications;
                    const next = { ...actCtx.state, notifications: nextVal };
                    await actCtx.setState(next);
                    return next;
                },
            },
        });

        setup.storage.set('100:200', {
            screenId: 'cart-screen',
            state: { notifications: true, newsletter: true },
            updatedAt: Date.now(),
        });

        const makeCtx = (queryId: string, actionData: string) => ({
            update: {
                widget_query: {
                    id: queryId,
                    chat: { id: 100 },
                    message_id: 200,
                    chat_instance: 'inst',
                    from: { id: 1, first_name: 'Alex' },
                    data: actionData,
                },
            },
            api: { raw: setup.mockRawApi },
        });

        // Send explicit target value: toggleNotifications:false
        await setup.plugin.middleware(
            makeCtx('q1', 'toggleNotifications:false') as never,
            async () => {},
        );
        expect(setup.storage.get('100:200')?.state).toEqual({
            notifications: false,
            newsletter: true,
        });

        // Duplicate call with toggleNotifications:false remains false (idempotent)
        await setup.plugin.middleware(
            makeCtx('q2', 'toggleNotifications:false') as never,
            async () => {},
        );
        expect(setup.storage.get('100:200')?.state).toEqual({
            notifications: false,
            newsletter: true,
        });
    });
});
