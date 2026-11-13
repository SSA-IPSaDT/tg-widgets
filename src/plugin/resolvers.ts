import { MemoryWidgetsStorage, type WidgetsStorage } from '../storage';
import type { StorageOptions, WidgetsLogger } from './types';

export const defaultLogger: WidgetsLogger = {
    info: (msg, ...args) => console.log(`[telegram-widgets] ${msg}`, ...args),
    warn: (msg, ...args) => console.warn(`[telegram-widgets] ${msg}`, ...args),
    error: (msg, ...args) => console.error(`[telegram-widgets] ${msg}`, ...args),
};

export const resolveLogger = (
    loggerOption?: WidgetsLogger | 'silent' | 'debug' | 'verbose' | boolean,
    debugOption?: boolean,
): WidgetsLogger => {
    if (loggerOption === false || loggerOption === 'silent') {
        return { info: () => {}, warn: () => {}, error: () => {} };
    }
    if (
        loggerOption === true ||
        loggerOption === 'debug' ||
        loggerOption === 'verbose' ||
        debugOption === true
    ) {
        return {
            info: (msg, ...args) => console.log(`[telegram-widgets:debug] ${msg}`, ...args),
            warn: (msg, ...args) => console.warn(`[telegram-widgets:warn] ${msg}`, ...args),
            error: (msg, ...args) => console.error(`[telegram-widgets:error] ${msg}`, ...args),
        };
    }
    if (loggerOption && typeof loggerOption === 'object' && 'info' in loggerOption) {
        return loggerOption;
    }
    return defaultLogger;
};

export const resolveStorage = (storageOption?: WidgetsStorage | StorageOptions): WidgetsStorage => {
    if (storageOption && typeof (storageOption as WidgetsStorage).get === 'function') {
        return storageOption as WidgetsStorage;
    }
    if (storageOption && typeof storageOption === 'object') {
        const storageOpts = storageOption as StorageOptions;
        return new MemoryWidgetsStorage({
            defaultTtlSeconds: storageOpts.defaultTtlSeconds,
            maxEntries: storageOpts.maxEntries,
        });
    }
    return new MemoryWidgetsStorage();
};
