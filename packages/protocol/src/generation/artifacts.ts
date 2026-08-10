import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fixtureCorpus } from "../fixtures/corpus.js";
import { httpOperations } from "../http/operations.js";
import { schemaRegistry } from "../schemas/registry.js";
import { buildOpenApi } from "./openapi.js";

export const packageRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const managedRoots = ["fixtures/v1", "generated"] as const;

function compareAscii(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => compareAscii(left, right))
      .map(([key, child]) => [key, stable(child)]),
  );
}

function json(value: unknown): string {
  return `${JSON.stringify(stable(value), null, 2)}\n`;
}

export function renderArtifacts(): Map<string, string> {
  const artifacts = new Map<string, string>();
  for (const [name, schema] of Object.entries(schemaRegistry).sort(([left], [right]) => compareAscii(left, right))) {
    artifacts.set(`generated/json-schema/v1/${name}.schema.json`, json({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: `https://bitch.invalid/schema/v1/${name}.json`,
      title: name,
      ...schema,
    }));
  }
  artifacts.set("generated/openapi-v1.json", json(buildOpenApi()));
  artifacts.set("fixtures/v1/protocol.json", json(fixtureCorpus));
  artifacts.set("fixtures/v1/http.json", json({ version: 1, operations: httpOperations }));
  const hashes = Object.fromEntries(
    [...artifacts].map(([relativePath, content]) => [
      relativePath,
      createHash("sha256").update(content).digest("hex"),
    ]),
  );
  artifacts.set("generated/manifest.json", json({ version: 1, piVersion: "0.83.0", files: hashes }));
  return artifacts;
}

async function listFiles(root: string, relativeDirectory: string): Promise<string[]> {
  const absoluteDirectory = resolve(root, relativeDirectory);
  let entries;
  try {
    entries = await readdir(absoluteDirectory, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  const files: string[] = [];
  for (const entry of entries) {
    const relativePath = `${relativeDirectory}/${entry.name}`;
    if (entry.isDirectory()) files.push(...await listFiles(root, relativePath));
    else if (entry.isFile() || entry.isSymbolicLink()) files.push(relativePath);
  }
  return files;
}

export interface ArtifactDifference {
  path: string;
  kind: "missing" | "stale" | "unexpected";
}

export async function findArtifactDifferences(
  root = packageRoot,
  artifacts = renderArtifacts(),
): Promise<ArtifactDifference[]> {
  const differences: ArtifactDifference[] = [];
  for (const [relativePath, content] of artifacts) {
    try {
      if (await readFile(resolve(root, relativePath), "utf8") !== content) {
        differences.push({ path: relativePath, kind: "stale" });
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        differences.push({ path: relativePath, kind: "missing" });
      } else {
        throw error;
      }
    }
  }
  const expected = new Set(artifacts.keys());
  for (const managedRoot of managedRoots) {
    for (const relativePath of await listFiles(root, managedRoot)) {
      if (!expected.has(relativePath)) differences.push({ path: relativePath, kind: "unexpected" });
    }
  }
  return differences.sort((left, right) =>
    compareAscii(left.path, right.path) || compareAscii(left.kind, right.kind),
  );
}

export async function writeArtifacts(root = packageRoot): Promise<void> {
  const artifacts = renderArtifacts();
  const differences = await findArtifactDifferences(root, artifacts);
  for (const difference of differences) {
    if (difference.kind === "unexpected") await rm(resolve(root, difference.path), { force: true });
  }
  for (const [relativePath, content] of artifacts) {
    const absolutePath = resolve(root, relativePath);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, content, "utf8");
  }
}
