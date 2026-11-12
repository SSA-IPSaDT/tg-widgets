/**
 * Двунаправленный легковесный кодек сжатия ключей объектов для протокола Telegram Widgets (Bot API 10.4).
 *
 * Сворачивает ключи объектов до 1-2 букв для минимизации полезной нагрузки:
 * 1. Запросы от клиента к боту (W.request -> update.widget_query): строгий лимит 64 байта!
 * 2. Состояние от бота к клиенту (chat_data, public_data): лимит 1024 байта!
 */

/**
 * Базовый словарь сокращений полей виджетов Telegram
 */
export const DEFAULT_KEY_MAP: Record<string, string> = {
    // Ядро протокола и навигации
    action: 'a',
    payload: 'p',
    type: 't',
    screen: 's',
    id: 'i',
    value: 'v',
    data: 'd',
    state: 'z',
    key: 'k',
    error: 'E',
    status: 'y',
    message: 'M',
    text: 'x',
    timestamp: 'T',
    name: 'n',
    username: 'u',

    // Настройки интерфейса и формы
    notifications: 'o',
    soundEffects: 'e',
    privateMode: 'm',
    newsletter: 'w',
    plan: 'l',
    tickets: 'k',
    setting: 'g',
    enabled: 'b',
    active: 'A',
    count: 'c',
    step: 'S',
    min: 'N',
    max: 'X',
    checked: 'C',
    selected: 'K',
    votes: 'V',
    userVote: 'U',

    // Электронная коммерция и транзакции
    quantity: 'q',
    price: 'P',
    size: 'Z',
    total: 'R',
    items: 'I',
    cart: 'C',
    currency: 'Y',
    address: 'D',

    // Системный идентификатор экрана
    __screen: '_s',
};

/**
 * Обратный словарь для восстановления оригинальных ключей
 */
export const REVERSE_KEY_MAP: Record<string, string> = Object.fromEntries(
    Object.entries(DEFAULT_KEY_MAP).map(([k, v]) => [v, k]),
);

/**
 * Регистрация пользовательских сокращений для предметной области приложения
 */
export const registerCodecKeys = (mappings: Record<string, string>): void => {
    for (const [longKey, shortKey] of Object.entries(mappings)) {
        DEFAULT_KEY_MAP[longKey] = shortKey;
        REVERSE_KEY_MAP[shortKey] = longKey;
    }
};

/**
 * Рекурсивно сжимает ключи объекта до 1-2 букв
 */
export const compressKeys = <T = unknown>(
    data: T,
    customMap?: Record<string, string>,
): unknown => {
    if (data === null || data === undefined) {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map((item) => compressKeys(item, customMap));
    }

    if (typeof data === 'object') {
        const result: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
            const shortKey = customMap?.[k] ?? DEFAULT_KEY_MAP[k] ?? k;
            result[shortKey] = compressKeys(v, customMap);
        }
        return result;
    }

    return data;
};

/**
 * Рекурсивно восстанавливает оригинальные ключи объекта
 */
export const decompressKeys = <T = unknown>(
    data: unknown,
    customReverseMap?: Record<string, string>,
): T => {
    if (data === null || data === undefined) {
        return data as T;
    }

    if (Array.isArray(data)) {
        return data.map((item) =>
            decompressKeys(item, customReverseMap),
        ) as unknown as T;
    }

    if (typeof data === 'object') {
        const result: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
            const fullKey = customReverseMap?.[k] ?? REVERSE_KEY_MAP[k] ?? k;
            result[fullKey] = decompressKeys(v, customReverseMap);
        }
        return result as T;
    }

    return data as T;
};

/**
 * Сериализует полезную нагрузку в компактную строку JSON со сжатыми ключами
 */
export const packPayload = (
    payload: unknown,
    customMap?: Record<string, string>,
): string => {
    const compressed = compressKeys(payload, customMap);
    return JSON.stringify(compressed);
};

/**
 * Разбирает компактную строку JSON и восстанавливает оригинальные ключи
 */
export const unpackPayload = <T = unknown>(
    raw: string,
    customReverseMap?: Record<string, string>,
): T => {
    try {
        const parsed = JSON.parse(raw);
        return decompressKeys<T>(parsed, customReverseMap);
    } catch {
        return raw as unknown as T;
    }
};

/**
 * Сериализует состояние виджета (chat_data / public_data) с упаковкой ключей
 * и системным идентификатором экрана
 */
export const packState = (
    screenId: string,
    state: Record<string, unknown>,
    customMap?: Record<string, string>,
): string => {
    const stateWithScreen = {
        ...state,
        __screen: screenId,
    };
    return packPayload(stateWithScreen, customMap);
};

/**
 * Восстанавливает состояние виджета из chat_data / public_data
 */
export const unpackState = <T = Record<string, unknown>>(
    rawState: string | null | undefined,
    customReverseMap?: Record<string, string>,
): { screenId?: string; state: T } => {
    if (!rawState || typeof rawState !== 'string') {
        return { state: {} as T };
    }

    const decompressed = unpackPayload<Record<string, unknown>>(
        rawState,
        customReverseMap,
    );
    if (!decompressed || typeof decompressed !== 'object') {
        return { state: {} as T };
    }

    const screenId = decompressed.__screen as string | undefined;
    const { __screen, ...cleanState } = decompressed;

    return {
        screenId,
        state: cleanState as T,
    };
};

/**
 * Легковесный JS-сниппет (< 300 Б) для встраивания в клиентский <script>,
 * позволяющий QuickJS клиенту прозрачно упаковывать и распаковывать объекты.
 */
export const CLIENT_CODEC_SNIPPET =
    'var __KM=' +
    JSON.stringify(DEFAULT_KEY_MAP) +
    ';var __RM=Object.fromEntries(Object.entries(__KM).map(([k,v])=>[v,k]));' +
    'window.packState=function(o){return JSON.stringify(Object.fromEntries(Object.entries(o).map(([k,v])=>[__KM[k]||k,v])));};' +
    'window.unpackState=function(s){var o=typeof s==="string"?JSON.parse(s):s;return Object.fromEntries(Object.entries(o).map(([k,v])=>[__RM[k]||k,v]));};';
