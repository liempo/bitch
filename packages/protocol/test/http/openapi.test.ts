import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

interface OpenApiMedia {
  "x-fixtures"?: string[];
}
interface OpenApiResponse {
  content?: Record<string, OpenApiMedia>;
}
interface OpenApiOperation {
  parameters?: unknown[];
  requestBody?: { content: Record<string, OpenApiMedia> };
  responses: Record<string, OpenApiResponse>;
}
interface OpenApiDocument {
  paths: Record<string, Record<string, OpenApiOperation>>;
}

const packageRoot = fileURLToPath(new URL("../..", import.meta.url));

async function openApi(): Promise<OpenApiDocument> {
  return JSON.parse(await readFile(`${packageRoot}/generated/openapi-v1.json`, "utf8")) as OpenApiDocument;
}

describe("generated OpenAPI contract", () => {
  it("contains approved query and precondition headers", async () => {
    const document = await openApi();
    expect(document.paths["/v1/conversations"]?.get?.parameters).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: "workspaceId", in: "query", required: false }),
    ]));
    expect(document.paths["/v1/config/soul"]?.put?.parameters).toEqual(expect.arrayContaining([
      expect.objectContaining({
        name: "If-None-Match",
        in: "header",
        required: true,
        schema: { type: "string", const: "*" },
      }),
    ]));
  });

  it("contains every approved alternate success status", async () => {
    const document = await openApi();
    expect(Object.keys(document.paths["/v1/conversations"]?.post?.responses ?? {})).toEqual([
      "200",
      "201",
      "202",
      "default",
    ]);
    expect(Object.keys(document.paths["/v1/conversations/{conversationId}/commands"]?.post?.responses ?? {}))
      .toEqual(["200", "202", "default"]);
    expect(Object.keys(document.paths["/v1/providers/{providerId}/login"]?.post?.responses ?? {}))
      .toEqual(["200", "202", "default"]);
  });

  it("binds all request and mode variants to fixtures", async () => {
    const document = await openApi();
    expect(document.paths["/v1/status"]?.get?.responses["200"]?.content?.["application/json"]?.["x-fixtures"])
      .toEqual(["status.gateway", "status.directory"]);
    expect(document.paths["/v1/conversations/{conversationId}/commands"]?.post?.requestBody?.content["application/json"]?.["x-fixtures"])
      .toHaveLength(23);
    expect(document.paths["/v1/providers/{providerId}/login"]?.post?.requestBody?.content["application/json"]?.["x-fixtures"])
      .toHaveLength(4);
  });
});
