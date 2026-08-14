---
title: Paseo Specification Integration and Phase Sequence - Plan
type: docs
date: 2026-08-14
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: github-issue-71
execution: code
---

# Paseo Specification Integration and Phase Sequence - Plan

## Goal Capsule

- **Objective:** Align top-level summaries, architecture and testing instructions, and the root phase plan with the completed Paseo-derived specification.
- **Authority:** Issue #71, parent issue #64, issues #53 and #65-#70, and the current root `plan/` authority.
- **Stop conditions:** Stop if a change alters delivery workflow, moves `plan/`, adds execution state, or introduces behavior absent from the governing documents.
- **Tail ownership:** One delivery owner controls writes, reviews all integration paths, runs verification, applies fixes, and creates the canonical commit.

## Product Contract

### Summary

After canonical specification leaves merge, repository entry points and phase plans must stop directing contributors to the superseded Directory, Gateway, HTTP/SSE, and embedded-SDK design.

### Requirements

- R1. `README.md` must summarize the selected daemon, Pi-only runtime, Projects, Workspaces, Conversations, Terminals, CLI/TUI clients, source relationship, and exact pins.
- R2. `docs/README.md` must map each product, architecture, operations, testing, glossary, and planning authority without copying its full rules.
- R3. The architecture and testing sections of `AGENTS.md` must require the Paseo-derived daemon, process-backed Pi RPC, loaded timeline authority, native Pi JSONL durability, public interfaces, copied tests, real Pi, built CLI, and real PTYs.
- R4. The root `plan/` set must define seven ordered phases: Paseo baseline, Pi daemon, Workspaces and Terminals, CLI and TUI, remote daemons, release, and deferred macOS.
- R5. Phase plans must contain outcomes, boundaries, dependencies, and exit gates only. They must contain no progress checkbox, issue-sized unit, execution status, or completed-task archive.
- R6. Phase 1 must keep license, notice, provenance, author, and third-party gates before source import.
- R7. This issue must keep phase files under root `plan/`. Issue #62 alone owns the later move to `docs/plan/` and delivery-workflow changes.
- R8. Top-level links and terms must agree with the canonical documents from issues #53 and #65-#70.
- R9. No top-level summary or phase file can authorize product implementation directly.

### Acceptance Examples

- AE1. **Covers R1-R3 and R8.** Given a contributor at the repository root, when they follow documentation links, then they reach one coherent Pi-only daemon specification.
- AE2. **Covers R4-R6.** Given the phase map, when a contributor reads Phase 1, then source import remains gated by attribution and provenance before package copying.
- AE3. **Covers R4 and R5.** Given any phase file, when it is reviewed, then delivery status and issue-sized execution remain in GitHub rather than the durable phase plan.
- AE4. **Covers R3, R7, and R9.** Given this issue's diff, when delivery-workflow sections are compared, then they remain unchanged and continue to point at root `plan/`.
- AE5. **Covers R4 and R8.** Given deferred macOS questions, when a contributor reads the MVP phases, then those questions remain deferred and do not block Phase 1 through Phase 6.

### Scope Boundaries

**In scope**

- Specification portions of `README.md`, `docs/README.md`, and `AGENTS.md`.
- Complete replacement of the root phase-plan filenames and contents.
- This executable plan.

**Out of scope**

- Delivery workflow, Compound Engineering setup, templates, ignore rules, moving `plan/`, implementation, source import, CI, and Phase 7 decisions.

### Dependencies and Risks

- Issues #53 and #65 through #70 are closed. They supply every canonical contract integrated by this issue.
- `README.md`, `docs/README.md`, and `AGENTS.md` also contain #62-owned workflow text. Hunk-level ownership is required.
- The current working tree contains the desired phase content under `docs/plan/`. Implementation must place equivalent phase content under root `plan/` until #62 executes.

### Open Questions

- **Blocking:** None.
- **Deferred:** Questions D01-D05 remain in `plan/gaps.md` for Phase 7.

## Planning Contract

### Key Technical Decisions

- KTD1. **Integrate only after canonical leaves.** Top-level summaries and phase outcomes derive from merged authorities instead of becoming another normative source. Governs R1-R3 and R8.
- KTD2. **Keep hunk-level ownership.** Update architecture and testing instructions now, but leave queue, plan, review, commit, and completion rules for #62. Governs R3 and R7.
- KTD3. **Replace phase names at root first.** Establish the Paseo-derived sequence under `plan/`, then let #62 perform a path-only move. Governs R4 and R7.
- KTD4. **Keep phase plans at program altitude.** GitHub issues and executable plans own delivery detail and state. Governs R5 and R9.
- KTD5. **Preserve deferred macOS questions.** Phase 7 remains separate from the CLI/TUI MVP and keeps unresolved presentation and release choices in gaps. Governs R4 and AE5.

### Implementation Constraints

- Start from current `origin/main` after #69 and #70 merge.
- Preserve all merged specification behavior and exact pins.
- Do not stage #62 workflow hunks from the pending working tree.
- Use repository-relative links that resolve before the later plan move.
- Use ASD-STE100-inspired Simplified Technical English.

### Sequencing

1. Characterize the merged canonical documents and current top-level workflow hunks.
2. Update only product, architecture, testing, and documentation-map text.
3. Replace root phase names and content without moving the directory.
4. Verify phase altitude, links, stale terms, and hunk ownership.
5. Review the complete diff and rerun checks after fixes.

## Implementation Units

### U1. Align repository entry points and instructions

- **Goal:** Make summaries, maps, architecture rules, and testing rules point to the merged specification.
- **Requirements:** R1-R3, R7-R9, AE1, and AE4.
- **Dependencies:** None after native blockers close.
- **Files:** `README.md`, `docs/README.md`, `AGENTS.md`.
- **Approach:** Update non-workflow sections only. Keep normative detail in linked documents and preserve root `plan/` paths until #62.
- **Test scenarios:**
  - **Success:** Root and docs entry points identify one selected daemon and Pi-only runtime.
  - **Edge:** Source import is planned but product code remains absent.
  - **Failure:** No HTTP/SSE, embedded SDK, Gateway, or second Conversation engine remains authorized.
  - **Integration:** Every map entry resolves to the owning canonical document.
  - **Authorization:** Architecture rules forbid cross-daemon fallback and protect daemon-host authority.
- **Verification:** Use hunk-level diff review and the link and stale-term checks.

### U2. Replace the root phase sequence

- **Goal:** Establish Paseo-derived program order and phase gates at root `plan/`.
- **Requirements:** R4-R7 and R9, AE2, AE3, and AE5.
- **Dependencies:** U1.
- **Files:** Remove `plan/01-contracts.md`, `plan/02-core-vertical-slice.md`, `plan/03-pi-capabilities.md`, `plan/04-local-gateways.md`, and `plan/05-gateway-workspaces.md`. Add `plan/01-paseo-baseline.md`, `plan/02-pi-daemon.md`, `plan/03-workspaces-terminals.md`, `plan/04-cli-tui.md`, and `plan/05-remote-daemons.md`. Update `plan/README.md`, `plan/06-release.md`, `plan/07-macos-client.md`, and `plan/gaps.md`.
- **Approach:** Preserve phase-level outcomes from the approved specification. Keep source provenance first, Pi-only adaptation second, and deferred graphical delivery after the CLI/TUI MVP.
- **Test scenarios:**
  - **Success:** Each phase has one outcome and exit condition.
  - **Edge:** Deferred gaps remain questions without progress state.
  - **Failure:** No phase authorizes a pull request or claims completion.
  - **Integration:** Parent issue #52 remains the Phase 1 execution tracker.
  - **Authorization:** Remote-daemon work does not add fallback or cross-daemon authority.
- **Verification:** Run checkbox, filename, link, and phase-order checks.

### U3. Complete the integration audit

- **Goal:** Prove that top-level and phase artifacts summarize rather than contradict canonical documents.
- **Requirements:** R1-R9 and AE1-AE5.
- **Dependencies:** U1 and U2.
- **Files:** All issue #71 files.
- **Approach:** Trace each summary and phase outcome to one authority. Reject stale terms except explicit historical exclusions. Confirm #62 workflow sections remain untouched.
- **Test scenarios:**
  - **Success:** One reading path reaches all current authorities.
  - **Edge:** Compatibility names remain only where the architecture explicitly retains them.
  - **Failure:** A broken link, duplicate normative rule, or workflow hunk fails review.
  - **Integration:** Phase order matches dependencies in the GitHub Project.
  - **Authorization:** No summary weakens remote authentication or daemon selection rules.
- **Verification:** Run the complete Verification Contract.

## Verification Contract

| Check | Command or manual check | Proves |
|---|---|---|
| Whitespace | `git diff --check` | Changed text has no whitespace error. |
| Scope | `git diff --name-status origin/main -- README.md docs/README.md AGENTS.md plan docs/plans/2026-08-14-071-docs-paseo-specification-integration-plan.md` | The owner sees the complete issue diff. |
| Root location | `test -d plan && test ! -e docs/plan` | #71 does not perform the #62 path move. |
| Phase state | `! rg -n --glob '*.md' -- '- \[[ xX]\]' plan` | Phase plans contain no progress checkboxes. |
| Phase names | `printf '%s\n' plan/01-paseo-baseline.md plan/02-pi-daemon.md plan/03-workspaces-terminals.md plan/04-cli-tui.md plan/05-remote-daemons.md plan/06-release.md plan/07-macos-client.md | xargs -n1 test -f` | The complete approved phase order exists. |
| Former names | `test ! -e plan/01-contracts.md && test ! -e plan/02-core-vertical-slice.md && test ! -e plan/03-pi-capabilities.md && test ! -e plan/04-local-gateways.md && test ! -e plan/05-gateway-workspaces.md` | Superseded phase files are absent. |
| Local links | Run the repository-relative Markdown link scan from issue #71 against all changed Markdown files. | Every local target resolves before #62 moves the directory. |
| Stale model | Review every result of `rg -n 'Directory mode|Gateway mode|Agent Server|HTTP and SSE|AgentSession|packages/pi-runtime' README.md docs/README.md AGENTS.md plan` and accept only explicit historical or exclusion text. | Top-level artifacts do not authorize the former design. |
| Workflow ownership | Review `git diff origin/main -- README.md docs/README.md AGENTS.md` and reject changes to queue, executable-plan, review, commit, completion, template, or `plan/` location rules. | #62 retains its focused workflow scope. |

No behavioral test applies because this slice integrates approved documentation only. No CI exists on `origin/main`. Issue #63 tracks that gap.

## Rollback

Revert the plan, top-level summary and instruction hunks, and complete root phase replacement together. Restore all former phase filenames only in the same reversal. No product data or runtime migration applies.

## Definition of Done

- R1-R9 and AE1-AE5 are represented without contradiction.
- Top-level summaries and instructions agree with merged canonical documents.
- Root phase plans contain no execution detail or state.
- #62 workflow hunks and the root plan location remain unchanged.
- The owner reviews the actual diff and reruns verification after accepted review fixes.
- One focused pull request uses `Closes #71`.
- No CI success is claimed while issue #63 remains open.
