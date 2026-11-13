import type { TelegramWidgetQueryPayload } from './types';

/**
 * Derives a consistent storage key string from chat, message, or inline message identifiers.
 *
 * @param chatId Chat ID.
 * @param messageId Message ID in chat.
 * @param inlineMessageId Inline message identifier if sent via inline query.
 * @returns Storage key string, or undefined if insufficient identifiers are present.
 */
export const getStorageKey = (
    chatId?: number | string,
    messageId?: number,
    inlineMessageId?: string,
): string | undefined => {
    if (inlineMessageId) {
        return `inline:${inlineMessageId}`;
    }
    if (chatId !== undefined && messageId !== undefined) {
        return `${chatId}:${messageId}`;
    }
    return undefined;
};

export interface ResolvedQueryContext {
    chatId?: number;
    messageId?: number;
    inlineMessageId?: string;
    storageKey?: string;
}

/**
 * Extracts and normalizes target chat, message, or inline IDs from a widget query.
 */
export const extractQueryContext = (query: TelegramWidgetQueryPayload): ResolvedQueryContext => {
    const chatId = query.chat?.id ?? query.message?.chat?.id;
    const messageId = query.message_id ?? query.message?.message_id;
    const inlineMessageId = query.inline_message_id;
    const storageKey = getStorageKey(chatId, messageId, inlineMessageId);
    return { chatId, messageId, inlineMessageId, storageKey };
};

const storageQueues = new Map<string, Promise<unknown>>();

/**
 * Enforces serial execution of concurrent actions targeting the exact same storage key.
 */
export const serializeByStorageKey = async <T>(key: string, task: () => Promise<T>): Promise<T> => {
    const prev = storageQueues.get(key) ?? Promise.resolve();
    let resolveTask: () => void;
    const taskPromise = new Promise<void>((r) => (resolveTask = r));
    const chained = prev.finally(() => taskPromise);
    storageQueues.set(key, chained);
    try {
        await prev;
        return await task();
    } finally {
        resolveTask!();
        if (storageQueues.get(key) === chained) storageQueues.delete(key);
    }
};
