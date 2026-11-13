#!/usr/bin/env bun
/**
 * Telegram Widgets (tg-widgets) Industrial Packaging Pipeline
 *
 * Highly optimized multi-target build runner.
 *
 * @module build
 */

import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';
import {
    BUILD_TARGETS,
    DIST_DIR,
    EXTERNAL_DEPENDENCIES,
    printArtifactSummary,
    ROOT_DIR,
    SRC_DIR,
    type BuildArtifactReport,
    type BuildOptions,
    type BuildTargetConfig,
} from './scripts/build-config';
import { buildTypeScriptDeclarations } from './scripts/build-types';

export * from './scripts/build-config';
export { buildTypeScriptDeclarations } from './scripts/build-types';

/**
 * Executes a single bundle job through Bun.build
 */
async function executeBundleJob(
    job: BuildTargetConfig,
    minify: boolean,
): Promise<BuildArtifactReport> {
    if (!existsSync(job.outdir)) {
        mkdirSync(job.outdir, { recursive: true });
    }

    const result = await Bun.build({
        entrypoints: [job.entrypoint],
        outdir: job.outdir,
        naming: job.filename,
        target: job.target,
        format: job.format,
        minify: minify
            ? {
                  whitespace: true,
                  syntax: true,
                  identifiers: true,
              }
            : false,
        sourcemap: 'none',
        splitting: false,
        external: EXTERNAL_DEPENDENCIES,
    });

    if (!result.success) {
        console.error(`❌ Build failed for ${job.id}:`);
        for (const log of result.logs) {
            console.error(log);
        }
        throw new Error(`Failed to build ${job.id}`);
    }

    const outputPath = join(job.outdir, job.filename);
    const content = await Bun.file(outputPath).arrayBuffer();
    const rawBytes = content.byteLength;
    const gzipped = gzipSync(Buffer.from(content));
    const gzipBytes = gzipped.byteLength;

    return {
        path: outputPath,
        relativePath: relative(ROOT_DIR, outputPath),
        rawBytes,
        gzipBytes,
        target: job.target,
        format: job.format,
    };
}

/**
 * Main packaging coordinator
 */
export async function buildProject(options: BuildOptions = {}): Promise<BuildArtifactReport[]> {
    const totalStart = performance.now();
    const minify = options.minify !== false;
    const emitTypes = options.emitTypes !== false;
    const clean = options.clean !== false;

    console.log('⚡ Starting Telegram Widgets build pipeline...');
    console.log(`   Minification: \x1b[32m${minify ? 'enabled (aggressive)' : 'disabled'}\x1b[0m`);
    console.log(`   Emit Types:   \x1b[32m${emitTypes ? 'enabled' : 'disabled'}\x1b[0m\n`);

    // 1. Clean dist directory
    if (clean && existsSync(DIST_DIR)) {
        rmSync(DIST_DIR, { recursive: true, force: true });
    }
    mkdirSync(DIST_DIR, { recursive: true });

    // 2. Filter targets
    const targetsToBuild = options.onlyBun
        ? BUILD_TARGETS.filter((t) => t.target === 'bun')
        : BUILD_TARGETS;

    // 3. Concurrently build all bundle targets
    const bundleStart = performance.now();
    const reports = await Promise.all(
        targetsToBuild.map((target) => executeBundleJob(target, minify)),
    );
    const bundleElapsed = (performance.now() - bundleStart).toFixed(0);
    console.log(`✔ Bundled ${reports.length} targets in ${bundleElapsed}ms\n`);

    // 4. Generate TypeScript declarations
    if (emitTypes) {
        buildTypeScriptDeclarations();
    }

    // 5. Print size & compression table
    printArtifactSummary(reports);

    const totalElapsed = (performance.now() - totalStart).toFixed(0);
    console.log(`✨ Build finished successfully in \x1b[32m${totalElapsed}ms\x1b[0m\n`);

    return reports;
}

async function main() {
    const args = process.argv.slice(2);
    const noMinify = args.includes('--no-minify');
    const noTypes = args.includes('--no-types');
    const onlyBun = args.includes('--only-bun') || args.includes('--bun');
    const watch = args.includes('--watch') || args.includes('-w');

    if (watch) {
        console.log('👀 Watching src/ for changes...');
        await buildProject({ minify: !noMinify, emitTypes: !noTypes, onlyBun });

        const { watch: fsWatch } = await import('node:fs');
        let debounceTimer: ReturnType<typeof setTimeout> | null = null;

        fsWatch(SRC_DIR, { recursive: true }, (_eventType, filename) => {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                console.log(`\n🔄 Change detected in ${filename}, rebuilding...`);
                try {
                    await buildProject({
                        minify: !noMinify,
                        emitTypes: !noTypes,
                        onlyBun,
                        clean: false,
                    });
                } catch (err) {
                    console.error('Build error:', err);
                }
            }, 100);
        });
        return;
    }

    await buildProject({
        minify: !noMinify,
        emitTypes: !noTypes,
        onlyBun,
    });
}

if (import.meta.main) {
    main().catch((err) => {
        console.error('Fatal build failure:', err);
        process.exit(1);
    });
}
