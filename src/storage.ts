export interface WidgetScreenRecord<TState = Record<string, unknown>> {
    screenId: string;
    state: TState;
    updatedAt: number;
}

/**
 * Pluggable storage adapter interface for managing widget state records across messages.
 * Allows using external databases (Redis, SQLite, Postgres, grammY Sessions)
 * instead of in-memory caching.
 */
export interface WidgetsStorage {
    get(
        key: string,
    ):
        | Promise<WidgetScreenRecord | undefined>
        | WidgetScreenRecord
        | undefined;
    set(
        key: string,
        value: WidgetScreenRecord,
        ttlSeconds?: number,
    ): Promise<void> | void;
    delete(key: string): Promise<void> | void;
    has?(key: string): Promise<boolean> | boolean;
    clear?(): Promise<void> | void;
}

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

    constructor(options?: MemoryWidgetsStorageOptions) {
        this.maxEntries = options?.maxEntries ?? 10_000;
        const ttlSec = options?.defaultTtlSeconds ?? 86_400;
        this.defaultTtlMs = ttlSec * 1000;
    }

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

    public set(
        key: string,
        value: WidgetScreenRecord,
        ttlSeconds?: number,
    ): void {
        this.entries.delete(key);

        // Enforce max entry limit by evicting oldest item
        if (this.entries.size >= this.maxEntries) {
            const oldestKey = this.entries.keys().next().value;
            if (oldestKey !== undefined) {
                this.entries.delete(oldestKey);
            }
        }

        const ttlMs =
            ttlSeconds !== undefined ? ttlSeconds * 1000 : this.defaultTtlMs;
        const expiresAt = ttlMs > 0 ? Date.now() + ttlMs : undefined;

        this.entries.set(key, {
            record: value,
            expiresAt,
        });
    }

    public delete(key: string): void {
        this.entries.delete(key);
    }

    public has(key: string): boolean {
        return this.get(key) !== undefined;
    }

    public clear(): void {
        this.entries.clear();
    }

    public get size(): number {
        return this.entries.size;
    }
}
