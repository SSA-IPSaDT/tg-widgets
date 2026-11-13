import { describe, expect, it } from 'bun:test';
import * as mod from '../mod';
import * as srcIndex from '../src/index';
import * as jsxRuntime from '../src/jsx-runtime';
import * as jsxDevRuntime from '../src/jsx-dev-runtime';
import packageJson from '../package.json';
import denoJson from '../deno.json';

describe('Cross-Runtime & Packaging Module', () => {
    describe('mod.ts (Universal & Deno Entrypoint)', () => {
        it('exports core plugin constructors and aliases', () => {
            expect(typeof mod.createTelegramWidgetsPlugin).toBe('function');
            expect(typeof mod.createWidgetsPlugin).toBe('function');
            expect(typeof mod.createBubblesPlugin).toBe('function');
        });

        it('exports screen definition builders', () => {
            expect(typeof mod.defineWidgetScreen).toBe('function');
            expect(typeof mod.defineStaticWidgetScreen).toBe('function');
            expect(typeof mod.defineClientWidgetScreen).toBe('function');
            expect(typeof mod.defineDynamicWidgetScreen).toBe('function');
            expect(typeof mod.getWidgetScreenType).toBe('function');
            expect(typeof mod.getBubbleScreenType).toBe('function');
        });

        it('exports JSX runtime primitives', () => {
            expect(typeof mod.jsx).toBe('function');
            expect(typeof mod.jsxs).toBe('function');
            expect(typeof mod.jsxDEV).toBe('function');
            expect(typeof mod.h).toBe('function');
            expect(typeof mod.Fragment).toBe('function');
        });

        it('exports codec compression and decompression utilities', () => {
            expect(typeof mod.packState).toBe('function');
            expect(typeof mod.unpackState).toBe('function');
            expect(typeof mod.packPayload).toBe('function');
            expect(typeof mod.unpackPayload).toBe('function');
            expect(typeof mod.compressKeys).toBe('function');
            expect(typeof mod.decompressKeys).toBe('function');
            expect(typeof mod.CLIENT_CODEC_SNIPPET).toBe('string');
        });

        it('exports action serialization utilities', () => {
            expect(typeof mod.encodeWidgetAction).toBe('function');
            expect(typeof mod.decodeWidgetAction).toBe('function');
            expect(typeof mod.validateWidgetActionData).toBe('function');
        });

        it('exports storage implementations', () => {
            expect(typeof mod.MemoryWidgetsStorage).toBe('function');
        });

        it('exports minification utilities', () => {
            expect(typeof mod.minifyHtmlSync).toBe('function');
            expect(typeof mod.minifyHtml).toBe('function');
            expect(typeof mod.purgeUnusedCss).toBe('function');
        });

        it('exports all UI components from mod.ts and src/index', () => {
            const expectedComponents = [
                'Alert',
                'Avatar',
                'Badge',
                'Banner',
                'Button',
                'Card',
                'CardHeader',
                'CardTitle',
                'CardDescription',
                'CardContent',
                'CardFooter',
                'Checkbox',
                'DescriptionText',
                'Divider',
                'LucideIcon',
                'ProgressBar',
                'Radio',
                'RadioGroup',
                'Script',
                'SegmentedControl',
                'Stepper',
                'Switch',
                'Table',
                'WidgetLayout',
            ];

            for (const comp of expectedComponents) {
                expect((mod as Record<string, unknown>)[comp]).toBeDefined();
                expect((srcIndex as Record<string, unknown>)[comp]).toBeDefined();
            }
        });
    });

    describe('jsx-runtime and jsx-dev-runtime', () => {
        it('exports standard jsx runtime functions', () => {
            expect(typeof jsxRuntime.jsx).toBe('function');
            expect(typeof jsxRuntime.jsxs).toBe('function');
            expect(typeof jsxRuntime.jsxDEV).toBe('function');
            expect(typeof jsxRuntime.Fragment).toBe('function');

            expect(typeof jsxDevRuntime.jsx).toBe('function');
            expect(typeof jsxDevRuntime.jsxs).toBe('function');
            expect(typeof jsxDevRuntime.jsxDEV).toBe('function');
            expect(typeof jsxDevRuntime.Fragment).toBe('function');
        });

        it('renders valid HTML via jsx runtime function call', () => {
            const rendered = jsxRuntime.jsx('span', {
                class: 'badge',
                children: 'Active',
            });
            expect(rendered).toBe('<span class="badge">Active</span>');
        });
    });

    describe('package.json & deno.json Manifests', () => {
        it('has consistent package name and version', () => {
            expect(packageJson.name).toBe('@ipsadt/tg-widgets');
            expect(denoJson.name).toBe('@ipsadt/tg-widgets');
            expect(packageJson.version).toBe(denoJson.version);
        });

        it('defines all required entry points in package.json exports', () => {
            const exports = packageJson.exports as Record<string, Record<string, string>>;
            expect(exports['.']).toBeDefined();
            expect(exports['./components']).toBeDefined();
            expect(exports['./jsx-runtime']).toBeDefined();
            expect(exports['./jsx-dev-runtime']).toBeDefined();
            expect(exports['./mod']).toBeDefined();
            expect(exports['./mod.ts']).toBeDefined();

            expect(exports['.'].types).toBe('./dist/index.d.ts');
            expect(exports['.'].bun).toBe('./dist/bun/index.js');
            expect(exports['.'].import).toBe('./dist/index.js');
            expect(exports['.'].require).toBe('./dist/index.cjs');

            expect(exports['./components'].bun).toBe('./dist/bun/components/index.js');
            expect(exports['./components'].import).toBe('./dist/components/index.js');
            expect(exports['./components'].require).toBe('./dist/components/index.cjs');

            expect(exports['./jsx-runtime'].bun).toBe('./dist/bun/jsx-runtime.js');
            expect(exports['./jsx-runtime'].import).toBe('./dist/jsx-runtime.js');
            expect(exports['./jsx-runtime'].require).toBe('./dist/jsx-runtime.cjs');

            expect(exports['./jsx-dev-runtime'].bun).toBe('./dist/bun/jsx-dev-runtime.js');
            expect(exports['./jsx-dev-runtime'].import).toBe('./dist/jsx-dev-runtime.js');
            expect(exports['./jsx-dev-runtime'].require).toBe('./dist/jsx-dev-runtime.cjs');
        });

        it('defines valid exports and JSX compilerOptions in deno.json', () => {
            expect(denoJson.exports['.']).toBe('./mod.ts');
            expect(denoJson.exports['./components']).toBe('./src/components/index.ts');
            expect(denoJson.exports['./jsx-runtime']).toBe('./src/jsx-runtime.ts');
            expect(denoJson.exports['./jsx-dev-runtime']).toBe('./src/jsx-dev-runtime.ts');
            expect(denoJson.compilerOptions.jsx).toBe('react-jsx');
            expect(denoJson.compilerOptions.jsxImportSource).toBe('@ipsadt/tg-widgets');
        });
    });

    describe('Distribution Artifacts Verification', () => {
        it('has all built bundles in dist and dist/bun', async () => {
            const { existsSync } = await import('node:fs');
            expect(existsSync('dist/bun/index.js')).toBe(true);
            expect(existsSync('dist/bun/components/index.js')).toBe(true);
            expect(existsSync('dist/bun/jsx-runtime.js')).toBe(true);
            expect(existsSync('dist/bun/jsx-dev-runtime.js')).toBe(true);
            expect(existsSync('dist/bun/react-shim.d.ts')).toBe(true);

            expect(existsSync('dist/index.js')).toBe(true);
            expect(existsSync('dist/index.cjs')).toBe(true);
            expect(existsSync('dist/index.d.ts')).toBe(true);
            expect(existsSync('dist/components/index.js')).toBe(true);
            expect(existsSync('dist/components/index.cjs')).toBe(true);
            expect(existsSync('dist/components/index.d.ts')).toBe(true);
            expect(existsSync('dist/jsx-runtime.js')).toBe(true);
            expect(existsSync('dist/jsx-runtime.cjs')).toBe(true);
            expect(existsSync('dist/jsx-runtime.d.ts')).toBe(true);
            expect(existsSync('dist/react-shim.d.ts')).toBe(true);
        });

        it('can dynamically import the Bun-optimized dist bundle', async () => {
            const bunDistPath = new URL('../dist/bun/index.js', import.meta.url).pathname;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const bunDist = (await import(bunDistPath)) as Record<string, any>;
            expect(typeof bunDist.createTelegramWidgetsPlugin).toBe('function');
            expect(typeof bunDist.defineWidgetScreen).toBe('function');
            expect(typeof bunDist.Button).toBe('function');
        });

        it('can dynamically import the Node ESM dist bundle', async () => {
            const nodeEsmDistPath = new URL('../dist/index.js', import.meta.url).pathname;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const nodeEsmDist = (await import(nodeEsmDistPath)) as Record<string, any>;
            expect(typeof nodeEsmDist.createTelegramWidgetsPlugin).toBe('function');
            expect(typeof nodeEsmDist.defineWidgetScreen).toBe('function');
            expect(typeof nodeEsmDist.Button).toBe('function');
        });
    });
});
