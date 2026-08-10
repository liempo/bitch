import { Compile } from "typebox/compile";
import { fixtureCorpus } from "../fixtures/corpus.js";
import type { Fixture, FixtureCorpus } from "../fixtures/types.js";
import { httpOperations } from "../http/operations.js";
import type { HttpBodyContract } from "../http/types.js";
import { schemaRegistry, type SchemaName } from "../schemas/registry.js";
import { securityErrors } from "./security.js";
import { semanticErrors } from "./semantics.js";
import type { FixtureValidationError } from "./types.js";

const validators = Object.fromEntries(
  Object.entries(schemaRegistry).map(([name, schema]) => [name, Compile(schema)]),
) as Record<SchemaName, ReturnType<typeof Compile>>;

function compareAscii(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function isFixture(value: unknown): value is Fixture {
  return value !== null && typeof value === "object" && "schema" in value && "value" in value;
}

function normalizeError(
  fixtureName: string,
  error: { path?: string; keyword?: string; message?: string },
): FixtureValidationError {
  return {
    fixture: fixtureName,
    path: error.path ?? "",
    code: error.keyword ?? "schema_validation_failed",
    message: error.message ?? "Fixture does not match its schema.",
  };
}

function fixtureAt(corpus: FixtureCorpus, reference: string): Fixture | undefined {
  const splitAt = reference.indexOf(".");
  if (splitAt < 1) return undefined;
  return corpus.fixtures[reference.slice(0, splitAt)]?.[reference.slice(splitAt + 1)];
}

function validateHttpBody(
  corpus: FixtureCorpus,
  operationId: string,
  direction: "request" | "response",
  contract: HttpBodyContract,
): FixtureValidationError[] {
  const errors: FixtureValidationError[] = [];
  if (contract.fixtures.length === 0) {
    errors.push({
      fixture: "$http",
      path: `/${operationId}/${direction}/fixtures`,
      code: "http_fixture_missing",
      message: `HTTP ${direction} must reference at least one fixture.`,
    });
  }
  for (const reference of contract.fixtures) {
    const referencedFixture = fixtureAt(corpus, reference);
    if (!referencedFixture) {
      errors.push({
        fixture: "$http",
        path: `/${operationId}/${direction}/fixtures`,
        code: "http_fixture_missing",
        message: `HTTP fixture "${reference}" does not exist.`,
      });
      continue;
    }
    const expectedSchema = contract.schema === "binary" ? "BinaryHttpBodyFixture" : contract.schema;
    if (referencedFixture.schema !== expectedSchema) {
      errors.push({
        fixture: "$http",
        path: `/${operationId}/${direction}/fixtures`,
        code: "http_fixture_schema_mismatch",
        message: `HTTP fixture "${reference}" must use schema "${expectedSchema}".`,
      });
    }
  }
  return errors;
}

function httpErrors(corpus: FixtureCorpus): FixtureValidationError[] {
  const errors: FixtureValidationError[] = [];
  const operationKeys = new Set<string>();
  const operationIds = new Set<string>();
  for (const operation of httpOperations) {
    const operationKey = `${operation.method.toUpperCase()} ${operation.path}`;
    if (operationKeys.has(operationKey)) {
      errors.push({
        fixture: "$http",
        path: operationKey,
        code: "http_operation_duplicate",
        message: `HTTP operation "${operationKey}" is duplicated.`,
      });
    }
    operationKeys.add(operationKey);
    if (operationIds.has(operation.operationId)) {
      errors.push({
        fixture: "$http",
        path: `/${operation.operationId}`,
        code: "http_operation_id_duplicate",
        message: `HTTP operationId "${operation.operationId}" is duplicated.`,
      });
    }
    operationIds.add(operation.operationId);

    if (operation.request) {
      errors.push(...validateHttpBody(corpus, operation.operationId, "request", operation.request));
    }
    const statuses = new Set<number>();
    for (const response of operation.responses) {
      if (statuses.has(response.status)) {
        errors.push({
          fixture: "$http",
          path: `/${operation.operationId}/responses/${response.status}`,
          code: "http_response_status_duplicate",
          message: `HTTP status ${response.status} is duplicated for operation "${operation.operationId}".`,
        });
      }
      statuses.add(response.status);
      if (response.body) {
        errors.push(...validateHttpBody(corpus, operation.operationId, "response", response.body));
      }
    }
    if (operation.problemFixture) {
      const problem = fixtureAt(corpus, operation.problemFixture);
      if (!problem) {
        errors.push({
          fixture: "$http",
          path: `/${operation.operationId}/problemFixture`,
          code: "http_fixture_missing",
          message: `HTTP problem fixture "${operation.problemFixture}" does not exist.`,
        });
      } else if (problem.schema !== "ProblemDetails") {
        errors.push({
          fixture: "$http",
          path: `/${operation.operationId}/problemFixture`,
          code: "http_fixture_schema_mismatch",
          message: `HTTP problem fixture "${operation.problemFixture}" must use schema "ProblemDetails".`,
        });
      }
    }
  }
  return errors;
}

export function validateFixtureCorpus(corpus: FixtureCorpus): FixtureValidationError[] {
  const errors: FixtureValidationError[] = [];
  if (corpus.version !== 1) {
    errors.push({
      fixture: "$corpus",
      path: "/version",
      code: "version_mismatch",
      message: "Fixture corpus version must be 1.",
    });
  }
  if (corpus.piVersion !== "0.83.0") {
    errors.push({
      fixture: "$corpus",
      path: "/piVersion",
      code: "pi_version_mismatch",
      message: "Fixture corpus must target Pi 0.83.0.",
    });
  }

  for (const [groupName, group] of Object.entries(corpus.fixtures)) {
    for (const [name, candidate] of Object.entries(group)) {
      const fixtureName = `${groupName}.${name}`;
      if (!isFixture(candidate)) {
        errors.push({
          fixture: fixtureName,
          path: "",
          code: "fixture_record_invalid",
          message: "Fixture must contain schema and value fields.",
        });
        continue;
      }
      if (!(candidate.schema in validators)) {
        errors.push({
          fixture: fixtureName,
          path: "/schema",
          code: "schema_unknown",
          message: `Unknown schema "${candidate.schema}".`,
        });
        continue;
      }
      const validator = validators[candidate.schema];
      for (const error of validator.Errors(candidate.value)) {
        errors.push(normalizeError(fixtureName, error));
      }
      errors.push(...securityErrors(fixtureName, candidate.value));
    }
  }

  errors.push(...semanticErrors(corpus));
  errors.push(...httpErrors(corpus));

  return errors.sort((left, right) =>
    compareAscii(left.fixture, right.fixture)
      || compareAscii(left.path, right.path)
      || compareAscii(left.code, right.code)
      || compareAscii(left.message, right.message),
  );
}

export { fixtureCorpus };
