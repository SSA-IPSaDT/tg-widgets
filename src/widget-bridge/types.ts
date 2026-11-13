/**
 * Telegram Widgets Client Bridge Type Definitions.
 *
 * Models the `window.TelegramWidget` interface injected into Telegram Bot API 10.4
 * HTML Widget views on Android, iOS, Telegram Desktop, and Web.
 *
 * @module widget-bridge/types
 */

/**
 * Current visual theme color parameters passed from the Telegram client.
 */
export interface TelegramWidgetThemeParams {
    /**
     * Primary background color in hex format (e.g. #ffffff).
     */
    bg_color?: string;
    /**
     * Main text color in hex format.
     */
    text_color?: string;
    /**
     * Hint and secondary label text color.
     */
    hint_color?: string;
    /**
     * Hyperlink and interactive accent color.
     */
    link_color?: string;
    /**
     * Primary action button background color.
     */
    button_color?: string;
    /**
     * Text color displayed on primary action buttons.
     */
    button_text_color?: string;
    /**
     * Secondary background color for grouped sections and cards.
     */
    secondary_bg_color?: string;
    /**
     * Text accent color for highlighted badges and titles.
     */
    accent_text_color?: string;
    /**
     * Subtitle and caption text color.
     */
    subtitle_text_color?: string;
    /**
     * Destructive and danger action text color (e.g. red).
     */
    destructive_text_color?: string;
    /**
     * Section background color for grouped lists.
     */
    section_bg_color?: string;
    /**
     * Section header label text color.
     */
    section_header_text_color?: string;
    /**
     * Separator line color between list items.
     */
    section_separator_color?: string;
    /**
     * Top header bar background color.
     */
    header_bg_color?: string;
    /**
     * Bottom action bar background color.
     */
    bottom_bar_bg_color?: string;
    /**
     * Custom vendor or experimental theme color tokens.
     */
    [key: string]: string | undefined;
}

/**
 * Information about the Telegram user viewing the widget.
 */
export interface TelegramWidgetViewer {
    /**
     * Unique identifier for this user or bot.
     */
    id: number;
    /**
     * First name of the viewing user.
     */
    first_name: string;
    /**
     * Optional last name of the viewing user.
     */
    last_name?: string;
    /**
     * Optional Telegram username (without leading @).
     */
    username?: string;
    /**
     * True if the user is a Telegram Premium subscriber.
     */
    is_premium?: boolean;
}

/**
 * Server answer payload returned to `window.TelegramWidget.request()`.
 */
export interface TelegramWidgetRequestAnswer {
    /**
     * Response string from the bot server (up to 1024 bytes), returned by `answerWidgetQuery`.
     */
    result: string | null;
}

/**
 * Request execution options passed to `window.TelegramWidget.request()`.
 */
export interface TelegramWidgetRequestOptions {
    /**
     * Requests user's TON wallet address card alongside the action query.
     */
    wallet?: boolean;
}

/**
 * Safe area insets for content rendering avoiding device notches, rounded corners, and system bars.
 */
export interface TelegramWidgetContentSafeAreaInset {
    /**
     * Top inset in CSS pixels.
     */
    top: number;
    /**
     * Right inset in CSS pixels.
     */
    right: number;
    /**
     * Bottom inset in CSS pixels.
     */
    bottom: number;
    /**
     * Left inset in CSS pixels.
     */
    left: number;
    /**
     * Corner radius of the top-right notch or curve.
     */
    cornerRight: number;
    /**
     * Corner radius of the top-left notch or curve.
     */
    cornerLeft: number;
}

/**
 * Telegram client TON wallet interaction provider.
 */
export interface TelegramWidgetWallet {
    /**
     * Requests the user to confirm and send a TON transaction.
     *
     * @param transaction TON transaction payload object.
     * @param data Additional context data passed to the handler.
     */
    sendTransaction(transaction: unknown, data: string): Promise<TelegramWidgetRequestAnswer>;

    /**
     * Requests the user to cryptographically sign data using their TON wallet private key.
     *
     * @param payload Payload to sign.
     * @param data Additional context data.
     */
    signData(payload: unknown, data: string): Promise<TelegramWidgetRequestAnswer>;
}

/**
 * Haptic feedback generator for mobile Telegram clients.
 */
export interface TelegramWidgetHapticFeedback {
    /**
     * Triggers an impact haptic vibration with the specified intensity.
     *
     * @param style Impact intensity style.
     */
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;

    /**
     * Triggers a notification vibration pattern.
     *
     * @param type Notification feedback category.
     */
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;

    /**
     * Triggers a subtle selection change tick feedback.
     */
    selectionChanged(): void;
}

/**
 * Event types dispatched by the Telegram widget runtime.
 */
export type TelegramWidgetEventType =
    'chatDataChanged' | 'publicDataChanged' | 'themeChanged' | 'contentSafeAreaChanged';
