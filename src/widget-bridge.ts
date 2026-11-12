/**
 * Strict TypeScript definitions for the Telegram Widget JavaScript Bridge (Bot API 10.4, Profile 1).
 * Available globally via `window.TelegramWidget` (or simply `TelegramWidget`) inside the QuickJS sandbox.
 */

export interface TelegramWidgetThemeParams {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
    accent_text_color?: string;
    subtitle_text_color?: string;
    destructive_text_color?: string;
    section_bg_color?: string;
    section_header_text_color?: string;
    section_separator_color?: string;
    header_bg_color?: string;
    bottom_bar_bg_color?: string;
    [key: string]: string | undefined;
}

export interface TelegramWidgetViewer {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    is_premium?: boolean;
}

export interface TelegramWidgetRequestAnswer {
    /**
     * Response string from the bot server (up to 1024 bytes), returned by `answerWidgetQuery`.
     */
    result: string | null;
}

export interface TelegramWidgetRequestOptions {
    /**
     * Requests user's TON wallet address card alongside the action query.
     */
    wallet?: boolean;
}

export interface TelegramWidgetContentSafeAreaInset {
    top: number;
    right: number;
    bottom: number;
    left: number;
    cornerRight: number;
    cornerLeft: number;
}

export interface TelegramWidgetWallet {
    sendTransaction(
        transaction: unknown,
        data: string,
    ): Promise<TelegramWidgetRequestAnswer>;
    signData(
        payload: unknown,
        data: string,
    ): Promise<TelegramWidgetRequestAnswer>;
}

export interface TelegramWidgetHapticFeedback {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
}

export type TelegramWidgetEventType =
    | 'chatDataChanged'
    | 'publicDataChanged'
    | 'themeChanged'
    | 'contentSafeAreaChanged';

export interface TelegramWidgetBridge {
    /**
     * Sandbox profile version (integer 1 in Bot API 10.4).
     */
    profile?: number;

    /**
     * Returns true if the client sandbox version is at least n.
     */
    isProfileAtLeast?(n: number): boolean;

    /**
     * Current active chat color scheme ('light' or 'dark').
     */
    colorScheme?: 'light' | 'dark';

    /**
     * Telegram chat theme palette parameters.
     */
    themeParams?: TelegramWidgetThemeParams;

    /**
     * True if the widget is currently visible on screen.
     */
    isActive?: boolean;

    /**
     * True if the widget is rendered inside an inline query preview.
     */
    isPreview?: boolean;

    /**
     * True if the message containing the widget is a forwarded copy.
     */
    isForward?: boolean;

    /**
     * Chat type context: 'private', 'group', 'supergroup', 'channel', or null.
     */
    chatType?: 'private' | 'group' | 'supergroup' | 'channel' | null;

    /**
     * Information about the user currently viewing the widget (when permitted).
     */
    viewer?: TelegramWidgetViewer | null;

    /**
     * Chat-specific state data string (up to 1024 bytes).
     */
    chatData?: string | null;

    /**
     * Public shared state data string (up to 1024 bytes).
     */
    publicData?: string | null;

    /**
     * Starts listening for real-time changes to publicData in shared widgets.
     */
    watchPublicData?(): void;

    /**
     * Stops listening for changes to publicData.
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
     */
    copyText?(text: string): void;

    /**
     * Opens an external HTTPS link with native user confirmation popup.
     */
    openLink?(url: string): void;

    /**
     * Opens a Telegram deep link (e.g. `https://t.me/...`) internally.
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
     */
    setResizeAnchor?(edge: 'top' | 'bottom'): void;

    /**
     * Signals the Telegram client that initial DOM rendering is complete.
     */
    ready?(): void;

    /**
     * Subscribes to widget bridge events.
     */
    onEvent?(eventName: TelegramWidgetEventType, handler: () => void): void;

    /**
     * Unsubscribes from widget bridge events.
     */
    offEvent?(eventName: string, handler: () => void): void;
}

declare global {
    interface Window {
        TelegramWidget?: TelegramWidgetBridge;
    }
    var TelegramWidget: TelegramWidgetBridge | undefined;
}
