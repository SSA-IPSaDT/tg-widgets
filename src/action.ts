import { Buffer } from 'node:buffer';

export interface DecodedWidgetAction {
    action: string;
    payload?: unknown;
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
 *
 * @example
 * encodeWidgetAction('increment') // -> 'increment'
 * encodeWidgetAction('set', 42) // -> 'set:42'
 * encodeWidgetAction('view', { tab: 'info' }) // -> 'view:{"tab":"info"}'
 */
export const encodeWidgetAction = (
    action: string,
    payload?: unknown,
): string => {
    let result = action;

    if (payload !== undefined && payload !== null) {
        const serialized =
            typeof payload === 'string' ||
            typeof payload === 'number' ||
            typeof payload === 'boolean'
                ? String(payload)
                : JSON.stringify(payload);
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
 * Парсит входящую строку query.data из Telegram WidgetQuery (до 64 байт).
 * Поддерживает форматы:
 * 1. Имя экшена: 'increment'
 * 2. Разделитель с пейлоудом: 'set:42' -> { action: 'set', payload: 42 }
 * 3. JSON формат: '{"action":"inc","payload":1}'
 */
export const decodeWidgetAction = (data: string): DecodedWidgetAction => {
    const trimmed = data.trim();

    if (!trimmed) {
        return { action: '' };
    }

    // Поддержка JSON формата
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
            const parsed = JSON.parse(trimmed);
            return {
                action: parsed.action ?? '',
                payload: parsed.payload,
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
                return { action, payload: JSON.parse(rawPayload) };
            } catch {}
        }

        return { action, payload: rawPayload };
    }

    return { action: trimmed };
};
