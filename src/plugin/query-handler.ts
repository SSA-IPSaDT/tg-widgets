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
import { extractQueryContext, serializeByStorageKey } from './utils';

const safeAnswer = (rawApi: RawWidgetApiMethods, queryId: string, data: unknown) =>
    rawApi
        .answerWidgetQuery({
            widget_query_id: queryId,
            data: typeof data === 'string' ? data : JSON.stringify(data),
        })
        .catch(() => {});

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

    const queryContext = extractQueryContext(query);
    const { storageKey, chatId, messageId, inlineMessageId } = queryContext;

    if (config.debug) {
        logger.info(
            `Received widget_query #${query.id} for storageKey: ${storageKey}, data: "${query.data}"`,
        );
    }

    if (!storageKey) {
        logger.warn('[telegram-widgets] Missing chat/message identifier in widget_query.');
        await safeAnswer(rawApi, query.id, { error: 'MISSING_MESSAGE_CONTEXT' });
        return;
    }

    try {
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

            const screen = registeredRecord
                ? screensById.get(registeredRecord.screenId)
                : undefined;
            if (!registeredRecord || !screen) {
                logger.warn(
                    `[telegram-widgets] No registered screen found for storage key ${storageKey}. Consider configuring persistent storage.`,
                );
                await safeAnswer(rawApi, query.id, { error: 'SCREEN_NOT_FOUND' });
                return;
            }

            const rawDataStr = query.data ?? '';
            const isRefresh = !rawDataStr || rawDataStr === 'refresh' || rawDataStr === 'reload';
            const screenType = getWidgetScreenType(screen);

            if (
                screenType === 'static' ||
                screenType === 'client' ||
                !screen.actions ||
                Object.keys(screen.actions).length === 0
            ) {
                if (isRefresh) {
                    await safeAnswer(rawApi, query.id, registeredRecord.state ?? {});
                    return;
                }
                logger.warn(
                    `[telegram-widgets] Received widget_query for non-interactive screen "${screen.id}" (type: ${screenType}).`,
                );
                await safeAnswer(rawApi, query.id, { error: 'NON_INTERACTIVE_SCREEN' });
                return;
            }

            // Parse action name and payload with codec support
            const { action: actionName, payload } = decodeWidgetAction(rawDataStr, {
                decompress: config.codec.decompressActionPayload,
                customReverseMap: config.codec.customReverseKeys,
            });

            const actions = (screen.actions ?? {}) as Record<
                string,
                (c: WidgetActionContext<Record<string, unknown>>, p: unknown) => unknown
            >;
            const handler = actions[actionName];
            if (!handler) {
                if (isRefresh) {
                    await safeAnswer(rawApi, query.id, registeredRecord.state ?? {});
                    return;
                }
                logger.warn(
                    `[telegram-widgets] Unhandled action "${actionName}" for screen "${screen.id}".`,
                );
                await safeAnswer(rawApi, query.id, { error: 'UNKNOWN_ACTION' });
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
                { chatId, messageId, inlineMessageId },
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
                    // Ensure slow network or rate limits do not block serialization queue for > 1500ms
                    await Promise.race([pending, new Promise((r) => setTimeout(r, 1500))]);
                }
            }
        });
    } catch (topLevelError) {
        logger.error(
            `[telegram-widgets] Unexpected error processing widget_query #${query.id}:`,
            topLevelError,
        );
        await safeAnswer(rawApi, query.id, { error: 'INTERNAL_ERROR' });
    }
};
