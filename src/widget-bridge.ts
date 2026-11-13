/**
 * Telegram Widgets JavaScript Bridge Interface.
 *
 * Models the `window.TelegramWidget` interface injected into Telegram Bot API 10.4
 * HTML Widget views on Android, iOS, Telegram Desktop, and Web.
 *
 * @module widget-bridge
 */

import type {
    TelegramWidgetContentSafeAreaInset,
    TelegramWidgetEventType,
    TelegramWidgetHapticFeedback,
    TelegramWidgetRequestAnswer,
    TelegramWidgetRequestOptions,
    TelegramWidgetThemeParams,
    TelegramWidgetViewer,
    TelegramWidgetWallet,
} from './widget-bridge/types';

export * from './widget-bridge/types';

/**
 * Strict TypeScript definitions for the Telegram Widget JavaScript Bridge (Bot API 10.4, Profile 1).
 * Available globally via `window.TelegramWidget` (or simply `TelegramWidget`) inside the QuickJS sandbox.
 */
export interface TelegramWidgetBridge {
    /**
     * Active Telegram Widget Profile revision number (e.g. 1).
     */
    profile?: number;

    /**
     * Checks if the host client supports at least the specified Profile version.
     *
     * @param n Profile version number to compare.
     * @returns True if supported.
     */
    isProfileAtLeast?(n: number): boolean;

    /**
     * Active user color scheme ('light' or 'dark').
     */
    colorScheme?: 'light' | 'dark';

    /**
     * Current theme color parameters from the client.
     */
    themeParams?: TelegramWidgetThemeParams;

    /**
     * True if the widget is actively rendered and visible on screen.
     */
    isActive?: boolean;

    /**
     * True if the widget is rendered inside an input bar preview or chat list preview.
     */
    isPreview?: boolean;

    /**
     * True if the widget message was forwarded from another chat.
     */
    isForward?: boolean;

    /**
     * Type of the current chat ('private', 'group', 'supergroup', or 'channel').
     */
    chatType?: 'private' | 'group' | 'supergroup' | 'channel' | null;

    /**
     * Information about the user currently viewing the widget.
     */
    viewer?: TelegramWidgetViewer | null;

    /**
     * Current chat-level private state string (up to 4096 bytes).
     */
    chatData?: string | null;

    /**
     * Current global public data string broadcast to all viewers.
     */
    publicData?: string | null;

    /**
     * Subscribes the widget to live public data updates from the bot server.
     */
    watchPublicData?(): void;

    /**
     * Unsubscribes from live public data updates.
     */
    unwatchPublicData?(): void;

    /**
     * Dispatches an action request to the bot via `update.widget_query`.
     *
     * @param data Action string (1-64 bytes UTF-8).
     * @param options Additional request options (e.g. `{ wallet: true }`).
     * @returns Promise resolving to the answer returned by `answerWidgetQuery`.
     */
    request?(
        data: string,
        options?: TelegramWidgetRequestOptions | unknown,
    ): Promise<TelegramWidgetRequestAnswer>;

    /**
     * Copies text into clipboard (1-256 characters) with a native Telegram toast confirmation.
     *
     * @param text Text string to copy.
     */
    copyText?(text: string): void;

    /**
     * Opens an external HTTPS link with native user confirmation popup.
     *
     * @param url External URL to open.
     */
    openLink?(url: string): void;

    /**
     * Opens a Telegram deep link (e.g. `https://t.me/...`) internally.
     *
     * @param url Telegram URL to open.
     */
    openTelegramLink?(url: string): void;

    /**
     * Haptic vibration feedback controller.
     */
    HapticFeedback?: TelegramWidgetHapticFeedback;

    /**
     * Inset boundaries for message timestamp bubble overlay in bottom corner.
     */
    contentSafeAreaInset?: TelegramWidgetContentSafeAreaInset;

    /**
     * TON Wallet integration methods.
     */
    wallet?: TelegramWidgetWallet | null;

    /**
     * Sets resize animation anchor point ('top' or 'bottom').
     *
     * @param edge Anchor edge.
     */
    setResizeAnchor?(edge: 'top' | 'bottom'): void;

    /**
     * Signals the Telegram client that initial DOM rendering is complete.
     */
    ready?(): void;

    /**
     * Subscribes to widget bridge events.
     *
     * @param eventName Name of the event to observe.
     * @param handler Event listener callback.
     */
    onEvent?(eventName: TelegramWidgetEventType, handler: () => void): void;

    /**
     * Unsubscribes from widget bridge events.
     *
     * @param eventName Name of the event.
     * @param handler Previously registered listener.
     */
    offEvent?(eventName: string, handler: () => void): void;
}
