import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fixtureCorpus } from "./fixture-data.js";
import { httpOperations } from "./http-contract.js";
import { schemaRegistry } from "./schemas.js";

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, child]) => [key, stable(child)]));
}
function json(value: unknown): string {
  return `${JSON.stringify(stable(value), null, 2)}\n`;
}
function schemaReference(schema: string | "binary"): Record<string, unknown> {
  return schema === "binary" ? { type: "string", format: "binary" } : { $ref: `#/components/schemas/${schema}` };
}
function pathParameters(path: string): unknown[] {
  return [...path.matchAll(/\{([^}]+)\}/g)].map((match) => ({
    name: match[1], in: "path", required: true, schema: { type: "string", minLength: 1 },
  }));
}
function queryParameters(operationId: string): unknown[] {
  if (operationId === "conversationEvents") return [{ name: "view", in: "query", required: false, schema: { type: "string", enum: ["background", "foreground"], default: "background" } }];
  if (operationId === "getConversationEntries") return [{ name: "since", in: "query", required: false, schema: { type: "string", minLength: 1 } }];
  if (["listConversations", "listWorkspaces", "listTrashedConversations", "listTrashedWorkspaces"].includes(operationId)) {
    return [
      { name: "limit", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 200, default: 50 } },
      { name: "cursor", in: "query", required: false, schema: { type: "string", minLength: 1 } },
    ];
  }
  return [];
}
function buildOpenApi(): Record<string, unknown> {
  const paths: Record<string, Record<string, unknown>> = {};
  for (const operation of httpOperations) {
    const mediaType = operation.responseMediaType ?? "application/json";
    const successResponse: Record<string, unknown> = { description: "Success" };
    if (operation.responseSchema) {
      const actualMediaType = mediaType === "dynamic" ? "application/octet-stream" : mediaType;
      successResponse.content = { [actualMediaType]: { schema: schemaReference(operation.responseSchema) } };
    }
    const responses: Record<string, unknown> = { [operation.successStatus]: successResponse };
    if (operation.path.startsWith("/v1/")) {
      responses.default = {
        description: "Problem Details",
        content: { "application/problem+json": { schema: { $ref: "#/components/schemas/ProblemDetails" } } },
      };
    } else if (operation.operationId === "healthReady") {
      responses[503] = { description: "Not ready", content: { "application/json": { schema: { $ref: "#/components/schemas/HealthResult" } } } };
    }
    const parameters = [...pathParameters(operation.path), ...queryParameters(operation.operationId)];
    const openApiOperation: Record<string, unknown> = {
      operationId: operation.operationId,
      parameters,
      responses,
      "x-fixture-request": operation.requestFixture,
      "x-fixture-response": operation.responseFixture,
    };
    if (operation.requestSchema) {
      const requestMediaType = operation.requestSchema === "binary" ? "application/octet-stream" : "application/json";
      openApiOperation.requestBody = { required: true, content: { [requestMediaType]: { schema: schemaReference(operation.requestSchema) } } };
    }
    (paths[operation.path] ??= {})[operation.method] = openApiOperation;
  }
  return {
    openapi: "3.1.0",
    info: { title: "BITCH Agent Server API", version: "1.0.0" },
    paths,
    components: { schemas: schemaRegistry },
  };
}

export function renderArtifacts(): Map<string, string> {
  const artifacts = new Map<string, string>();
  for (const [name, schema] of Object.entries(schemaRegistry).sort(([left], [right]) => left.localeCompare(right))) {
    artifacts.set(`generated/json-schema/v1/${name}.schema.json`, json({ $schema: "https://json-schema.org/draft/2020-12/schema", $id: `https://bitch.invalid/schema/v1/${name}.json`, title: name, ...schema }));
  }
  artifacts.set("generated/openapi-v1.json", json(buildOpenApi()));
  artifacts.set("fixtures/v1/protocol.json", json(fixtureCorpus));
  artifacts.set("fixtures/v1/http.json", json({ version: 1, operations: httpOperations }));
  const hashes = Object.fromEntries([...artifacts].map(([relativePath, content]) => [relativePath, createHash("sha256").update(content).digest("hex")]));
  artifacts.set("generated/manifest.json", json({ version: 1, piVersion: "0.83.0", files: hashes }));
  return artifacts;
}

async function main(): Promise<void> {
  const check = process.argv.includes("--check");
  const stale: string[] = [];
  for (const [relativePath, content] of renderArtifacts()) {
    const absolutePath = resolve(packageRoot, relativePath);
    if (check) {
      try {
        if (await readFile(absolutePath, "utf8") !== content) stale.push(relativePath);
      } catch {
        stale.push(relativePath);
      }
    } else {
      await mkdir(dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, content, "utf8");
    }
  }
  if (stale.length > 0) {
    console.error(`Generated protocol artifacts are stale:\n${stale.map((path) => `- ${path}`).join("\n")}`);
    process.exitCode = 1;
    return;
  }
  console.log(check ? `Generated protocol artifacts are current (${renderArtifacts().size} files).` : `Generated ${renderArtifacts().size} protocol artifacts.`);
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) await main();
