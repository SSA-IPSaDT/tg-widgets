/**
 * Telegram Widgets Action Codec and Serializer.
 *
 * Implements compact action and payload encoding designed to fit inside
 * Telegram Bot API 10.4's strict 64-byte `update.widget_query.data` ceiling.
 *
 * @module action
 */

import { Buffer } from 'node:buffer';
import { compressKeys, decompressKeys } from './codec';

/**
 * Parsed widget action representation consisting of an action identifier and optional payload.
 */
export interface DecodedWidgetAction {
    /**
     * Unique action identifier (e.g. 'toggle', 'increment', 'navigate').
     */
    action: string;
    /**
     * Optional parsed primitive or structured object payload.
     */
    payload?: unknown;
}

/**
 * Options configuring action serialization.
 */
export interface EncodeWidgetActionOptions {
    /**
     * Enables automatic shortening of object keys via bidirectional codec dictionary (default: false).
     */
    compress?: boolean;
    /**
     * Custom dictionary map of long key names to single-letter codes.
     */
    customMap?: Record<string, string>;
}

/**
 * Options configuring action deserialization.
 */
export interface DecodeWidgetActionOptions {
    /**
     * Enables automatic decompression of shortened single-letter keys (default: false).
     */
    decompress?: boolean;
    /**
     * Custom reverse dictionary map of single-letter codes back to long key names.
     */
    customReverseMap?: Record<string, string>;
}

/**
 * Maximum byte length permitted for `update.widget_query.data` by Telegram Bot API specification (64 bytes).
 */
export const TELEGRAM_MAX_WIDGET_QUERY_DATA_BYTES = 64;

/**
 * Validates action string byte length according to Telegram Bot API specification (1-64 bytes UTF-8).
 *
 * @param data Raw action string to validate.
 * @returns True if length is within 1 to 64 bytes.
 *
 * @example
 * validateWidgetActionData('increment') // true
 * validateWidgetActionData('x'.repeat(65)) // false
 */
export const validateWidgetActionData = (data: string): boolean => {
    const bytes = Buffer.byteLength(data, 'utf-8');
    return bytes >= 1 && bytes <= TELEGRAM_MAX_WIDGET_QUERY_DATA_BYTES;
};

/**
 * Serializes an action and optional payload into a compact string fitting within the 64-byte limit.
 * Uses a concise `:` delimiter to minimize byte overhead.
 * When `options.compress = true`, shortens object keys down to single letters via bidirectional codec.
 *
 * @param action Action name identifier.
 * @param payload Optional primitive or JSON-serializable payload.
 * @param options Optional compression settings.
 * @returns Formatted query data string.
 *
 * @example
 * encodeWidgetAction('increment') // -> 'increment'
 * encodeWidgetAction('set', 42) // -> 'set:42'
 * encodeWidgetAction('view', { tab: 'info' }) // -> 'view:{"tab":"info"}'
 * encodeWidgetAction('toggle', { setting: 'notifications' }, { compress: true })
 */
export const encodeWidgetAction = (
    action: string,
    payload?: unknown,
    options?: EncodeWidgetActionOptions,
): string => {
    let result = action;

    if (payload !== undefined && payload !== null) {
        let serialized: string;
        if (
            typeof payload === 'string' ||
            typeof payload === 'number' ||
            typeof payload === 'boolean'
        ) {
            serialized = String(payload);
        } else {
            const dataToSerialize = options?.compress
                ? compressKeys(payload, options?.customMap)
                : payload;
            serialized = JSON.stringify(dataToSerialize);
        }
        result = `${action}:${serialized}`;
    }

    const byteLen = Buffer.byteLength(result, 'utf-8');
    if (byteLen > TELEGRAM_MAX_WIDGET_QUERY_DATA_BYTES) {
        console.warn(
            `⚠️ [telegram-widgets] Encoded action "${result}" is ${byteLen} bytes, which exceeds Telegram limit of 64 bytes!`,
        );
    }

    return result;
};

/**
 * Serializes an action with automatic payload object key compression.
 *
 * @param action Action name identifier.
 * @param payload Object payload to compress.
 * @param customMap Optional key mapping overrides.
 * @returns Encoded and compressed string.
 */
export const encodeCompressedWidgetAction = (
    action: string,
    payload?: unknown,
    customMap?: Record<string, string>,
): string => {
    return encodeWidgetAction(action, payload, { compress: true, customMap });
};

/**
 * Parses incoming query.data string from Telegram update.widget_query (up to 64 bytes).
 * Automatically decompresses shortened keys back into human-readable property names.
 *
 * Supported formats:
 * 1. Plain action identifier: 'increment'
 * 2. Delimited action with payload: 'set:42' -> { action: 'set', payload: 42 }
 * 3. JSON format: '{"action":"inc","payload":1}' or '{"a":"inc","p":1}'
 * 4. Compressed delimiter: 'toggle:{"g":"o"}' -> { action: 'toggle', payload: { setting: 'notifications' } }
 *
 * @param data Raw query data string.
 * @param options Decompression options.
 * @returns Decoded action object.
 */
export const decodeWidgetAction = (
    data: string,
    options?: DecodeWidgetActionOptions,
): DecodedWidgetAction => {
    const trimmed = data.trim();

    if (!trimmed) {
        return { action: '' };
    }

    // Support JSON format (full keys or shortened a/p keys)
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
            const parsed = JSON.parse(trimmed);
            const decompressed =
                options?.decompress === false
                    ? parsed
                    : (decompressKeys(parsed, options?.customReverseMap) as Record<
                          string,
                          unknown
                      >);

            const action = (decompressed.action as string) ?? (decompressed.a as string) ?? '';
            const payload = decompressed.payload ?? decompressed.p;

            return {
                action,
                payload,
            };
        } catch {
            // Fallback to delimited parsing
        }
    }

    // Support delimited 'action:payload' format
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx !== -1) {
        const action = trimmed.slice(0, colonIdx);
        const rawPayload = trimmed.slice(colonIdx + 1);

        // Parse primitives (booleans, null, numbers, JSON)
        if (rawPayload === 'true') {
            return { action, payload: true };
        }
        if (rawPayload === 'false') {
            return { action, payload: false };
        }
        if (rawPayload === 'null') {
            return { action, payload: null };
        }
        if (/^-?\d+(\.\d+)?$/.test(rawPayload)) {
            return { action, payload: Number(rawPayload) };
        }

        if (
            (rawPayload.startsWith('{') && rawPayload.endsWith('}')) ||
            (rawPayload.startsWith('[') && rawPayload.endsWith(']'))
        ) {
            try {
                const parsed = JSON.parse(rawPayload);
                const decompressed =
                    options?.decompress === false
                        ? parsed
                        : decompressKeys(parsed, options?.customReverseMap);
                return { action, payload: decompressed };
            } catch {}
        }

        return { action, payload: rawPayload };
    }

    return { action: trimmed };
};
