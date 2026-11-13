/**
 * Telegram Widgets grammY Plugin Suite.
 *
 * Implements the core `createTelegramWidgetsPlugin` factory, request query handler,
 * state controller dispatcher, and plugin configuration resolvers.
 *
 * @module plugin
 */

import type { Context, MiddlewareFn } from 'grammy';
import type { AnyWidgetScreen, RawWidgetApiMethods } from './screen';
import type { WidgetsStorage } from './storage';
import { resolveLogger, resolvePluginConfig, resolveStorage } from './plugin/config';
import { createWidgetsController } from './plugin/controller';
import { handleWidgetQuery } from './plugin/query-handler';
import type {
    CreateWidgetsPluginOptions,
    TelegramWidgetsPluginReturn,
    WidgetsFlavor,
} from './plugin/types';

export * from './plugin/types';
export { resolveLogger, resolvePluginConfig, resolveStorage } from './plugin/config';
export { getStorageKey } from './plugin/utils';
export { createWidgetsController } from './plugin/controller';
export { renderHtml, validateSize } from './plugin/renderer';
export { handleWidgetQuery } from './plugin/query-handler';

/**
 * Creates the Telegram Widgets grammY plugin instance.
 *
 * @param options Plugin configuration options.
 * @returns Plugin instance with middleware, registered screens, storage, and resolved configuration.
 */
export const createTelegramWidgetsPlugin = <TScreens extends Record<string, AnyWidgetScreen>>(
    options: CreateWidgetsPluginOptions<TScreens>,
): TelegramWidgetsPluginReturn<TScreens> => {
    const config = resolvePluginConfig(
        options as CreateWidgetsPluginOptions<Record<string, AnyWidgetScreen>>,
    );
    const logger = resolveLogger(options.logger, options.debug);
    const storage: WidgetsStorage = resolveStorage(options.storage);

    const screens = options.screens;
    const screensById = new Map<string, AnyWidgetScreen>();

    for (const [key, screen] of Object.entries(screens)) {
        screensById.set(screen.id, screen);
        if (key !== screen.id) {
            screensById.set(key, screen);
        }
    }

    const middleware: MiddlewareFn<Context & WidgetsFlavor<TScreens>> = async (ctx, next) => {
        const rawApi = ctx.api.raw as unknown as RawWidgetApiMethods;
        const controller = createWidgetsController(
            ctx,
            rawApi,
            config,
            storage,
            screensById,
            logger,
        );

        ctx.widgets = controller;
        ctx.bubbles = controller;

        await handleWidgetQuery(ctx, rawApi, config, storage, screensById, logger, next);
    };

    return { middleware, screens, storage, config };
};

/**
 * Shorthand alias for `createTelegramWidgetsPlugin`.
 */
export const createWidgetsPlugin: typeof createTelegramWidgetsPlugin = createTelegramWidgetsPlugin;

/**
 * Bubble-branded alias for `createTelegramWidgetsPlugin`.
 */
export const createBubblesPlugin: typeof createTelegramWidgetsPlugin = createTelegramWidgetsPlugin;
