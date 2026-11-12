import type { Context, MiddlewareFn } from 'grammy';

import { inspectWidgetSize, renderWidget, type WidgetSizeReport } from './jsx';
import type {
    AnyWidgetScreen,
    RawWidgetApiMethods,
    WidgetActionContext,
} from './screen';

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

export interface TelegramWidgetQueryPayload {
    id: string;
    from: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
    };
    chat?: {
        id: number;
        type: string;
    };
    message?: {
        message_id: number;
        chat: {
            id: number;
        };
        chat_data?: string;
    };
    message_id?: number;
    chat_instance?: string;
    widget_id?: string;
    data?: string;
}

export interface SendWidgetOptions<TProps> {
    chatId?: number | string;
    props: TProps;
    caption?: string;
    replyMarkup?: unknown;
    allowQueries?: boolean;
    replyParameters?: { message_id: number };
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
    ) => Promise<{ message_id: number }>;

    /**
     * Отвечает виджетом на текущее сообщение в чате
     */
    reply: <K extends keyof TScreens & string>(
        screenId: K,
        options: SendWidgetOptions<Parameters<TScreens[K]['component']>[0]>,
    ) => Promise<{ message_id: number }>;

    /**
     * Рендерит и инспектирует размер HTML разметки виджета без отправки
     */
    render: <K extends keyof TScreens & string>(
        screenId: K,
        props: Parameters<TScreens[K]['component']>[0],
    ) => WidgetSizeReport;

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
    logger?: WidgetsLogger;
}

export const createTelegramWidgetsPlugin = <
    TScreens extends Record<string, AnyWidgetScreen>,
>(
    options: CreateWidgetsPluginOptions<TScreens>,
): {
    middleware: MiddlewareFn<Context & WidgetsFlavor<TScreens>>;
    screens: TScreens;
} => {
    const logger = options.logger ?? defaultLogger;
    const screens = options.screens;
    const screensById = new Map<string, AnyWidgetScreen>();

    for (const [key, screen] of Object.entries(screens)) {
        screensById.set(screen.id, screen);
        if (key !== screen.id) {
            screensById.set(key, screen);
        }
    }

    // Хранилище активных состояний: `${chatId}:${messageId}` -> { screenId, state }
    const stateRegistry = new Map<
        string,
        { screenId: string; state: Record<string, unknown> }
    >();

    const middleware: MiddlewareFn<Context & WidgetsFlavor<TScreens>> = async (
        ctx,
        next,
    ) => {
        const rawApi = ctx.api.raw as unknown as RawWidgetApiMethods;

        const controller: WidgetsController<TScreens> = {
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

                const html = renderWidget(
                    screen.component(sendOpts.props as never),
                );
                const initState = (screen.initialState(
                    sendOpts.props as never,
                ) ?? {}) as Record<string, unknown>;
                const chatData = JSON.stringify({
                    ...initState,
                    __screen: screen.id,
                });

                const result = await rawApi.sendWidget({
                    chat_id: targetChatId,
                    html,
                    chat_data: chatData,
                    allow_queries: sendOpts.allowQueries ?? true,
                    caption: sendOpts.caption,
                    reply_markup: sendOpts.replyMarkup,
                });

                if (result && typeof result.message_id === 'number') {
                    stateRegistry.set(`${targetChatId}:${result.message_id}`, {
                        screenId: screen.id,
                        state: initState,
                    });
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

                const messageKey = `${targetChatId}:${messageId}`;
                const currentState =
                    updateOpts.state ??
                    (updateOpts.props
                        ? (screen.initialState(
                              updateOpts.props as never,
                          ) as Record<string, unknown>)
                        : (stateRegistry.get(messageKey)?.state ?? {}));

                const chatData = JSON.stringify({
                    ...currentState,
                    __screen: screen.id,
                });

                stateRegistry.set(messageKey, {
                    screenId: screen.id,
                    state: currentState,
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

        const chatId = query.chat?.id ?? query.message?.chat.id;
        const messageId = query.message_id ?? query.message?.message_id;

        if (!chatId || !messageId) {
            await rawApi.answerWidgetQuery({
                widget_query_id: query.id,
                data: JSON.stringify({ error: 'MISSING_MESSAGE_CONTEXT' }),
            });
            return;
        }

        const messageKey = `${chatId}:${messageId}`;
        let registeredRecord = stateRegistry.get(messageKey);

        // Восстановление из query.message.chat_data, если в памяти нет (например, после рестарта)
        if (!registeredRecord && query.message?.chat_data) {
            try {
                const parsed = JSON.parse(query.message.chat_data);
                if (parsed.__screen && screensById.has(parsed.__screen)) {
                    registeredRecord = {
                        screenId: parsed.__screen,
                        state: parsed,
                    };
                    stateRegistry.set(messageKey, registeredRecord);
                }
            } catch {}
        }

        if (!registeredRecord) {
            logger.warn(`No registered screen found for message ${messageKey}`);
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

        // Парсинг экшена и полезной нагрузки
        let actionName = query.data ?? '';
        let payload: unknown = undefined;

        if (actionName.startsWith('{')) {
            try {
                const parsed = JSON.parse(actionName);
                actionName = parsed.action ?? '';
                payload = parsed.payload;
            } catch {}
        }

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
                `Unhandled action "${actionName}" for screen "${screen.id}"`,
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
            from: {
                id: query.from.id,
                firstName: query.from.first_name,
                lastName: query.from.last_name,
                username: query.from.username,
            },
            state: currentState,
            setState: async (nextState: Record<string, unknown>) => {
                currentState = nextState;
                registeredRecord!.state = nextState;
                try {
                    await rawApi.editMessageWidgetData({
                        chat_id: chatId,
                        message_id: messageId,
                        chat_data: JSON.stringify({
                            ...nextState,
                            __screen: screen.id,
                        }),
                    });
                } catch (err) {
                    const msg = String(err);
                    if (!msg.includes('message is not modified')) {
                        logger.warn(
                            `Failed to editMessageWidgetData for ${messageKey}`,
                            err,
                        );
                    }
                }
            },
            answer: async (data?: unknown) => {
                isAnswered = true;
                await rawApi.answerWidgetQuery({
                    widget_query_id: query.id,
                    data: data !== undefined ? JSON.stringify(data) : undefined,
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
                `Error executing action "${actionName}" on screen "${screen.id}"`,
                error,
            );
            if (!isAnswered) {
                await actionCtx.answer({ error: 'INTERNAL_ERROR' });
            }
        }
    };

    return { middleware, screens };
};

export const createWidgetsPlugin = createTelegramWidgetsPlugin;
export const createBubblesPlugin = createTelegramWidgetsPlugin;
