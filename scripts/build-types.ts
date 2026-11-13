import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { DIST_DIR, ROOT_DIR, SRC_DIR } from './build-config';

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
