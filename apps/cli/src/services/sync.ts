import { FileSystem, Path } from '@effect/platform';
import { Effect } from 'effect';
import { ConfigService } from './config.ts';
import { SyncError } from '../lib/errors.ts';
import { generateToolContent, generateAgentContent } from '../lib/templates.ts';
import { expandHome } from '../lib/utils/files.ts';

const OPENCODE_CONFIG_DIR = '~/.config/opencode';
const TOOL_DIR = '~/.config/opencode/tool';
const AGENT_DIR = '~/.config/opencode/agent';
const TOOL_FILENAME = 'btca.ts';
const AGENT_FILENAME = 'btca-docs.md';

const syncService = Effect.gen(function* () {
	const fs = yield* FileSystem.FileSystem;
	const path = yield* Path.Path;
	const config = yield* ConfigService;

	const getToolPath = () =>
		expandHome(TOOL_DIR).pipe(Effect.map((dir) => path.join(dir, TOOL_FILENAME)));

	const getAgentPath = () =>
		expandHome(AGENT_DIR).pipe(Effect.map((dir) => path.join(dir, AGENT_FILENAME)));

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

				const repoNames = repos.map((r) => r.name);

				// Ensure directories exist
				const toolDir = yield* expandHome(TOOL_DIR);
				const agentDir = yield* expandHome(AGENT_DIR);
				yield* fs.makeDirectory(toolDir, { recursive: true });
				yield* fs.makeDirectory(agentDir, { recursive: true });

				// Generate and write files
				const toolPath = yield* getToolPath();
				const agentPath = yield* getAgentPath();

				yield* fs.writeFileString(toolPath, generateToolContent(repoNames));
				yield* fs.writeFileString(agentPath, generateAgentContent(repoNames));

				return { toolPath, agentPath };
			}),

		unsync: () =>
			Effect.gen(function* () {
				const toolPath = yield* getToolPath();
				const agentPath = yield* getAgentPath();

				const removed: string[] = [];

				if (yield* fs.exists(toolPath)) {
					yield* fs.remove(toolPath);
					removed.push(toolPath);
				}
				if (yield* fs.exists(agentPath)) {
					yield* fs.remove(agentPath);
					removed.push(agentPath);
				}

				return { removed };
			}),

		isSynced: () =>
			Effect.gen(function* () {
				const toolPath = yield* getToolPath();
				const agentPath = yield* getAgentPath();
				return (yield* fs.exists(toolPath)) && (yield* fs.exists(agentPath));
			})
	};
});

export class SyncService extends Effect.Service<SyncService>()('SyncService', {
	effect: syncService,
	dependencies: [ConfigService.Default]
}) {}
