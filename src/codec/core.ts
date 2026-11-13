import { DEFAULT_KEY_MAP, REVERSE_KEY_MAP } from './dictionary';

/**
 * Registers domain-specific key mappings into the codec.
 *
 * @param mappings Custom long-to-short key mapping pairs.
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
