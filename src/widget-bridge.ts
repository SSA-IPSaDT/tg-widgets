/**
 * Строгая типизация JavaScript API виджета Telegram (Bot API 10.4)
 * Доступно через window.TelegramWidget внутри iframe виджета
 */
export interface TelegramWidgetBridge {
    chatData?: string;
    publicData?: string;
    themeParams?: Record<string, string>;
    request(
        method: string,
        params?: unknown,
    ): Promise<{ result?: string; error?: string }>;
    onEvent(
        eventName: 'chatDataChanged' | 'publicDataChanged' | 'themeChanged',
        handler: () => void,
    ): void;
    openLink(url: string): void;
    openTelegramLink(url: string): void;
    HapticFeedback?: {
        impactOccurred(
            style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft',
        ): void;
        notificationOccurred(type: 'error' | 'success' | 'warning'): void;
        selectionChanged(): void;
    };
}

declare global {
    interface Window {
        TelegramWidget?: TelegramWidgetBridge;
    }
}
