import { Buffer } from 'node:buffer';
import { compressKeys, decompressKeys } from './codec';

export interface DecodedWidgetAction {
    action: string;
    payload?: unknown;
}

export interface EncodeWidgetActionOptions {
    compress?: boolean;
    customMap?: Record<string, string>;
}

export interface DecodeWidgetActionOptions {
    decompress?: boolean;
    customReverseMap?: Record<string, string>;
}

export const TELEGRAM_MAX_WIDGET_QUERY_DATA_BYTES = 64;

/**
 * Валидирует размер строки действия в байтах UTF-8 согласно спецификации Telegram (1-64 байт)
 */
export const validateWidgetActionData = (data: string): boolean => {
    const bytes = Buffer.byteLength(data, 'utf-8');
    return bytes >= 1 && bytes <= TELEGRAM_MAX_WIDGET_QUERY_DATA_BYTES;
};

/**
 * Компактно сериализует экшен и полезную нагрузку в строку до 64 байт.
 * Использует компактный разделитель `:` для максимальной экономии байтов.
 * При `options.compress = true` (или через `encodeCompressedWidgetAction`)
 * сворачивает ключи объекта до 1-2 букв через кодек.
 *
 * @example
 * encodeWidgetAction('increment') // -> 'increment'
 * encodeWidgetAction('set', 42) // -> 'set:42'
 * encodeWidgetAction('view', { tab: 'info' }) // -> 'view:{"tab":"info"}'
 * encodeWidgetAction('toggle', { setting: 'notifications' }, { compress: true }) // -> 'toggle:{"g":"o"}'
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
 * Сериализует действие с обязательным сжатием ключей полезной нагрузки до 1 буквы
 */
export const encodeCompressedWidgetAction = (
    action: string,
    payload?: unknown,
    customMap?: Record<string, string>,
): string => {
    return encodeWidgetAction(action, payload, { compress: true, customMap });
};

/**
 * Парсит входящую строку query.data из Telegram WidgetQuery (до 64 байт).
 * Автоматически распаковывает сжатые ключи через обратный словарь кодека.
 *
 * Поддерживает форматы:
 * 1. Имя экшена: 'increment'
 * 2. Разделитель с пейлоудом: 'set:42' -> { action: 'set', payload: 42 }
 * 3. JSON формат: '{"action":"inc","payload":1}' или '{"a":"inc","p":1}'
 * 4. Сжатый разделитель: 'toggle:{"g":"o"}' -> { action: 'toggle', payload: { setting: 'notifications' } }
 */
export const decodeWidgetAction = (
    data: string,
    options?: DecodeWidgetActionOptions,
): DecodedWidgetAction => {
    const trimmed = data.trim();

    if (!trimmed) {
        return { action: '' };
    }

    // Поддержка JSON формата (полного и сокращенного a/p)
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
            const parsed = JSON.parse(trimmed);
            const decompressed =
                options?.decompress === false
                    ? parsed
                    : (decompressKeys(
                          parsed,
                          options?.customReverseMap,
                      ) as Record<string, unknown>);

            const action =
                (decompressed.action as string) ??
                (decompressed.a as string) ??
                '';
            const payload = decompressed.payload ?? decompressed.p;

            return {
                action,
                payload,
            };
        } catch {
            // Фолбэк на строковый парсинг
        }
    }

    // Поддержка формата с разделителем 'action:payload'
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx !== -1) {
        const action = trimmed.slice(0, colonIdx);
        const rawPayload = trimmed.slice(colonIdx + 1);

        // Попытка спарсить примитивы (числа, булевы, JSON)
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
