#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PASEO_COMMIT, PASEO_REPOSITORY } from "./validate-paseo-import.mjs";

function git(upstream, args) {
  return execFileSync("git", ["-C", upstream, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 100 * 1024 * 1024,
  });
}

function parseArguments(argv) {
  const options = {
    output: path.resolve("provenance/paseo-authors.txt"),
    check: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--check") {
      options.check = true;
      continue;
    }
    if (argument === "--upstream" || argument === "--output") {
      const value = argv[index + 1];
      if (!value) throw new Error(`${argument} requires a path`);
      options[argument.slice(2)] = path.resolve(value);
      index += 1;
      continue;
    }
    throw new Error(`unknown argument ${argument}`);
  }
  if (!options.upstream) throw new Error("--upstream is required");
  return options;
}

function readSelectedPaths(root) {
  const inventory = JSON.parse(
    readFileSync(path.join(root, "provenance", "paseo-0.3.1.json"), "utf8"),
  );
  if (!Array.isArray(inventory.selectedPaths) || inventory.selectedPaths.length === 0) {
    throw new Error("inventory selectedPaths must be a nonempty array");
  }
  return inventory.selectedPaths;
}

export function generateAuthorSnapshot({ upstream, root = process.cwd() }) {
  const source = realpathSync(upstream);
  const head = git(source, ["rev-parse", "HEAD"]).trim();
  if (head !== PASEO_COMMIT) {
    throw new Error(`upstream HEAD ${head} does not match ${PASEO_COMMIT}`);
  }
  if (git(source, ["status", "--short"]).trim()) {
    throw new Error("upstream checkout must be clean");
  }

  const selectedPaths = readSelectedPaths(root);
  const output = git(source, [
    "log",
    PASEO_COMMIT,
    "--use-mailmap",
    "--format=%aN%x09%aE",
    "--",
    ...selectedPaths,
  ]);
  const identities = new Set();
  for (const line of output.split("\n")) {
    if (!line) continue;
    const separator = line.indexOf("\t");
    if (separator <= 0 || separator === line.length - 1) {
      throw new Error(`unexpected Git author record ${JSON.stringify(line)}`);
    }
    const name = line.slice(0, separator).trim();
    const email = line.slice(separator + 1).trim().toLowerCase();
    if (!name || !email || /[\r\n<>]/.test(name) || /[\r\n<>]/.test(email)) {
      throw new Error(`unsafe Git author identity ${JSON.stringify(line)}`);
    }
    identities.add(`${name} <${email}>`);
  }
  const authors = [...identities].sort((left, right) =>
    left < right ? -1 : left > right ? 1 : 0,
  );
  if (authors.length === 0) throw new Error("selected path history has no authors");

  return [
    "# Paseo Selected-Path Authors",
    "",
    "This deterministic snapshot records author identities from the selected Paseo path histories through the pinned commit.",
    "It does not claim that each identity owns every selected file.",
    "",
    `Repository: ${PASEO_REPOSITORY}`,
    `Commit: ${PASEO_COMMIT}`,
    "",
    "Selected paths:",
    ...selectedPaths.map((selectedPath) => `- ${selectedPath}`),
    "",
    "Authors:",
    ...authors.map((author) => `- ${author}`),
    "",
  ].join("\n");
}

function isMain() {
  return process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
}

if (isMain()) {
  try {
    const options = parseArguments(process.argv.slice(2));
    const snapshot = generateAuthorSnapshot({
      upstream: options.upstream,
      root: process.cwd(),
    });
    if (options.check) {
      if (!existsSync(options.output)) throw new Error(`${options.output} is missing`);
      const current = readFileSync(options.output, "utf8");
      if (current !== snapshot) throw new Error(`${options.output} is not current`);
      console.log(`Paseo author snapshot OK: ${options.output}`);
    } else {
      writeFileSync(options.output, snapshot);
      console.log(`Wrote ${options.output}`);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
