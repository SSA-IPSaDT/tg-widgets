#!/usr/bin/env bun
import { execSync } from 'node:child_process';

/**
 * Standard project branch naming patterns:
 * - <type>/<description> (e.g. feat/add-screen, fix/storage-leak, chore/update-deps)
 * - main branches (main, master, dev, development, next)
 */
export const ALLOWED_BRANCH_PATTERNS = [
    /^(feat|feature|fix|chore|docs|refactor|test|ci|perf|style|release|hotfix)\/([a-z0-9._-]+)$/,
    /^(main|master|dev|development|next)$/,
];

export function getCurrentBranch(): string {
    try {
        return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    } catch {
        return '';
    }
}

export function validateBranchName(branch: string): { valid: boolean; reason?: string } {
    if (!branch || branch === 'HEAD') {
        // Detached HEAD state is permitted (e.g. during CI or rebasing)
        return { valid: true };
    }

    const matches = ALLOWED_BRANCH_PATTERNS.some((pattern) => pattern.test(branch));
    if (!matches) {
        return {
            valid: false,
            reason: `Branch name "${branch}" does not conform to the project branch naming convention.
Allowed formats:
  - <type>/<description> (e.g. feat/interactive-widgets, fix/storage-ttl, chore/update-deps)
  - Allowed types: feat, feature, fix, chore, docs, refactor, test, ci, perf, style, release, hotfix
  - Base branches: main, master, dev, development, next`,
        };
    }

    return { valid: true };
}

function main() {
    const branch = getCurrentBranch();
    const result = validateBranchName(branch);
    if (!result.valid) {
        console.error(`\x1b[31m❌ [branch-culture] ${result.reason}\x1b[0m`);
        process.exit(1);
    }
    console.log(
        `\x1b[32m✔ [branch-culture] Branch "${branch}" follows project conventions.\x1b[0m`,
    );
}

if (import.meta.main) {
    main();
}
