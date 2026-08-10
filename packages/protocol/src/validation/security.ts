import type { FixtureValidationError } from "./types.js";

const prohibitedKeys = new Set([
  "apikey",
  "apitoken",
  "authorization",
  "authtoken",
  "accesstoken",
  "refreshtoken",
  "credential",
  "credentials",
  "password",
  "secret",
  "sessionfile",
  "sessionpath",
  "fulloutputpath",
]);
const prohibitedInternalPath = /(?:\/data\/(?:sessions|state|secrets|config|artifacts)(?:\/|$)|\/data\/trash\/sessions(?:\/|$)|\/bitch\/directory\/(?:sessions|state|recovery|config|trash)(?:\/|$)|\/run\/bitch(?:\/|$)|\/tmp\/pi-)/;

export function securityErrors(fixtureName: string, value: unknown): FixtureValidationError[] {
  const errors: FixtureValidationError[] = [];
  const visit = (current: unknown, path: string): void => {
    if (typeof current === "string") {
      if (prohibitedInternalPath.test(current)) {
        errors.push({
          fixture: fixtureName,
          path,
          code: "internal_path_forbidden",
          message: "Transport values cannot expose internal session, state, credential, artifact, recovery, or temporary paths.",
        });
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
        errors.push({
          fixture: fixtureName,
          path: childPath,
          code: "credential_or_path_field_forbidden",
          message: `Transport field "${key}" is credential-shaped or exposes an internal path.`,
        });
      }
      visit(child, childPath);
    }
  };
  visit(value, "");
  return errors;
}
