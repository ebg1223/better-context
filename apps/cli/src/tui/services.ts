import { BunContext } from '@effect/platform-bun';
import { Effect, Layer, ManagedRuntime, Stream } from 'effect';
import { ConfigService } from '../services/config.ts';
import { OcService, type OcEvent } from '../services/oc.ts';
import type { Repo } from './types.ts';

// Create a layer with all dependencies
// We need both OcService and ConfigService available in the runtime
// OcService.Default already has ConfigService.Default as a dependency, but we still need
// to expose ConfigService in the layer so effects can access it directly
// Use provideMerge to keep both custom services AND platform services (Path, FileSystem) in the output
const ServicesLayer = Layer.mergeAll(OcService.Default, ConfigService.Default).pipe(
	Layer.provideMerge(BunContext.layer)
);

// Create a managed runtime - this is NOT a promise, it's the runtime directly
const runtime = ManagedRuntime.make(ServicesLayer);

// Services bridge - async functions that React can call
export const services = {
	// Config operations
	getRepos: (): Promise<Repo[]> =>
		runtime.runPromise(
			Effect.gen(function* () {
				const config = yield* ConfigService;
				const repos = yield* config.getRepos();
				// Convert readonly to mutable
				return repos.map((r) => ({ ...r }));
			})
		),

	addRepo: (repo: Repo): Promise<Repo> =>
		runtime.runPromise(
			Effect.gen(function* () {
				const config = yield* ConfigService;
				const added = yield* config.addRepo(repo);
				return { ...added };
			})
		),

	removeRepo: (name: string): Promise<void> =>
		runtime.runPromise(
			Effect.gen(function* () {
				const config = yield* ConfigService;
				yield* config.removeRepo(name);
			})
		),

	getModel: (): Promise<{ provider: string; model: string }> =>
		runtime.runPromise(
			Effect.gen(function* () {
				const config = yield* ConfigService;
				return yield* config.getModel();
			})
		),

	updateModel: (provider: string, model: string): Promise<{ provider: string; model: string }> =>
		runtime.runPromise(
			Effect.gen(function* () {
				const config = yield* ConfigService;
				return yield* config.updateModel({ provider, model });
			})
		),

	// OC operations
	spawnTui: (tech: string): Promise<void> =>
		runtime.runPromise(
			Effect.gen(function* () {
				const oc = yield* OcService;
				yield* oc.spawnTui({ tech });
			})
		),

	askQuestion: (tech: string, question: string, onEvent: (event: OcEvent) => void): Promise<void> =>
		runtime.runPromise(
			Effect.gen(function* () {
				const oc = yield* OcService;
				const stream = yield* oc.askQuestion({
					question,
					tech,
					suppressLogs: true
				});

				yield* Stream.runForEach(stream, (event) => Effect.sync(() => onEvent(event)));
			})
		)
};

export type Services = typeof services;
