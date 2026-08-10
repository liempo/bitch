import type { SchemaName } from "../schemas/registry.js";

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";
export type HttpMediaType = "application/json" | "application/octet-stream" | "text/event-stream" | "*/*";
export type HttpSchemaReference = SchemaName | "binary";

export interface HttpParameter {
  name: string;
  in: "query" | "header";
  required: boolean;
  schema: Record<string, unknown>;
  example?: unknown;
  description?: string;
}

export interface HttpBodyContract {
  schema: HttpSchemaReference;
  fixtures: readonly string[];
  mediaType?: HttpMediaType;
}

export interface HttpResponseContract {
  status: number;
  description: string;
  body?: HttpBodyContract;
  headers?: Readonly<Record<string, Record<string, unknown>>>;
}

export interface HttpOperation {
  operationId: string;
  method: HttpMethod;
  path: string;
  parameters?: readonly HttpParameter[];
  request?: HttpBodyContract;
  responses: readonly HttpResponseContract[];
  problemFixture?: string;
}
