/**
 * Строгая типизация JavaScript API виджета Telegram (Bot API 10.4, Profile 1).
 * Доступно глобально через `window.TelegramWidget` внутри QuickJS песочницы виджета.
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
     * Строка ответа от бота (до 1024 байт), возвращенная через answerWidgetQuery
     */
    result: string | null;
}

export interface TelegramWidgetRequestOptions {
    /**
     * Запросить у пользователя карту TON-кошелька вместе с запросом
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
     * Версия профиля песочницы виджетов (1 в Bot API 10.4)
     */
    profile?: number;

    /**
     * Возвращает true, если версия профиля клиента не ниже n
     */
    isProfileAtLeast?(n: number): boolean;

    /**
     * Текущая цветовая схема чата ('light' или 'dark')
     */
    colorScheme?: 'light' | 'dark';

    /**
     * Параметры темы чата
     */
    themeParams?: TelegramWidgetThemeParams;

    /**
     * True, если виджет сейчас виден на экране
     */
    isActive?: boolean;

    /**
     * True, если это предпросмотр в инлайн-результатах
     */
    isPreview?: boolean;

    /**
     * True, если сообщение является пересланной копией
     */
    isForward?: boolean;

    /**
     * Тип чата: 'private', 'group', 'supergroup', 'channel' или null
     */
    chatType?: 'private' | 'group' | 'supergroup' | 'channel' | null;

    /**
     * Информация о пользователе, просматривающем виджет (если разрешено)
     */
    viewer?: TelegramWidgetViewer | null;

    /**
     * Состояние чата (chat_data сообщения, до 1024 байт)
     */
    chatData?: string | null;

    /**
     * Публичное разделяемое состояние (public_data, до 1024 байт)
     */
    publicData?: string | null;

    /**
     * Включает отслеживание изменений publicData разделяемого виджета
     */
    watchPublicData?(): void;

    /**
     * Выключает отслеживание изменений publicData
     */
    unwatchPublicData?(): void;

    /**
     * Отправляет запрос к боту через update.widget_query.
     * @param data Строка действия длиной 1-64 байта
     * @param options Дополнительные параметры (например, { wallet: true })
     */
    request(
        data: string,
        options?: TelegramWidgetRequestOptions | unknown,
    ): Promise<TelegramWidgetRequestAnswer>;

    /**
     * Копирует текст в буфер обмена (1-256 символов) с показом нативного тоста
     */
    copyText?(text: string): void;

    /**
     * Открывает внешнюю https:// ссылку с подтверждением пользователя
     */
    openLink(url: string): void;

    /**
     * Открывает https://t.me/... ссылку внутри Telegram
     */
    openTelegramLink(url: string): void;

    /**
     * Управление виброоткликом устройства
     */
    HapticFeedback?: TelegramWidgetHapticFeedback;

    /**
     * Безопасная зона времени и статуса сообщения в углу баббла
     */
    contentSafeAreaInset?: TelegramWidgetContentSafeAreaInset;

    /**
     * Работа с TON кошельком пользователя
     */
    wallet?: TelegramWidgetWallet | null;

    /**
     * Управляет якорем изменения размера виджета ('top' или 'bottom')
     */
    setResizeAnchor?(edge: 'top' | 'bottom'): void;

    /**
     * Сигнализирует приложению о завершении первичного рендера
     */
    ready?(): void;

    /**
     * Подписка на события виджета
     */
    onEvent(eventName: TelegramWidgetEventType, handler: () => void): void;

    /**
     * Отписка от событий виджета
     */
    offEvent?(eventName: string, handler: () => void): void;
}

declare global {
    interface Window {
        TelegramWidget?: TelegramWidgetBridge;
    }
}
