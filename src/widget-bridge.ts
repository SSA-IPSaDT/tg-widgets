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
    profile?: number;
    isProfileAtLeast?(n: number): boolean;
    colorScheme?: 'light' | 'dark';
    themeParams?: TelegramWidgetThemeParams;
    isActive?: boolean;
    isPreview?: boolean;
    isForward?: boolean;
    chatType?: 'private' | 'group' | 'supergroup' | 'channel' | null;
    viewer?: TelegramWidgetViewer | null;
    chatData?: string | null;
    publicData?: string | null;
    watchPublicData?(): void;
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
