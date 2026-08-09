import { Compile } from "typebox/compile";
import { httpOperations } from "./http-contract.js";
import { commandTypes, conversationEventTypes, gatewayEventTypes, schemaRegistry, type SchemaName } from "./schemas.js";
import { fixtureCorpus, type Fixture, type FixtureCorpus } from "./fixture-data.js";

export interface FixtureValidationError {
  fixture: string;
  path: string;
  code: string;
  message: string;
}

const validators = Object.fromEntries(
  Object.entries(schemaRegistry).map(([name, schema]) => [name, Compile(schema)]),
) as Record<SchemaName, ReturnType<typeof Compile>>;

const requiredGroups: Record<string, readonly string[]> = {
  commands: commandTypes,
  receipts: ["accepted", "running", "failed", "interrupted", ...commandTypes],
  conversationEvents: conversationEventTypes,
  gatewayEvents: gatewayEventTypes,
  piContent: ["text", "thinking", "image", "toolCall"],
  piMessages: ["user", "assistant", "toolResult", "bashExecution", "custom", "branchSummary", "compactionSummary"],
  piEntries: ["message", "thinkingLevelChange", "modelChange", "compaction", "branchSummary", "custom", "customMessage", "label", "sessionInfo"],
  dialogs: ["value", "confirmation", "cancelled"],
  pendingDialogs: ["select", "confirm", "input", "editor"],
  providerPrompts: ["text", "secret", "manualCode", "select"],
  providerNotifications: ["info", "authUrl", "deviceCode", "progress"],
  providerLoginResults: ["running", "needsInput", "completed", "failed", "cancelled"],
  assistantEvents: ["start", "textStart", "textDelta", "textEnd", "thinkingStart", "thinkingDelta", "thinkingEnd", "toolcallStart", "toolcallDelta", "toolcallEnd", "done", "error"],
  binary: ["soul", "artifact", "heartbeat"],
};

const prohibitedKeys = new Set([
  "apikey", "apitoken", "authorization", "authtoken", "accesstoken", "refreshtoken",
  "credential", "credentials", "password", "secret", "sessionfile", "sessionpath", "fulloutputpath",
]);
const prohibitedInternalPath = /(?:\/data\/(?:sessions|trash\/sessions|state|secrets)(?:\/|$)|\/run\/bitch(?:\/|$)|\/tmp\/pi-)/;

function securityErrors(fixtureName: string, value: unknown): FixtureValidationError[] {
  const errors: FixtureValidationError[] = [];
  const visit = (current: unknown, path: string): void => {
    if (typeof current === "string") {
      if (prohibitedInternalPath.test(current)) {
        errors.push({ fixture: fixtureName, path, code: "internal_path_forbidden", message: "Transport values cannot expose internal session, state, secret, or temporary paths." });
      }
      return;
    }
    if (Array.isArray(current)) {
      current.forEach((item, index) => visit(item, `${path}/${index}`));
      return;
    }
    if (current === null || typeof current !== "object") return;
    for (const [key, child] of Object.entries(current)) {
      const childPath = `${path}/${key}`;
      if (prohibitedKeys.has(key.replace(/[_-]/g, "").toLowerCase())) {
        errors.push({ fixture: fixtureName, path: childPath, code: "credential_or_path_field_forbidden", message: `Transport field "${key}" is credential-shaped or exposes an internal path.` });
      }
      visit(child, childPath);
    }
  };
  visit(value, "");
  return errors;
}

function isFixture(value: unknown): value is Fixture {
  return value !== null && typeof value === "object" && "schema" in value && "value" in value;
}

function normalizeError(fixtureName: string, error: { path?: string; keyword?: string; message?: string }): FixtureValidationError {
  return {
    fixture: fixtureName,
    path: error.path ?? "",
    code: error.keyword ?? "schema_validation_failed",
    message: error.message ?? "Fixture does not match its schema.",
  };
}

export function validateFixtureCorpus(corpus: FixtureCorpus): FixtureValidationError[] {
  const errors: FixtureValidationError[] = [];
  if (corpus.version !== 1) {
    errors.push({ fixture: "$corpus", path: "/version", code: "version_mismatch", message: "Fixture corpus version must be 1." });
  }
  if (corpus.piVersion !== "0.83.0") {
    errors.push({ fixture: "$corpus", path: "/piVersion", code: "pi_version_mismatch", message: "Fixture corpus must target Pi 0.83.0." });
  }

  for (const [groupName, requiredNames] of Object.entries(requiredGroups)) {
    const group = corpus.fixtures[groupName];
    if (!group) {
      errors.push({ fixture: "$corpus", path: `/fixtures/${groupName}`, code: "fixture_group_missing", message: `Required fixture group "${groupName}" is missing.` });
      continue;
    }
    for (const requiredName of requiredNames) {
      if (!(requiredName in group)) {
        errors.push({ fixture: "$corpus", path: `/fixtures/${groupName}/${requiredName}`, code: "fixture_variant_missing", message: `Required fixture variant "${groupName}.${requiredName}" is missing.` });
      }
    }
  }

  for (const [groupName, group] of Object.entries(corpus.fixtures)) {
    for (const [name, candidate] of Object.entries(group)) {
      const fixtureName = `${groupName}.${name}`;
      if (!isFixture(candidate)) {
        errors.push({ fixture: fixtureName, path: "", code: "fixture_record_invalid", message: "Fixture must contain schema and value fields." });
        continue;
      }
      if (!(candidate.schema in validators)) {
        errors.push({ fixture: fixtureName, path: "/schema", code: "schema_unknown", message: `Unknown schema "${candidate.schema}".` });
        continue;
      }
      const validator = validators[candidate.schema];
      for (const error of validator.Errors(candidate.value)) errors.push(normalizeError(fixtureName, error));
      errors.push(...securityErrors(fixtureName, candidate.value));
    }
  }

  const fixtureAt = (reference: string): Fixture | undefined => {
    const splitAt = reference.indexOf(".");
    if (splitAt < 1) return undefined;
    return corpus.fixtures[reference.slice(0, splitAt)]?.[reference.slice(splitAt + 1)];
  };
  const operationKeys = new Set<string>();
  for (const operation of httpOperations) {
    const operationKey = `${operation.method.toUpperCase()} ${operation.path}`;
    if (operationKeys.has(operationKey)) {
      errors.push({ fixture: "$http", path: operationKey, code: "http_operation_duplicate", message: `HTTP operation "${operationKey}" is duplicated.` });
    }
    operationKeys.add(operationKey);
    for (const direction of ["request", "response"] as const) {
      const schema = direction === "request" ? operation.requestSchema : operation.responseSchema;
      const reference = direction === "request" ? operation.requestFixture : operation.responseFixture;
      if (!schema && !reference) continue;
      if (!schema || !reference) {
        errors.push({ fixture: "$http", path: `/${operation.operationId}/${direction}`, code: "http_fixture_incomplete", message: `HTTP ${direction} must define both schema and fixture reference.` });
        continue;
      }
      const referencedFixture = fixtureAt(reference);
      if (!referencedFixture) {
        errors.push({ fixture: "$http", path: `/${operation.operationId}/${direction}Fixture`, code: "http_fixture_missing", message: `HTTP fixture "${reference}" does not exist.` });
        continue;
      }
      const expectedSchema = schema === "binary" ? "BinaryHttpBodyFixture" : schema;
      if (referencedFixture.schema !== expectedSchema) {
        errors.push({ fixture: "$http", path: `/${operation.operationId}/${direction}Fixture`, code: "http_fixture_schema_mismatch", message: `HTTP fixture "${reference}" must use schema "${expectedSchema}".` });
      }
    }
  }

  return errors.sort((left, right) =>
    left.fixture.localeCompare(right.fixture) || left.path.localeCompare(right.path) || left.code.localeCompare(right.code) || left.message.localeCompare(right.message),
  );
}

export { fixtureCorpus };
