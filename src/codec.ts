/**
 * Bidirectional lightweight object key compression codec for Telegram Widgets protocol (Bot API 10.4).
 *
 * Compresses object keys down to 1-2 letters to minimize payload sizes:
 * 1. Client-to-bot action requests (W.request -> update.widget_query): strict 64-byte limit!
 * 2. Bot-to-client states (chat_data, public_data): 1024-byte limit!
 */

/**
 * Default dictionary of common widget field abbreviations.
 */
export const DEFAULT_KEY_MAP: Record<string, string> = {
    // Protocol core & navigation
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

    // UI settings and form controls
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

    // E-commerce & financial
    quantity: 'q',
    price: 'P',
    size: 'Z',
    total: 'R',
    items: 'I',
    cart: 'C',
    currency: 'Y',
    address: 'D',

    // System screen identifier
    __screen: '_s',
};

/**
 * Reverse dictionary for recovering original property names.
 */
export const REVERSE_KEY_MAP: Record<string, string> = Object.fromEntries(
    Object.entries(DEFAULT_KEY_MAP).map(([k, v]) => [v, k]),
);

/**
 * Registers domain-specific key mappings into the codec.
 *
 * @param mappings Custom long-to-short key mapping pairs.
 *
 * @example
 * registerCodecKeys({ transactionHash: 'tx', recipientId: 'rc' });
 */
export const registerCodecKeys = (mappings: Record<string, string>): void => {
    for (const [longKey, shortKey] of Object.entries(mappings)) {
        DEFAULT_KEY_MAP[longKey] = shortKey;
        REVERSE_KEY_MAP[shortKey] = longKey;
    }
};

/**
 * Recursively compresses object keys down to shortened forms.
 *
 * @param data Object or array to compress.
 * @param customMap Optional dictionary override.
 * @returns Compressed clone of the data structure.
 */
export const compressKeys = <T = unknown>(data: T, customMap?: Record<string, string>): unknown => {
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
 * Recursively restores original object keys from compressed forms.
 *
 * @param data Compressed object or array.
 * @param customReverseMap Optional dictionary override.
 * @returns Object with original keys restored.
 */
export const decompressKeys = <T = unknown>(
    data: unknown,
    customReverseMap?: Record<string, string>,
): T => {
    if (data === null || data === undefined) {
        return data as T;
    }

    if (Array.isArray(data)) {
        return data.map((item) => decompressKeys(item, customReverseMap)) as unknown as T;
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
 * Serializes payload into a compact JSON string with compressed keys.
 *
 * @param payload Data payload.
 * @param customMap Optional key mapping dictionary.
 * @returns Compact JSON string.
 */
export const packPayload = (payload: unknown, customMap?: Record<string, string>): string => {
    const compressed = compressKeys(payload, customMap);
    return JSON.stringify(compressed);
};

/**
 * Parses compact JSON string and restores original object keys.
 *
 * @param raw Compact JSON string.
 * @param customReverseMap Optional key mapping dictionary.
 * @returns Parsed object with full property names.
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
 * Serializes widget state (chat_data / public_data) with key compression
 * and the screen identifier token.
 *
 * @param screenId Target screen identifier.
 * @param state State data object.
 * @param customMap Optional key mapping dictionary.
 * @returns Compact string representation for Telegram API.
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
 * Unpacks widget state from chat_data / public_data string and resolves screenId.
 *
 * @param rawState Raw chat_data string from Telegram.
 * @param customReverseMap Optional key mapping dictionary.
 * @returns Clean state object and screenId.
 */
export const unpackState = <T = Record<string, unknown>>(
    rawState: string | null | undefined,
    customReverseMap?: Record<string, string>,
): { screenId?: string; state: T } => {
    if (!rawState || typeof rawState !== 'string') {
        return { state: {} as T };
    }

    const decompressed = unpackPayload<Record<string, unknown>>(rawState, customReverseMap);
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
 * Lightweight client script snippet (< 300 B) for embedding into inline `<script>`,
 * providing client-side QuickJS code with transparent state compression helpers.
 */
export const CLIENT_CODEC_SNIPPET =
    'var __KM=' +
    JSON.stringify(DEFAULT_KEY_MAP) +
    ';var __RM=Object.fromEntries(Object.entries(__KM).map(([k,v])=>[v,k]));' +
    'window.packState=function(o){return JSON.stringify(Object.fromEntries(Object.entries(o).map(([k,v])=>[__KM[k]||k,v])));};' +
    'window.unpackState=function(s){var o=typeof s==="string"?JSON.parse(s):s;return Object.fromEntries(Object.entries(o).map(([k,v])=>[__RM[k]||k,v]));};';
