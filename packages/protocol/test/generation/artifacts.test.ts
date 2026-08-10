import { execFile } from "node:child_process";
import { readFile, rm, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderArtifacts } from "../../src/generation/index.js";

const execute = promisify(execFile);
const packageRoot = fileURLToPath(new URL("../..", import.meta.url));

describe("generated protocol artifacts", () => {
  it("render deterministically and match every committed file", async () => {
    const first = renderArtifacts();
    const second = renderArtifacts();
    expect(second).toEqual(first);
    for (const [relativePath, expected] of first) {
      await expect(readFile(`${packageRoot}/${relativePath}`, "utf8")).resolves.toBe(expected);
    }
  });

  it("rejects an unexpected generated artifact through the public command", async () => {
    const unexpectedPath = `${packageRoot}/generated/json-schema/v1/Unexpected.schema.json`;
    await writeFile(unexpectedPath, "{}\n", "utf8");
    try {
      await expect(execute(process.execPath, [
        "--import",
        "tsx",
        "src/generation/cli.ts",
        "--check",
      ], { cwd: packageRoot })).rejects.toMatchObject({
        stderr: expect.stringContaining("unexpected: generated/json-schema/v1/Unexpected.schema.json"),
      });
    } finally {
      await rm(unexpectedPath, { force: true });
    }
  });
});
