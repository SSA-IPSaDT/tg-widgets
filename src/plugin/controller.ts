import { deflateSync } from 'node:zlib';
import type { Context } from 'grammy';
import { packState } from '../codec';
import { inspectWidgetSize, inspectWidgetSizeAsync } from '../jsx';
import { getWidgetScreenType, type AnyWidgetScreen, type RawWidgetApiMethods } from '../screen';
import type { WidgetsStorage } from '../storage';
import { sendWidgetMessage } from './controller-send';
import { renderHtml } from './renderer';
import type {
    ResolvedPluginConfig,
    WidgetsController,
    WidgetsFlavor,
    WidgetsLogger,
} from './types';
import { getStorageKey } from './utils';

export const createWidgetsController = <TScreens extends Record<string, AnyWidgetScreen>>(
    ctx: Context & WidgetsFlavor<TScreens>,
    rawApi: RawWidgetApiMethods,
    config: ResolvedPluginConfig,
    storage: WidgetsStorage,
    screensById: Map<string, AnyWidgetScreen>,
    logger: WidgetsLogger,
): WidgetsController<TScreens> => {
    const controller: WidgetsController<TScreens> = {
        storage,
        config,

        send: async (screenId, sendOpts) => {
            return sendWidgetMessage(
                ctx,
                rawApi,
                config,
                storage,
                screensById,
                logger,
                screenId,
                sendOpts,
            );
        },

        reply: async (screenId, sendOpts) => {
            const currentMsgId = ctx.msg?.message_id;
            return controller.send(screenId, {
                chatId: ctx.chat?.id,
                ...sendOpts,
                replyParameters:
                    sendOpts.replyParameters ??
                    (currentMsgId ? { message_id: currentMsgId } : undefined),
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

        inspect: async (screenId, props, inspectOpts) => {
            const screen = screensById.get(screenId);
            if (!screen) {
                throw new Error(
                    `[telegram-widgets] Screen "${screenId}" not found in registered screens.`,
                );
            }
            const rawMarkup = screen.component(props as never);
            const html = await renderHtml(rawMarkup, config, inspectOpts?.minifier);
            const buf = Buffer.from(html, 'utf-8');
            const compressed = deflateSync(buf, { level: 9 });
            const maxAllowed = config.sizeLimit.maxBytes;
            return {
                html,
                byteLength: buf.byteLength,
                compressedByteLength: compressed.byteLength,
                isValid: compressed.byteLength <= maxAllowed,
                maxAllowed,
            };
        },

        update: async (messageId, screenId, updateOpts) => {
            const screen = screensById.get(screenId);
            if (!screen) {
                throw new Error(
                    `[telegram-widgets] Screen "${screenId}" not found in registered screens.`,
                );
            }

            const screenType = getWidgetScreenType(screen);
            if (screenType === 'static') {
                logger.warn(
                    `[telegram-widgets] Screen "${screenId}" is a static screen without dynamic state. Calling update() on static screens is not recommended.`,
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
                (updateOpts.props && screen.initialState
                    ? (screen.initialState(updateOpts.props as never) as Record<string, unknown>)
                    : (existingRecord?.state ?? {}));

            const shouldCompress = updateOpts.compressState ?? config.codec.compressState;

            const chatData = shouldCompress
                ? packState(screen.id, currentState, config.codec.customKeys)
                : JSON.stringify({
                      ...currentState,
                      __screen: screen.id,
                  });

            await storage.set(storageKey, {
                screenId: screen.id,
                state: currentState,
                updatedAt: Date.now(),
            });

            if (config.debug) {
                logger.info(
                    `Updated screen "${screen.id}" for msg ${messageId} (compressState: ${shouldCompress})`,
                );
            }

            return rawApi.editMessageWidgetData({
                chat_id: targetChatId,
                message_id: messageId,
                chat_data: chatData,
            });
        },

        getScreen: (screenId: string) => screensById.get(screenId),
    };

    return controller;
};
