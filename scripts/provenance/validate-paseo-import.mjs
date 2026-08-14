#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const PASEO_COMMIT = "163e7d1cc421cdfe4de67b971ff6cea4b51eb0ed";
export const PASEO_REPOSITORY = "https://github.com/getpaseo/paseo.git";
export const PASEO_VERSION = "0.3.1";
export const LICENSE_EXPRESSION = "AGPL-3.0-only";
export const LICENSE_SHA256 =
  "2d29a730f15470509f7a36e63a024c2f121958471474dfcd6b272c99586fc337";

const BLOB_PATTERN = /^[0-9a-f]{40}$/;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const FILE_STATUSES = new Set(["copied", "renamed", "adapted"]);

export class ProvenanceValidationError extends Error {
  constructor(issues) {
    super(`Paseo provenance validation failed with ${issues.length} issue(s)`);
    this.name = "ProvenanceValidationError";
    this.issues = issues;
  }
}

function readJson(file, issues, label) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    issues.push(`${label}: cannot parse ${path.relative(process.cwd(), file)}: ${error.message}`);
    return null;
  }
}

function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isRepositoryPath(value) {
  if (typeof value !== "string" || value.length === 0 || value.includes("\0")) {
    return false;
  }
  if (path.posix.isAbsolute(value) || value.includes("\\")) {
    return false;
  }
  const normalized = path.posix.normalize(value);
  return normalized === value && normalized !== ".." && !normalized.startsWith("../");
}

function requireKeys(object, required, allowed, label, issues) {
  if (!isPlainObject(object)) {
    issues.push(`${label}: expected an object`);
    return false;
  }
  for (const key of required) {
    if (!(key in object)) issues.push(`${label}: missing required field ${key}`);
  }
  for (const key of Object.keys(object)) {
    if (!allowed.includes(key)) issues.push(`${label}: unknown field ${key}`);
  }
  return true;
}

function validateUniquePaths(values, label, issues) {
  if (!Array.isArray(values) || values.length === 0) {
    issues.push(`${label}: expected a nonempty array`);
    return;
  }
  const seen = new Set();
  for (const [index, value] of values.entries()) {
    if (!isRepositoryPath(value)) issues.push(`${label}[${index}]: invalid repository path`);
    if (seen.has(value)) issues.push(`${label}: duplicate path ${value}`);
    seen.add(value);
  }
  const sorted = [...values].sort();
  if (JSON.stringify(values) !== JSON.stringify(sorted)) {
    issues.push(`${label}: paths must use stable lexical order`);
  }
}

function collectFiles(root) {
  const files = [];
  if (!existsSync(root)) return files;
  const visit = (entry) => {
    const stat = lstatSync(entry);
    if (stat.isSymbolicLink() || stat.isFile()) {
      files.push(entry);
      return;
    }
    if (!stat.isDirectory()) return;
    for (const name of readdirSync(entry).sort()) visit(path.join(entry, name));
  };
  visit(root);
  return files;
}

function git(upstream, args, encoding = "utf8") {
  return execFileSync("git", ["-C", upstream, ...args], {
    encoding,
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 100 * 1024 * 1024,
  });
}

function verifyUpstream(upstream, expectedCommit, issues) {
  if (!upstream) return null;
  try {
    const resolved = realpathSync(upstream);
    const head = git(resolved, ["rev-parse", "HEAD"]).trim();
    if (head !== expectedCommit) {
      issues.push(`upstream: HEAD ${head} does not match ${expectedCommit}`);
    }
    if (git(resolved, ["status", "--short"]).trim()) {
      issues.push("upstream: checkout must be clean");
    }
    return resolved;
  } catch (error) {
    issues.push(`upstream: cannot inspect checkout: ${error.message}`);
    return null;
  }
}

function upstreamEntry(upstream, commit, upstreamPath, issues, label) {
  if (!upstream) return null;
  try {
    const output = git(upstream, ["ls-tree", commit, "--", upstreamPath]).trim();
    const match = output.match(/^[0-7]{6} blob ([0-9a-f]{40})\t(.+)$/);
    if (!match || match[2] !== upstreamPath) {
      issues.push(`${label}: upstream path is absent or is not a file`);
      return null;
    }
    const content = git(upstream, ["show", `${commit}:${upstreamPath}`], null);
    return { blob: match[1], content };
  } catch (error) {
    issues.push(`${label}: cannot inspect upstream file: ${error.message}`);
    return null;
  }
}

function validateSchemaArtifact(root, expectedCommit, issues) {
  const schemaPath = path.join(root, "provenance", "paseo-0.3.1.schema.json");
  const schema = readJson(schemaPath, issues, "schema");
  if (!schema) return;
  if (schema.$schema !== "https://json-schema.org/draft/2020-12/schema") {
    issues.push("schema: unsupported JSON Schema declaration");
  }
  if (expectedCommit === PASEO_COMMIT) {
    const commitConst = schema?.properties?.source?.properties?.commit?.const;
    if (commitConst !== PASEO_COMMIT) issues.push("schema: pinned commit const is wrong");
  }
  const required = schema.required;
  for (const key of [
    "$schema",
    "schemaVersion",
    "source",
    "selectedPaths",
    "destinationRoots",
    "files",
    "exclusions",
  ]) {
    if (!Array.isArray(required) || !required.includes(key)) {
      issues.push(`schema: root required fields omit ${key}`);
    }
  }
}

function validatePackageAndNotice(root, inventory, issues) {
  const packageJson = readJson(path.join(root, "package.json"), issues, "package.json");
  const packageLock = readJson(path.join(root, "package-lock.json"), issues, "package-lock.json");
  if (packageJson?.license !== LICENSE_EXPRESSION) {
    issues.push(`package.json: license must be ${LICENSE_EXPRESSION}`);
  }
  if (packageLock?.packages?.[""]?.license !== LICENSE_EXPRESSION) {
    issues.push(`package-lock.json: root license must be ${LICENSE_EXPRESSION}`);
  }
  for (const script of ["check:provenance", "test:provenance", "provenance:authors"]) {
    if (typeof packageJson?.scripts?.[script] !== "string") {
      issues.push(`package.json: missing ${script} script`);
    }
  }

  const licensePath = path.join(root, "LICENSE");
  if (!existsSync(licensePath)) {
    issues.push("LICENSE: file is missing");
  } else {
    const actual = sha256(readFileSync(licensePath));
    if (actual !== inventory?.source?.licenseSha256 || actual !== LICENSE_SHA256) {
      issues.push(`LICENSE: SHA-256 ${actual} does not match the pinned license`);
    }
  }

  const noticePath = path.join(root, "NOTICE.md");
  if (!existsSync(noticePath)) {
    issues.push("NOTICE.md: file is missing");
    return;
  }
  const notice = readFileSync(noticePath, "utf8");
  for (const required of [
    "Copyright (c) 2026 BITCH contributors",
    "Copyright (c) 2025-present Mohamed Boudra",
    PASEO_COMMIT,
    "provenance/paseo-0.3.1.json",
    "provenance/paseo-authors.txt",
    "provenance/third-party-notices.json",
    "https://github.com/liempo/bitch",
  ]) {
    if (!notice.includes(required)) issues.push(`NOTICE.md: missing required text ${required}`);
  }
  if ((inventory?.files?.length ?? 0) === 0) {
    if (!notice.includes("As of 2026-08-14, BITCH contains no Paseo package source or object code.")) {
      issues.push("NOTICE.md: pre-import state is missing or untruthful");
    }
  } else {
    if (notice.includes("contains no Paseo package source or object code")) {
      issues.push("NOTICE.md: pre-import statement remains after source import");
    }
    if (!/first modification date[^\n]*\d{4}-\d{2}-\d{2}/i.test(notice)) {
      issues.push("NOTICE.md: imported source needs an actual first modification date");
    }
  }
}

function validateThirdParty(root, inventory, issues) {
  const file = path.join(root, "provenance", "third-party-notices.json");
  const notices = readJson(file, issues, "third-party notices");
  if (!notices) return;
  requireKeys(notices, ["schemaVersion", "artifacts"], ["schemaVersion", "artifacts"], "third-party notices", issues);
  if (notices.schemaVersion !== 1) issues.push("third-party notices: schemaVersion must be 1");
  if (!Array.isArray(notices.artifacts)) {
    issues.push("third-party notices: artifacts must be an array");
    return;
  }
  const byId = new Map();
  for (const [index, artifact] of notices.artifacts.entries()) {
    const label = `third-party notices artifacts[${index}]`;
    if (!requireKeys(
      artifact,
      ["id", "name", "upstreamPath", "status", "reason", "requiredBeforeImport"],
      ["id", "name", "upstreamPath", "status", "reason", "requiredBeforeImport", "source", "sha256", "licenseExpression", "notice"],
      label,
      issues,
    )) continue;
    if (typeof artifact.id !== "string" || artifact.id.length === 0) issues.push(`${label}: invalid id`);
    if (byId.has(artifact.id)) issues.push(`${label}: duplicate id ${artifact.id}`);
    byId.set(artifact.id, artifact);
    if (!isRepositoryPath(artifact.upstreamPath)) issues.push(`${label}: invalid upstreamPath`);
    if (!new Set(["excluded", "included"]).has(artifact.status)) issues.push(`${label}: invalid status`);
    if (!Array.isArray(artifact.requiredBeforeImport) || artifact.requiredBeforeImport.length === 0) {
      issues.push(`${label}: requiredBeforeImport must be nonempty`);
    }
    if (artifact.status === "included") {
      for (const key of ["source", "sha256", "licenseExpression", "notice"]) {
        if (!artifact[key]) issues.push(`${label}: included artifact is missing ${key}`);
      }
    }
  }
  for (const [index, exclusion] of (inventory?.exclusions ?? []).entries()) {
    const artifact = byId.get(exclusion.thirdPartyNoticeId);
    if (!artifact) {
      issues.push(`exclusions[${index}]: missing third-party notice ${exclusion.thirdPartyNoticeId}`);
    } else if (artifact.upstreamPath !== exclusion.upstreamPath || artifact.status !== "excluded") {
      issues.push(`exclusions[${index}]: third-party notice does not match excluded path and status`);
    }
  }
}

function validateInventory(root, inventory, upstream, expectedCommit, issues) {
  if (!requireKeys(
    inventory,
    ["$schema", "schemaVersion", "source", "selectedPaths", "destinationRoots", "files", "exclusions"],
    ["$schema", "schemaVersion", "source", "selectedPaths", "destinationRoots", "files", "exclusions"],
    "inventory",
    issues,
  )) return;
  if (inventory.$schema !== "./paseo-0.3.1.schema.json") issues.push("inventory: wrong $schema path");
  if (inventory.schemaVersion !== 1) issues.push("inventory: schemaVersion must be 1");
  if (requireKeys(
    inventory.source,
    ["project", "repository", "packageVersion", "commit", "licenseExpression", "licenseSha256"],
    ["project", "repository", "packageVersion", "commit", "licenseExpression", "licenseSha256"],
    "source",
    issues,
  )) {
    const expected = {
      project: "Paseo",
      repository: PASEO_REPOSITORY,
      packageVersion: PASEO_VERSION,
      commit: expectedCommit,
      licenseExpression: LICENSE_EXPRESSION,
      licenseSha256: LICENSE_SHA256,
    };
    for (const [key, value] of Object.entries(expected)) {
      if (inventory.source[key] !== value) issues.push(`source: ${key} must be ${value}`);
    }
  }
  validateUniquePaths(inventory.selectedPaths, "selectedPaths", issues);
  validateUniquePaths(inventory.destinationRoots, "destinationRoots", issues);
  if (!Array.isArray(inventory.files)) {
    issues.push("files: expected an array");
    return;
  }
  if (!Array.isArray(inventory.exclusions)) {
    issues.push("exclusions: expected an array");
    return;
  }

  const destinations = new Set();
  const upstreamPaths = new Set();
  for (const [index, entry] of inventory.files.entries()) {
    const label = `files[${index}]`;
    if (!requireKeys(
      entry,
      ["destination", "upstreamPath", "upstreamCommit", "status", "upstreamBlob", "sha256", "licenseExpression", "notice"],
      ["destination", "upstreamPath", "upstreamCommit", "status", "upstreamBlob", "sha256", "licenseExpression", "notice"],
      label,
      issues,
    )) continue;
    if (!isRepositoryPath(entry.destination)) issues.push(`${label}: invalid destination`);
    if (!isRepositoryPath(entry.upstreamPath)) issues.push(`${label}: invalid upstreamPath`);
    if (destinations.has(entry.destination)) issues.push(`${label}: duplicate destination ${entry.destination}`);
    destinations.add(entry.destination);
    upstreamPaths.add(entry.upstreamPath);
    if (entry.upstreamCommit !== expectedCommit) issues.push(`${label}: wrong upstream commit`);
    if (!FILE_STATUSES.has(entry.status)) issues.push(`${label}: invalid status ${entry.status}`);
    if (!BLOB_PATTERN.test(entry.upstreamBlob ?? "")) issues.push(`${label}: invalid upstream blob`);
    if (!SHA256_PATTERN.test(entry.sha256 ?? "")) issues.push(`${label}: invalid SHA-256`);
    if (entry.licenseExpression !== LICENSE_EXPRESSION) issues.push(`${label}: wrong license expression`);
    if (entry.notice !== null && typeof entry.notice !== "string") issues.push(`${label}: notice must be text or null`);

    const destination = path.join(root, entry.destination ?? "");
    if (!existsSync(destination) || !lstatSync(destination).isFile()) {
      issues.push(`${label}: destination is missing or is not a regular file`);
    } else {
      const content = readFileSync(destination);
      const actual = sha256(content);
      if (entry.sha256 !== actual) issues.push(`${label}: destination SHA-256 is ${actual}, not ${entry.sha256}`);
      const source = upstreamEntry(upstream, expectedCommit, entry.upstreamPath, issues, label);
      if (source) {
        if (entry.upstreamBlob !== source.blob) issues.push(`${label}: upstream blob is ${source.blob}, not ${entry.upstreamBlob}`);
        if ((entry.status === "copied" || entry.status === "renamed") && !content.equals(source.content)) {
          issues.push(`${label}: ${entry.status} destination differs from upstream bytes`);
        }
      }
    }
  }

  for (const destinationRoot of inventory.destinationRoots ?? []) {
    if (!isRepositoryPath(destinationRoot)) continue;
    for (const file of collectFiles(path.join(root, destinationRoot))) {
      const relative = path.relative(root, file).split(path.sep).join("/");
      if (!destinations.has(relative)) issues.push(`files: missing inventory entry for ${relative}`);
    }
  }

  const exclusionPaths = new Set();
  for (const [index, exclusion] of inventory.exclusions.entries()) {
    const label = `exclusions[${index}]`;
    if (!requireKeys(
      exclusion,
      ["upstreamPath", "upstreamBlob", "upstreamSha256", "reason", "thirdPartyNoticeId"],
      ["upstreamPath", "upstreamBlob", "upstreamSha256", "reason", "thirdPartyNoticeId"],
      label,
      issues,
    )) continue;
    if (!isRepositoryPath(exclusion.upstreamPath)) issues.push(`${label}: invalid upstreamPath`);
    if (exclusionPaths.has(exclusion.upstreamPath)) issues.push(`${label}: duplicate excluded path`);
    exclusionPaths.add(exclusion.upstreamPath);
    if (!BLOB_PATTERN.test(exclusion.upstreamBlob ?? "")) issues.push(`${label}: invalid upstream blob`);
    if (!SHA256_PATTERN.test(exclusion.upstreamSha256 ?? "")) issues.push(`${label}: invalid upstream SHA-256`);
    if (typeof exclusion.reason !== "string" || exclusion.reason.length === 0) issues.push(`${label}: reason is required`);
    if (typeof exclusion.thirdPartyNoticeId !== "string" || exclusion.thirdPartyNoticeId.length === 0) {
      issues.push(`${label}: thirdPartyNoticeId is required`);
    }
    if (upstreamPaths.has(exclusion.upstreamPath)) issues.push(`${label}: excluded path also has an imported file entry`);
    if (existsSync(path.join(root, exclusion.upstreamPath))) issues.push(`${label}: excluded artifact exists in BITCH`);
    const source = upstreamEntry(upstream, expectedCommit, exclusion.upstreamPath, issues, label);
    if (source) {
      if (source.blob !== exclusion.upstreamBlob) issues.push(`${label}: upstream blob is ${source.blob}, not ${exclusion.upstreamBlob}`);
      const actual = sha256(source.content);
      if (actual !== exclusion.upstreamSha256) issues.push(`${label}: upstream SHA-256 is ${actual}, not ${exclusion.upstreamSha256}`);
    }
  }
}

function validateAuthorSnapshot(root, inventory, expectedCommit, issues) {
  const file = path.join(root, "provenance", "paseo-authors.txt");
  if (!existsSync(file)) {
    issues.push("paseo-authors.txt: file is missing");
    return;
  }
  const text = readFileSync(file, "utf8");
  if (!text.includes(`Commit: ${expectedCommit}`)) issues.push("paseo-authors.txt: wrong or missing commit");
  for (const selectedPath of inventory?.selectedPaths ?? []) {
    if (!text.includes(`- ${selectedPath}`)) issues.push(`paseo-authors.txt: missing selected path ${selectedPath}`);
  }
}

export function validateRepository({
  root = process.cwd(),
  upstream = null,
  expectedCommit = PASEO_COMMIT,
} = {}) {
  const resolvedRoot = realpathSync(root);
  const issues = [];
  const inventoryPath = path.join(resolvedRoot, "provenance", "paseo-0.3.1.json");
  const inventory = readJson(inventoryPath, issues, "inventory");
  validateSchemaArtifact(resolvedRoot, expectedCommit, issues);
  const resolvedUpstream = verifyUpstream(upstream, expectedCommit, issues);
  if (inventory) {
    validateInventory(resolvedRoot, inventory, resolvedUpstream, expectedCommit, issues);
    validatePackageAndNotice(resolvedRoot, inventory, issues);
    validateThirdParty(resolvedRoot, inventory, issues);
    validateAuthorSnapshot(resolvedRoot, inventory, expectedCommit, issues);
  }
  if (issues.length) throw new ProvenanceValidationError(issues);
  return { fileCount: inventory.files.length, exclusionCount: inventory.exclusions.length };
}

function parseArguments(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--root" || argument === "--upstream") {
      const value = argv[index + 1];
      if (!value) throw new Error(`${argument} requires a path`);
      options[argument.slice(2)] = value;
      index += 1;
    } else {
      throw new Error(`unknown argument ${argument}`);
    }
  }
  return options;
}

function isMain() {
  return process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
}

if (isMain()) {
  try {
    const result = validateRepository(parseArguments(process.argv.slice(2)));
    console.log(`Paseo provenance OK: ${result.fileCount} imported file(s), ${result.exclusionCount} exclusion(s)`);
  } catch (error) {
    if (error instanceof ProvenanceValidationError) {
      for (const issue of error.issues) console.error(`- ${issue}`);
    } else {
      console.error(error.message);
    }
    process.exitCode = 1;
  }
}
