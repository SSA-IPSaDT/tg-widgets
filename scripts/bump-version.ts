#!/usr/bin/env bun
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type ReleaseType = 'patch' | 'minor' | 'major' | 'auto';

export interface CommitInfo {
    hash: string;
    type: string;
    scope?: string;
    description: string;
    isBreaking: boolean;
    raw: string;
}

export function parseSemver(version: string): [number, number, number] {
    const clean = version.replace(/^v/, '');
    const parts = clean.split('.').map((p) => parseInt(p, 10));
    if (parts.length !== 3 || parts.some(isNaN)) {
        throw new Error(`Invalid semver version: "${version}"`);
    }
    return [parts[0], parts[1], parts[2]];
}

export function incrementSemver(
    currentVersion: string,
    releaseType: 'patch' | 'minor' | 'major',
): string {
    const [major, minor, patch] = parseSemver(currentVersion);
    switch (releaseType) {
        case 'major':
            return `${major + 1}.0.0`;
        case 'minor':
            return `${major}.${minor + 1}.0`;
        case 'patch':
            return `${major}.${minor}.${patch + 1}`;
    }
}

export function analyzeCommitsSinceLastTag(): {
    releaseType: 'patch' | 'minor' | 'major';
    commits: CommitInfo[];
} {
    let rawLog = '';
    try {
        let lastTag = '';
        try {
            lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null', {
                encoding: 'utf-8',
            }).trim();
        } catch {
            lastTag = '';
        }

        const range = lastTag ? `${lastTag}..HEAD` : 'HEAD~20..HEAD';
        try {
            rawLog = execSync(`git log ${range} --pretty=format:"%h|%s"`, {
                encoding: 'utf-8',
            }).trim();
        } catch {
            rawLog = execSync('git log -n 15 --pretty=format:"%h|%s"', {
                encoding: 'utf-8',
            }).trim();
        }
    } catch {
        rawLog = '';
    }

    const commits: CommitInfo[] = [];
    let detectedType: 'patch' | 'minor' | 'major' = 'patch';

    if (rawLog) {
        const lines = rawLog.split('\n').filter(Boolean);
        for (const line of lines) {
            const [hash, ...rest] = line.split('|');
            const message = rest.join('|').trim();

            const match = message.match(/^([a-z]+)(\(([^)]+)\))?(!)?:\s*(.+)$/i);
            const isBreaking = Boolean(match?.[4] || message.includes('BREAKING CHANGE:'));

            if (match) {
                const commitType = match[1].toLowerCase();
                const scope = match[3];
                const description = match[5];

                commits.push({
                    hash: hash || '',
                    type: commitType,
                    scope,
                    description,
                    isBreaking,
                    raw: message,
                });

                if (isBreaking) {
                    detectedType = 'major';
                } else if (commitType === 'feat' && detectedType !== 'major') {
                    detectedType = 'minor';
                }
            } else {
                commits.push({
                    hash: hash || '',
                    type: 'other',
                    description: message,
                    isBreaking: false,
                    raw: message,
                });
            }
        }
    }

    return { releaseType: detectedType, commits };
}

export function generateChangelogSection(
    newVersion: string,
    date: string,
    commits: CommitInfo[],
): string {
    const features = commits.filter((c) => c.type === 'feat');
    const fixes = commits.filter((c) => c.type === 'fix');
    const perfs = commits.filter((c) => c.type === 'perf');
    const others = commits.filter(
        (c) => !['feat', 'fix', 'perf'].includes(c.type) && c.type !== 'other',
    );

    const lines: string[] = [`## [${newVersion}] - ${date}`, ''];

    if (features.length > 0) {
        lines.push('### Features', '');
        for (const c of features) {
            const scopePrefix = c.scope ? `**${c.scope}**: ` : '';
            lines.push(`- ${scopePrefix}${c.description} (${c.hash})`);
        }
        lines.push('');
    }

    if (fixes.length > 0) {
        lines.push('### Bug Fixes', '');
        for (const c of fixes) {
            const scopePrefix = c.scope ? `**${c.scope}**: ` : '';
            lines.push(`- ${scopePrefix}${c.description} (${c.hash})`);
        }
        lines.push('');
    }

    if (perfs.length > 0) {
        lines.push('### Performance Improvements', '');
        for (const c of perfs) {
            const scopePrefix = c.scope ? `**${c.scope}**: ` : '';
            lines.push(`- ${scopePrefix}${c.description} (${c.hash})`);
        }
        lines.push('');
    }

    if (others.length > 0) {
        lines.push('### Maintenance & Refactoring', '');
        for (const c of others) {
            const scopePrefix = c.scope ? `**${c.scope}**: ` : '';
            lines.push(`- ${scopePrefix}${c.description} (${c.hash})`);
        }
        lines.push('');
    }

    if (features.length === 0 && fixes.length === 0 && perfs.length === 0 && others.length === 0) {
        lines.push(
            `- Automated maintenance release and synchronized updates for version ${newVersion}.`,
            '',
        );
    }

    return lines.join('\n');
}

export function updateChangelogContent(existingContent: string, newSection: string): string {
    const marker = '---';
    const markerIndex = existingContent.indexOf(marker);

    if (markerIndex === -1) {
        return `${existingContent.trim()}\n\n---\n\n${newSection}\n`;
    }

    const preamble = existingContent.slice(0, markerIndex + marker.length);
    const rest = existingContent.slice(markerIndex + marker.length).trim();

    return `${preamble}\n\n${newSection}\n---\n\n${rest}\n`;
}

export interface BumpOptions {
    target?: string;
    dryRun?: boolean;
    commit?: boolean;
    updateChangelog?: boolean;
}

export function bumpVersion(options: BumpOptions = {}): {
    oldVersion: string;
    newVersion: string;
    releaseType: string;
} {
    const projectRoot = resolve(import.meta.dir, '..');
    const pkgPath = resolve(projectRoot, 'package.json');
    const denoPath = resolve(projectRoot, 'deno.json');
    const changelogPath = resolve(projectRoot, 'CHANGELOG.md');

    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const deno = JSON.parse(readFileSync(denoPath, 'utf-8'));

    const oldVersion = pkg.version;
    const { releaseType: autoType, commits } = analyzeCommitsSinceLastTag();

    let newVersion: string;
    let effectiveReleaseType = options.target || 'auto';

    if (options.target === 'patch' || options.target === 'minor' || options.target === 'major') {
        newVersion = incrementSemver(oldVersion, options.target);
    } else if (options.target && /^\d+\.\d+\.\d+/.test(options.target)) {
        newVersion = options.target.replace(/^v/, '');
        effectiveReleaseType = 'custom';
    } else {
        // 'auto'
        newVersion = incrementSemver(oldVersion, autoType);
        effectiveReleaseType = `auto (${autoType})`;
    }

    console.log(
        `📦 Bumping version: \x1b[33m${oldVersion}\x1b[0m ➜ \x1b[32m${newVersion}\x1b[0m [${effectiveReleaseType}]`,
    );

    if (options.dryRun) {
        console.log('🔍 [dry-run] No files were modified.');
        return { oldVersion, newVersion, releaseType: effectiveReleaseType };
    }

    // 1. Update package.json
    pkg.version = newVersion;
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + '\n', 'utf-8');
    console.log('✔ Updated package.json');

    // 2. Update deno.json
    deno.version = newVersion;
    writeFileSync(denoPath, JSON.stringify(deno, null, 4) + '\n', 'utf-8');
    console.log('✔ Updated deno.json');

    // 3. Update CHANGELOG.md
    if (options.updateChangelog !== false) {
        const today = new Date().toISOString().split('T')[0];
        const newSection = generateChangelogSection(newVersion, today, commits);
        const currentChangelog = readFileSync(changelogPath, 'utf-8');
        const updatedChangelog = updateChangelogContent(currentChangelog, newSection);
        writeFileSync(changelogPath, updatedChangelog, 'utf-8');
        console.log('✔ Updated CHANGELOG.md');
    }

    // 4. Git commit & tag if requested
    if (options.commit) {
        try {
            execSync(`git add "${pkgPath}" "${denoPath}" "${changelogPath}"`, {
                stdio: 'inherit',
            });
            const commitMsg = `chore(release): bump version to v${newVersion}`;
            execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
            execSync(`git tag -a "v${newVersion}" -m "Release v${newVersion}"`, {
                stdio: 'inherit',
            });
            console.log(`✔ Created git release commit and tag v${newVersion}`);
        } catch (err) {
            console.error('⚠️ Failed to create git commit/tag:', err);
        }
    }

    return { oldVersion, newVersion, releaseType: effectiveReleaseType };
}

function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const commit = args.includes('--commit') || args.includes('-c');
    const noChangelog = args.includes('--no-changelog');

    const positional = args.filter((a) => !a.startsWith('-'));
    const target = positional[0] || 'auto';

    bumpVersion({
        target,
        dryRun,
        commit,
        updateChangelog: !noChangelog,
    });
}

if (import.meta.main) {
    main();
}
