/**
 * Telegram Widgets Screen Definition Builders.
 *
 * Provides type-safe builder helpers (`defineStaticWidgetScreen`, `defineClientWidgetScreen`,
 * `defineDynamicWidgetScreen`, and `defineWidgetScreen`) to configure screen components and paradigms.
 *
 * @module screen/builders
 */

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
 *
 * @param screen Widget screen definition.
 * @returns The resolved paradigm ('static', 'client', or 'dynamic').
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

/**
 * Bubble-branded alias for getWidgetScreenType.
 */
export const getBubbleScreenType: typeof getWidgetScreenType = getWidgetScreenType;

/**
 * Defines a completely static widget screen.
 * Ideal for alerts, receipts, static cards, and announcements.
 *
 * Benefits:
 * - allow_queries is set to false (no unnecessary server queries)
 * - chat_data is completely omitted, saving valuable byte payload
 * - Server storage is bypassed (0 bytes allocated in Redis/memory)
 * - Skips JavaScript minification passes
 *
 * @param options Screen configuration options.
 * @returns A strictly typed static widget screen.
 */
export const defineStaticWidgetScreen = <TProps = unknown>(options: {
    /**
     * Unique identifier for this static screen.
     */
    id: string;
    /**
     * Component rendering JSX to HTML string.
     */
    component: (props: TProps) => string;
}): StaticWidgetScreen<TProps> => ({
    type: 'static',
    id: options.id,
    component: options.component,
});

/**
 * Bubble-branded alias for defineStaticWidgetScreen.
 */
export const defineStaticBubbleScreen: typeof defineStaticWidgetScreen = defineStaticWidgetScreen;

/**
 * Defines a client-side interactive widget screen.
 * Ideal for accordions, tabs, local forms, calculators, and client-only state transitions.
 *
 * Benefits:
 * - allow_queries is set to false (no round trips to the bot server)
 * - Server storage is bypassed (0 server sessions/records stored)
 * - Client scripts in <script> are fully minified via fast engine
 *
 * @param options Client screen configuration options.
 * @returns A strictly typed client interactive widget screen.
 */
export const defineClientWidgetScreen = <TProps = unknown, TState = unknown>(options: {
    /**
     * Unique identifier for this client screen.
     */
    id: string;
    /**
     * Component rendering JSX to HTML string.
     */
    component: (props: TProps) => string;
    /**
     * Optional factory function returning initial client state.
     */
    initialState?: (props: TProps) => TState;
}): ClientWidgetScreen<TProps, TState> => ({
    type: 'client',
    id: options.id,
    component: options.component,
    initialState: options.initialState as ((props?: TProps) => TState) | undefined,
});

/**
 * Bubble-branded alias for defineClientWidgetScreen.
 */
export const defineClientBubbleScreen: typeof defineClientWidgetScreen = defineClientWidgetScreen;

/**
 * Defines a fully dynamic widget screen with server actions and state persistence.
 * Ideal for counters, polls, shopping carts, live feeds, and games.
 *
 * @param options Dynamic screen configuration options.
 * @returns A strictly typed dynamic widget screen.
 */
export const defineDynamicWidgetScreen = <
    TProps = unknown,
    TState = unknown,
    TActions extends Record<string, WidgetActionHandler<TState, unknown, unknown>> = Record<
        string,
        WidgetActionHandler<TState, unknown, unknown>
    >,
>(options: {
    /**
     * Unique screen identifier.
     */
    id: string;
    /**
     * Component rendering JSX to HTML string.
     */
    component: (props: TProps) => string;
    /**
     * State initializer factory.
     */
    initialState: (props: TProps) => TState;
    /**
     * Server action handlers map.
     */
    actions: TActions;
}): DynamicWidgetScreen<TProps, TState, TActions> => ({
    type: 'dynamic',
    id: options.id,
    component: options.component,
    initialState: options.initialState as (props?: TProps) => TState,
    actions: options.actions,
});

/**
 * Bubble-branded alias for defineDynamicWidgetScreen.
 */
export const defineDynamicBubbleScreen: typeof defineDynamicWidgetScreen =
    defineDynamicWidgetScreen;

/**
 * Universal screen builder that supports static, client, and dynamic screens.
 * If type is not specified, it will automatically infer the appropriate paradigm.
 *
 * @param options Screen configuration options.
 * @returns Typed widget screen definition.
 */
export const defineWidgetScreen = <
    TProps = unknown,
    TState = unknown,
    TActions extends Record<string, WidgetActionHandler<TState, unknown, unknown>> = Record<
        string,
        WidgetActionHandler<TState, unknown, unknown>
    >,
>(options: {
    /**
     * Optional explicit paradigm override ('static', 'client', or 'dynamic').
     */
    type?: WidgetScreenType;
    /**
     * Unique identifier for this screen.
     */
    id: string;
    /**
     * Component rendering JSX to HTML string.
     */
    component: (props: TProps) => string;
    /**
     * State initializer factory.
     */
    initialState?: (props: TProps) => TState;
    /**
     * Action handlers map.
     */
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

/**
 * Bubble-branded alias for defineWidgetScreen.
 */
export const defineBubbleScreen: typeof defineWidgetScreen = defineWidgetScreen;
