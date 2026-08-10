import type { SchemaName } from "../schemas/registry.js";

export interface Fixture {
  schema: SchemaName;
  value: unknown;
}

export interface FixtureCorpus {
  version: 1;
  piVersion: "0.83.0";
  fixtures: Record<string, Record<string, Fixture>>;
}

export const fixture = (schema: SchemaName, value: unknown): Fixture => ({ schema, value });
