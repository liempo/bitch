---
title: Paseo-Derived MVP Product Contract - Plan
type: docs
date: 2026-08-14
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: github-issue-65
execution: code
---

# Paseo-Derived MVP Product Contract - Plan

## Goal Capsule

- **Objective:** Replace the former Directory and Gateway product model with the approved Pi-only Paseo daemon model in four product documents.
- **Authority:** Issue #65, parent issue #64, the user-approved specification revision, and Paseo commit `163e7d1cc421cdfe4de67b971ff6cea4b51eb0ed`.
- **Stop conditions:** Stop if a rule cannot be traced to the approved revision or pinned Paseo behavior, or if a change needs wire, storage, test, licensing, or macOS implementation detail.
- **Tail ownership:** One delivery owner controls the tree, reviews the complete four-file contract, runs verification, applies review fixes, and creates the canonical commit.

## Product Contract

### Summary

The canonical product documents still describe the superseded BITCH runtime. This slice defines one selected daemon, Pi-only Conversations, Paseo Projects and Workspaces, Terminals, and CLI/TUI clients.

### Requirements

- R1. `docs/product/scope.md` must define the Pi-only local and remote daemon MVP, included Paseo behavior, deferred improvements, and success criteria.
- R2. `docs/product/conversations.md` must define daemon-owned live work, Pi JSONL durability, lifecycle, timeline repair, controls, extensions, images, and restart behavior.
- R3. `docs/product/workspaces.md` must define Project and Workspace identity, local and managed-worktree placement, deterministic path opening, archive, recovery, and concurrent work.
- R4. `docs/product/clients.md` must define the daemon registry, explicit selection, CLI, TUI Workspace canvas, Conversation and Terminal presentation, and direct and relay routes.
- R5. An unavailable selected daemon must remain selected. No action can run on another daemon ID implicitly.
- R6. Public product surfaces must expose Pi as the only agent runtime while retaining Pi model providers.
- R7. The documents must distinguish durable Pi sessions, loaded normalized timelines, runtime-only processes and Terminals, and non-authoritative client replicas.
- R8. BITCH-specific improvements and graphical clients must remain deferred without weakening the CLI and TUI MVP.
- R9. Product documents must contain user-visible rules only and use the terms in `docs/glossary.md`.

### Acceptance Examples

- AE1. **Covers R1-R7.** Given a selected daemon and Workspace, when a user starts Pi work and disconnects, then the daemon keeps work active and reconnect repairs one canonical timeline.
- AE2. **Covers R3 and R7.** Given two Workspaces with one `cwd`, when clients use them, then Workspace-owned Conversations, Terminals, and layouts remain separate.
- AE3. **Covers R4 and R5.** Given an unavailable remote daemon, when a client attempts a mutation, then it reports disconnection and performs no local fallback.
- AE4. **Covers R2, R6, and R8.** Given Pi resources and controls, when a client uses transferable behavior, then Pi executes them while terminal-only extension UI remains deferred.
- AE5. **Covers R4 and R7.** Given two clients attached to one Terminal, when both send input and size claims, then both can write and the copied size claimant orders resizes.

### Scope Boundaries

**In scope**

- `docs/product/scope.md`, `docs/product/conversations.md`, `docs/product/workspaces.md`, and `docs/product/clients.md`.

**Out of scope**

- Protocol fields, store schemas, algorithms, test implementation, licensing implementation, acceptance enumeration, macOS detail, and product code.

### Dependencies and Risks

- Issue #53 is closed and supplies the linked licensing target.
- Later architecture leaves must implement this product contract without adding behavior.
- The current working tree contains other pending changes. The owner must isolate only this plan and the four product files.

### Open Questions

- **Blocking:** None.
- **Deferred:** None for this slice. Deferred product improvements remain explicitly out of MVP scope.

## Planning Contract

### Key Technical Decisions

- KTD1. **Use one daemon model.** Remove Directory and Gateway as active product modes. One selected daemon owns each action and resource. Governs R1, R4, and R5.
- KTD2. **Use the Paseo authority split.** The loaded normalized timeline is authoritative for clients. Pi JSONL remains native durable Pi state and rebuild input. Governs R2 and R7.
- KTD3. **Keep Project and Workspace identity distinct.** Projects own exact roots. Workspaces own opaque identity, one `cwd`, and their resources. Governs R3 and AE2.
- KTD4. **Make the TUI the bounded BITCH difference.** Recreate Paseo's graphical Workspace canvas in a terminal without running Pi's native TUI. Governs R4 and R8.
- KTD5. **Defer non-baseline improvements.** Do not carry former Trash, receipt, Docker, provider-login, `SOUL.md`, or full Pi parity requirements into the MVP. Governs R6 and R8.

### Implementation Constraints

- Preserve the exact Paseo and Pi pins.
- Use user-visible **Conversation**, **Workspace**, **Project**, **Terminal**, and **daemon** terms consistently.
- Mention former modes only to state that they are removed or superseded.
- Link to technical authority instead of copying wire or storage detail into product text.
- Use ASD-STE100-inspired Simplified Technical English.

### Sequencing

1. Establish the shared scope and authority model.
2. Rewrite Conversation and Workspace rules against that model.
3. Rewrite client behavior and cross-check every shared lifecycle rule.
4. Run links, terminology scans, and owner diff review.

## Implementation Units

### U1. Define the shared MVP boundary

- **Goal:** Establish the daemon, Pi, Workspace, client, included behavior, and deferred behavior contract.
- **Requirements:** R1, R5-R9, AE1, AE3, and AE4.
- **Dependencies:** None.
- **Files:** `docs/product/scope.md`.
- **Approach:** Replace operating modes with the selected-daemon model. State host authority, Pi-only behavior, local and remote routes, client set, source pin, exclusions, and success criteria.
- **Test scenarios:**
  - **Success:** The complete local or remote Pi workflow has one selected daemon.
  - **Edge:** Removing localhost leaves remote-only operation possible.
  - **Failure:** No fallback daemon or non-Pi runtime is implied.
  - **Integration:** Scope links the approved licensing policy and matches the glossary.
  - **Authorization:** Remote access is described as daemon-host authority, not client filesystem access.
- **Verification:** Review every R1, R5-R9 statement in the file and run the Verification Contract.

### U2. Define Conversation behavior

- **Goal:** Specify Pi session, lifecycle, timeline, extension, tool, image, multi-client, and shutdown behavior.
- **Requirements:** R2, R5-R8, AE1, and AE4.
- **Dependencies:** U1.
- **Files:** `docs/product/conversations.md`.
- **Approach:** Use the two-layer authority model and copied Paseo lifecycle. Keep only controls transferred by the retained adapter. State archive, hard-delete, disconnect, and restart effects without inventing durability.
- **Test scenarios:**
  - **Success:** A settled turn survives client disconnect and repairs on reconnect.
  - **Edge:** Pi retry and no-agent extension commands remain within their accepted turn semantics.
  - **Failure:** Daemon shutdown does not replay an interrupted prompt.
  - **Integration:** Question permissions and normalized tool details match client presentation.
  - **Authorization:** Multiple clients share daemon ordering without a new mutation lease.
- **Verification:** Trace each lifecycle transition and authority statement to R2 and the pinned boundary.

### U3. Define Project and Workspace behavior

- **Goal:** Specify identity, placement, exact-path selection, archive, recovery, and concurrent access.
- **Requirements:** R3, R5, R7, AE2.
- **Dependencies:** U1.
- **Files:** `docs/product/workspaces.md`.
- **Approach:** Preserve opaque IDs, lexical roots, multiple same-path Workspaces, deterministic compatibility opening, local-file safety, and managed-worktree final-reference removal.
- **Test scenarios:**
  - **Success:** Local and worktree Workspaces use their approved placement.
  - **Edge:** Explicit creation mints another Workspace at an existing `cwd`.
  - **Failure:** Archive never recursively deletes an ordinary local directory.
  - **Integration:** Conversation and Terminal resources remain peer Workspace children.
  - **Authorization:** Every path belongs to the selected daemon's host.
- **Verification:** Compare identity and archive rules with R3 and AE2.

### U4. Define client behavior

- **Goal:** Specify registry, selection, CLI, TUI, synchronization, Terminal, lifecycle, and remote route behavior.
- **Requirements:** R4-R8, AE1, AE3, and AE5.
- **Dependencies:** U1-U3.
- **Files:** `docs/product/clients.md`.
- **Approach:** Keep clients behind one daemon protocol. Define the TUI canvas and panel gestures without importing implementation detail. State authoritative bootstrap and Terminal size claims.
- **Test scenarios:**
  - **Success:** CLI and TUI target the same selected daemon resources.
  - **Edge:** Live rows received during bootstrap remain separate until authoritative reconciliation.
  - **Failure:** Route loss does not change daemon selection or abort daemon work.
  - **Integration:** Terminal panels use copied binary snapshots and claims.
  - **Authorization:** Direct and relay routes enforce the governing authentication boundary.
- **Verification:** Trace each client flow across the four product documents without contradiction.

## Verification Contract

| Check | Command or manual check | Proves |
|---|---|---|
| Whitespace | `git diff --check` | Changed text has no whitespace error. |
| Scope | `git diff --name-status origin/main -- docs/product/scope.md docs/product/conversations.md docs/product/workspaces.md docs/product/clients.md docs/plans/2026-08-14-065-docs-paseo-mvp-product-contract-plan.md` | The owner sees the complete issue scope. |
| Source pin | `rg -n '163e7d1cc421cdfe4de67b971ff6cea4b51eb0ed|Pi 0\.83\.0' docs/product/scope.md docs/product/conversations.md docs/product/workspaces.md docs/product/clients.md` | Product references keep the approved baseline. |
| Removed modes | Review every result of `rg -n 'Directory mode|Gateway mode|Agent Server' docs/product/scope.md docs/product/conversations.md docs/product/workspaces.md docs/product/clients.md` and accept only explicit historical or exclusion text. | Superseded modes are not active product behavior. |
| Local links | Run the repository-relative Markdown link scan from issue #65 against the four changed documents. | Every local target exists at merge time. |
| Product review | Read the four files in order and trace AE1-AE5 without consulting implementation detail. | The public product contract is complete and coherent. |

No behavioral test applies because this slice changes approved documentation only. No CI exists on `origin/main`. Issue #63 tracks that gap.

## Rollback

Revert the plan and all four product documents in one commit. Do not leave a mixed product model. No runtime or user data needs migration.

## Definition of Done

- R1-R9 and AE1-AE5 are represented without contradiction.
- The exact file scope contains no technical implementation or unrelated macOS detail.
- Every repository-relative Markdown link resolves.
- The owner reviews the actual diff and reruns verification after accepted review fixes.
- One focused pull request uses `Closes #65`.
- No CI success is claimed while issue #63 remains open.
