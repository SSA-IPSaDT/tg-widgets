export interface RawWidgetApiMethods {
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

    sendSharedWidget?(params: {
        chat_id: number | string;
        widget_id: string;
        message_thread_id?: number;
        caption?: string;
        reply_markup?: unknown;
    }): Promise<{ message_id: number; [key: string]: unknown }>;

    editMessageWidgetData(params: {
        chat_id?: number | string;
        message_id?: number;
        inline_message_id?: string;
        chat_data?: string;
        public_data?: string;
    }): Promise<unknown>;

    editSharedWidgetData?(params: {
        widget_id?: string;
        public_data: string;
    }): Promise<unknown>;

    answerWidgetQuery(params: {
        widget_query_id: string;
        data?: string;
    }): Promise<unknown>;
}

export interface WidgetActionContext<TState> {
    queryId: string;
    chatId?: number | string;
    messageId?: number;
    inlineMessageId?: string;
    chatInstance: string;
    chatType?:
        | 'sender'
        | 'private'
        | 'group'
        | 'supergroup'
        | 'channel'
        | string;
    from: {
        id: number;
        firstName: string;
        lastName?: string;
        username?: string;
        isPremium?: boolean;
        languageCode?: string;
    };
    state: TState;
    setState: (newState: Partial<TState> | TState) => Promise<void>;
    answer: (data?: unknown) => Promise<void>;
    rawApi: RawWidgetApiMethods;
}

export type BubbleActionContext<TState> = WidgetActionContext<TState>;

export type WidgetActionHandler<
    TState,
    TPayload = unknown,
    TResult = unknown,
> = (
    ctx: WidgetActionContext<TState>,
    payload?: TPayload,
) => Promise<TResult> | TResult;

export type BubbleActionHandler<
    TState,
    TPayload = unknown,
    TResult = unknown,
> = WidgetActionHandler<TState, TPayload, TResult>;

/**
 * Telegram Widget screen paradigm:
 * - 'static': Pure HTML/CSS presentation. Zero JS runtime, zero server queries, zero storage overhead.
 * - 'client': Client-side interactive widget (DOM, accordions, tabs, local calculation) without server bot queries. Zero server storage overhead.
 * - 'dynamic': Full bidirectional interactivity with server actions, state persistence, and widget_query handling.
 */
export type WidgetScreenType = 'static' | 'client' | 'dynamic';
export type BubbleScreenType = WidgetScreenType;

/**
 * Completely static widget screen.
 * Contains only HTML/CSS markup without server state or actions.
 */
export interface StaticWidgetScreen<TProps = unknown> {
    type: 'static';
    id: string;
    component: (props: TProps) => string;
}

export type StaticBubbleScreen<TProps = unknown> = StaticWidgetScreen<TProps>;

/**
 * Client-interactive widget screen.
 * Runs interactions purely on the client side without round trips to the bot.
 */
export interface ClientWidgetScreen<TProps = unknown, TState = unknown> {
    type: 'client';
    id: string;
    component: (props: TProps) => string;
    initialState?: (props?: TProps) => TState;
}

export type ClientBubbleScreen<TProps = unknown, TState = unknown> =
    ClientWidgetScreen<TProps, TState>;

/**
 * Dynamic widget screen with bidirectional bot communication and state persistence.
 */
export interface DynamicWidgetScreen<
    TProps = unknown,
    TState = unknown,
    TActions = Record<string, WidgetActionHandler<TState>>,
> {
    type: 'dynamic';
    id: string;
    component: (props: TProps) => string;
    initialState: (props?: TProps) => TState;
    actions: TActions;
}

export type DynamicBubbleScreen<
    TProps = unknown,
    TState = unknown,
    TActions = Record<string, WidgetActionHandler<TState>>,
> = DynamicWidgetScreen<TProps, TState, TActions>;

/**
 * General widget screen representation supporting all paradigms.
 */
export interface WidgetScreen<
    TProps = unknown,
    TState = unknown,
    TActions = Record<string, WidgetActionHandler<TState>>,
> {
    type?: WidgetScreenType;
    id: string;
    component: (props: TProps) => string;
    initialState: (props?: TProps) => TState;
    actions: TActions;
}

export type BubbleScreen<
    TProps = unknown,
    TState = unknown,
    TActions = Record<string, WidgetActionHandler<TState>>,
> = WidgetScreen<TProps, TState, TActions>;

export type AnyWidgetScreen = {
    type?: WidgetScreenType;
    id: string;
    component: (props: never) => string;
    initialState?: (props?: never) => unknown;
    actions?: Record<string, unknown>;
};

export type AnyBubbleScreen = AnyWidgetScreen;

/**
 * Determines the architectural paradigm of a widget screen.
 */
export const getWidgetScreenType = (
    screen: AnyWidgetScreen,
): WidgetScreenType => {
    if (screen.type) {
        return screen.type;
    }
    if (screen.actions && Object.keys(screen.actions).length > 0) {
        return 'dynamic';
    }
    if (screen.initialState) {
        return 'client';
    }
    return 'static';
};

export const getBubbleScreenType = getWidgetScreenType;

/**
 * Defines a completely static widget screen.
 * Ideal for alerts, receipts, static cards, and announcements.
 *
 * Benefits:
 * - allow_queries is set to false (no unnecessary server queries)
 * - chat_data is completely omitted, saving valuable byte payload
 * - Server storage is bypassed (0 bytes allocated in Redis/memory)
 * - Skips JavaScript minification passes
 */
export const defineStaticWidgetScreen = <TProps = unknown>(options: {
    id: string;
    component: (props: TProps) => string;
}): StaticWidgetScreen<TProps> => ({
    type: 'static',
    id: options.id,
    component: options.component,
});

export const defineStaticBubbleScreen = defineStaticWidgetScreen;

/**
 * Defines a client-side interactive widget screen.
 * Ideal for accordions, tabs, local forms, calculators, and client-only state transitions.
 *
 * Benefits:
 * - allow_queries is set to false (no round trips to the bot server)
 * - Server storage is bypassed (0 server sessions/records stored)
 * - Client scripts in <script> are fully minified via Terser/fast engine
 */
export const defineClientWidgetScreen = <
    TProps = unknown,
    TState = unknown,
>(options: {
    id: string;
    component: (props: TProps) => string;
    initialState?: (props: TProps) => TState;
}): ClientWidgetScreen<TProps, TState> => ({
    type: 'client',
    id: options.id,
    component: options.component,
    initialState: options.initialState as
        | ((props?: TProps) => TState)
        | undefined,
});

export const defineClientBubbleScreen = defineClientWidgetScreen;

/**
 * Defines a fully dynamic widget screen with server actions and state persistence.
 * Ideal for counters, polls, shopping carts, live feeds, and games.
 */
export const defineDynamicWidgetScreen = <
    TProps = unknown,
    TState = unknown,
    TActions extends Record<
        string,
        WidgetActionHandler<TState, unknown, unknown>
    > = Record<string, WidgetActionHandler<TState, unknown, unknown>>,
>(options: {
    id: string;
    component: (props: TProps) => string;
    initialState: (props: TProps) => TState;
    actions: TActions;
}): DynamicWidgetScreen<TProps, TState, TActions> => ({
    type: 'dynamic',
    id: options.id,
    component: options.component,
    initialState: options.initialState as (props?: TProps) => TState,
    actions: options.actions,
});

export const defineDynamicBubbleScreen = defineDynamicWidgetScreen;

/**
 * Universal screen builder that supports static, client, and dynamic screens.
 * If type is not specified, it will automatically infer the appropriate paradigm.
 */
export const defineWidgetScreen = <
    TProps = unknown,
    TState = unknown,
    TActions extends Record<
        string,
        WidgetActionHandler<TState, unknown, unknown>
    > = Record<string, WidgetActionHandler<TState, unknown, unknown>>,
>(options: {
    type?: WidgetScreenType;
    id: string;
    component: (props: TProps) => string;
    initialState?: (props: TProps) => TState;
    actions?: TActions;
}): WidgetScreen<TProps, TState, TActions> => {
    const type: WidgetScreenType =
        options.type ??
        (options.actions && Object.keys(options.actions).length > 0
            ? 'dynamic'
            : options.initialState
              ? 'client'
              : 'static');

    return {
        type,
        id: options.id,
        component: options.component,
        initialState: (options.initialState ?? (() => ({} as TState))) as (
            props?: TProps,
        ) => TState,
        actions: (options.actions ?? {}) as TActions,
    };
};

export const defineBubbleScreen = defineWidgetScreen;
