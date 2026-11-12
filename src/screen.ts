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
    setState: (newState: TState) => Promise<void>;
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

export interface WidgetScreen<
    TProps = unknown,
    TState = unknown,
    TActions = Record<string, WidgetActionHandler<TState>>,
> {
    id: string;
    component: (props: TProps) => string;
    initialState: (props: TProps) => TState;
    actions: TActions;
}

export type BubbleScreen<
    TProps = unknown,
    TState = unknown,
    TActions = Record<string, WidgetActionHandler<TState>>,
> = WidgetScreen<TProps, TState, TActions>;

export type AnyWidgetScreen = {
    id: string;
    component: (props: never) => string;
    initialState: (props: never) => unknown;
    actions: Record<string, unknown>;
};

export type AnyBubbleScreen = AnyWidgetScreen;

export const defineWidgetScreen = <
    TProps,
    TState,
    TActions extends Record<
        string,
        WidgetActionHandler<TState, unknown, unknown>
    > = Record<string, WidgetActionHandler<TState, unknown, unknown>>,
>(options: {
    id: string;
    component: (props: TProps) => string;
    initialState: (props: TProps) => TState;
    actions?: TActions;
}): WidgetScreen<TProps, TState, TActions> => ({
    id: options.id,
    component: options.component,
    initialState: options.initialState,
    actions: (options.actions ?? {}) as TActions,
});

export const defineBubbleScreen = defineWidgetScreen;
