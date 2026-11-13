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
