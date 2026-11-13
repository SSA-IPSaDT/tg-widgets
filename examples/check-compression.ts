import { screens } from './index';
import { inspectWidgetSize, inspectWidgetSizeAsync } from '../src';

/**
 * Diagnostic utility script to verify Telegram 4096B deflate limits
 * across all showcase screens using native zero-dependency minifier.
 */
async function main() {
    console.log('\n📊 Telegram Widgets — Compression & 4096B Deflate Verification\n');
    console.log('='.repeat(98));
    console.log(
        '| ' +
            'Screen'.padEnd(12) +
            ' | ' +
            'Raw HTML'.padStart(10) +
            ' | ' +
            'Min HTML'.padStart(10) +
            ' | ' +
            'HTML Saved'.padStart(10) +
            ' | ' +
            'Deflate 9'.padStart(10) +
            ' | ' +
            '4KB %'.padStart(8) +
            ' | ' +
            'Status'.padStart(8) +
            ' |',
    );
    console.log('='.repeat(98));

    let totalRawHtml = 0;
    let totalMinHtml = 0;
    let totalMinDeflate = 0;
    let hasViolations = false;

    for (const [name, screen] of Object.entries(screens)) {
        const anyScreen = screen as {
            initialState?: () => unknown;
            component: (props: unknown) => string;
        };
        const rawMarkup = anyScreen.component(
            anyScreen.initialState ? anyScreen.initialState() : {},
        );
        const unminified = inspectWidgetSize(rawMarkup, { minify: false });
        const compressed = await inspectWidgetSizeAsync(rawMarkup, {
            hoistStyles: true,
            purgeCss: true,
            minifyCSS: { level: 2 },
            minifyJS: { collapseWhitespace: true, removeComments: true },
        });

        totalRawHtml += unminified.byteLength;
        totalMinHtml += compressed.byteLength;
        totalMinDeflate += compressed.compressedByteLength;

        const savedBytes = unminified.byteLength - compressed.byteLength;
        const pctHtmlSaved = ((savedBytes / unminified.byteLength) * 100).toFixed(1);
        const limitPct = ((compressed.compressedByteLength / 4096) * 100).toFixed(1);
        const isOk = compressed.compressedByteLength <= 4096;

        if (!isOk) {
            hasViolations = true;
        }

        console.log(
            '| ' +
                name.padEnd(12) +
                ' | ' +
                `${unminified.byteLength} B`.padStart(10) +
                ' | ' +
                `${compressed.byteLength} B`.padStart(10) +
                ' | ' +
                `-${pctHtmlSaved}%`.padStart(10) +
                ' | ' +
                `${compressed.compressedByteLength} B`.padStart(10) +
                ' | ' +
                `${limitPct}%`.padStart(8) +
                ' | ' +
                (isOk ? '✅ PASS' : '❌ FAIL').padStart(8) +
                ' |',
        );
    }

    console.log('='.repeat(98));
    const totalSavedBytes = totalRawHtml - totalMinHtml;
    const totalPctSaved = ((totalSavedBytes / totalRawHtml) * 100).toFixed(1);
    console.log(
        '| ' +
            'TOTAL'.padEnd(12) +
            ' | ' +
            `${totalRawHtml} B`.padStart(10) +
            ' | ' +
            `${totalMinHtml} B`.padStart(10) +
            ' | ' +
            `-${totalPctSaved}%`.padStart(10) +
            ' | ' +
            `${totalMinDeflate} B`.padStart(10) +
            ' | ' +
            '-'.padStart(8) +
            ' | ' +
            (hasViolations ? '❌ FAIL' : '✅ PASS').padStart(8) +
            ' |',
    );
    console.log('='.repeat(98));

    if (hasViolations) {
        console.error(
            '\n❌ One or more screens exceed the Telegram 4096-byte deflate payload limit.\n',
        );
        process.exit(1);
    }

    console.log('\n✅ All screens strictly satisfy Telegram 4096-byte deflate payload limit.\n');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
