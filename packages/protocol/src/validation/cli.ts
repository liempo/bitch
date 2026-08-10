import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { FixtureCorpus } from "../fixtures/types.js";
import { validateFixtureCorpus } from "./corpus.js";

const packageRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const fixturePath = resolve(packageRoot, "fixtures/v1/protocol.json");
const corpus = JSON.parse(await readFile(fixturePath, "utf8")) as FixtureCorpus;
const errors = validateFixtureCorpus(corpus);
if (errors.length > 0) {
  for (const error of errors) {
    console.error(`${error.fixture}${error.path}: [${error.code}] ${error.message}`);
  }
  console.error(`Fixture validation failed with ${errors.length} error(s).`);
  process.exitCode = 1;
} else {
  const fixtureCount = Object.values(corpus.fixtures).reduce(
    (total, group) => total + Object.keys(group).length,
    0,
  );
  console.log(`Validated ${fixtureCount} protocol fixtures for v1 and Pi ${corpus.piVersion}.`);
}
