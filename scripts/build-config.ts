import { join, resolve } from 'node:path';

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
    'html-minifier-terser',
    'node:buffer',
    'node:zlib',
    'node:child_process',
    'node:fs',
    'node:path',
];

export const ROOT_DIR = resolve(import.meta.dir, '..');
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
