/**
 * Telegram Widgets Controller Type Definitions.
 *
 * Models context-injected `ctx.widgets` and `ctx.bubbles` controller interfaces,
 * message dispatch options, rendering inspectors, and grammY context flavors.
 *
 * @module plugin/controller-types
 */

import type { WidgetSizeReport } from '../jsx';
import type { AnyWidgetScreen } from '../screen';
import type { WidgetsStorage } from '../storage';
import type { MinifierConfig, ResolvedPluginConfig, SizeLimitConfig } from './types';

/**
 * Options controlling how a widget screen is rendered and sent to a chat.
 */
export interface SendWidgetOptions<TProps> {
    /**
     * Target chat ID override (defaults to ctx.chat.id).
     */
    chatId?: number | string;
    /**
     * Properties passed into the screen's root component function.
     */
    props?: TProps;
    /**
     * Optional message thread / topic ID for forum supergroups.
     */
    messageThreadId?: number;
    /**
     * Explicit widget layout width in pixels.
     */
    width?: number;
    /**
     * Explicit widget layout height in pixels.
     */
    height?: number;
    /**
     * Text caption displayed below the widget bubble.
     */
    caption?: string;
    /**
     * Special entities for formatted caption text.
     */
    captionEntities?: unknown[];
    /**
     * Parse mode for caption text ('Markdown', 'MarkdownV2', or 'HTML').
     */
    parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML' | string;
    /**
     * Snake_case alias for parseMode.
     */
    parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML' | string;
    /**
     * Public broadcast data string visible to all widget viewers.
     */
    publicData?: string;
    /**
     * Reply markup (inline keyboard) attached to the widget message.
     */
    replyMarkup?: unknown;
    /**
     * Whether client interaction queries are permitted on this widget.
     */
    allowQueries?: boolean;
    /**
     * Whether this widget is rendered as a shared reusable widget.
     */
    isShared?: boolean;
    /**
     * Reply parameters linking this message to another message.
     */
    replyParameters?: { message_id: number; [key: string]: unknown };
    /**
     * Per-send minifier configuration override.
     */
    minifier?: MinifierConfig;
    /**
     * Whether to compress initial chat_data using the codec.
     */
    compressState?: boolean;
    /**
     * Per-send size limit configuration override.
     */
    sizeLimit?: SizeLimitConfig;
    /**
     * When true, skips storing the initial state record in the storage backend.
     */
    skipStorage?: boolean;
}

/**
 * Bubble-branded alias for SendWidgetOptions.
 */
export type SendBubbleOptions<TProps> = SendWidgetOptions<TProps>;

/**
 * Options configuring a widget state update.
 */
export interface UpdateWidgetOptions<TProps> {
    /**
     * Target chat ID override.
     */
    chatId?: number | string;
    /**
     * Updated component props.
     */
    props?: TProps;
    /**
     * New state dictionary to persist and broadcast to the widget.
     */
    state?: Record<string, unknown>;
    /**
     * Whether to compress the updated state with the codec.
     */
    compressState?: boolean;
}

/**
 * Main widget controller interface exposed on `ctx.widgets` and `ctx.bubbles`.
 */
export interface WidgetsController<TScreens extends Record<string, AnyWidgetScreen>> {
    /**
     * Sends a new widget message to the active chat.
     */
    send: <K extends keyof TScreens & string>(
        screenId: K,
        options: SendWidgetOptions<Parameters<TScreens[K]['component']>[0]>,
    ) => Promise<{ message_id: number; [key: string]: unknown }>;

    /**
     * Sends a widget message replying directly to the triggering message.
     */
    reply: <K extends keyof TScreens & string>(
        screenId: K,
        options: SendWidgetOptions<Parameters<TScreens[K]['component']>[0]>,
    ) => Promise<{ message_id: number; [key: string]: unknown }>;

    /**
     * Synchronously renders a widget screen and returns its size report.
     */
    render: <K extends keyof TScreens & string>(
        screenId: K,
        props: Parameters<TScreens[K]['component']>[0],
    ) => WidgetSizeReport;

    /**
     * Asynchronously renders a widget screen with full minification passes.
     */
    renderAsync: <K extends keyof TScreens & string>(
        screenId: K,
        props: Parameters<TScreens[K]['component']>[0],
    ) => Promise<WidgetSizeReport>;

    /**
     * Updates the chat_data state of an already sent widget message.
     */
    update: <K extends keyof TScreens & string>(
        messageId: number,
        screenId: K,
        options: UpdateWidgetOptions<Parameters<TScreens[K]['component']>[0]>,
    ) => Promise<unknown>;

    /**
     * Retrieves a registered screen definition by its unique ID.
     */
    getScreen: (screenId: string) => AnyWidgetScreen | undefined;

    /**
     * Inspects the compressed size and deflate ceiling compliance of a screen.
     */
    inspect: <K extends keyof TScreens & string>(
        screenId: K,
        props: Parameters<TScreens[K]['component']>[0],
        options?: { minifier?: MinifierConfig },
    ) => Promise<WidgetSizeReport>;

    /**
     * Active state storage backend.
     */
    storage: WidgetsStorage;

    /**
     * Fully resolved immutable plugin configuration.
     */
    readonly config: ResolvedPluginConfig;
}

/**
 * Bubble-branded alias for WidgetsController.
 */
export type BubblesController<TScreens extends Record<string, AnyWidgetScreen>> =
    WidgetsController<TScreens>;

/**
 * Context flavor extension augmenting grammY `Context` with `ctx.widgets` and `ctx.bubbles`.
 */
export type WidgetsFlavor<TScreens extends Record<string, AnyWidgetScreen>> = {
    /**
     * Telegram widgets controller.
     */
    widgets: WidgetsController<TScreens>;
    /**
     * Bubble-branded alias for ctx.widgets.
     */
    bubbles: WidgetsController<TScreens>;
};

/**
 * Bubble-branded alias for WidgetsFlavor.
 */
export type BubblesFlavor<TScreens extends Record<string, AnyWidgetScreen>> =
    WidgetsFlavor<TScreens>;
