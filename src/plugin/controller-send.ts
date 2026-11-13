import type { Context } from 'grammy';
import { packState } from '../codec';
import { getWidgetScreenType, type AnyWidgetScreen, type RawWidgetApiMethods } from '../screen';
import type { WidgetsStorage } from '../storage';
import { renderHtml, validateSize } from './renderer';
import type {
    ResolvedPluginConfig,
    SendWidgetOptions,
    WidgetsFlavor,
    WidgetsLogger,
} from './types';
import { getStorageKey } from './utils';

export const sendWidgetMessage = async <
    TScreens extends Record<string, AnyWidgetScreen>,
    K extends keyof TScreens & string,
>(
    ctx: Context & WidgetsFlavor<TScreens>,
    rawApi: RawWidgetApiMethods,
    config: ResolvedPluginConfig,
    storage: WidgetsStorage,
    screensById: Map<string, AnyWidgetScreen>,
    logger: WidgetsLogger,
    screenId: K,
    sendOpts: SendWidgetOptions<Parameters<TScreens[K]['component']>[0]>,
): Promise<{ message_id: number; [key: string]: unknown }> => {
    const screen = screensById.get(screenId);
    if (!screen) {
        throw new Error(`[telegram-widgets] Screen "${screenId}" not found in registered screens.`);
    }

    const targetChatId = sendOpts.chatId ?? ctx.chat?.id;
    if (!targetChatId) {
        throw new Error(
            `[telegram-widgets] Cannot determine target chat_id to send screen "${screenId}".`,
        );
    }

    const screenType = getWidgetScreenType(screen);

    let minifierOverride = sendOpts.minifier;
    if (
        screenType === 'static' &&
        minifierOverride === undefined &&
        config.minifier.options.minifyJS !== false
    ) {
        minifierOverride = {
            ...config.minifier.options,
            minifyJS: false,
        };
    }

    const rawMarkup = screen.component(sendOpts.props as never);
    const html = await renderHtml(rawMarkup, config, minifierOverride);

    validateSize(screen.id, html, config, logger, sendOpts.sizeLimit);

    let chatData: string | undefined = undefined;
    let initState: Record<string, unknown> = {};

    if (screenType === 'dynamic' || (screenType === 'client' && screen.initialState)) {
        initState = (
            screen.initialState ? screen.initialState(sendOpts.props as never) : {}
        ) as Record<string, unknown>;

        const shouldCompress = sendOpts.compressState ?? config.codec.compressState;

        chatData = shouldCompress
            ? packState(screen.id, initState, config.codec.customKeys)
            : JSON.stringify({
                  ...initState,
                  __screen: screen.id,
              });
    }

    const defaultAllowQueries = screenType === 'dynamic';
    const allowQueries =
        sendOpts.allowQueries ?? config.defaults.allowQueries ?? defaultAllowQueries;

    const parseMode =
        sendOpts.parseMode ??
        sendOpts.parse_mode ??
        config.defaults.parseMode ??
        (sendOpts.caption ? 'Markdown' : undefined);

    const result = await rawApi.sendWidget({
        chat_id: targetChatId,
        message_thread_id: sendOpts.messageThreadId,
        html,
        width: sendOpts.width ?? config.defaults.width,
        height: sendOpts.height ?? config.defaults.height,
        chat_data: chatData,
        public_data: sendOpts.publicData,
        allow_queries: allowQueries,
        is_shared: sendOpts.isShared,
        caption: sendOpts.caption,
        caption_entities: sendOpts.captionEntities,
        parse_mode: parseMode,
        reply_markup: sendOpts.replyMarkup,
        reply_parameters: sendOpts.replyParameters,
    });

    const shouldSaveStorage = screenType === 'dynamic' && sendOpts.skipStorage !== true;

    if (shouldSaveStorage && result && typeof result.message_id === 'number') {
        const storageKey = getStorageKey(targetChatId, result.message_id);
        if (storageKey) {
            await storage.set(storageKey, {
                screenId: screen.id,
                state: initState,
                updatedAt: Date.now(),
            });
        }
    }

    if (config.debug) {
        logger.info(
            `Sent ${screenType} screen "${screen.id}" to chat ${targetChatId} (msg: ${result?.message_id}, allowQueries: ${allowQueries}, chatData: ${chatData !== undefined ? 'present' : 'omitted'}, storage: ${shouldSaveStorage ? 'saved' : 'skipped'})`,
        );
    }

    return result;
};
