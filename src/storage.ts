export interface WidgetScreenRecord<TState = Record<string, unknown>> {
    screenId: string;
    state: TState;
    updatedAt: number;
}

/**
 * Интерфейс подключаемого хранилища активных состояний виджетов.
 * Позволяет использовать распределенные базы (Redis, SQLite, Postgres, grammY Sessions)
 * вместо локального Map в памяти.
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
     * Максимальное количество активных записей в памяти.
     * При превышении старые записи удаляются (LRU-стратегия).
     * @default 10000
     */
    maxEntries?: number;

    /**
     * Время жизни записи по умолчанию в секундах.
     * По умолчанию: 86400 (24 часа)
     * @default 86400
     */
    defaultTtlSeconds?: number;
}

interface MemoryEntry {
    record: WidgetScreenRecord;
    expiresAt?: number;
}

/**
 * Дефолтное хранилище состояний в памяти процесса с поддержкой TTL и защитой от переполнения (LRU).
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

        // Проверка истечения TTL
        if (item.expiresAt !== undefined && Date.now() > item.expiresAt) {
            this.entries.delete(key);
            return undefined;
        }

        // Обновляем позицию для LRU (удаляем и вставляем заново в конец Map)
        this.entries.delete(key);
        this.entries.set(key, item);

        return item.record;
    }

    public set(
        key: string,
        value: WidgetScreenRecord,
        ttlSeconds?: number,
    ): void {
        // Удаляем старый ключ, если был
        this.entries.delete(key);

        // Контроль максимального размера Map
        if (this.entries.size >= this.maxEntries) {
            // Удаляем самую старую запись (первый ключ в итераторе Map)
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
