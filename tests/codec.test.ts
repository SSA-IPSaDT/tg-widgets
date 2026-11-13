import { describe, expect, test } from 'bun:test';
import {
    CLIENT_CODEC_SNIPPET,
    compressKeys,
    decompressKeys,
    decodeWidgetAction,
    encodeCompressedWidgetAction,
    encodeWidgetAction,
    packPayload,
    packState,
    registerCodecKeys,
    unpackPayload,
    unpackState,
    validateWidgetActionData,
} from '../src';

describe('Bidirectional Codec & 64-byte Action Protocol', () => {
    describe('compressKeys & decompressKeys', () => {
        test('compresses standard known keys down to 1-2 letters', () => {
            const original = {
                notifications: true,
                newsletter: false,
                plan: 'pro',
                tickets: 5,
                count: 42,
            };

            const compressed = compressKeys(original);
            expect(compressed).toHaveProperty('o', true); // notifications -> o
            expect(compressed).toHaveProperty('w', false); // newsletter -> w
            expect(compressed).toHaveProperty('l', 'pro'); // plan -> l
            expect(compressed).toHaveProperty('k', 5); // tickets -> k
            expect(compressed).toHaveProperty('c', 42); // count -> c
        });

        test('decompresses keys back to full property names', () => {
            const compressed = {
                o: true,
                w: false,
                l: 'enterprise',
                k: 10,
                c: 99,
            };

            const decompressed = decompressKeys(compressed);
            expect(decompressed).toEqual({
                notifications: true,
                newsletter: false,
                plan: 'enterprise',
                tickets: 10,
                count: 99,
            });
        });

        test('recursively compresses and decompresses deeply nested objects', () => {
            const nested = {
                plan: 'premium',
                meta: {
                    notifications: true,
                    tickets: 2,
                    config: {
                        count: 100,
                    },
                },
            };

            const compressed = compressKeys(nested);
            expect(compressed).toEqual({
                l: 'premium',
                meta: {
                    o: true,
                    k: 2,
                    config: {
                        c: 100,
                    },
                },
            });

            const restored = decompressKeys(compressed);
            expect(restored).toEqual(nested);
        });

        test('compresses objects inside arrays', () => {
            const list = [
                { plan: 'free', count: 1 },
                { plan: 'pro', count: 5 },
            ];

            const compressed = compressKeys(list) as Record<string, unknown>[];
            expect(compressed[0]).toEqual({ l: 'free', c: 1 });
            expect(compressed[1]).toEqual({ l: 'pro', c: 5 });

            const restored = decompressKeys(compressed);
            expect(restored).toEqual(list);
        });

        test('preserves unknown keys without modification', () => {
            const data = {
                customPropertyXYZ: 12345,
                mySecretKey: 'hello',
                plan: 'basic',
            };

            const compressed = compressKeys(data);
            expect(compressed).toHaveProperty('customPropertyXYZ', 12345);
            expect(compressed).toHaveProperty('mySecretKey', 'hello');
            expect(compressed).toHaveProperty('l', 'basic');

            const restored = decompressKeys(compressed);
            expect(restored).toEqual(data);
        });

        test('handles primitives, null, and undefined safely', () => {
            expect(compressKeys(null as any)).toBe(null);
            expect(compressKeys(undefined as any)).toBe(undefined);
            expect(compressKeys('string' as any)).toBe('string');
            expect(compressKeys(123 as any)).toBe(123);
        });

        test('supports dynamic custom key registration via registerCodecKeys', () => {
            registerCodecKeys({
                transactionHash: 'tx',
                cryptoCurrency: 'cr',
                walletAddress: 'wa',
            });

            const transaction = {
                transactionHash: '0x123abc',
                cryptoCurrency: 'TON',
                walletAddress: 'EQB...',
                count: 1,
            };

            const customMap = {
                transactionHash: 'tx',
                cryptoCurrency: 'cr',
                walletAddress: 'wa',
            };
            const reverseMap = {
                tx: 'transactionHash',
                cr: 'cryptoCurrency',
                wa: 'walletAddress',
            };

            const compressed = compressKeys(transaction, customMap);
            expect(compressed).toEqual({
                tx: '0x123abc',
                cr: 'TON',
                wa: 'EQB...',
                c: 1,
            });

            const restored = decompressKeys(compressed, reverseMap);
            expect(restored).toEqual(transaction);
        });
    });

    describe('packState & unpackState', () => {
        test('packs screen ID and state into compact string representation', () => {
            const packed = packState('dashboard', {
                notifications: true,
                count: 5,
            });

            expect(typeof packed).toBe('string');
            expect(packed).toContain('"_s":"dashboard"');
            expect(packed).toContain('"o":true');
            expect(packed).toContain('"c":5');
        });

        test('unpacks compressed state string accurately', () => {
            const rawJson = JSON.stringify({
                _s: 'profile',
                o: false,
                c: 77,
            });

            const unpacked = unpackState(rawJson);
            expect(unpacked.screenId).toBe('profile');
            expect(unpacked.state).toEqual({
                notifications: false,
                count: 77,
            });
        });

        test('unpacks uncompressed legacy state strings transparently', () => {
            const legacyJson = JSON.stringify({
                __screen: 'counter',
                count: 10,
                step: 1,
            });

            const unpacked = unpackState(legacyJson);
            expect(unpacked.screenId).toBe('counter');
            expect(unpacked.state).toEqual({
                count: 10,
                step: 1,
            });
        });

        test('handles invalid JSON or empty string without throwing', () => {
            const invalid = unpackState('not a json');
            expect(invalid.screenId).toBeUndefined();
            expect(invalid.state).toEqual({});

            const empty = unpackState('');
            expect(empty.screenId).toBeUndefined();
            expect(empty.state).toEqual({});
        });
    });

    describe('packPayload & unpackPayload', () => {
        test('packs and unpacks action payloads with key minification', () => {
            const payload = { plan: 'enterprise', tickets: 4 };
            const packed = packPayload(payload);

            expect(packed).toBe('{"l":"enterprise","k":4}');

            const unpacked = unpackPayload(packed);
            expect(unpacked).toEqual(payload);
        });

        test('handles string payloads with JSON quotes', () => {
            expect(packPayload('simple_string')).toBe('"simple_string"');
            expect(unpackPayload('"simple_string"')).toBe('simple_string');
        });

        test('handles numeric and boolean payloads', () => {
            expect(packPayload(42)).toBe('42');
            expect(unpackPayload('42')).toBe(42);

            expect(packPayload(true)).toBe('true');
            expect(unpackPayload('true')).toBe(true);
        });
    });

    describe('encodeWidgetAction & decodeWidgetAction (64-byte protocol)', () => {
        test('encodes action without payload', () => {
            const encoded = encodeWidgetAction('refresh');
            expect(encoded).toBe('refresh');

            const decoded = decodeWidgetAction(encoded);
            expect(decoded.action).toBe('refresh');
            expect(decoded.payload).toBeUndefined();
        });

        test('encodes action with primitive payload separated by colon', () => {
            const encoded = encodeWidgetAction('setPlan', 'pro');
            expect(encoded).toBe('setPlan:pro');

            const decoded = decodeWidgetAction(encoded);
            expect(decoded.action).toBe('setPlan');
            expect(decoded.payload).toBe('pro');
        });

        test('encodes action with object payload compressed into JSON', () => {
            const encoded = encodeWidgetAction('vote', { plan: 'pro', count: 1 });
            const decoded = decodeWidgetAction(encoded);

            expect(decoded.action).toBe('vote');
            expect(decoded.payload).toEqual({ plan: 'pro', count: 1 });
        });

        test('enforces Telegram 64-byte limit on widget_query data string via boolean check', () => {
            expect(validateWidgetActionData('a'.repeat(64))).toBe(true);
            expect(validateWidgetActionData('a'.repeat(65))).toBe(false);
            expect(validateWidgetActionData('')).toBe(false);
        });

        test('encodeWidgetAction logs warning when total encoded string exceeds 64 bytes', () => {
            let warnLogged = false;
            const originalWarn = console.warn;
            console.warn = (...args) => {
                if (args[0]?.includes('exceeds Telegram limit of 64 bytes')) {
                    warnLogged = true;
                }
            };
            try {
                const hugePayload = { text: 'X'.repeat(60) };
                const res = encodeWidgetAction('myAction', hugePayload);
                expect(res.length).toBeGreaterThan(64);
                expect(warnLogged).toBe(true);
            } finally {
                console.warn = originalWarn;
            }
        });

        test('encodeCompressedWidgetAction uses custom codec dictionary', () => {
            const customMap = { orderNumber: 'on' };
            const encoded = encodeCompressedWidgetAction(
                'order',
                { orderNumber: '123' },
                customMap,
            );
            expect(encoded).toContain('order:');
            expect(encoded).toContain('"on":"123"');

            const reverseMap = { on: 'orderNumber' };
            const decoded = decodeWidgetAction(encoded, { customReverseMap: reverseMap });
            expect(decoded.action).toBe('order');
            expect(decoded.payload).toEqual({ orderNumber: '123' });
        });
    });

    describe('CLIENT_CODEC_SNIPPET', () => {
        test('snippet is valid executable JavaScript containing codec functions', () => {
            expect(typeof CLIENT_CODEC_SNIPPET).toBe('string');
            expect(CLIENT_CODEC_SNIPPET).toContain('packState');
            expect(CLIENT_CODEC_SNIPPET).toContain('unpackState');

            // Evaluate snippet in isolated context to verify syntax and runtime execution
            const mockWindow: Record<string, any> = {};
            const runner = new Function('window', CLIENT_CODEC_SNIPPET);
            expect(() => runner(mockWindow)).not.toThrow();

            expect(typeof mockWindow.packState).toBe('function');
            expect(typeof mockWindow.unpackState).toBe('function');

            // Test client packState execution
            const clientPacked = mockWindow.packState({ notifications: true, plan: 'pro' });
            expect(clientPacked).toContain('"o":true');
            expect(clientPacked).toContain('"l":"pro"');

            // Test client unpackState execution
            const clientUnpacked = mockWindow.unpackState(clientPacked);
            expect(clientUnpacked.notifications).toBe(true);
            expect(clientUnpacked.plan).toBe('pro');
        });
    });
});
