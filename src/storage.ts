/**
 * Telegram Widgets State Storage Adapters.
 *
 * Implements in-memory and pluggable persistent storage backends
 * for saving and updating dynamic widget state across user interactions.
 *
 * @module storage
 */

/**
 * Persisted state record stored for a dynamic widget screen instance.
 */
export interface WidgetScreenRecord<TState = Record<string, unknown>> {
    /**
     * Unique identifier of the registered widget screen definition.
     */
    screenId: string;
    /**
     * Arbitrary application state payload associated with this widget instance.
     */
    state: TState;
    /**
     * Unix timestamp (in milliseconds) of the most recent state mutation.
     */
    updatedAt: number;
}

/**
 * Pluggable storage adapter interface for managing widget state records across messages.
 * Allows using external databases (Redis, SQLite, Postgres, grammY Sessions)
 * instead of in-memory caching.
 */
export interface WidgetsStorage {
    /**
     * Retrieves an active state record by composite storage key (e.g. "chatId:messageId").
     *
     * @param key Unique record key.
     * @returns The stored record or undefined if not found or expired.
     */
    get(key: string): Promise<WidgetScreenRecord | undefined> | WidgetScreenRecord | undefined;

    /**
     * Stores or updates a widget state record with an optional time-to-live.
     *
     * @param key Unique record key.
     * @param value State record payload.
     * @param ttlSeconds Optional expiration timeout in seconds.
     */
    set(key: string, value: WidgetScreenRecord, ttlSeconds?: number): Promise<void> | void;

    /**
     * Deletes a record from storage.
     *
     * @param key Unique record key to remove.
     */
    delete(key: string): Promise<void> | void;

    /**
     * Checks if a non-expired record exists for the given key.
     *
     * @param key Unique record key.
     * @returns True if present and valid.
     */
    has?(key: string): Promise<boolean> | boolean;

    /**
     * Removes all stored records from the storage backend.
     */
    clear?(): Promise<void> | void;
}

/**
 * Options configuring the default in-memory LRU widget storage.
 */
export interface MemoryWidgetsStorageOptions {
    /**
     * Maximum number of active entries allowed in memory.
     * When reached, least-recently-used (LRU) records are evicted.
     * @default 10000
     */
    maxEntries?: number;

    /**
     * Default record time-to-live (TTL) in seconds.
     * @default 86400 (24 hours)
     */
    defaultTtlSeconds?: number;
}

interface MemoryEntry {
    record: WidgetScreenRecord;
    expiresAt?: number;
}

/**
 * In-memory storage implementation featuring LRU eviction and TTL expiration.
 *
 * @example
 * const storage = new MemoryWidgetsStorage({ maxEntries: 5000, defaultTtlSeconds: 3600 });
 */
export class MemoryWidgetsStorage implements WidgetsStorage {
    private readonly entries = new Map<string, MemoryEntry>();
    private readonly maxEntries: number;
    private readonly defaultTtlMs: number;

    /**
     * Creates an in-memory widget storage instance.
     *
     * @param options Storage configuration options.
     */
    constructor(options?: MemoryWidgetsStorageOptions) {
        this.maxEntries = options?.maxEntries ?? 10_000;
        const ttlSec = options?.defaultTtlSeconds ?? 86_400;
        this.defaultTtlMs = ttlSec * 1000;
    }

    /**
     * Retrieves an active state record from memory, refreshing LRU recency.
     *
     * @param key Storage key.
     * @returns The record or undefined if missing or expired.
     */
    public get(key: string): WidgetScreenRecord | undefined {
        const item = this.entries.get(key);
        if (!item) {
            return undefined;
        }

        // Verify TTL expiration
        if (item.expiresAt !== undefined && Date.now() > item.expiresAt) {
            this.entries.delete(key);
            return undefined;
        }

        // Refresh LRU ordering by reinserting the key at the end
        this.entries.delete(key);
        this.entries.set(key, item);

        return item.record;
    }

    /**
     * Stores a record in memory, evicting the least-recently-used record if capacity is reached.
     *
     * @param key Storage key.
     * @param value State record payload.
     * @param ttlSeconds Expiration time in seconds.
     */
    public set(key: string, value: WidgetScreenRecord, ttlSeconds?: number): void {
        this.entries.delete(key);

        // Enforce max entry limit by evicting oldest item
        if (this.entries.size >= this.maxEntries) {
            const oldestKey = this.entries.keys().next().value;
            if (oldestKey !== undefined) {
                this.entries.delete(oldestKey);
            }
        }

        const ttlMs = ttlSeconds !== undefined ? ttlSeconds * 1000 : this.defaultTtlMs;
        const expiresAt = ttlMs > 0 ? Date.now() + ttlMs : undefined;

        this.entries.set(key, {
            record: value,
            expiresAt,
        });
    }

    /**
     * Removes a state record from memory.
     *
     * @param key Storage key to remove.
     */
    public delete(key: string): void {
        this.entries.delete(key);
    }

    /**
     * Checks if a valid, non-expired record exists.
     *
     * @param key Storage key.
     * @returns True if active.
     */
    public has(key: string): boolean {
        return this.get(key) !== undefined;
    }

    /**
     * Clears all stored records from memory.
     */
    public clear(): void {
        this.entries.clear();
    }

    /**
     * Current count of active entries in memory.
     */
    public get size(): number {
        return this.entries.size;
    }
}
