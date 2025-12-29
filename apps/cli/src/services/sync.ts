import { FileSystem, Path } from '@effect/platform';
import { Effect } from 'effect';
import { ConfigService } from './config.ts';
import { SyncError } from '../lib/errors.ts';
import { generateSkillContent, type RepoInfo } from '../lib/templates.ts';
import { expandHome } from '../lib/utils/files.ts';

const OPENCODE_CONFIG_DIR = '~/.config/opencode';
const SKILL_DIR = '~/.config/opencode/skill/btca';
const SKILL_FILENAME = 'SKILL.md';

const syncService = Effect.gen(function* () {
	const fs = yield* FileSystem.FileSystem;
	const path = yield* Path.Path;
	const config = yield* ConfigService;

	const getSkillPath = () =>
		expandHome(SKILL_DIR).pipe(Effect.map((dir) => path.join(dir, SKILL_FILENAME)));

	const checkOpenCodeInstalled = () =>
		Effect.gen(function* () {
			const configDir = yield* expandHome(OPENCODE_CONFIG_DIR);
			const exists = yield* fs.exists(configDir);
			if (!exists) {
				return yield* Effect.fail(
					new SyncError({ message: 'OpenCode not found. Install OpenCode first.' })
				);
			}
		});

	return {
		sync: () =>
			Effect.gen(function* () {
				yield* checkOpenCodeInstalled();

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

				// Ensure skill directory exists
				const skillDir = yield* expandHome(SKILL_DIR);
				yield* fs.makeDirectory(skillDir, { recursive: true });

				// Generate and write skill file
				const skillPath = yield* getSkillPath();
				yield* fs.writeFileString(skillPath, generateSkillContent(repoInfos));

				return { skillPath };
			}),

		unsync: () =>
			Effect.gen(function* () {
				const skillPath = yield* getSkillPath();
				const skillDir = yield* expandHome(SKILL_DIR);

				const removed: string[] = [];

				if (yield* fs.exists(skillPath)) {
					yield* fs.remove(skillPath);
					removed.push(skillPath);
				}

				// Try to remove the btca skill directory if empty
				if (yield* fs.exists(skillDir)) {
					yield* fs.remove(skillDir).pipe(Effect.ignore);
				}

				return { removed };
			}),

		isSynced: () =>
			Effect.gen(function* () {
				const skillPath = yield* getSkillPath();
				return yield* fs.exists(skillPath);
			})
	};
});

export class SyncService extends Effect.Service<SyncService>()('SyncService', {
	effect: syncService,
	dependencies: [ConfigService.Default]
}) {}
