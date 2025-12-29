import { FileSystem, Path } from '@effect/platform';
import { Effect } from 'effect';
import { ConfigService } from './config.ts';
import { SyncError } from '../lib/errors.ts';
import { generateSkillContent, type RepoInfo } from '../lib/templates.ts';
import { expandHome } from '../lib/utils/files.ts';

// OpenCode paths
const OPENCODE_CONFIG_DIR = '~/.config/opencode';
const OPENCODE_SKILL_DIR = '~/.config/opencode/skill/btca';

// Claude Code paths
const CLAUDE_CONFIG_DIR = '~/.claude';
const CLAUDE_SKILL_DIR = '~/.claude/skills/btca';

// Codex paths (uses same SKILL.md format)
const CODEX_CONFIG_DIR = '~/.codex';
const CODEX_SKILL_DIR = '~/.codex/skills/btca';

const SKILL_FILENAME = 'SKILL.md';

interface SyncTarget {
	name: string;
	configDir: string;
	skillDir: string;
	filename: string;
	generateContent: (repos: RepoInfo[]) => string;
}

const SYNC_TARGETS: SyncTarget[] = [
	{
		name: 'OpenCode',
		configDir: OPENCODE_CONFIG_DIR,
		skillDir: OPENCODE_SKILL_DIR,
		filename: SKILL_FILENAME,
		generateContent: generateSkillContent
	},
	{
		name: 'Claude Code',
		configDir: CLAUDE_CONFIG_DIR,
		skillDir: CLAUDE_SKILL_DIR,
		filename: SKILL_FILENAME,
		generateContent: generateSkillContent
	},
	{
		name: 'Codex',
		configDir: CODEX_CONFIG_DIR,
		skillDir: CODEX_SKILL_DIR,
		filename: SKILL_FILENAME,
		generateContent: generateSkillContent
	}
];

const syncService = Effect.gen(function* () {
	const fs = yield* FileSystem.FileSystem;
	const path = yield* Path.Path;
	const config = yield* ConfigService;

	const getFilePath = (target: SyncTarget) =>
		expandHome(target.skillDir).pipe(Effect.map((dir) => path.join(dir, target.filename)));

	const isTargetInstalled = (target: SyncTarget) =>
		Effect.gen(function* () {
			const configDir = yield* expandHome(target.configDir);
			return yield* fs.exists(configDir);
		});

	return {
		sync: () =>
			Effect.gen(function* () {
				const repos = yield* config.getRepos();
				if (repos.length === 0) {
					return yield* Effect.fail(
						new SyncError({ message: 'No repos configured. Add repos first.' })
					);
				}

				// Extract repo info for templates
				const repoInfos: RepoInfo[] = repos.map((r) => ({
					name: r.name,
					url: r.url,
					specialNotes: r.specialNotes
				}));

				const synced: { target: string; path: string }[] = [];

				// Sync to each installed target
				for (const target of SYNC_TARGETS) {
					const installed = yield* isTargetInstalled(target);
					if (!installed) continue;

					// Ensure directory exists
					const dir = yield* expandHome(target.skillDir);
					yield* fs.makeDirectory(dir, { recursive: true });

					// Generate and write file
					const filePath = yield* getFilePath(target);
					yield* fs.writeFileString(filePath, target.generateContent(repoInfos));
					synced.push({ target: target.name, path: filePath });
				}

				if (synced.length === 0) {
					return yield* Effect.fail(
						new SyncError({
							message: 'No supported tools found. Install OpenCode, Claude Code, or Codex first.'
						})
					);
				}

				return { synced };
			}),

		unsync: () =>
			Effect.gen(function* () {
				const removed: string[] = [];

				for (const target of SYNC_TARGETS) {
					const filePath = yield* getFilePath(target);
					const dir = yield* expandHome(target.skillDir);

					if (yield* fs.exists(filePath)) {
						yield* fs.remove(filePath);
						removed.push(filePath);
					}

					// Try to remove the directory if empty (ignore errors)
					if (yield* fs.exists(dir)) {
						yield* fs.remove(dir).pipe(Effect.ignore);
					}
				}

				return { removed };
			}),

		isSynced: () =>
			Effect.gen(function* () {
				// Check if synced to at least one target
				for (const target of SYNC_TARGETS) {
					const filePath = yield* getFilePath(target);
					if (yield* fs.exists(filePath)) {
						return true;
					}
				}
				return false;
			})
	};
});

export class SyncService extends Effect.Service<SyncService>()('SyncService', {
	effect: syncService,
	dependencies: [ConfigService.Default]
}) {}
