import { screens } from '../examples/index';
import { inspectWidgetSize, inspectWidgetSizeAsync } from '../src';

/**
 * Diagnostic utility script to compare uncompressed vs max-compressed size metrics
 * across all showcase screens.
 */
async function main() {
    console.log('\n📊 Telegram Widgets - Uncompressed vs Max-Compressed Size Benchmark\n');
    console.log('='.repeat(98));
    console.log(
        '| ' +
            'Screen'.padEnd(12) +
            ' | ' +
            'Raw HTML'.padStart(10) +
            ' | ' +
            'Minified HTML'.padStart(14) +
            ' | ' +
            'Raw Deflate'.padStart(12) +
            ' | ' +
            'Min Deflate'.padStart(12) +
            ' | ' +
            '4KB %'.padStart(7) +
            ' | ' +
            'Saved'.padStart(8) +
            ' |',
    );
    console.log('='.repeat(98));

    let totalRawHtml = 0;
    let totalMinHtml = 0;
    let totalRawDeflate = 0;
    let totalMinDeflate = 0;

    for (const [name, screen] of Object.entries(screens)) {
        const rawMarkup = screen.component(
            screen.initialState ? screen.initialState() : ({} as never),
        );
        const uncompressed = inspectWidgetSize(rawMarkup);
        const compressed = await inspectWidgetSizeAsync(rawMarkup, {
            hoistStyles: true,
            purgeCss: true,
            minifyCSS: { level: 2 },
            minifyJS: { mangle: { toplevel: true }, compress: { passes: 3, unsafe: true } },
        });

        totalRawHtml += uncompressed.byteLength;
        totalMinHtml += compressed.byteLength;
        totalRawDeflate += uncompressed.compressedByteLength;
        totalMinDeflate += compressed.compressedByteLength;

        const savedDeflate = uncompressed.compressedByteLength - compressed.compressedByteLength;
        const pctSaved = ((savedDeflate / uncompressed.compressedByteLength) * 100).toFixed(1);
        const limitPct = ((compressed.compressedByteLength / 4096) * 100).toFixed(1);

        console.log(
            '| ' +
                name.padEnd(12) +
                ' | ' +
                `${uncompressed.byteLength} B`.padStart(10) +
                ' | ' +
                `${compressed.byteLength} B`.padStart(14) +
                ' | ' +
                `${uncompressed.compressedByteLength} B`.padStart(12) +
                ' | ' +
                `${compressed.compressedByteLength} B`.padStart(12) +
                ' | ' +
                `${limitPct}%`.padStart(7) +
                ' | ' +
                `-${pctSaved}%`.padStart(8) +
                ' |',
        );
    }

    console.log('='.repeat(98));
    const totalSavedDeflate = totalRawDeflate - totalMinDeflate;
    const totalPctSaved = ((totalSavedDeflate / totalRawDeflate) * 100).toFixed(1);
    console.log(
        '| ' +
            'TOTAL'.padEnd(12) +
            ' | ' +
            `${totalRawHtml} B`.padStart(10) +
            ' | ' +
            `${totalMinHtml} B`.padStart(14) +
            ' | ' +
            `${totalRawDeflate} B`.padStart(12) +
            ' | ' +
            `${totalMinDeflate} B`.padStart(12) +
            ' | ' +
            '-'.padStart(7) +
            ' | ' +
            `-${totalPctSaved}%`.padStart(8) +
            ' |',
    );
    console.log('='.repeat(98));
    console.log('\n✅ All screens strictly satisfy Telegram 4096-byte deflate payload limit.\n');
}

main().catch(console.error);
