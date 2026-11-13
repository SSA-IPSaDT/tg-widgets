import type {
    AnyWidgetScreen,
    ClientWidgetScreen,
    DynamicWidgetScreen,
    StaticWidgetScreen,
    WidgetActionHandler,
    WidgetScreen,
    WidgetScreenType,
} from './types';

/**
 * Determines the architectural paradigm of a widget screen.
 */
export const getWidgetScreenType = (screen: AnyWidgetScreen): WidgetScreenType => {
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
export const defineClientWidgetScreen = <TProps = unknown, TState = unknown>(options: {
    id: string;
    component: (props: TProps) => string;
    initialState?: (props: TProps) => TState;
}): ClientWidgetScreen<TProps, TState> => ({
    type: 'client',
    id: options.id,
    component: options.component,
    initialState: options.initialState as ((props?: TProps) => TState) | undefined,
});

export const defineClientBubbleScreen = defineClientWidgetScreen;

/**
 * Defines a fully dynamic widget screen with server actions and state persistence.
 * Ideal for counters, polls, shopping carts, live feeds, and games.
 */
export const defineDynamicWidgetScreen = <
    TProps = unknown,
    TState = unknown,
    TActions extends Record<string, WidgetActionHandler<TState, unknown, unknown>> = Record<
        string,
        WidgetActionHandler<TState, unknown, unknown>
    >,
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
    TActions extends Record<string, WidgetActionHandler<TState, unknown, unknown>> = Record<
        string,
        WidgetActionHandler<TState, unknown, unknown>
    >,
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
        initialState: (options.initialState ?? (() => ({}) as TState)) as (
            props?: TProps,
        ) => TState,
        actions: (options.actions ?? {}) as TActions,
    };
};

export const defineBubbleScreen = defineWidgetScreen;
