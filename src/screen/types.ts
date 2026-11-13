/**
 * Telegram Widgets Screen Definition & Paradigm Types.
 *
 * Models static, client-interactive, and dynamic server-driven widget screens,
 * action contexts, handler signatures, and raw Bot API method contracts.
 *
 * @module screen/types
 */

/**
 * Raw Telegram Bot API method contracts implemented by grammY bot instances.
 */
export interface RawWidgetApiMethods {
    /**
     * Sends a new HTML widget message to a Telegram chat.
     */
    sendWidget(params: {
        chat_id: number | string;
        html: string;
        message_thread_id?: number;
        width?: number;
        height?: number;
        chat_data?: string;
        public_data?: string;
        allow_queries?: boolean;
        is_shared?: boolean;
        caption?: string;
        caption_entities?: unknown[];
        parse_mode?: string;
        reply_markup?: unknown;
        reply_parameters?: { message_id: number; [key: string]: unknown };
    }): Promise<{ message_id: number; [key: string]: unknown }>;

    /**
     * Sends a previously created shared widget message.
     */
    sendSharedWidget?(params: {
        chat_id: number | string;
        widget_id: string;
        message_thread_id?: number;
        caption?: string;
        reply_markup?: unknown;
    }): Promise<{ message_id: number; [key: string]: unknown }>;

    /**
     * Updates widget data for an active widget message.
     */
    editMessageWidgetData(params: {
        chat_id?: number | string;
        message_id?: number;
        inline_message_id?: string;
        chat_data?: string;
        public_data?: string;
    }): Promise<unknown>;

    /**
     * Edits public data for a shared widget.
     */
    editSharedWidgetData?(params: { widget_id?: string; public_data: string }): Promise<unknown>;

    /**
     * Answers an incoming widget_query update from the Telegram client.
     */
    answerWidgetQuery(params: { widget_query_id: string; data?: string }): Promise<unknown>;
}

/**
 * Context object provided to dynamic widget action handlers.
 */
export interface WidgetActionContext<TState> {
    /**
     * Unique query ID of the incoming widget_query update.
     */
    queryId: string;
    /**
     * Target chat ID where the widget was triggered.
     */
    chatId?: number | string;
    /**
     * Target message ID of the widget.
     */
    messageId?: number;
    /**
     * Identifier of an inline widget message if sent via inline query.
     */
    inlineMessageId?: string;
    /**
     * Chat instance identifier passed from Telegram.
     */
    chatInstance: string;
    /**
     * Chat type context string.
     */
    chatType?: 'sender' | 'private' | 'group' | 'supergroup' | 'channel' | string;
    /**
     * User who initiated the widget action.
     */
    from: {
        /**
         * User's Telegram ID.
         */
        id: number;
        /**
         * First name.
         */
        firstName: string;
        /**
         * Optional last name.
         */
        lastName?: string;
        /**
         * Optional username.
         */
        username?: string;
        /**
         * Premium status.
         */
        isPremium?: boolean;
        /**
         * Language code.
         */
        languageCode?: string;
    };
    /**
     * Current persisted state of this widget instance.
     */
    state: TState;
    /**
     * Updates the persisted state and sends updated chat_data to the widget.
     */
    setState: (newState: Partial<TState> | TState) => Promise<void>;
    /**
     * Answers the pending query with an optional response string (up to 1024 bytes).
     */
    answer: (data?: unknown) => Promise<void>;
    /**
     * Low-level Telegram API accessor.
     */
    rawApi: RawWidgetApiMethods;
}

/**
 * Bubble-branded alias for WidgetActionContext.
 */
export type BubbleActionContext<TState> = WidgetActionContext<TState>;

/**
 * Function signature of an action handler attached to a dynamic widget screen.
 */
export type WidgetActionHandler<TState, TPayload = unknown, TResult = unknown> = (
    ctx: WidgetActionContext<TState>,
    payload?: TPayload,
) => Promise<TResult> | TResult;

/**
 * Bubble-branded alias for WidgetActionHandler.
 */
export type BubbleActionHandler<
    TState,
    TPayload = unknown,
    TResult = unknown,
> = WidgetActionHandler<TState, TPayload, TResult>;

/**
 * Screen execution paradigm ('static', 'client', or 'dynamic').
 */
export type WidgetScreenType = 'static' | 'client' | 'dynamic';

/**
 * Bubble-branded alias for WidgetScreenType.
 */
export type BubbleScreenType = WidgetScreenType;

/**
 * Static widget screen definition. Renders read-only UI without interaction or state overhead.
 */
export interface StaticWidgetScreen<TProps = unknown> {
    /**
     * Screen paradigm discriminator ('static').
     */
    type: 'static';
    /**
     * Unique identifier for this screen.
     */
    id: string;
    /**
     * Functional component rendering JSX markup to HTML string.
     */
    component: (props: TProps) => string;
}

/**
 * Bubble-branded alias for StaticWidgetScreen.
 */
export type StaticBubbleScreen<TProps = unknown> = StaticWidgetScreen<TProps>;

/**
 * Client-interactive widget screen definition. Handles state and events locally via `<Script />`.
 */
export interface ClientWidgetScreen<TProps = unknown, TState = unknown> {
    /**
     * Screen paradigm discriminator ('client').
     */
    type: 'client';
    /**
     * Unique identifier for this screen.
     */
    id: string;
    /**
     * Functional component rendering JSX markup to HTML string.
     */
    component: (props: TProps) => string;
    /**
     * Factory function producing initial client state passed via chat_data.
     */
    initialState?: (props?: TProps) => TState;
}

/**
 * Bubble-branded alias for ClientWidgetScreen.
 */
export type ClientBubbleScreen<TProps = unknown, TState = unknown> = ClientWidgetScreen<
    TProps,
    TState
>;

/**
 * Dynamic widget screen definition. Routes client actions to server-side TypeScript handlers.
 */
export interface DynamicWidgetScreen<
    TProps = unknown,
    TState = unknown,
    TActions = Record<string, WidgetActionHandler<TState>>,
> {
    /**
     * Screen paradigm discriminator ('dynamic').
     */
    type: 'dynamic';
    /**
     * Unique identifier for this screen.
     */
    id: string;
    /**
     * Functional component rendering JSX markup to HTML string.
     */
    component: (props: TProps) => string;
    /**
     * Factory function producing initial state persisted into storage.
     */
    initialState: (props?: TProps) => TState;
    /**
     * Map of server-side action handlers invoked on widget_query updates.
     */
    actions: TActions;
}

/**
 * Bubble-branded alias for DynamicWidgetScreen.
 */
export type DynamicBubbleScreen<
    TProps = unknown,
    TState = unknown,
    TActions = Record<string, WidgetActionHandler<TState>>,
> = DynamicWidgetScreen<TProps, TState, TActions>;

/**
 * General widget screen definition supporting optional paradigm tagging.
 */
export interface WidgetScreen<
    TProps = unknown,
    TState = unknown,
    TActions = Record<string, WidgetActionHandler<TState>>,
> {
    /**
     * Optional explicit paradigm discriminator.
     */
    type?: WidgetScreenType;
    /**
     * Unique screen identifier.
     */
    id: string;
    /**
     * Functional component rendering JSX markup to HTML string.
     */
    component: (props: TProps) => string;
    /**
     * Factory function producing initial state.
     */
    initialState: (props?: TProps) => TState;
    /**
     * Server-side action handlers map.
     */
    actions: TActions;
}

/**
 * Bubble-branded alias for WidgetScreen.
 */
export type BubbleScreen<
    TProps = unknown,
    TState = unknown,
    TActions = Record<string, WidgetActionHandler<TState>>,
> = WidgetScreen<TProps, TState, TActions>;

/**
 * Polymorphic representation of any registered widget screen.
 */
export type AnyWidgetScreen = {
    /**
     * Optional paradigm discriminator.
     */
    type?: WidgetScreenType;
    /**
     * Screen ID.
     */
    id: string;
    /**
     * Render component.
     */
    component: (props: never) => string;
    /**
     * Initial state factory.
     */
    initialState?: (props?: never) => unknown;
    /**
     * Action handlers map.
     */
    actions?: Record<string, unknown>;
};

/**
 * Bubble-branded alias for AnyWidgetScreen.
 */
export type AnyBubbleScreen = AnyWidgetScreen;
