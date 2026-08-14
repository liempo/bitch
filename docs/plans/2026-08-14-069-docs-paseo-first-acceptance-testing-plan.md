---
title: Paseo-First Acceptance and Testing Contracts - Plan
type: docs
date: 2026-08-14
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: github-issue-69
execution: code
---

# Paseo-First Acceptance and Testing Contracts - Plan

## Goal Capsule

- **Objective:** Replace obsolete mode-based workflows with concise daemon MVP acceptance and make pinned Paseo tests the primary retained behavioral evidence.
- **Authority:** Issue #69, parent issue #64, issues #53 and #65-#68, and the test corpus at Paseo commit `163e7d1cc421cdfe4de67b971ff6cea4b51eb0ed`.
- **Stop conditions:** Stop if a required outcome lacks a public proof path, a copied test cannot be classified, or a proposed test needs credentials, paid services, production data, or source inspection as proof.
- **Tail ownership:** One delivery owner controls writes, maps every workflow to evidence, reviews copied-suite claims, runs verification, applies fixes, and creates the canonical commit.

## Product Contract

### Summary

The current acceptance and test contracts target the removed Directory, Gateway, HTTP/SSE, Docker, and embedded-SDK design. The revised contract must preserve Paseo tests and add only evidence for BITCH differences and missing public outcomes.

### Requirements

- R1. `docs/testing.md` must make the exact pinned Paseo test corpus the primary baseline for retained behavior.
- R2. Every upstream test must be classified as copied unchanged, copied with adaptation, excluded, or replaced, with path, reason, behavior, and replacement evidence.
- R3. Applicable package-internal Paseo regression tests must remain. Public-boundary proof is added for changed BITCH behavior or an otherwise unproved public outcome.
- R4. Real Pi integration must start Pi 0.83.0 in RPC mode with a deterministic scripted local model provider.
- R5. Added CLI end-to-end tests must execute the built CLI as a subprocess. Terminal and TUI integration must use real PTYs.
- R6. `docs/product/acceptance.md` must define public daemon MVP workflows for local startup, Pi work, retry, resources, import, multiple Conversations, Terminals, Workspaces, direct, relay, localhost removal, restart, and Pi-only exclusion.
- R7. Test sections must cover protocol, Conversation, timeline, import, Project, Workspace, Terminal, CLI, TUI, direct, relay, recovery, and security boundaries.
- R8. Build, type, lint, generated-file, source-text, import, private-symbol, and empty-future-suite checks cannot serve as behavioral proof.
- R9. Required checks must avoid production services, production data, credentials, paid providers, and a mandatory hosted relay.
- R10. Source-import verification must include license, notice, provenance, author, third-party, package-identity, and test-classification gates.

### Acceptance Examples

- AE1. **Covers R1-R3.** Given retained Paseo behavior with an applicable upstream test, when BITCH imports it, then the copied test remains primary and no duplicate BITCH test replaces it.
- AE2. **Covers R4.** Given a retryable first Pi model failure, when real Pi runs against the scripted provider, then public Conversation state stays running through `agent_end` and settles only at the approved boundary.
- AE3. **Covers R5 and R6.** Given the built CLI and a temporary daemon, when a user runs, disconnects, reconnects, and opens the same Conversation, then public state repairs without duplicate timeline items.
- AE4. **Covers R2 and R9.** Given an upstream test that needs a paid provider or hosted service, when it is classified, then the record states the exclusion and retained public replacement where required.
- AE5. **Covers R7-R9.** Given an authorization boundary, when tests run, then both allowed and denied paths execute through public interfaces without secret disclosure.

### Scope Boundaries

**In scope**

- `docs/product/acceptance.md`, `docs/testing.md`, and this plan.

**Out of scope**

- Test implementation, CI, source import, paid-provider tests, production resources, and deferred macOS package acceptance.

### Dependencies and Risks

- Issues #53 and #65 through #68 are closed. They own provenance checks and the behavior under test.
- The source baseline has package-internal regression tests that remain valid even though new BITCH differences require public-boundary proof.
- The current working tree contains unrelated pending documentation. The owner must isolate this exact scope.

### Open Questions

- **Blocking:** None.
- **Deferred:** A live hosted-relay test can remain optional. Local cryptographic and protocol relay tests are required.

## Planning Contract

### Key Technical Decisions

- KTD1. **Preserve before adding.** Start with the applicable pinned Paseo test and adapt only approved boundaries. Governs R1-R3.
- KTD2. **Classify every upstream test.** Exclusion is evidence, not deletion by omission. Governs R2 and R10.
- KTD3. **Use public proof for BITCH differences.** Keep internal copied regression tests while proving changed outcomes through daemon, built CLI, or TUI boundaries. Governs R3, R5, R7, and R8.
- KTD4. **Use real deterministic runtime seams.** Start real Pi RPC, built CLI subprocesses, and real PTYs. Fake only external systems needed for isolation or protocol-error determinism. Governs R4, R5, and R9.
- KTD5. **Separate behavior from build health.** Build checks remain required gates but do not replace behavioral tests. Governs R8.
- KTD6. **Keep workflows concise and public.** Acceptance documents describe user actions and expected results, while testing owns layer and suite detail. Governs R6 and R7.

### Implementation Constraints

- Preserve pinned package test entry points and suffix meanings.
- Do not claim a future or unavailable suite passed.
- Do not automatically retry failed tests to hide flakiness.
- Normalize IDs, timestamps, and temporary paths only where presentation snapshots require it.
- Use ASD-STE100-inspired Simplified Technical English.

### Sequencing

1. Characterize pinned package tests and entry points.
2. Rewrite test principles, layers, classifications, and required coverage.
3. Rewrite public MVP acceptance workflows.
4. Map every workflow to an owning test section.
5. Run command, link, exclusion, safety, and owner diff review.

## Implementation Units

### U1. Define the Paseo-first test contract

- **Goal:** Specify baseline preservation, classification, layers, deterministic runtime seams, coverage, and pull-request gates.
- **Requirements:** R1-R5 and R7-R10, AE1, AE2, AE4, and AE5.
- **Dependencies:** None.
- **Files:** `docs/testing.md`.
- **Approach:** Replace BITCH-only mode tests with copied package suites and public difference tests. Name exact package commands and required daemon, CLI, PTY, relay, recovery, security, and provenance evidence.
- **Test scenarios:**
  - **Success:** Each retained package runs its copied default suite against local workspaces.
  - **Edge:** A fake Pi process covers only an error record that real scripted Pi cannot emit deterministically.
  - **Failure:** Slow, flaky, or internal status alone cannot justify exclusion.
  - **Integration:** The complete Phase 1 gate combines copied suites, real Pi, CLI smoke, provenance, and classification.
  - **Authorization:** Direct, relay, Pi-only, and secret boundaries include allowed and denied tests.
- **Verification:** Compare listed commands with pinned package scripts and run the Verification Contract.

### U2. Define public MVP workflows

- **Goal:** Specify concise actions and expected results for every public MVP boundary.
- **Requirements:** R6-R9, AE2, AE3, and AE5.
- **Dependencies:** U1.
- **Files:** `docs/product/acceptance.md`.
- **Approach:** Replace former mode and Gateway workflows with 15 public daemon workflows. Use built clients and real daemon resources as the observable boundary.
- **Test scenarios:**
  - **Success:** Local startup, Pi work, import, Workspace, Terminal, direct, and relay workflows have expected outcomes.
  - **Edge:** Multiple same-path Workspaces and same-size Terminal claim transfer remain explicit.
  - **Failure:** Selected-daemon loss, daemon restart, and non-Pi creation have denied outcomes.
  - **Integration:** Each workflow names only behavior owned by the revised product and architecture documents.
  - **Authorization:** Direct and relay workflows establish trust before mutation.
- **Verification:** Map each numbered workflow to at least one testing section.

### U3. Complete the evidence crosswalk

- **Goal:** Prove that acceptance and testing documents cover the same boundary without duplicate requirements.
- **Requirements:** R1-R10 and AE1-AE5.
- **Dependencies:** U1 and U2.
- **Files:** `docs/product/acceptance.md`, `docs/testing.md`.
- **Approach:** Review every expected result against the copied or added evidence rule. Keep implementation commands in testing and user outcomes in acceptance.
- **Test scenarios:**
  - **Success:** Every acceptance outcome has one owning evidence section.
  - **Edge:** One copied test can cover multiple retained outcomes without duplicate BITCH tests.
  - **Failure:** An unavailable future suite cannot satisfy a current pull-request gate.
  - **Integration:** License and provenance checks remain build or release gates, not user-behavior claims.
  - **Authorization:** Every access-control outcome has allowed and denied evidence.
- **Verification:** Perform the manual crosswalk and record no uncovered workflow.

## Verification Contract

| Check | Command or manual check | Proves |
|---|---|---|
| Whitespace | `git diff --check` | Changed text has no whitespace error. |
| Scope | `git diff --name-status origin/main -- docs/product/acceptance.md docs/testing.md docs/plans/2026-08-14-069-docs-paseo-first-acceptance-testing-plan.md` | The owner sees the complete issue diff. |
| Paseo commands | Compare the copied-suite table with `package.json` files at Paseo commit `163e7d1cc421cdfe4de67b971ff6cea4b51eb0ed`. | Package entry points are exact. |
| Required seams | `rg -n 'real pinned Pi RPC process|built CLI as a subprocess|real PTYs|copied Paseo' docs/testing.md` | Core evidence rules remain explicit. |
| Removed workflows | Review every result of `rg -n 'Directory mode|Gateway mode|Agent Server|HTTP|SSE' docs/product/acceptance.md docs/testing.md` and accept only explicit historical or exclusion text. | Obsolete workflows are not active acceptance. |
| Local links | Run the repository-relative Markdown link scan from issue #69 against both changed documents. | Every local target resolves at merge time. |
| Crosswalk | For each numbered heading in `docs/product/acceptance.md`, record at least one owning section in `docs/testing.md`. | Every public workflow has required evidence. |
| Environment safety | Review required suites for production services, production data, credentials, paid providers, and mandatory hosted dependencies. | Required verification remains isolated and deterministic. |

No behavioral test applies to this documentation-only slice. The plan defines future behavioral evidence but does not claim those suites exist. No CI exists on `origin/main`. Issue #63 tracks that gap.

## Rollback

Revert the plan and both documents together. Do not leave an acceptance workflow without its owning evidence contract. No runtime or test data migration applies.

## Definition of Done

- R1-R10 and AE1-AE5 are represented without contradiction.
- Every acceptance workflow maps to required deterministic evidence.
- Copied Paseo tests remain primary for retained behavior.
- The owner reviews the actual diff and reruns verification after accepted review fixes.
- One focused pull request uses `Closes #69`.
- No CI or unavailable-suite success is claimed while issue #63 remains open.
