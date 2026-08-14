---
title: Paseo License and Provenance Import Gate - Plan
type: chore
date: 2026-08-14
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: github-issue-53
execution: code
---

# Paseo License and Provenance Import Gate - Plan

## Goal Capsule

- **Objective:** Add the offline license, notice, source-inventory, author-attribution, and third-party gate required before Paseo source import.
- **Authority:** Issue #53, `docs/architecture/licensing.md`, parent issue #52, and Paseo commit `163e7d1cc421cdfe4de67b971ff6cea4b51eb0ed`.
- **Stop conditions:** Stop if the pinned license differs, a selected path is unclear, a third-party artifact cannot be classified, or a public-distribution claim needs legal interpretation.
- **Tail ownership:** One delivery owner controls the tree, reviews generated evidence, runs all checks, applies review fixes, and creates the canonical commit.

## Product Contract

### Summary

No Paseo package source can enter BITCH until one deterministic gate records the approved license and exact provenance boundary.

### Requirements

- R1. Copy the pinned Paseo root `LICENSE` byte for byte and declare `AGPL-3.0-only` in root package metadata.
- R2. Add `NOTICE.md` with BITCH and Paseo attribution, upstream URL and commit, a truthful dated pre-import statement, inventory and license links, and source-offer guidance.
- R3. Add `provenance/paseo-0.3.1.schema.json` and `provenance/paseo-0.3.1.json` with exact destination, source, commit, status, blob, SHA-256, license, and file-notice fields.
- R4. The validator must reject missing paths, duplicate destinations, wrong pins, wrong blobs, wrong hashes, invalid statuses, and missing third-party notices.
- R5. Add a deterministic selected-path author snapshot and a generator that checks a caller-supplied clean pinned Paseo checkout.
- R6. Record the bundled `silero_vad.onnx` path as excluded until its origin, checksum, license, and notice are verified.
- R7. Add one offline repository command that validates the pre-import license, notice, schema, empty import inventory, exclusions, and package metadata.
- R8. Add deterministic positive and negative tests with Node built-ins. Do not add a new test framework or runtime dependency.
- R9. Document the exact process that later source-import pull requests use to add inventory entries and regenerate attribution.
- R10. Do not import Paseo package source, root build tooling, or the unverified binary in this issue.

### Acceptance Examples

- AE1. **Covers R1-R3 and R7.** Given a clean BITCH checkout before source import, when the owner runs the gate, then the exact license, notice, metadata, schema, and empty inventory pass.
- AE2. **Covers R3, R4, and R8.** Given a duplicate destination or wrong commit, blob, or hash in a temporary fixture, when the validator runs, then it exits nonzero with the failed rule.
- AE3. **Covers R5.** Given a clean Paseo checkout at the exact pin, when the author generator runs in check mode, then it reproduces `provenance/paseo-authors.txt` byte for byte.
- AE4. **Covers R6 and R10.** Given the pinned `silero_vad.onnx` path, when the gate inspects the pre-import inventory, then the artifact is explicitly excluded and absent from BITCH source paths.
- AE5. **Covers R2.** Given that no package source is imported yet, when a reader opens `NOTICE.md`, then it does not falsely claim that modified Paseo package files are already distributed.

### Scope Boundaries

**In scope**

- Root legal artifacts, package metadata, provenance data, validators, built-in Node tests, and documentation for the import gate.

**Out of scope**

- Legal advice, package source import, product rebranding, publishing, runtime notices, and public network deployment.

### Dependencies and Risks

- The pinned Paseo tree has conflicting `AGPL-3.0-or-later`, deprecated `AGPL-3.0`, and root-license `AGPLv3` signals. The approved conservative policy selects `AGPL-3.0-only`.
- The author check needs a local clean Paseo checkout. The normal repository gate remains offline.
- A qualified reviewer must approve the legal interpretation before public distribution. This review does not block the internal pre-import engineering gate.

### Open Questions

- **Blocking:** None.
- **Deferred:** Public distribution and network source-offer wording receives qualified legal review before release.

## Planning Contract

### Key Technical Decisions

- KTD1. **Use the narrow approved SPDX expression.** Declare `AGPL-3.0-only` without inferring a later-version grant. Governs R1 and R2.
- KTD2. **Keep one machine-readable import inventory.** Store selected paths, exclusions, and file entries in `provenance/paseo-0.3.1.json`, validated by one schema and one executable. Governs R3, R4, R6, and R7.
- KTD3. **Use Node built-ins.** Implement validation, SHA-256 checks, Git subprocess calls, temporary fixtures, and tests without a new dependency. Governs R4, R7, and R8.
- KTD4. **Separate offline validation from upstream regeneration.** The standard gate validates committed evidence offline. Author regeneration takes `--upstream <path>` and rejects a checkout at the wrong commit. Governs R5 and R7.
- KTD5. **Use a truthful pre-import notice.** Record that no Paseo package source is present as of this gate. Require the first import to add its actual first modification date. Governs R2 and R10.

### Implementation Constraints

- Preserve the pinned `LICENSE` byte for byte.
- Use canonical JSON with stable ordering for generated provenance output.
- Never infer an upstream blob or checksum from a BITCH destination.
- Keep tests in temporary directories and avoid network, credentials, production data, and paid services.
- Keep all generated test state untracked.

### Sequencing

1. Add the legal and static provenance artifacts.
2. Implement the validator and author generator.
3. Add positive and negative tests and package commands.
4. Update documentation and run the complete gate against a clean pinned checkout.

## Implementation Units

### U1. Add license and notice artifacts

- **Goal:** Establish the repository license metadata and truthful pre-import notice.
- **Requirements:** R1, R2, R10, AE1, and AE5.
- **Dependencies:** None.
- **Files:** `LICENSE`, `NOTICE.md`, `package.json`, `package-lock.json`, `README.md`.
- **Approach:** Copy the pinned license exactly. Add package metadata and scripts without changing dependency versions. State the exact pin, source relationship, pre-import state, and future version-specific source-offer requirement.
- **Test scenarios:**
  - **Success:** `cmp` reports no difference between the two license files.
  - **Edge:** The notice distinguishes the pre-import state from the first later modified-source import.
  - **Failure:** A wrong package license or missing pin makes the gate fail.
  - **Integration:** README and NOTICE use the same source URL and commit.
  - **Authorization:** No credential or private source location enters either file.
- **Verification:** Run the license comparison, package metadata check, and offline gate in the Verification Contract.

### U2. Add provenance data and schema

- **Goal:** Define the exact empty-import and exclusion records accepted before source copying.
- **Requirements:** R3, R4, R6, R10, AE1, AE2, and AE4.
- **Dependencies:** U1.
- **Files:** `provenance/paseo-0.3.1.schema.json`, `provenance/paseo-0.3.1.json`, `provenance/third-party-notices.json`.
- **Approach:** Record the approved selected package paths, an empty imported-file array, and the excluded ONNX path. Define required fields and closed enumerations for copied, renamed, and adapted file status. Keep exclusions in their separate inventory collection.
- **Test scenarios:**
  - **Success:** The pre-import inventory validates with zero imported files and one explicit binary exclusion.
  - **Edge:** Generated outputs can cite one source and command instead of one upstream blob per output.
  - **Failure:** Duplicate destinations, absent files, or malformed notices fail.
  - **Integration:** Every future imported entry can map one BITCH destination to one upstream blob.
  - **Authorization:** Inventory paths contain no credentials or private host paths.
- **Verification:** Run schema and validator tests in the Verification Contract.

### U3. Implement deterministic checks

- **Goal:** Validate static evidence offline and regenerate the author snapshot from an explicit pinned checkout.
- **Requirements:** R4-R8, AE1-AE4.
- **Dependencies:** U2.
- **Files:** `scripts/provenance/validate-paseo-import.mjs`, `scripts/provenance/generate-paseo-authors.mjs`, `test/provenance/validate-paseo-import.test.mjs`, `provenance/paseo-authors.txt`, `package.json`.
- **Approach:** Use `node:fs`, `node:crypto`, `node:child_process`, `node:test`, and temporary fixtures. Make diagnostics identify the failed invariant and path without leaking file content.
- **Test scenarios:**
  - **Success:** Committed pre-import evidence passes offline.
  - **Edge:** Adapted files use destination hashes while copied files must also match the upstream blob content.
  - **Failure:** Tests cover missing, duplicate, wrong-pin, wrong-blob, wrong-hash, and missing-notice records.
  - **Integration:** Author check rejects a dirty or wrong-commit upstream checkout and reproduces the snapshot at the pin.
  - **Authorization:** Diagnostics show paths and rule names, not secret-bearing content.
- **Verification:** Run `node --test`, the offline package command, and the author check.

### U4. Document later import use

- **Goal:** Make the gate executable for every later source-import issue.
- **Requirements:** R9 and R10.
- **Dependencies:** U3.
- **Files:** `docs/architecture/licensing.md`, `docs/testing.md`, `README.md`, `NOTICE.md`.
- **Approach:** Document entry generation, copied versus adapted hashes, author regeneration, third-party exclusion, and the first-import notice update. Keep legal policy separate from check implementation.
- **Test scenarios:**
  - **Success:** A later import owner can identify every required command and artifact.
  - **Edge:** An unavailable or excluded binary remains recorded without entering the source tree.
  - **Failure:** Documentation does not authorize import when the gate fails.
  - **Integration:** Testing and licensing documents name the same offline command.
  - **Authorization:** Public source guidance contains no local path or token.
- **Verification:** Run the Markdown-link check and owner diff review.

## Verification Contract

| Check | Command or manual check | Proves |
|---|---|---|
| Whitespace | `git diff --check` | Changed text has no whitespace error. |
| Pinned source | `test "$(git -C "$PASEO_SOURCE" rev-parse HEAD)" = 163e7d1cc421cdfe4de67b971ff6cea4b51eb0ed && test -z "$(git -C "$PASEO_SOURCE" status --short)"` | The comparison source is clean and exact. |
| License bytes | `cmp LICENSE "$PASEO_SOURCE/LICENSE"` | The root license is copied verbatim. |
| Metadata | `node -e "const p=require('./package.json'); if(p.license!=='AGPL-3.0-only') process.exit(1)"` | Root metadata uses the approved expression. |
| Validator tests | `node --test test/provenance/validate-paseo-import.test.mjs` | Positive and representative negative rules work. |
| Offline gate | `npm run check:provenance` | Committed pre-import evidence passes without network access. |
| Author snapshot | `npm run provenance:authors -- --upstream "$PASEO_SOURCE" --check` | Selected-path attribution is deterministic at the pin. |
| Binary exclusion | `test ! -e packages/server/src/server/speech/providers/local/sherpa/assets/silero_vad.onnx` | The unverified binary is absent. |
| Scope review | `git diff --name-status origin/main -- LICENSE NOTICE.md package.json package-lock.json README.md docs/architecture/licensing.md docs/testing.md provenance scripts/provenance test/provenance docs/plans/2026-08-14-053-chore-paseo-license-provenance-gate-plan.md` | The owner sees the complete issue diff. |

Set `PASEO_SOURCE` to a local clean checkout of `https://github.com/getpaseo/paseo` at the approved commit. No hosted CI exists on `origin/main`. Disclose issue #63 instead of claiming CI passed.

## Rollback

Revert the issue #53 commit. Remove the root legal and provenance artifacts only if no later source-import commit depends on them. Restore prior package metadata and lockfile together. No product or user data needs migration.

## Definition of Done

- R1-R10 and AE1-AE5 pass.
- The plan remains implementation-ready with no blocking question.
- A clean repository passes the offline gate.
- A clean pinned Paseo checkout reproduces the license and author evidence.
- No Paseo package source or unverified binary enters the tree.
- The owner reviews the actual diff and reruns all authoritative checks after accepted review fixes.
- One focused pull request uses `Closes #53`.
- No CI success is claimed while issue #63 remains open.
