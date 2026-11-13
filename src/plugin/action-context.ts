import { packPayload, packState } from '../codec';
import type { RawWidgetApiMethods, WidgetActionContext } from '../screen';
import type { WidgetsStorage } from '../storage';
import type { ResolvedPluginConfig, TelegramWidgetQueryPayload, WidgetsLogger } from './types';

export interface ActionContextRunner {
    actionCtx: WidgetActionContext<Record<string, unknown>>;
    getIsAnswered: () => boolean;
    getPendingEditPromise: () => Promise<unknown> | null;
    getCurrentState: () => Record<string, unknown>;
}

export const createActionContext = (
    query: TelegramWidgetQueryPayload,
    screenId: string,
    initialState: Record<string, unknown>,
    storageKey: string,
    rawApi: RawWidgetApiMethods,
    storage: WidgetsStorage,
    config: ResolvedPluginConfig,
    logger: WidgetsLogger,
): ActionContextRunner => {
    let isAnswered = false;
    let currentState = initialState;
    let pendingEditPromise: Promise<unknown> | null = null;

    const actionCtx: WidgetActionContext<Record<string, unknown>> = {
        queryId: query.id,
        chatId: query.chat?.id,
        messageId: query.message_id,
        inlineMessageId: query.inline_message_id,
        chatInstance: query.chat_instance,
        chatType: query.chat_type,
        from: {
            id: query.from.id,
            firstName: query.from.first_name,
            lastName: query.from.last_name,
            username: query.from.username,
            isPremium: query.from.is_premium,
            languageCode: query.from.language_code,
        },
        get state() {
            return currentState;
        },
        setState: async (nextState: Partial<Record<string, unknown>> | Record<string, unknown>) => {
            const merged = { ...currentState, ...nextState };
            currentState = merged;
            await storage.set(storageKey, {
                screenId,
                state: merged,
                updatedAt: Date.now(),
            });

            const chatData = config.codec.compressState
                ? packState(screenId, merged, config.codec.customKeys)
                : JSON.stringify({
                      ...merged,
                      __screen: screenId,
                  });

            pendingEditPromise = rawApi
                .editMessageWidgetData({
                    chat_id: query.chat?.id,
                    message_id: query.message_id,
                    inline_message_id: query.inline_message_id,
                    chat_data: chatData,
                })
                .catch((err) => {
                    const msg = String(err);
                    if (!msg.includes('message is not modified')) {
                        logger.warn(`Failed to editMessageWidgetData for ${storageKey}`, err);
                    }
                });
        },
        answer: async (data?: unknown) => {
            isAnswered = true;
            if (data && typeof data === 'object' && 'text' in data) {
                const notifyText = String((data as { text: unknown }).text);
                const showAlert = Boolean((data as { show_alert?: boolean }).show_alert);
                try {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (rawApi as any).answerCallbackQuery?.({
                        callback_query_id: query.id,
                        text: notifyText,
                        show_alert: showAlert,
                    });
                } catch {
                    // ignore if query is handled as raw widget_query
                }
            }
            const responseData = data !== undefined ? data : currentState;
            let serialized: string;
            if (typeof responseData === 'string') {
                serialized = responseData;
            } else if (
                config.codec.compressAnswer &&
                typeof responseData === 'object' &&
                responseData !== null
            ) {
                serialized = packPayload(responseData, config.codec.customKeys);
            } else {
                serialized = JSON.stringify(responseData);
            }

            if (config.debug) {
                logger.info(`Answering query #${query.id} with data: ${serialized}`);
            }

            await rawApi.answerWidgetQuery({
                widget_query_id: query.id,
                data: serialized,
            });
        },
        rawApi,
    };

    return {
        actionCtx,
        getIsAnswered: () => isAnswered,
        getPendingEditPromise: () => pendingEditPromise,
        getCurrentState: () => currentState,
    };
};
