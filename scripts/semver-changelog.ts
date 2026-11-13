import { execSync } from 'node:child_process';

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
    const docs = commits.filter((c) => c.type === 'docs');
    const perf = commits.filter((c) => c.type === 'perf');
    const refactor = commits.filter((c) => c.type === 'refactor');
    const other = commits.filter(
        (c) => !['feat', 'fix', 'docs', 'perf', 'refactor'].includes(c.type),
    );

    const lines: string[] = [`## [${newVersion}] - ${date}`, ''];

    const formatCommit = (c: CommitInfo) => {
        const scope = c.scope ? `**${c.scope}**: ` : '';
        const breaking = c.isBreaking ? ' *(BREAKING)*' : '';
        const hash = c.hash ? ` (${c.hash})` : '';
        return `- ${scope}${c.description}${breaking}${hash}`;
    };

    if (features.length > 0) {
        lines.push('### Features', '');
        features.forEach((c) => lines.push(formatCommit(c)));
        lines.push('');
    }

    if (fixes.length > 0) {
        lines.push('### Bug Fixes', '');
        fixes.forEach((c) => lines.push(formatCommit(c)));
        lines.push('');
    }

    if (perf.length > 0) {
        lines.push('### Performance Improvements', '');
        perf.forEach((c) => lines.push(formatCommit(c)));
        lines.push('');
    }

    if (refactor.length > 0) {
        lines.push('### Code Refactoring', '');
        refactor.forEach((c) => lines.push(formatCommit(c)));
        lines.push('');
    }

    if (docs.length > 0) {
        lines.push('### Documentation', '');
        docs.forEach((c) => lines.push(formatCommit(c)));
        lines.push('');
    }

    if (other.length > 0 && commits.length <= 15) {
        lines.push('### Maintenance & Tooling', '');
        other.forEach((c) => lines.push(formatCommit(c)));
        lines.push('');
    }

    return lines.join('\n');
}

export function updateChangelogContent(existingContent: string, newSection: string): string {
    const headerMatch = existingContent.match(/^(# Changelog[^\n]*\n+[^#]*\n+)/i);
    if (headerMatch) {
        const header = headerMatch[1];
        const rest = existingContent.slice(header.length);
        return `${header}${newSection}\n${rest}`;
    }
    return `# Changelog\n\n${newSection}\n${existingContent}`;
}
