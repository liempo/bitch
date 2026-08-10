import { createHash } from "node:crypto";
import { canonicalPayloadHash } from "../receipts/payload-hash.js";
import { discriminatorRequirements, requiredFixtureNames } from "../fixtures/requirements.js";
import type { Fixture, FixtureCorpus } from "../fixtures/types.js";
import { directoryCapabilities, gatewayCapabilities } from "../schemas/common.js";
import { schemaRegistry, type SchemaName } from "../schemas/registry.js";
import type { FixtureValidationError } from "./types.js";

function valueAt(value: unknown, path: readonly string[]): unknown {
  let current = value;
  for (const segment of path) {
    if (current === null || typeof current !== "object" || !(segment in current)) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

function valueKey(value: unknown): string {
  return `${typeof value}:${JSON.stringify(value)}`;
}

function fixturesIn(corpus: FixtureCorpus, groupName: string): Array<[string, Fixture]> {
  return Object.entries(corpus.fixtures[groupName] ?? {}).filter(
    (entry): entry is [string, Fixture] => entry[1] !== null && typeof entry[1] === "object" && "schema" in entry[1] && "value" in entry[1],
  );
}

function fixtureAt(corpus: FixtureCorpus, reference: string): Fixture | undefined {
  const splitAt = reference.indexOf(".");
  if (splitAt < 1) return undefined;
  return corpus.fixtures[reference.slice(0, splitAt)]?.[reference.slice(splitAt + 1)];
}

function coverageErrors(corpus: FixtureCorpus): FixtureValidationError[] {
  const errors: FixtureValidationError[] = [];
  const coveredSchemas = new Set<SchemaName>();
  for (const group of Object.values(corpus.fixtures)) {
    for (const candidate of Object.values(group)) {
      if (candidate && typeof candidate === "object" && "schema" in candidate && candidate.schema in schemaRegistry) {
        coveredSchemas.add(candidate.schema as SchemaName);
      }
    }
  }
  for (const schemaName of Object.keys(schemaRegistry) as SchemaName[]) {
    if (!coveredSchemas.has(schemaName)) {
      errors.push({
        fixture: "$corpus",
        path: `/schemas/${schemaName}`,
        code: "schema_fixture_missing",
        message: `Schema "${schemaName}" must have at least one direct fixture.`,
      });
    }
  }

  for (const [groupName, names] of Object.entries(requiredFixtureNames)) {
    const group = corpus.fixtures[groupName];
    if (!group) {
      errors.push({
        fixture: "$corpus",
        path: `/fixtures/${groupName}`,
        code: "fixture_group_missing",
        message: `Required fixture group "${groupName}" is missing.`,
      });
      continue;
    }
    for (const name of names) {
      if (!(name in group)) {
        errors.push({
          fixture: "$corpus",
          path: `/fixtures/${groupName}/${name}`,
          code: "fixture_variant_missing",
          message: `Required fixture variant "${groupName}.${name}" is missing.`,
        });
      }
    }
  }

  for (const requirement of discriminatorRequirements) {
    const observed = new Set<string>();
    for (const [, candidate] of fixturesIn(corpus, requirement.group)) {
      if (candidate.schema !== requirement.schema) continue;
      if (requirement.where && valueKey(valueAt(candidate.value, requirement.where.path)) !== valueKey(requirement.where.value)) {
        continue;
      }
      observed.add(valueKey(valueAt(candidate.value, requirement.path)));
    }
    for (const expected of requirement.expected) {
      if (!observed.has(valueKey(expected))) {
        errors.push({
          fixture: "$corpus",
          path: `/fixtures/${requirement.group}`,
          code: "fixture_discriminator_missing",
          message: `Fixture group "${requirement.group}" must cover ${requirement.path.join(".")}=${JSON.stringify(expected)} for schema "${requirement.schema}".`,
        });
      }
    }
  }
  return errors;
}

function receiptErrors(corpus: FixtureCorpus): FixtureValidationError[] {
  const errors: FixtureValidationError[] = [];
  for (const [name, candidate] of fixturesIn(corpus, "receipts")) {
    if (candidate.schema !== "CommandReceipt" || candidate.value === null || typeof candidate.value !== "object") continue;
    const receipt = candidate.value as Record<string, unknown>;
    if (typeof receipt.type !== "string") continue;
    const command = corpus.fixtures.commands?.[receipt.type]?.value;
    const payload = valueAt(command, ["payload"]);
    if (payload === undefined) continue;
    const expected = canonicalPayloadHash(payload);
    if (receipt.payloadHash !== expected) {
      errors.push({
        fixture: `receipts.${name}`,
        path: "/payloadHash",
        code: "payload_hash_mismatch",
        message: `Receipt payloadHash must equal the RFC 8785 SHA-256 digest for commands.${receipt.type}.payload.`,
      });
    }
  }
  return errors;
}

function statusErrors(corpus: FixtureCorpus): FixtureValidationError[] {
  const errors: FixtureValidationError[] = [];
  const expectedByMode: Record<string, readonly string[]> = {
    directory: directoryCapabilities,
    gateway: gatewayCapabilities,
  };
  for (const [name, candidate] of fixturesIn(corpus, "status")) {
    if (candidate.schema !== "StatusResult" || candidate.value === null || typeof candidate.value !== "object") continue;
    const status = candidate.value as Record<string, unknown>;
    if (typeof status.mode !== "string" || !Array.isArray(status.capabilities)) continue;
    const expected = expectedByMode[status.mode];
    if (!expected || JSON.stringify(status.capabilities) === JSON.stringify(expected)) continue;
    errors.push({
      fixture: `status.${name}`,
      path: "/capabilities",
      code: "capability_fixture_mismatch",
      message: `The ${status.mode} status fixture must contain the complete first-release capability list in ascending ASCII order.`,
    });
  }
  return errors;
}

function binaryErrors(corpus: FixtureCorpus): FixtureValidationError[] {
  const errors: FixtureValidationError[] = [];
  for (const [name, candidate] of fixturesIn(corpus, "binary")) {
    if (candidate.schema !== "BinaryHttpBodyFixture" || candidate.value === null || typeof candidate.value !== "object") continue;
    const value = candidate.value as Record<string, unknown>;
    if (typeof value.bodyBase64 !== "string") continue;
    const bytes = Buffer.from(value.bodyBase64, "base64");
    if (value.byteCount !== bytes.length) {
      errors.push({
        fixture: `binary.${name}`,
        path: "/byteCount",
        code: "binary_byte_count_mismatch",
        message: "Binary fixture byteCount must equal the decoded body length.",
      });
    }
    if (typeof value.sha256 === "string") {
      const digest = createHash("sha256").update(bytes).digest("hex");
      if (value.sha256 !== digest) {
        errors.push({
          fixture: `binary.${name}`,
          path: "/sha256",
          code: "binary_sha256_mismatch",
          message: "Binary fixture sha256 must equal the decoded body digest.",
        });
      }
    }
  }

  const soulBody = fixtureAt(corpus, "binary.soul")?.value as Record<string, unknown> | undefined;
  const soulDescriptor = fixtureAt(corpus, "responses.soul")?.value as Record<string, unknown> | undefined;
  if (soulBody && soulDescriptor) {
    if (soulBody.byteCount !== soulDescriptor.byteCount || soulBody.sha256 !== soulDescriptor.sha256 || soulDescriptor.etag !== `"sha256:${String(soulBody.sha256)}"`) {
      errors.push({
        fixture: "responses.soul",
        path: "",
        code: "soul_descriptor_mismatch",
        message: "The SOUL.md descriptor must match the binary body fixture.",
      });
    }
  }

  const artifactBody = fixtureAt(corpus, "binary.artifact")?.value as Record<string, unknown> | undefined;
  for (const reference of ["responses.artifact", "responses.directoryArtifact"]) {
    const artifact = fixtureAt(corpus, reference)?.value as Record<string, unknown> | undefined;
    if (!artifact || !artifactBody) continue;
    if (artifact.byteCount !== artifactBody.byteCount || artifact.mediaType !== artifactBody.mediaType) {
      errors.push({
        fixture: reference,
        path: "",
        code: "artifact_descriptor_mismatch",
        message: "The artifact descriptor must match the binary body fixture.",
      });
    }
    if (artifact.downloadUrl !== `/v1/artifacts/${String(artifact.artifactId)}`) {
      errors.push({
        fixture: reference,
        path: "/downloadUrl",
        code: "artifact_download_url_mismatch",
        message: "Artifact downloadUrl must contain its artifactId.",
      });
    }
  }
  return errors;
}

export function semanticErrors(corpus: FixtureCorpus): FixtureValidationError[] {
  return [
    ...coverageErrors(corpus),
    ...receiptErrors(corpus),
    ...statusErrors(corpus),
    ...binaryErrors(corpus),
  ];
}
