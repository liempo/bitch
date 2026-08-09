import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { renderArtifacts } from "../src/generate.js";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));

describe("generated protocol artifacts", () => {
  it("render deterministically and match committed files", async () => {
    const first = renderArtifacts();
    const second = renderArtifacts();
    expect(second).toEqual(first);
    for (const [relativePath, expected] of first) {
      await expect(readFile(`${packageRoot}/${relativePath}`, "utf8")).resolves.toBe(expected);
    }
  });
});
