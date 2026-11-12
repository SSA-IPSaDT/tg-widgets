import type { Context, MiddlewareFn } from 'grammy';

import { decodeWidgetAction } from './action';
import {
    inspectWidgetSize,
    inspectWidgetSizeAsync,
    renderWidgetAsync,
    type WidgetSizeReport,
} from './jsx';
import type {
    AnyWidgetScreen,
    RawWidgetApiMethods,
    WidgetActionContext,
} from './screen';
import { MemoryWidgetsStorage, type WidgetsStorage } from './storage';

export interface WidgetsLogger {
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
}

const defaultLogger: WidgetsLogger = {
    info: (msg, ...args) => console.log(`[telegram-widgets] ${msg}`, ...args),
    warn: (msg, ...args) => console.warn(`[telegram-widgets] ${msg}`, ...args),
    error: (msg, ...args) =>
        console.error(`[telegram-widgets] ${msg}`, ...args),
};

/**
 * Структура входящего Update.widget_query в Telegram Bot API 10.4
 */
export interface TelegramWidgetQueryPayload {
    id: string;
    from: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
        is_premium?: boolean;
        language_code?: string;
    };
    chat?: {
        id: number;
        type: string;
        title?: string;
        username?: string;
    };
    message_id?: number;
    inline_message_id?: string;
    chat_instance: string;
    chat_type?:
        | 'sender'
        | 'private'
        | 'group'
        | 'supergroup'
        | 'channel'
        | string;
    type?: unknown;
    data?: string;
}

export interface SendWidgetOptions<TProps> {
    chatId?: number | string;
    props: TProps;
    messageThreadId?: number;
    width?: number;
    height?: number;
    caption?: string;
    captionEntities?: unknown[];
    parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML' | string;
    parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML' | string;
    publicData?: string;
    replyMarkup?: unknown;
    allowQueries?: boolean;
    isShared?: boolean;
    replyParameters?: { message_id: number; [key: string]: unknown };
}

export type SendBubbleOptions<TProps> = SendWidgetOptions<TProps>;

export interface UpdateWidgetOptions<TProps> {
    chatId?: number | string;
    props?: TProps;
    state?: Record<string, unknown>;
}

export interface WidgetsController<
    TScreens extends Record<string, AnyWidgetScreen>,
> {
    /**
     * Отправляет виджет в указанный (или текущий) чат
     */
    send: <K extends keyof TScreens & string>(
        screenId: K,
        options: SendWidgetOptions<Parameters<TScreens[K]['component']>[0]>,
    ) => Promise<{ message_id: number; [key: string]: unknown }>;

    /**
     * Отвечает виджетом на текущее сообщение в чате
     */
    reply: <K extends keyof TScreens & string>(
        screenId: K,
        options: SendWidgetOptions<Parameters<TScreens[K]['component']>[0]>,
    ) => Promise<{ message_id: number; [key: string]: unknown }>;

    /**
     * Рендерит и инспектирует размер HTML разметки виджета без отправки
     */
    render: <K extends keyof TScreens & string>(
        screenId: K,
        props: Parameters<TScreens[K]['component']>[0],
    ) => WidgetSizeReport;

    /**
     * Асинхронно рендерит и инспектирует размер с глубокой минификацией через html-minifier-terser
     */
    renderAsync: <K extends keyof TScreens & string>(
        screenId: K,
        props: Parameters<TScreens[K]['component']>[0],
    ) => Promise<WidgetSizeReport>;

    /**
     * Обновляет состояние данных (chat_data) существующего виджета
     */
    update: <K extends keyof TScreens & string>(
        messageId: number,
        screenId: K,
        options: UpdateWidgetOptions<Parameters<TScreens[K]['component']>[0]>,
    ) => Promise<unknown>;

    /**
     * Возвращает зарегистрированный экран по его ID
     */
    getScreen: (screenId: string) => AnyWidgetScreen | undefined;

    /**
     * Подключенное хранилище состояний виджетов
     */
    storage: WidgetsStorage;
}

export type BubblesController<
    TScreens extends Record<string, AnyWidgetScreen>,
> = WidgetsController<TScreens>;

export type WidgetsFlavor<TScreens extends Record<string, AnyWidgetScreen>> = {
    widgets: WidgetsController<TScreens>;
    bubbles: WidgetsController<TScreens>;
};

export type BubblesFlavor<TScreens extends Record<string, AnyWidgetScreen>> =
    WidgetsFlavor<TScreens>;

export interface CreateWidgetsPluginOptions<
    TScreens extends Record<string, AnyWidgetScreen>,
> {
    screens: TScreens;
    storage?: WidgetsStorage;
    logger?: WidgetsLogger;
}

const getStorageKey = (
    chatId?: number | string,
    messageId?: number,
    inlineMessageId?: string,
): string | undefined => {
    if (inlineMessageId) {
        return `inline:${inlineMessageId}`;
    }
    if (chatId !== undefined && messageId !== undefined) {
        return `${chatId}:${messageId}`;
    }
    return undefined;
};

export const createTelegramWidgetsPlugin = <
    TScreens extends Record<string, AnyWidgetScreen>,
>(
    options: CreateWidgetsPluginOptions<TScreens>,
): {
    middleware: MiddlewareFn<Context & WidgetsFlavor<TScreens>>;
    screens: TScreens;
    storage: WidgetsStorage;
} => {
    const logger = options.logger ?? defaultLogger;
    const screens = options.screens;
    const storage = options.storage ?? new MemoryWidgetsStorage();
    const screensById = new Map<string, AnyWidgetScreen>();

    for (const [key, screen] of Object.entries(screens)) {
        screensById.set(screen.id, screen);
        if (key !== screen.id) {
            screensById.set(key, screen);
        }
    }

    const middleware: MiddlewareFn<Context & WidgetsFlavor<TScreens>> = async (
        ctx,
        next,
    ) => {
        const rawApi = ctx.api.raw as unknown as RawWidgetApiMethods;

        const controller: WidgetsController<TScreens> = {
            storage,

            send: async (screenId, sendOpts) => {
                const screen = screensById.get(screenId);
                if (!screen) {
                    throw new Error(
                        `[telegram-widgets] Screen "${screenId}" not found in registered screens.`,
                    );
                }

                const targetChatId = sendOpts.chatId ?? ctx.chat?.id;
                if (!targetChatId) {
                    throw new Error(
                        `[telegram-widgets] Cannot determine target chat_id to send screen "${screenId}".`,
                    );
                }

                const html = await renderWidgetAsync(
                    screen.component(sendOpts.props as never),
                );
                const initState = (screen.initialState(
                    sendOpts.props as never,
                ) ?? {}) as Record<string, unknown>;
                const chatData = JSON.stringify({
                    ...initState,
                    __screen: screen.id,
                });

                const parseMode =
                    sendOpts.parseMode ??
                    sendOpts.parse_mode ??
                    (sendOpts.caption ? 'Markdown' : undefined);

                const result = await rawApi.sendWidget({
                    chat_id: targetChatId,
                    message_thread_id: sendOpts.messageThreadId,
                    html,
                    width: sendOpts.width,
                    height: sendOpts.height,
                    chat_data: chatData,
                    public_data: sendOpts.publicData,
                    allow_queries: sendOpts.allowQueries ?? true,
                    is_shared: sendOpts.isShared,
                    caption: sendOpts.caption,
                    caption_entities: sendOpts.captionEntities,
                    parse_mode: parseMode,
                    reply_markup: sendOpts.replyMarkup,
                    reply_parameters: sendOpts.replyParameters,
                });

                if (result && typeof result.message_id === 'number') {
                    const storageKey = getStorageKey(
                        targetChatId,
                        result.message_id,
                    );
                    if (storageKey) {
                        await storage.set(storageKey, {
                            screenId: screen.id,
                            state: initState,
                            updatedAt: Date.now(),
                        });
                    }
                }

                return result;
            },

            reply: async (screenId, sendOpts) => {
                const currentMsgId = ctx.msg?.message_id;
                return controller.send(screenId, {
                    chatId: ctx.chat?.id,
                    ...sendOpts,
                    replyParameters:
                        sendOpts.replyParameters ??
                        (currentMsgId
                            ? { message_id: currentMsgId }
                            : undefined),
                });
            },

            render: (screenId, props) => {
                const screen = screensById.get(screenId);
                if (!screen) {
                    throw new Error(
                        `[telegram-widgets] Screen "${screenId}" not found in registered screens.`,
                    );
                }
                const body = screen.component(props as never);
                return inspectWidgetSize(body);
            },

            renderAsync: async (screenId, props) => {
                const screen = screensById.get(screenId);
                if (!screen) {
                    throw new Error(
                        `[telegram-widgets] Screen "${screenId}" not found in registered screens.`,
                    );
                }
                const body = screen.component(props as never);
                return inspectWidgetSizeAsync(body);
            },

            update: async (messageId, screenId, updateOpts) => {
                const screen = screensById.get(screenId);
                if (!screen) {
                    throw new Error(
                        `[telegram-widgets] Screen "${screenId}" not found in registered screens.`,
                    );
                }

                const targetChatId = updateOpts.chatId ?? ctx.chat?.id;
                if (!targetChatId) {
                    throw new Error(
                        `[telegram-widgets] Cannot determine target chat_id to update screen "${screenId}".`,
                    );
                }

                const storageKey = getStorageKey(targetChatId, messageId);
                if (!storageKey) {
                    throw new Error(
                        `[telegram-widgets] Cannot resolve storage key for chat ${targetChatId} and message ${messageId}`,
                    );
                }

                const existingRecord = await storage.get(storageKey);
                const currentState =
                    updateOpts.state ??
                    (updateOpts.props
                        ? (screen.initialState(
                              updateOpts.props as never,
                          ) as Record<string, unknown>)
                        : (existingRecord?.state ?? {}));

                const chatData = JSON.stringify({
                    ...currentState,
                    __screen: screen.id,
                });

                await storage.set(storageKey, {
                    screenId: screen.id,
                    state: currentState,
                    updatedAt: Date.now(),
                });

                return rawApi.editMessageWidgetData({
                    chat_id: targetChatId,
                    message_id: messageId,
                    chat_data: chatData,
                });
            },

            getScreen: (screenId: string) => screensById.get(screenId),
        };

        // Поддерживаем оба имени: ctx.widgets и ctx.bubbles
        ctx.widgets = controller;
        ctx.bubbles = controller;

        // Обработка входящего update.widget_query
        const rawUpdate = ctx.update as unknown as
            Record<string, unknown> | undefined;
        if (
            !rawUpdate ||
            typeof rawUpdate !== 'object' ||
            !('widget_query' in rawUpdate)
        ) {
            await next();
            return;
        }

        const query = rawUpdate.widget_query as
            TelegramWidgetQueryPayload | undefined;
        if (!query) {
            await next();
            return;
        }

        const chatId = query.chat?.id;
        const messageId = query.message_id;
        const inlineMessageId = query.inline_message_id;

        const storageKey = getStorageKey(chatId, messageId, inlineMessageId);

        if (!storageKey) {
            logger.warn(
                '[telegram-widgets] Missing chat/message identifier in widget_query.',
            );
            await rawApi.answerWidgetQuery({
                widget_query_id: query.id,
                data: JSON.stringify({ error: 'MISSING_MESSAGE_CONTEXT' }),
            });
            return;
        }

        const registeredRecord = await storage.get(storageKey);

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

        // Парсинг экшена и полезной нагрузки согласно компактному протоколу
        const { action: actionName, payload } = decodeWidgetAction(
            query.data ?? '',
        );

        const actions = screen.actions as Record<
            string,
            (
                c: WidgetActionContext<Record<string, unknown>>,
                p: unknown,
            ) => unknown
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

        let isAnswered = false;
        let currentState = registeredRecord.state;

        const actionCtx: WidgetActionContext<Record<string, unknown>> = {
            queryId: query.id,
            chatId,
            messageId,
            inlineMessageId,
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
            state: currentState,
            setState: async (nextState: Record<string, unknown>) => {
                currentState = nextState;
                await storage.set(storageKey, {
                    screenId: screen.id,
                    state: nextState,
                    updatedAt: Date.now(),
                });
                try {
                    await rawApi.editMessageWidgetData({
                        chat_id: chatId,
                        message_id: messageId,
                        inline_message_id: inlineMessageId,
                        chat_data: JSON.stringify({
                            ...nextState,
                            __screen: screen.id,
                        }),
                    });
                } catch (err) {
                    const msg = String(err);
                    if (!msg.includes('message is not modified')) {
                        logger.warn(
                            `Failed to editMessageWidgetData for ${storageKey}`,
                            err,
                        );
                    }
                }
            },
            answer: async (data?: unknown) => {
                isAnswered = true;
                const serialized =
                    data !== undefined
                        ? typeof data === 'string'
                            ? data
                            : JSON.stringify(data)
                        : undefined;
                await rawApi.answerWidgetQuery({
                    widget_query_id: query.id,
                    data: serialized,
                });
            },
            rawApi,
        };

        try {
            const result = await handler(actionCtx, payload);
            if (!isAnswered) {
                await actionCtx.answer(result ?? currentState);
            }
        } catch (error) {
            logger.error(
                `[telegram-widgets] Error executing action "${actionName}" on screen "${screen.id}":`,
                error,
            );
            if (!isAnswered) {
                await actionCtx.answer({ error: 'INTERNAL_ERROR' });
            }
        }
    };

    return { middleware, screens, storage };
};

export const createWidgetsPlugin = createTelegramWidgetsPlugin;
export const createBubblesPlugin = createTelegramWidgetsPlugin;
