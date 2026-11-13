import type { Context, MiddlewareFn } from 'grammy';
import { decodeWidgetAction } from '../action';
import { unpackState } from '../codec';
import {
    getWidgetScreenType,
    type AnyWidgetScreen,
    type RawWidgetApiMethods,
    type WidgetActionContext,
} from '../screen';
import type { WidgetsStorage } from '../storage';
import { createActionContext } from './action-context';
import type {
    ResolvedPluginConfig,
    TelegramWidgetQueryPayload,
    WidgetsFlavor,
    WidgetsLogger,
} from './types';
import { getStorageKey } from './utils';

const storageQueues = new Map<string, Promise<unknown>>();

const serializeByStorageKey = async <T>(key: string, task: () => Promise<T>): Promise<T> => {
    const prev = storageQueues.get(key) ?? Promise.resolve();
    let resolveTask: () => void;
    const taskPromise = new Promise<void>((resolve) => {
        resolveTask = resolve;
    });
    const chained = prev.then(
        () => taskPromise,
        () => taskPromise,
    );
    storageQueues.set(key, chained);
    try {
        await prev;
        return await task();
    } finally {
        resolveTask!();
        if (storageQueues.get(key) === chained) {
            storageQueues.delete(key);
        }
    }
};

export const handleWidgetQuery = async <TScreens extends Record<string, AnyWidgetScreen>>(
    ctx: Context & WidgetsFlavor<TScreens>,
    rawApi: RawWidgetApiMethods,
    config: ResolvedPluginConfig,
    storage: WidgetsStorage,
    screensById: Map<string, AnyWidgetScreen>,
    logger: WidgetsLogger,
    next: Parameters<MiddlewareFn<Context & WidgetsFlavor<TScreens>>>[1],
): Promise<void> => {
    const rawUpdate = ctx.update as unknown as Record<string, unknown> | undefined;
    if (!rawUpdate || typeof rawUpdate !== 'object' || !('widget_query' in rawUpdate)) {
        await next();
        return;
    }

    const query = rawUpdate.widget_query as TelegramWidgetQueryPayload | undefined;
    if (!query) {
        await next();
        return;
    }

    const storageKey = getStorageKey(query.chat?.id, query.message_id, query.inline_message_id);

    if (config.debug) {
        logger.info(
            `Received widget_query #${query.id} for storageKey: ${storageKey}, data: "${query.data}"`,
        );
    }

    if (!storageKey) {
        logger.warn('[telegram-widgets] Missing chat/message identifier in widget_query.');
        await rawApi.answerWidgetQuery({
            widget_query_id: query.id,
            data: JSON.stringify({ error: 'MISSING_MESSAGE_CONTEXT' }),
        });
        return;
    }

    await serializeByStorageKey(storageKey, async () => {
        let registeredRecord = await storage.get(storageKey);

        // Fallback: If not found in storage, attempt to recover screenId and state if embedded in query data
        if (!registeredRecord && query.data && typeof query.data === 'string') {
            if (query.data.includes('"_s"') || query.data.includes('"__screen"')) {
                const recovered = unpackState(query.data, config.codec.customReverseKeys);
                if (recovered.screenId) {
                    registeredRecord = {
                        screenId: recovered.screenId,
                        state: recovered.state,
                        updatedAt: Date.now(),
                    };
                }
            }
        }

        if (!registeredRecord) {
            logger.warn(
                `[telegram-widgets] No registered screen found for storage key ${storageKey}. Consider configuring persistent storage.`,
            );
            await rawApi.answerWidgetQuery({
                widget_query_id: query.id,
                data: JSON.stringify({ error: 'SCREEN_NOT_FOUND' }),
            });
            return;
        }

        const screen = screensById.get(registeredRecord.screenId);
        if (!screen) {
            await rawApi.answerWidgetQuery({
                widget_query_id: query.id,
                data: JSON.stringify({ error: 'SCREEN_NOT_FOUND' }),
            });
            return;
        }

        const screenType = getWidgetScreenType(screen);
        if (
            screenType === 'static' ||
            screenType === 'client' ||
            !screen.actions ||
            Object.keys(screen.actions).length === 0
        ) {
            logger.warn(
                `[telegram-widgets] Received widget_query for non-interactive screen "${screen.id}" (type: ${screenType}).`,
            );
            await rawApi.answerWidgetQuery({
                widget_query_id: query.id,
                data: JSON.stringify({ error: 'NON_INTERACTIVE_SCREEN' }),
            });
            return;
        }

        // Parse action name and payload with codec support
        const { action: actionName, payload } = decodeWidgetAction(query.data ?? '', {
            decompress: config.codec.decompressActionPayload,
            customReverseMap: config.codec.customReverseKeys,
        });

        const actions = (screen.actions ?? {}) as Record<
            string,
            (c: WidgetActionContext<Record<string, unknown>>, p: unknown) => unknown
        >;
        const handler = actions[actionName];
        if (!handler) {
            logger.warn(
                `[telegram-widgets] Unhandled action "${actionName}" for screen "${screen.id}".`,
            );
            await rawApi.answerWidgetQuery({
                widget_query_id: query.id,
                data: JSON.stringify({ error: 'UNKNOWN_ACTION' }),
            });
            return;
        }

        const runner = createActionContext(
            query,
            screen.id,
            registeredRecord.state,
            storageKey,
            rawApi,
            storage,
            config,
            logger,
        );

        try {
            const result = await handler(runner.actionCtx, payload);
            if (!runner.getIsAnswered()) {
                await runner.actionCtx.answer(result ?? runner.getCurrentState());
            }
        } catch (error) {
            logger.error(
                `[telegram-widgets] Error executing action "${actionName}" on screen "${screen.id}":`,
                error,
            );
            if (!runner.getIsAnswered()) {
                await runner.actionCtx.answer({ error: 'INTERNAL_ERROR' });
            }
        } finally {
            const pending = runner.getPendingEditPromise();
            if (pending) {
                await pending;
            }
        }
    });
};
