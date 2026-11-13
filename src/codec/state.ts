import { compressKeys, decompressKeys } from './core';

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
