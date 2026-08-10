import { httpOperations } from "../http/operations.js";
import type { HttpBodyContract, HttpOperation } from "../http/types.js";
import { schemaRegistry } from "../schemas/registry.js";

function schemaReference(schema: HttpBodyContract["schema"]): Record<string, unknown> {
  return schema === "binary"
    ? { type: "string", format: "binary" }
    : { $ref: `#/components/schemas/${schema}` };
}

function pathParameterSchema(name: string): Record<string, unknown> {
  if (["artifactId", "commandId", "dialogId", "workspaceId"].includes(name)) {
    return { type: "string", format: "uuid" };
  }
  return { type: "string", minLength: 1 };
}

function pathParameterExample(name: string): string {
  const examples: Record<string, string> = {
    artifactId: "550e8400-e29b-41d4-a716-446655440004",
    commandId: "550e8400-e29b-41d4-a716-446655440001",
    conversationId: "0195f6f4-7c5b-7000-8000-000000000001",
    dialogId: "550e8400-e29b-41d4-a716-446655440002",
    providerId: "scripted",
    workspaceId: "550e8400-e29b-41d4-a716-446655440010",
  };
  return examples[name] ?? "value";
}

function pathParameters(path: string): unknown[] {
  return [...path.matchAll(/\{([^}]+)\}/g)].map((match) => {
    const name = match[1] ?? "";
    return {
      name,
      in: "path",
      required: true,
      schema: pathParameterSchema(name),
      example: pathParameterExample(name),
    };
  });
}

function mediaContract(contract: HttpBodyContract): Record<string, unknown> {
  if (contract.mediaType === "text/event-stream" && contract.schema !== "binary") {
    return {
      schema: { type: "string" },
      "x-event-schema": schemaReference(contract.schema),
      "x-fixtures": contract.fixtures,
    };
  }
  return {
    schema: schemaReference(contract.schema),
    "x-fixtures": contract.fixtures,
  };
}

function responseHeaders(headers: NonNullable<HttpOperation["responses"][number]["headers"]>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(headers).map(([name, value]) => {
    const { required, ...header } = value;
    return [name, required === true ? { ...header, "x-required": true } : header];
  }));
}

export function buildOpenApi(): Record<string, unknown> {
  const paths: Record<string, Record<string, unknown>> = {};
  for (const operation of httpOperations) {
    const responses: Record<string, unknown> = {};
    for (const contract of operation.responses) {
      const generatedResponse: Record<string, unknown> = { description: contract.description };
      if (contract.body) {
        generatedResponse.content = {
          [contract.body.mediaType ?? "application/json"]: mediaContract(contract.body),
        };
      }
      if (contract.headers) generatedResponse.headers = responseHeaders(contract.headers);
      responses[String(contract.status)] = generatedResponse;
    }
    if (operation.problemFixture) {
      responses.default = {
        description: "Problem Details",
        content: {
          "application/problem+json": {
            schema: { $ref: "#/components/schemas/ProblemDetails" },
            "x-fixtures": [operation.problemFixture],
          },
        },
      };
    }

    const openApiOperation: Record<string, unknown> = {
      operationId: operation.operationId,
      parameters: [
        ...pathParameters(operation.path),
        ...(operation.parameters ?? []),
      ],
      responses,
    };
    if (operation.request) {
      openApiOperation.requestBody = {
        required: true,
        content: {
          [operation.request.mediaType ?? "application/json"]: mediaContract(operation.request),
        },
      };
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
