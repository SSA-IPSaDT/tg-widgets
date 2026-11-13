import { describe, expect, it } from 'bun:test';
import { validateBranchName } from '../scripts/check-branch';
import {
    parseSemver,
    incrementSemver,
    generateChangelogSection,
    updateChangelogContent,
    bumpVersion,
} from '../scripts/bump-version';

describe('Automation Scripts Module', () => {
    describe('check-branch.ts', () => {
        it('validates standard conventional feature and fix branches', () => {
            expect(validateBranchName('feat/interactive-widgets').valid).toBe(true);
            expect(validateBranchName('fix/storage-leak-ttl').valid).toBe(true);
            expect(validateBranchName('chore/deps-bump').valid).toBe(true);
            expect(validateBranchName('docs/readme-examples').valid).toBe(true);
            expect(validateBranchName('refactor/action-decoder').valid).toBe(true);
            expect(validateBranchName('test/action-routing-suite').valid).toBe(true);
            expect(validateBranchName('perf/minifier-cache').valid).toBe(true);
            expect(validateBranchName('release/v0.3.0').valid).toBe(true);
            expect(validateBranchName('hotfix/critical-patch').valid).toBe(true);
        });

        it('validates main branch names and detached HEAD', () => {
            expect(validateBranchName('main').valid).toBe(true);
            expect(validateBranchName('master').valid).toBe(true);
            expect(validateBranchName('dev').valid).toBe(true);
            expect(validateBranchName('development').valid).toBe(true);
            expect(validateBranchName('HEAD').valid).toBe(true);
            expect(validateBranchName('').valid).toBe(true);
        });

        it('rejects unconventional branch names with helpful guidance', () => {
            const bad1 = validateBranchName('my-branch');
            expect(bad1.valid).toBe(false);
            expect(bad1.reason).toContain('Allowed formats');

            const bad2 = validateBranchName('random_fix');
            expect(bad2.valid).toBe(false);

            const bad3 = validateBranchName('feature_without_slash');
            expect(bad3.valid).toBe(false);
        });
    });

    describe('bump-version.ts', () => {
        it('parses valid semver versions correctly', () => {
            expect(parseSemver('0.2.0')).toEqual([0, 2, 0]);
            expect(parseSemver('v1.5.3')).toEqual([1, 5, 3]);
            expect(() => parseSemver('invalid')).toThrow(/Invalid semver version/);
        });

        it('increments semver versions correctly for patch, minor, and major', () => {
            expect(incrementSemver('0.2.0', 'patch')).toBe('0.2.1');
            expect(incrementSemver('0.2.0', 'minor')).toBe('0.3.0');
            expect(incrementSemver('0.2.0', 'major')).toBe('1.0.0');

            expect(incrementSemver('1.4.9', 'patch')).toBe('1.4.10');
            expect(incrementSemver('1.4.9', 'minor')).toBe('1.5.0');
            expect(incrementSemver('1.4.9', 'major')).toBe('2.0.0');
        });

        it('generates structured changelog sections grouping commits', () => {
            const commits = [
                {
                    hash: 'abc1234',
                    type: 'feat',
                    scope: 'screen',
                    description: 'add static paradigm',
                    isBreaking: false,
                    raw: 'feat(screen): add static paradigm',
                },
                {
                    hash: 'def5678',
                    type: 'fix',
                    description: 'resolve storage TTL expiration',
                    isBreaking: false,
                    raw: 'fix: resolve storage TTL expiration',
                },
                {
                    hash: 'ghi9012',
                    type: 'perf',
                    description: 'optimize terser pass',
                    isBreaking: false,
                    raw: 'perf: optimize terser pass',
                },
            ];

            const section = generateChangelogSection('0.3.0', '2026-11-13', commits);
            expect(section).toContain('## [0.3.0] - 2026-11-13');
            expect(section).toContain('### Features');
            expect(section).toContain('**screen**: add static paradigm (abc1234)');
            expect(section).toContain('### Bug Fixes');
            expect(section).toContain('resolve storage TTL expiration (def5678)');
            expect(section).toContain('### Performance Improvements');
            expect(section).toContain('optimize terser pass (ghi9012)');
        });

        it('updates changelog content keeping preamble and inserting new section', () => {
            const existing = `# Changelog\n\nPreamble text.\n\n---\n\n## [0.2.0] - 2026-11-12\n\n- Previous feature.\n`;
            const newSection = `## [0.3.0] - 2026-11-13\n\n- New feature.\n`;

            const updated = updateChangelogContent(existing, newSection);
            expect(updated).toContain('# Changelog');
            expect(updated).toContain('## [0.3.0] - 2026-11-13');
            expect(updated).toContain('## [0.2.0] - 2026-11-12');
            expect(updated.indexOf('0.3.0')).toBeLessThan(updated.indexOf('0.2.0'));
        });

        it('supports dry-run mode without modifying filesystem', () => {
            const res = bumpVersion({ target: 'patch', dryRun: true });
            expect(res.oldVersion).toBe('0.2.0');
            expect(res.newVersion).toBe('0.2.1');
        });
    });
});
