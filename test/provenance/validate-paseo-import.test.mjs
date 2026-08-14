import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  ProvenanceValidationError,
  validateRepository,
} from "../../scripts/provenance/validate-paseo-import.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const temporaryRoots = [];

function temporaryDirectory(prefix) {
  const directory = mkdtempSync(path.join(os.tmpdir(), prefix));
  temporaryRoots.push(directory);
  return directory;
}

afterEach(() => {
  while (temporaryRoots.length) rmSync(temporaryRoots.pop(), { recursive: true, force: true });
});

function json(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

function fixture() {
  const root = temporaryDirectory("bitch-provenance-");
  mkdirSync(path.join(root, "provenance"), { recursive: true });
  for (const file of ["LICENSE", "NOTICE.md", "package.json", "package-lock.json"]) {
    copyFileSync(path.join(repositoryRoot, file), path.join(root, file));
  }
  for (const file of [
    "paseo-0.3.1.json",
    "paseo-0.3.1.schema.json",
    "paseo-authors.txt",
    "third-party-notices.json",
  ]) {
    copyFileSync(
      path.join(repositoryRoot, "provenance", file),
      path.join(root, "provenance", file),
    );
  }
  return root;
}

function inventoryPath(root) {
  return path.join(root, "provenance", "paseo-0.3.1.json");
}

function mutateInventory(root, mutate) {
  const file = inventoryPath(root);
  const value = json(file);
  mutate(value);
  writeJson(file, value);
}

function expectIssue(action, text) {
  assert.throws(action, (error) => {
    assert.ok(error instanceof ProvenanceValidationError);
    assert.ok(
      error.issues.some((issue) => issue.includes(text)),
      `expected an issue containing ${JSON.stringify(text)}, got:\n${error.issues.join("\n")}`,
    );
    return true;
  });
}

function fileEntry(root, destination, content = "copied content\n") {
  const file = path.join(root, destination);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
  return {
    destination,
    upstreamPath: "packages/cli/example.txt",
    upstreamCommit: "163e7d1cc421cdfe4de67b971ff6cea4b51eb0ed",
    status: "adapted",
    upstreamBlob: "1".repeat(40),
    sha256: sha256(Buffer.from(content)),
    licenseExpression: "AGPL-3.0-only",
    notice: null,
  };
}

test("the committed pre-import gate passes offline", () => {
  const result = validateRepository({ root: repositoryRoot });
  assert.deepEqual(result, { fileCount: 0, exclusionCount: 1 });
});

test("a duplicate destination fails", () => {
  const root = fixture();
  mutateInventory(root, (inventory) => {
    const entry = fileEntry(root, "packages/cli/example.txt");
    inventory.files.push(entry, { ...entry, upstreamPath: "packages/cli/other.txt" });
  });
  expectIssue(() => validateRepository({ root }), "duplicate destination");
});

test("a missing destination fails", () => {
  const root = fixture();
  mutateInventory(root, (inventory) => {
    inventory.files.push({
      destination: "packages/cli/missing.txt",
      upstreamPath: "packages/cli/missing.txt",
      upstreamCommit: inventory.source.commit,
      status: "copied",
      upstreamBlob: "1".repeat(40),
      sha256: "2".repeat(64),
      licenseExpression: "AGPL-3.0-only",
      notice: null,
    });
  });
  expectIssue(() => validateRepository({ root }), "destination is missing");
});

test("a wrong source pin fails", () => {
  const root = fixture();
  mutateInventory(root, (inventory) => {
    inventory.source.commit = "0".repeat(40);
  });
  expectIssue(() => validateRepository({ root }), "source: commit must be");
});

test("a wrong destination hash fails", () => {
  const root = fixture();
  mutateInventory(root, (inventory) => {
    const entry = fileEntry(root, "packages/cli/example.txt");
    entry.sha256 = "0".repeat(64);
    inventory.files.push(entry);
  });
  expectIssue(() => validateRepository({ root }), "destination SHA-256");
});

test("an invalid file status fails", () => {
  const root = fixture();
  mutateInventory(root, (inventory) => {
    const entry = fileEntry(root, "packages/cli/example.txt");
    entry.status = "unknown";
    inventory.files.push(entry);
  });
  expectIssue(() => validateRepository({ root }), "invalid status");
});

test("an unlisted file below a managed destination root fails", () => {
  const root = fixture();
  mkdirSync(path.join(root, "packages", "cli"), { recursive: true });
  writeFileSync(path.join(root, "packages", "cli", "unlisted.txt"), "not inventoried\n");
  expectIssue(() => validateRepository({ root }), "missing inventory entry");
});

test("an excluded artifact present in BITCH fails", () => {
  const root = fixture();
  const excluded = json(inventoryPath(root)).exclusions[0].upstreamPath;
  mkdirSync(path.dirname(path.join(root, excluded)), { recursive: true });
  writeFileSync(path.join(root, excluded), "excluded bytes\n");
  expectIssue(() => validateRepository({ root }), "excluded artifact exists in BITCH");
});

test("a missing third-party notice fails", () => {
  const root = fixture();
  mutateInventory(root, (inventory) => {
    inventory.exclusions[0].thirdPartyNoticeId = "missing-notice";
  });
  expectIssue(() => validateRepository({ root }), "missing third-party notice");
});

test("a wrong upstream blob fails against an explicit checkout", () => {
  const root = fixture();
  const upstream = temporaryDirectory("bitch-upstream-");
  execFileSync("git", ["-C", upstream, "init", "--quiet"]);
  execFileSync("git", ["-C", upstream, "config", "user.name", "Test Author"]);
  execFileSync("git", ["-C", upstream, "config", "user.email", "author@example.invalid"]);
  writeFileSync(path.join(upstream, "source.txt"), "upstream bytes\n");
  execFileSync("git", ["-C", upstream, "add", "source.txt"]);
  execFileSync("git", ["-C", upstream, "commit", "--quiet", "-m", "test source"]);
  const commit = execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
  const blob = execFileSync("git", ["-C", upstream, "rev-parse", "HEAD:source.txt"], {
    encoding: "utf8",
  }).trim();

  mkdirSync(path.join(root, "imported"), { recursive: true });
  copyFileSync(path.join(upstream, "source.txt"), path.join(root, "imported", "source.txt"));
  mutateInventory(root, (inventory) => {
    inventory.source.commit = commit;
    inventory.selectedPaths = ["source.txt"];
    inventory.destinationRoots = ["imported"];
    inventory.exclusions = [];
    inventory.files = [
      {
        destination: "imported/source.txt",
        upstreamPath: "source.txt",
        upstreamCommit: commit,
        status: "copied",
        upstreamBlob: blob,
        sha256: sha256(readFileSync(path.join(root, "imported", "source.txt"))),
        licenseExpression: "AGPL-3.0-only",
        notice: null,
      },
    ];
  });
  const noticeFile = path.join(root, "NOTICE.md");
  writeFileSync(
    noticeFile,
    readFileSync(noticeFile, "utf8").replace(
      "As of 2026-08-14, BITCH contains no Paseo package source or object code. The first Paseo source-import change must replace this paragraph with a prominent modification statement and the actual first modification date from BITCH Git history.",
      "BITCH modified selected Paseo files. The first modification date is 2026-08-14.",
    ),
  );
  writeFileSync(
    path.join(root, "provenance", "paseo-authors.txt"),
    `Commit: ${commit}\n\nSelected paths:\n- source.txt\n`,
  );

  assert.deepEqual(validateRepository({ root, upstream, expectedCommit: commit }), {
    fileCount: 1,
    exclusionCount: 0,
  });

  mutateInventory(root, (inventory) => {
    inventory.files[0].upstreamBlob = "0".repeat(40);
  });
  expectIssue(
    () => validateRepository({ root, upstream, expectedCommit: commit }),
    "upstream blob is",
  );
});
