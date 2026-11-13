import { describe, expect, test } from 'bun:test';
import { minifyHtml, minifyHtmlSync, purgeUnusedCss } from '../src';

describe('Minifier & CSS Purging Pipeline', () => {
    describe('purgeUnusedCss()', () => {
        test('preserves global resets, :root tokens, and widget root rules', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        :root { --tg-color: #fff; }
                        body { margin: 0; }
                        * { box-sizing: border-box; }
                        .tg-widget-root { display: flex; }
                        .tg-unused-card-class { color: red; }
                    </style>
                </head>
                <body>
                    <div class="tg-widget-root">Hello</div>
                </body>
                </html>
            `;

            const purged = purgeUnusedCss(html);
            expect(purged).toContain(':root');
            expect(purged).toContain('body');
            expect(purged).toContain('*');
            expect(purged).toContain('.tg-widget-root');
            expect(purged).not.toContain('.tg-unused-card-class');
        });

        test('preserves rules for classes present in the HTML body', () => {
            const html = `
                <style>
                    .tg-btn { padding: 8px; }
                    .tg-table { border: 1px solid black; }
                    .tg-badge { font-size: 10px; }
                </style>
                <div class="tg-btn tg-badge">Click</div>
            `;

            const purged = purgeUnusedCss(html);
            expect(purged).toContain('.tg-btn');
            expect(purged).toContain('.tg-badge');
            expect(purged).not.toContain('.tg-table');
        });

        test('purges @keyframes tg-pulse when tg-badge-pulse is not used in the body', () => {
            const withoutPulse = `
                <style>
                    @keyframes tg-pulse { 0% { opacity: 1; } }
                    .tg-card { background: white; }
                </style>
                <div class="tg-card">No pulse badge here</div>
            `;
            expect(purgeUnusedCss(withoutPulse)).not.toContain('@keyframes tg-pulse');

            const withPulse = `
                <style>
                    @keyframes tg-pulse { 0% { opacity: 1; } }
                    .tg-badge-pulse { animation: tg-pulse 1s; }
                </style>
                <div class="tg-badge-pulse">Live</div>
            `;
            expect(purgeUnusedCss(withPulse)).toContain('@keyframes tg-pulse');
        });

        test('preserves tag-based selectors like details and svg when corresponding elements exist', () => {
            const detailsHtml = `
                <style>
                    details[open] .tg-accordion-chevron { transform: rotate(90deg); }
                    table.tg-table { width: 100%; }
                </style>
                <details open><summary>FAQ</summary><span class="tg-accordion-chevron">></span></details>
            `;
            const purged = purgeUnusedCss(detailsHtml);
            expect(purged).toContain('details');
            expect(purged).not.toContain('table.tg-table');
        });

        test('returns empty style tag or removes tag if all rules are purged', () => {
            const html = `
                <style>
                    .unreferenced-one { display: none; }
                    .unreferenced-two { color: blue; }
                </style>
                <div>No matching classes</div>
            `;
            const purged = purgeUnusedCss(html);
            expect(purged).not.toContain('.unreferenced-one');
            expect(purged).not.toContain('.unreferenced-two');
            expect(purged).not.toContain('<style>');
        });
    });

    describe('minifyHtmlSync()', () => {
        test('collapses redundant whitespace between HTML tags', () => {
            const raw = `
                <div class="container">
                    <span>Item 1</span>
                    <span>Item 2</span>
                </div>
            `;
            const minified = minifyHtmlSync(raw, { purgeCss: false });
            expect(minified).toBe(
                '<div class="container"><span>Item 1</span><span>Item 2</span></div>',
            );
        });

        test('strips HTML comments', () => {
            const raw = '<div><!-- This is a comment --><span>Visible</span></div>';
            const minified = minifyHtmlSync(raw, { purgeCss: false });
            expect(minified).toBe('<div><span>Visible</span></div>');
        });

        test('strips redundant xmlns attribute from inline SVGs to save bytes', () => {
            const raw =
                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path d="M0 0"/></svg>';
            const minified = minifyHtmlSync(raw, { purgeCss: false });
            expect(minified).not.toContain('xmlns="http://www.w3.org/2000/svg"');
            expect(minified).toContain('<svg width="16" height="16">');
        });
    });

    describe('minifyHtml() (Deep Asynchronous Terser Pipeline)', () => {
        test('minifies client JavaScript inside <script> tags using Terser', async () => {
            const raw = `
                <!DOCTYPE html>
                <html>
                <body>
                    <script>
                        (function() {
                            var unnecessaryLongVariableName = 42;
                            function calculate(firstArg, secondArg) {
                                return firstArg + secondArg;
                            }
                            console.log(calculate(unnecessaryLongVariableName, 10));
                        })();
                    </script>
                </body>
                </html>
            `;

            const minified = await minifyHtml(raw);
            expect(minified).not.toContain('unnecessaryLongVariableName');
            expect(minified).not.toContain('calculate');
            expect(minified).toContain('<script>');
            expect(minified).toContain('console.log');
        });

        test('minifies embedded CSS with CleanCSS level 2', async () => {
            const raw = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        .tg-box {
                            margin-top: 10px;
                            margin-right: 10px;
                            margin-bottom: 10px;
                            margin-left: 10px;
                            background-color: #ffffff;
                            opacity: 1;
                        }
                    </style>
                </head>
                <body>
                    <div class="tg-box">Content</div>
                </body>
                </html>
            `;

            const minified = await minifyHtml(raw);
            expect(minified).toContain('margin:10px');
            expect(minified).toContain('#fff');
            expect(minified).not.toContain('margin-left: 10px');
        });

        test('respects minifyJS: false option override for static screens', async () => {
            const raw = `
                <!DOCTYPE html>
                <html>
                <body>
                    <script>
                        var myUnminifiedVar = 100;
                    </script>
                </body>
                </html>
            `;

            const minified = await minifyHtml(raw, { minifyJS: false });
            expect(minified).toContain('myUnminifiedVar');
        });

        test('respects purgeCss: false option override', async () => {
            const raw = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        .unused-selector { color: purple; }
                    </style>
                </head>
                <body>
                    <div>Hello</div>
                </body>
                </html>
            `;

            const minified = await minifyHtml(raw, { purgeCss: false });
            expect(minified).toContain('.unused-selector');
        });

        test('achieves significant byte reduction (> 40%) on realistic widget markup', async () => {
            const realisticWidget = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        :root {
                            --tg-theme-button-color: #2481cc;
                        }
                        .tg-card {
                            padding: 12px 16px;
                            border-radius: 8px;
                            background-color: #ffffff;
                        }
                        .unused-class-one {
                            display: none;
                        }
                        .unused-class-two {
                            color: red;
                        }
                    </style>
                </head>
                <body>
                    <!-- Header component comment -->
                    <div class="tg-card">
                        <h1>Telegram Interactive Card</h1>
                        <button class="tg-btn" onclick="handleClick()">Click Me</button>
                    </div>
                    <script>
                        function handleClick() {
                            var clientStateObject = { count: 1, text: "hello" };
                            window.TelegramWidget.request("action", clientStateObject);
                        }
                    </script>
                </body>
                </html>
            `;

            const minified = await minifyHtml(realisticWidget);
            const originalBytes = Buffer.byteLength(realisticWidget, 'utf-8');
            const minifiedBytes = Buffer.byteLength(minified, 'utf-8');

            const reductionPct = ((originalBytes - minifiedBytes) / originalBytes) * 100;
            expect(reductionPct).toBeGreaterThan(40);
        });
    });
});
