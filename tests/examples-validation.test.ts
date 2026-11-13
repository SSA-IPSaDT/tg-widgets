import { describe, expect, it } from 'bun:test';
import { screens } from '../examples/index';
import { inspectWidgetSize, inspectWidgetSizeAsync } from '../src/jsx';
import { getWidgetScreenType, type AnyWidgetScreen } from '../src/screen';

describe('Examples Validation Suite', () => {
    const screenEntries = Object.entries(screens);

    it('should export all 11 example screens', () => {
        expect(screenEntries.length).toBe(11);
        const expectedScreens = [
            'accordion',
            'controls',
            'table',
            'alerts',
            'cards',
            'counter',
            'poll',
            'ecommerce',
            'profile',
            'tournament',
            'crypto',
        ];
        for (const name of expectedScreens) {
            expect(screens[name as keyof typeof screens]).toBeDefined();
        }
    });

    for (const [name, screen] of screenEntries) {
        const anyScreen = screen as AnyWidgetScreen;

        describe(`Screen: "${name}" (${screen.id})`, () => {
            it('has a valid screen definition and identifier', () => {
                expect(typeof screen.id).toBe('string');
                expect(screen.id.length).toBeGreaterThan(0);
                expect(typeof screen.component).toBe('function');
            });

            const getProps = () =>
                (anyScreen.initialState ? anyScreen.initialState() : {}) as never;

            it('renders markup that strictly complies with Profile 1 (no <input>, <textarea>, <select>)', () => {
                const markup = screen.component(getProps());
                expect(typeof markup).toBe('string');
                expect(markup.length).toBeGreaterThan(0);

                // Telegram Widgets Profile 1 prohibits native form inputs
                expect(markup).not.toMatch(/<input\b/i);
                expect(markup).not.toMatch(/<textarea\b/i);
                expect(markup).not.toMatch(/<select\b/i);

                // Code cleanliness check: no awkward window casting
                expect(markup).not.toContain('window as unknown as');
            });

            it('strictly satisfies the 4096-byte deflate payload limit (synchronous)', () => {
                const markup = screen.component(getProps());
                const report = inspectWidgetSize(markup);

                expect(report.byteLength).toBeGreaterThan(0);
                expect(report.compressedByteLength).toBeGreaterThan(0);
                expect(report.compressedByteLength).toBeLessThanOrEqual(4096);
                expect(report.isValid).toBe(true);
            });

            it('strictly satisfies the 4096-byte deflate payload limit under production minification (async)', async () => {
                const markup = screen.component(getProps());
                const report = await inspectWidgetSizeAsync(markup);

                expect(report.compressedByteLength).toBeLessThanOrEqual(4096);
                expect(report.isValid).toBe(true);
            });

            it('has a well-defined architectural paradigm', () => {
                const type = getWidgetScreenType(screen as never);
                expect(['static', 'client', 'dynamic']).toContain(type);

                if (type === 'dynamic') {
                    expect(anyScreen.actions).toBeDefined();
                    expect(typeof anyScreen.actions).toBe('object');
                    expect(Object.keys(anyScreen.actions!).length).toBeGreaterThan(0);
                }
            });

            if (anyScreen.actions && Object.keys(anyScreen.actions).length > 0) {
                it('defines valid callable action handlers', () => {
                    for (const [actionName, handler] of Object.entries(anyScreen.actions!)) {
                        expect(typeof handler).toBe('function');
                        expect(actionName.length).toBeGreaterThan(0);
                    }
                });
            }
        });
    }
});
