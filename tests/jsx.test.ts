import { describe, expect, test } from 'bun:test';
import {
    formatStyle,
    Fragment,
    h,
    inspectWidgetSize,
    inspectWidgetSizeAsync,
    renderWidget,
    renderWidgetAsync,
} from '../src';
import { jsx, jsxs } from '../src/jsx-runtime';
import { jsxDEV } from '../src/jsx-dev-runtime';

describe('JSX Engine & Inline CSS Styler', () => {
    describe('formatStyle()', () => {
        test('converts camelCase properties to kebab-case', () => {
            const style = {
                backgroundColor: 'red',
                fontSize: 14,
                borderTopLeftRadius: 8,
                boxSizing: 'border-box',
            };
            const result = formatStyle(style);
            expect(result).toBe(
                'background-color:red;font-size:14px;border-top-left-radius:8px;box-sizing:border-box',
            );
        });

        test('appends px to numeric dimensions but preserves unitless CSS properties', () => {
            const style = {
                padding: 12,
                margin: 0,
                opacity: 0.85,
                zIndex: 100,
                fontWeight: 600,
                lineHeight: 1.5,
                flex: 1,
                flexGrow: 2,
                flexShrink: 0,
                order: 3,
            };
            const result = formatStyle(style);
            expect(result).toContain('padding:12px');
            expect(result).toContain('margin:0');
            expect(result).toContain('opacity:0.85');
            expect(result).toContain('z-index:100');
            expect(result).toContain('font-weight:600');
            expect(result).toContain('line-height:1.5');
            expect(result).toContain('flex:1');
            expect(result).toContain('flex-grow:2');
            expect(result).toContain('flex-shrink:0');
            expect(result).toContain('order:3');
        });

        test('omits null, undefined, and empty string properties', () => {
            const style = {
                color: 'blue',
                background: null,
                border: undefined,
                margin: '',
            };
            const result = formatStyle(style);
            expect(result).toBe('color:blue');
        });

        test('handles empty style objects gracefully', () => {
            expect(formatStyle({})).toBe('');
        });
    });

    describe('h() JSX Factory', () => {
        test('renders basic HTML elements with attributes', () => {
            const html = h('div', { id: 'container', title: 'Hello' }, 'World');
            expect(html).toBe('<div id="container" title="Hello">World</div>');
        });

        test('handles boolean attributes correctly', () => {
            const checkedBtn = h('button', { disabled: true, autofocus: true }, 'Submit');
            expect(checkedBtn).toBe('<button disabled autofocus>Submit</button>');

            const uncheckedBtn = h('button', { disabled: false }, 'Submit');
            expect(uncheckedBtn).toBe('<button>Submit</button>');
        });

        test('aliases className to class and merges styles', () => {
            const el = h(
                'div',
                {
                    className: 'card active',
                    style: { display: 'flex', gap: 8 },
                },
                'Content',
            );
            expect(el).toBe('<div class="card active" style="display:flex;gap:8px">Content</div>');
        });

        test('renders void self-closing elements with self-closing syntax', () => {
            expect(h('br', null)).toBe('<br />');
            expect(h('hr', { className: 'divider' })).toBe('<hr class="divider" />');
            expect(h('img', { src: 'icon.png', alt: 'Test' })).toBe('<img src="icon.png" alt="Test" />');
        });

        test('filters out null, undefined, and false children', () => {
            const el = h('div', null, 'Hello', null, undefined, false, 'World');
            expect(el).toBe('<div>HelloWorld</div>');
        });

        test('renders functional components', () => {
            interface GreetingProps {
                name: string;
                exclaim?: boolean;
            }
            const Greeting = ({ name, exclaim }: GreetingProps) =>
                h('span', { className: 'greeting' }, `Hello, ${name}${exclaim ? '!' : ''}`);

            const html = h(Greeting as never, { name: 'Alice', exclaim: true });
            expect(html).toBe('<span class="greeting">Hello, Alice!</span>');
        });
    });

    describe('Fragment', () => {
        test('renders children directly without wrapping element', () => {
            const html = h(Fragment, null, h('p', null, 'First'), h('p', null, 'Second'));
            expect(html).toBe('<p>First</p><p>Second</p>');
        });

        test('renders empty fragment as empty string', () => {
            expect(h(Fragment, null)).toBe('');
        });

        test('renders nested fragments correctly', () => {
            const html = h(
                Fragment,
                null,
                'Start',
                h(Fragment, null, h('span', null, 'Middle')),
                'End',
            );
            expect(html).toBe('Start<span>Middle</span>End');
        });
    });

    describe('JSX Runtime Exports (jsx, jsxs, jsxDEV)', () => {
        test('jsx and jsxs function identically to h()', () => {
            const single = jsx('div', { id: 'test', children: 'Hello' });
            expect(single).toBe('<div id="test">Hello</div>');

            const multiple = jsxs('div', {
                className: 'box',
                children: [
                    jsx('span', { children: 'A' }),
                    jsx('span', { children: 'B' }),
                ],
            });
            expect(multiple).toBe('<div class="box"><span>A</span><span>B</span></div>');
        });

        test('jsxDEV handles development key and source arguments gracefully', () => {
            const devEl = jsxDEV('h1', { children: 'Title' }, 'my-key', false, { fileName: 'test.tsx', lineNumber: 1 });
            expect(devEl).toBe('<h1>Title</h1>');
        });
    });

    describe('renderWidget & inspectWidgetSize', () => {
        test('renderWidget wraps body in valid Telegram HTML document structure', () => {
            const content = '<div class="card">Hello Telegram</div>';
            const doc = renderWidget(content);
            expect(doc).toContain('<!DOCTYPE html>');
            expect(doc).toContain('<meta charset="utf-8">');
            expect(doc).toContain('name="viewport"');
            expect(doc).toContain('<body><div class="card">Hello Telegram</div></body>');
        });

        test('renderWidget does not double-wrap if DOCTYPE is already present', () => {
            const fullDoc = '<!DOCTYPE html><html><body>Already Wrapped</body></html>';
            const doc = renderWidget(fullDoc);
            expect(doc).toBe(fullDoc);
        });

        test('inspectWidgetSize accurately measures byte length and deflate level 9 compressed size', () => {
            const markup = '<div style="font-size:24px;color:#2481cc">Telegram 10.4 Widget</div>';
            const report = inspectWidgetSize(markup);

            expect(report.byteLength).toBe(Buffer.byteLength(report.html, 'utf-8'));
            expect(report.compressedByteLength).toBeGreaterThan(0);
            expect(report.compressedByteLength).toBeLessThan(report.byteLength);
            expect(report.isValid).toBe(true);
            expect(report.maxAllowed).toBe(4096);
        });

        test('inspectWidgetSize correctly handles UTF-8 multibyte characters (emojis & Cyrillic)', () => {
            const unicodeText = '🚀 Привет мир! 💎 QuickJS Profile 1 ♟️';
            const report = inspectWidgetSize(unicodeText);

            expect(report.byteLength).toBe(Buffer.byteLength(report.html, 'utf-8'));
            expect(report.isValid).toBe(true);
        });

        test('inspectWidgetSize correctly flags payloads exceeding 4096-byte limit', () => {
            // Generate incompressible random text exceeding 4096 compressed bytes
            const chars: string[] = [];
            for (let i = 0; i < 6000; i++) {
                chars.push(String.fromCharCode(32 + Math.floor(Math.random() * 95)));
            }
            const largeText = chars.join('');
            const report = inspectWidgetSize(largeText);

            expect(report.compressedByteLength).toBeGreaterThan(4096);
            expect(report.isValid).toBe(false);
        });

        test('renderWidgetAsync and inspectWidgetSizeAsync apply asynchronous minification', async () => {
            const markup = `
                <div class="tg-layout" style="display: flex; flex-direction: column;">
                    <!-- Comment to be removed -->
                    <h1>Async Render</h1>
                    <p>Testing deep Terser minification</p>
                </div>
            `;
            const rendered = await renderWidgetAsync(markup);
            expect(rendered).not.toContain('<!-- Comment to be removed -->');

            const report = await inspectWidgetSizeAsync(markup);
            expect(report.compressedByteLength).toBeGreaterThan(0);
            expect(report.isValid).toBe(true);
        });
    });
});
