#!/usr/bin/env bun
/**
 * Telegram Widgets (tg-widgets) Industrial Packaging Pipeline
 *
 * Highly optimized multi-target build runner.
 *
 * @module build
 */

import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

export interface BuildTargetConfig {
    id: string;
    entrypoint: string;
    outdir: string;
    filename: string;
    target: 'node' | 'bun';
    format: 'esm' | 'cjs';
    description: string;
}

export interface BuildOptions {
    minify?: boolean;
    emitTypes?: boolean;
    clean?: boolean;
    onlyBun?: boolean;
    verbose?: boolean;
}

export interface BuildArtifactReport {
    path: string;
    relativePath: string;
    rawBytes: number;
    gzipBytes: number;
    target: string;
    format: string;
}

export const EXTERNAL_DEPENDENCIES = [
    'grammy',
    'lucide-static',
    'node:buffer',
    'node:zlib',
    'node:child_process',
    'node:fs',
    'node:path',
];

export const ROOT_DIR = resolve(import.meta.dir);
export const DIST_DIR = join(ROOT_DIR, 'dist');
export const SRC_DIR = join(ROOT_DIR, 'src');

/**
 * All build targets covering Bun, Node ESM, and Node CJS.
 */
export const BUILD_TARGETS: BuildTargetConfig[] = [
    // 1. Bun-native entrypoints (condition: "bun")
    {
        id: 'bun-main',
        entrypoint: join(SRC_DIR, 'index.ts'),
        outdir: join(DIST_DIR, 'bun'),
        filename: 'index.js',
        target: 'bun',
        format: 'esm',
        description: 'Bun-optimized main bundle',
    },
    {
        id: 'bun-components',
        entrypoint: join(SRC_DIR, 'components/index.ts'),
        outdir: join(DIST_DIR, 'bun/components'),
        filename: 'index.js',
        target: 'bun',
        format: 'esm',
        description: 'Bun-optimized components bundle',
    },
    {
        id: 'bun-jsx-runtime',
        entrypoint: join(SRC_DIR, 'jsx-runtime.ts'),
        outdir: join(DIST_DIR, 'bun'),
        filename: 'jsx-runtime.js',
        target: 'bun',
        format: 'esm',
        description: 'Bun-optimized JSX runtime',
    },
    {
        id: 'bun-jsx-dev-runtime',
        entrypoint: join(SRC_DIR, 'jsx-dev-runtime.ts'),
        outdir: join(DIST_DIR, 'bun'),
        filename: 'jsx-dev-runtime.js',
        target: 'bun',
        format: 'esm',
        description: 'Bun-optimized JSX dev runtime',
    },

    // 2. Node.js ESM entrypoints (condition: "import")
    {
        id: 'node-esm-main',
        entrypoint: join(SRC_DIR, 'index.ts'),
        outdir: DIST_DIR,
        filename: 'index.js',
        target: 'node',
        format: 'esm',
        description: 'Node.js ESM main bundle',
    },
    {
        id: 'node-esm-components',
        entrypoint: join(SRC_DIR, 'components/index.ts'),
        outdir: join(DIST_DIR, 'components'),
        filename: 'index.js',
        target: 'node',
        format: 'esm',
        description: 'Node.js ESM components bundle',
    },
    {
        id: 'node-esm-jsx-runtime',
        entrypoint: join(SRC_DIR, 'jsx-runtime.ts'),
        outdir: DIST_DIR,
        filename: 'jsx-runtime.js',
        target: 'node',
        format: 'esm',
        description: 'Node.js ESM JSX runtime',
    },
    {
        id: 'node-esm-jsx-dev-runtime',
        entrypoint: join(SRC_DIR, 'jsx-dev-runtime.ts'),
        outdir: DIST_DIR,
        filename: 'jsx-dev-runtime.js',
        target: 'node',
        format: 'esm',
        description: 'Node.js ESM JSX dev runtime',
    },

    // 3. Node.js CommonJS entrypoints (condition: "require")
    {
        id: 'node-cjs-main',
        entrypoint: join(SRC_DIR, 'index.ts'),
        outdir: DIST_DIR,
        filename: 'index.cjs',
        target: 'node',
        format: 'cjs',
        description: 'Node.js CommonJS main bundle',
    },
    {
        id: 'node-cjs-components',
        entrypoint: join(SRC_DIR, 'components/index.ts'),
        outdir: join(DIST_DIR, 'components'),
        filename: 'index.cjs',
        target: 'node',
        format: 'cjs',
        description: 'Node.js CommonJS components bundle',
    },
    {
        id: 'node-cjs-jsx-runtime',
        entrypoint: join(SRC_DIR, 'jsx-runtime.ts'),
        outdir: DIST_DIR,
        filename: 'jsx-runtime.cjs',
        target: 'node',
        format: 'cjs',
        description: 'Node.js CommonJS JSX runtime',
    },
    {
        id: 'node-cjs-jsx-dev-runtime',
        entrypoint: join(SRC_DIR, 'jsx-dev-runtime.ts'),
        outdir: DIST_DIR,
        filename: 'jsx-dev-runtime.cjs',
        target: 'node',
        format: 'cjs',
        description: 'Node.js CommonJS JSX dev runtime',
    },
];

export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
}

export function printArtifactSummary(reports: BuildArtifactReport[]): void {
    console.log('┌──────────────────────────────────────┬──────────┬──────────┬────────┬────────┐');
    console.log('│ Artifact                             │ Raw Size │ Gzip     │ Target │ Format │');
    console.log('├──────────────────────────────────────┼──────────┼──────────┼────────┼────────┤');

    let totalRaw = 0;
    let totalGzip = 0;

    for (const r of reports) {
        totalRaw += r.rawBytes;
        totalGzip += r.gzipBytes;

        const pathCol = r.relativePath.padEnd(36, ' ');
        const rawCol = formatBytes(r.rawBytes).padStart(8, ' ');
        const gzipCol = formatBytes(r.gzipBytes).padStart(8, ' ');
        const targetCol = r.target.padEnd(6, ' ');
        const formatCol = r.format.padEnd(6, ' ');

        console.log(`│ ${pathCol} │ ${rawCol} │ ${gzipCol} │ ${targetCol} │ ${formatCol} │`);
    }

    console.log('├──────────────────────────────────────┼──────────┼──────────┼────────┼────────┤');
    const totalPathCol = 'Total Bundle Footprint'.padEnd(36, ' ');
    const totalRawCol = formatBytes(totalRaw).padStart(8, ' ');
    const totalGzipCol = formatBytes(totalGzip).padStart(8, ' ');
    console.log(`│ ${totalPathCol} │ ${totalRawCol} │ ${totalGzipCol} │        │        │`);
    console.log(
        '└──────────────────────────────────────┴──────────┴──────────┴────────┴────────┘\n',
    );
}

/**
 * Compiles TypeScript declarations using tsconfig.build.json
 */
export function buildTypeScriptDeclarations(): void {
    const start = performance.now();
    console.log('📘 Generating TypeScript declaration files (.d.ts)...');

    execSync('bun x tsc --project tsconfig.build.json', {
        cwd: ROOT_DIR,
        stdio: 'inherit',
    });

    // Copy ambient react-shim.d.ts to both root dist and dist/bun
    const shimSource = join(SRC_DIR, 'react-shim.d.ts');
    if (existsSync(shimSource)) {
        copyFileSync(shimSource, join(DIST_DIR, 'react-shim.d.ts'));

        const bunDir = join(DIST_DIR, 'bun');
        if (!existsSync(bunDir)) {
            mkdirSync(bunDir, { recursive: true });
        }
        copyFileSync(shimSource, join(bunDir, 'react-shim.d.ts'));
    }

    // Clean any nested dist/src directory if generated
    const nestedSrc = join(DIST_DIR, 'src');
    if (existsSync(nestedSrc)) {
        rmSync(nestedSrc, { recursive: true, force: true });
    }

    const elapsed = (performance.now() - start).toFixed(0);
    console.log(`✔ Type definitions generated in ${elapsed}ms\n`);
}

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
