import { describe, expect, it } from 'bun:test';
import { MemoryWidgetsStorage, type WidgetsStorage, type WidgetScreenRecord } from '../src/storage';

describe('Storage Module', () => {
    describe('MemoryWidgetsStorage - Basic operations', () => {
        it('should store, retrieve, check existence, and delete records', () => {
            const storage = new MemoryWidgetsStorage();

            expect(storage.size).toBe(0);
            expect(storage.get('msg:1')).toBeUndefined();
            expect(storage.has('msg:1')).toBe(false);

            const record: WidgetScreenRecord = {
                screenId: 'counter-screen',
                state: { count: 42 },
                updatedAt: Date.now(),
            };

            storage.set('msg:1', record);
            expect(storage.size).toBe(1);
            expect(storage.has('msg:1')).toBe(true);

            const retrieved = storage.get('msg:1');
            expect(retrieved).toBeDefined();
            expect(retrieved?.screenId).toBe('counter-screen');
            expect(retrieved?.state).toEqual({ count: 42 });

            storage.delete('msg:1');
            expect(storage.size).toBe(0);
            expect(storage.has('msg:1')).toBe(false);
            expect(storage.get('msg:1')).toBeUndefined();
        });

        it('should clear all stored records', () => {
            const storage = new MemoryWidgetsStorage();

            storage.set('a', { screenId: 's1', state: {}, updatedAt: 1 });
            storage.set('b', { screenId: 's2', state: {}, updatedAt: 2 });
            storage.set('c', { screenId: 's3', state: {}, updatedAt: 3 });

            expect(storage.size).toBe(3);
            storage.clear();
            expect(storage.size).toBe(0);
            expect(storage.get('a')).toBeUndefined();
            expect(storage.get('b')).toBeUndefined();
            expect(storage.get('c')).toBeUndefined();
        });

        it('should overwrite existing records with updated data', () => {
            const storage = new MemoryWidgetsStorage();

            storage.set('msg:10', { screenId: 'old', state: { val: 1 }, updatedAt: 100 });
            expect(storage.size).toBe(1);
            expect(storage.get('msg:10')?.screenId).toBe('old');

            storage.set('msg:10', { screenId: 'new', state: { val: 2 }, updatedAt: 200 });
            expect(storage.size).toBe(1);
            expect(storage.get('msg:10')?.screenId).toBe('new');
            expect(storage.get('msg:10')?.state).toEqual({ val: 2 });
        });
    });

    describe('MemoryWidgetsStorage - LRU Eviction', () => {
        it('should evict the oldest entry when exceeding maxEntries', () => {
            const storage = new MemoryWidgetsStorage({ maxEntries: 3 });

            storage.set('k1', { screenId: 's1', state: {}, updatedAt: 1 });
            storage.set('k2', { screenId: 's2', state: {}, updatedAt: 2 });
            storage.set('k3', { screenId: 's3', state: {}, updatedAt: 3 });

            expect(storage.size).toBe(3);
            expect(storage.has('k1')).toBe(true);
            expect(storage.has('k2')).toBe(true);
            expect(storage.has('k3')).toBe(true);

            // Adding k4 should evict k1 (oldest)
            storage.set('k4', { screenId: 's4', state: {}, updatedAt: 4 });
            expect(storage.size).toBe(3);
            expect(storage.has('k1')).toBe(false);
            expect(storage.has('k2')).toBe(true);
            expect(storage.has('k3')).toBe(true);
            expect(storage.has('k4')).toBe(true);
        });

        it('should refresh LRU order on get', () => {
            const storage = new MemoryWidgetsStorage({ maxEntries: 3 });

            storage.set('k1', { screenId: 's1', state: {}, updatedAt: 1 });
            storage.set('k2', { screenId: 's2', state: {}, updatedAt: 2 });
            storage.set('k3', { screenId: 's3', state: {}, updatedAt: 3 });

            // Accessing k1 makes it recently used; now k2 is the oldest!
            const k1 = storage.get('k1');
            expect(k1?.screenId).toBe('s1');

            // Insert k4 -> should evict k2
            storage.set('k4', { screenId: 's4', state: {}, updatedAt: 4 });
            expect(storage.has('k1')).toBe(true);
            expect(storage.has('k2')).toBe(false);
            expect(storage.has('k3')).toBe(true);
            expect(storage.has('k4')).toBe(true);
        });
    });

    describe('MemoryWidgetsStorage - TTL Expiration', () => {
        it('should expire records after custom TTL in seconds', async () => {
            const storage = new MemoryWidgetsStorage();

            // Set with 0.05 seconds (50ms) TTL
            storage.set(
                'temp:1',
                { screenId: 'expiring', state: { count: 1 }, updatedAt: Date.now() },
                0.05,
            );

            expect(storage.has('temp:1')).toBe(true);
            expect(storage.get('temp:1')).toBeDefined();

            // Wait for expiration
            await new Promise((resolve) => setTimeout(resolve, 70));

            expect(storage.get('temp:1')).toBeUndefined();
            expect(storage.has('temp:1')).toBe(false);
            expect(storage.size).toBe(0);
        });

        it('should expire records based on defaultTtlSeconds', async () => {
            const storage = new MemoryWidgetsStorage({ defaultTtlSeconds: 0.04 });

            storage.set('temp:default', {
                screenId: 'default-exp',
                state: {},
                updatedAt: Date.now(),
            });

            expect(storage.has('temp:default')).toBe(true);

            await new Promise((resolve) => setTimeout(resolve, 60));

            expect(storage.get('temp:default')).toBeUndefined();
            expect(storage.has('temp:default')).toBe(false);
        });

        it('should not expire records when ttl is 0 (persistent)', async () => {
            const storage = new MemoryWidgetsStorage({ defaultTtlSeconds: 0 });

            storage.set('persistent:1', {
                screenId: 'perm',
                state: {},
                updatedAt: Date.now(),
            });

            await new Promise((resolve) => setTimeout(resolve, 50));

            expect(storage.has('persistent:1')).toBe(true);
            expect(storage.get('persistent:1')).toBeDefined();
        });
    });

    describe('Custom WidgetsStorage implementation', () => {
        it('should support asynchronous external database adapters', async () => {
            class AsyncMockDbStorage implements WidgetsStorage {
                private store = new Map<string, WidgetScreenRecord>();

                async get(key: string): Promise<WidgetScreenRecord | undefined> {
                    await new Promise((r) => setTimeout(r, 5));
                    return this.store.get(key);
                }

                async set(key: string, value: WidgetScreenRecord): Promise<void> {
                    await new Promise((r) => setTimeout(r, 5));
                    this.store.set(key, value);
                }

                async delete(key: string): Promise<void> {
                    await new Promise((r) => setTimeout(r, 5));
                    this.store.delete(key);
                }

                async has(key: string): Promise<boolean> {
                    await new Promise((r) => setTimeout(r, 5));
                    return this.store.has(key);
                }

                async clear(): Promise<void> {
                    await new Promise((r) => setTimeout(r, 5));
                    this.store.clear();
                }
            }

            const db = new AsyncMockDbStorage();
            await db.set('chat:100:msg:200', {
                screenId: 'async-screen',
                state: { connected: true },
                updatedAt: Date.now(),
            });

            const exists = await db.has?.('chat:100:msg:200');
            expect(exists).toBe(true);

            const record = await db.get('chat:100:msg:200');
            expect(record?.screenId).toBe('async-screen');
            expect(record?.state).toEqual({ connected: true });

            await db.delete('chat:100:msg:200');
            const afterDelete = await db.get('chat:100:msg:200');
            expect(afterDelete).toBeUndefined();
        });
    });
});
