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
    sendTransaction(transaction: unknown, data: string): Promise<TelegramWidgetRequestAnswer>;
    signData(payload: unknown, data: string): Promise<TelegramWidgetRequestAnswer>;
}

export interface TelegramWidgetHapticFeedback {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
}

export type TelegramWidgetEventType =
    'chatDataChanged' | 'publicDataChanged' | 'themeChanged' | 'contentSafeAreaChanged';
