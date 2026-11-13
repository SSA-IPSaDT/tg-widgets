#!/usr/bin/env bun
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
    analyzeCommitsSinceLastTag,
    generateChangelogSection,
    incrementSemver,
    updateChangelogContent,
    type CommitInfo,
    type ReleaseType,
} from './semver-changelog';

export * from './semver-changelog';

export function bumpVersion(options: {
    releaseType?: ReleaseType;
    target?: ReleaseType;
    dryRun?: boolean;
    commit?: boolean;
}): {
    oldVersion: string;
    newVersion: string;
    releaseType: 'patch' | 'minor' | 'major';
    commits: CommitInfo[];
} {
    const rootDir = resolve(import.meta.dir, '..');
    const pkgPath = resolve(rootDir, 'package.json');
    const denoPath = resolve(rootDir, 'deno.json');
    const changelogPath = resolve(rootDir, 'CHANGELOG.md');

    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const oldVersion = pkg.version;

    const requestedRelease = options.target ?? options.releaseType;
    let targetRelease: 'patch' | 'minor' | 'major';
    let commitList: CommitInfo[] = [];

    if (!requestedRelease || requestedRelease === 'auto') {
        const analysis = analyzeCommitsSinceLastTag();
        targetRelease = analysis.releaseType;
        commitList = analysis.commits;
    } else {
        targetRelease = requestedRelease;
        const analysis = analyzeCommitsSinceLastTag();
        commitList = analysis.commits;
    }

    const newVersion = incrementSemver(oldVersion, targetRelease);
    const dateStr = new Date().toISOString().split('T')[0];

    console.log(`📦 Bumping version: ${oldVersion} ➜ ${newVersion} [${targetRelease}]`);

    if (options.dryRun) {
        console.log('🔍 [dry-run] No files were modified.');
        return { oldVersion, newVersion, releaseType: targetRelease, commits: commitList };
    }

    // 1. Update package.json
    pkg.version = newVersion;
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + '\n', 'utf-8');

    // 2. Update deno.json
    try {
        const denoJson = JSON.parse(readFileSync(denoPath, 'utf-8'));
        denoJson.version = newVersion;
        writeFileSync(denoPath, JSON.stringify(denoJson, null, 4) + '\n', 'utf-8');
    } catch {
        // ignore if not present
    }

    // 3. Update CHANGELOG.md
    try {
        const existingChangelog = readFileSync(changelogPath, 'utf-8');
        const section = generateChangelogSection(newVersion, dateStr, commitList);
        const updatedChangelog = updateChangelogContent(existingChangelog, section);
        writeFileSync(changelogPath, updatedChangelog, 'utf-8');
    } catch {
        // create new if missing
        const section = generateChangelogSection(newVersion, dateStr, commitList);
        writeFileSync(changelogPath, `# Changelog\n\n${section}\n`, 'utf-8');
    }

    // 4. Git commit & tag if requested
    if (options.commit) {
        console.log(`🔖 Formatting files and creating git commit and tag v${newVersion}...`);
        try {
            execSync('bun run format', { cwd: rootDir, stdio: 'ignore' });
        } catch {
            // ignore format failure
        }
        execSync(`git add ${pkgPath} ${denoPath} ${changelogPath}`, { cwd: rootDir });
        execSync(`git commit -m "chore(release): bump version to v${newVersion}"`, {
            cwd: rootDir,
        });
        execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`, { cwd: rootDir });
        console.log(`✔ Git release commit and tag v${newVersion} created!`);
    }

    return { oldVersion, newVersion, releaseType: targetRelease, commits: commitList };
}

function printUsage(): void {
    console.log(`
Usage: bun run bump-version.ts [type] [options]

Arguments:
  type            Release type: 'patch', 'minor', 'major', or 'auto' (default: auto)

Options:
  --dry-run       Preview version bump and changelog without writing to files
  --commit        Create git commit and git tag automatically
  --help          Show this message
`);
}

if (import.meta.main) {
    const args = process.argv.slice(2);
    if (args.includes('--help') || args.includes('-h')) {
        printUsage();
        process.exit(0);
    }

    const dryRun = args.includes('--dry-run');
    const commit = args.includes('--commit');
    const releaseTypeArg = args.find((a) => ['patch', 'minor', 'major', 'auto'].includes(a)) as
        ReleaseType | undefined;

    try {
        bumpVersion({
            releaseType: releaseTypeArg,
            dryRun,
            commit,
        });
    } catch (err) {
        console.error('❌ Error during version bump:', err);
        process.exit(1);
    }
}
