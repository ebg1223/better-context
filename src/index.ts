import { BunRuntime } from "@effect/platform-bun";
import { Effect, Layer } from "effect";
import { OcService } from "./services/oc";

const programLayer = Layer.mergeAll(OcService.Default);

const program = Effect.gen(function* () {
  yield* Effect.log("this will be interesting soon I think");

  const oc = yield* OcService;

  yield* oc.testPrompting(
    "How do I write a hello world program in elixir? Don't write it, just explain how to do it."
  );
}).pipe(
  Effect.provide(programLayer),
  Effect.catchAll((error) => {
    console.error("Error:", error);
    return Effect.void;
  })
);

BunRuntime.runMain(program);
