---
title: Deferred macOS Client Contract - Plan
type: docs
date: 2026-08-14
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: github-issue-70
execution: code
---

# Deferred macOS Client Contract - Plan

## Goal Capsule

- **Objective:** Replace the former SwiftUI direction with the approved deferred Paseo shared-app and Electron contract without starting Phase 7 implementation.
- **Authority:** Issue #70, parent issue #64, the revised MVP contracts, pinned Paseo app and desktop source, and `docs/plan/07-macos-client.md`.
- **Stop conditions:** Stop if the change selects an unresolved Phase 7 presentation or release choice, imports source, changes the MVP gate, or weakens renderer or daemon ownership boundaries.
- **Tail ownership:** One delivery owner controls writes, reviews product, architecture, and acceptance together, runs verification, applies fixes, and creates the canonical commit.

## Product Contract

### Summary

The deferred macOS documents must select Paseo's shared Expo, React Native Web, and Electron structure while preserving one daemon protocol and the later iOS option.

### Requirements

- R1. `docs/product/macos.md` must define the deferred product direction, managed daemon behavior, daemon registry, Workspace canvas, Conversation and Terminal behavior, security, and packaging.
- R2. `docs/architecture/macos-client.md` must define the shared app, Electron shell, package boundary, adapters, managed process, local transport, preload, renderer security, application loading, state authority, windows, build, and tests.
- R3. `docs/product/deferred-acceptance.md` must define future managed-daemon, multiple-daemon, canvas, Terminal, package, and iOS workflows.
- R4. The selected stack must be Expo and React Native, React Native Web export, and an Electron desktop shell. SwiftUI is rejected for this stage.
- R5. Electron can stop only the local daemon process that it started. An independently CLI-started daemon remains external.
- R6. Local and remote resources must use the same daemon protocol and explicit daemon selection without fallback.
- R7. The renderer must remain sandboxed, context-isolated, and without unrestricted Node.js integration. A narrow validated preload and IPC bridge owns desktop functions.
- R8. Shared navigation, daemon client state, Workspace canvas, Conversation presentation, and Terminal behavior must remain reusable by a later iOS client.
- R9. Signing, notarization, architecture support, updates, source notices, and unresolved window details remain Phase 7 work and do not block the CLI and TUI MVP.

### Acceptance Examples

- AE1. **Covers R1, R2, and R5.** Given an Electron-owned daemon, when the app quits under the default policy, then it stops that process and preserves daemon data.
- AE2. **Covers R5.** Given a daemon started independently by the CLI, when the desktop app quits, then that daemon remains active.
- AE3. **Covers R6.** Given an unavailable selected remote daemon, when the app restarts, then the daemon remains selected and no localhost fallback occurs.
- AE4. **Covers R7.** Given renderer content, when it requests a desktop function, then only a validated preload method can reach the Electron main process.
- AE5. **Covers R8 and R9.** Given a later iOS build, when it uses the shared app, then it connects to remote daemons and never bundles or starts a local daemon.

### Scope Boundaries

**In scope**

- `docs/product/macos.md`, `docs/product/deferred-acceptance.md`, `docs/architecture/macos-client.md`, and this plan.

**Out of scope**

- Source import, app implementation, exact windows and menus, final packaging choices, signing administration, updates, and any change to the CLI/TUI MVP gate.

### Dependencies and Risks

- Issues #53 and #65 through #68 are closed. Their MVP product, protocol, state, and runtime contracts remain authoritative for all shared daemon behavior.
- Issue #53 supplies the licensing policy referenced by future package notices.
- Root `plan/gaps.md` owns unresolved Phase 7 questions until #62 moves the phase directory. This slice must not answer them silently.
- The current working tree contains unrelated pending documentation. The owner must isolate this exact scope.

### Open Questions

- **Blocking:** None.
- **Deferred:** Window geometry, menu and deep-link behavior, detailed Pi controls, graphical recovery, supported package variants, signing, notarization, updates, and iOS scope remain in root `plan/gaps.md` until #62 moves it.

## Planning Contract

### Key Technical Decisions

- KTD1. **Use the pinned Paseo graphical structure.** Select shared Expo and React Native, React Native Web, and Electron instead of SwiftUI. Governs R1-R4.
- KTD2. **Keep one daemon protocol.** The graphical client uses the same copied client and daemon boundary as CLI and TUI clients. Governs R2 and R6.
- KTD3. **Track process ownership.** Electron stops only a managed daemon process that it started. Governs R5 and AE1-AE2.
- KTD4. **Keep desktop authority in Electron main.** Renderer desktop access crosses a narrow typed and validated preload bridge. Governs R7 and AE4.
- KTD5. **Preserve shared-app reuse.** Keep platform-independent presentation in the shared app and platform effects behind adapters. Governs R8 and AE5.
- KTD6. **Keep Phase 7 unresolved choices deferred.** This contract selects architecture, not final presentation or release values. Governs R9.

### Implementation Constraints

- State that implementation is pending after the CLI and TUI MVP.
- Do not import `packages/app`, `packages/desktop`, or audio packages.
- Do not add product requirements for unresolved gaps.
- Keep security denials explicit and testable through public app and IPC boundaries.
- Use ASD-STE100-inspired Simplified Technical English.

### Sequencing

1. Rewrite the deferred product direction and ownership behavior.
2. Rewrite the selected architecture and security boundary.
3. Rewrite deferred public acceptance workflows.
4. Cross-check unresolved gaps and the MVP non-blocking statement.
5. Run link, terminology, security, and owner diff review.

## Implementation Units

### U1. Define deferred product behavior

- **Goal:** Specify stack direction, daemon ownership, registry, canvas, Conversation, Terminal, security, and package boundaries.
- **Requirements:** R1, R4-R9, AE1-AE3, and AE5.
- **Dependencies:** None.
- **Files:** `docs/product/macos.md`.
- **Approach:** Replace native SwiftUI direction with copied graphical behavior. Keep exact presentation and release choices deferred while preserving Pi-only and no-fallback rules.
- **Test scenarios:**
  - **Success:** A managed app can start, use, and stop only its daemon.
  - **Edge:** The keep-running setting can leave an owned daemon active after quit.
  - **Failure:** An unavailable remote selection never redirects to localhost.
  - **Integration:** Canvas resources use shared daemon semantics.
  - **Authorization:** Renderer behavior remains behind the desktop security boundary.
- **Verification:** Trace each product statement to R1 and R4-R9.

### U2. Define deferred desktop architecture

- **Goal:** Specify packages, shared-app boundary, process ownership, transport, renderer security, state authority, build, and test boundaries.
- **Requirements:** R2, R4-R9, AE1-AE5.
- **Dependencies:** U1.
- **Files:** `docs/architecture/macos-client.md`.
- **Approach:** Use the pinned Paseo structure and defer source import. Keep Electron-only effects behind adapters and a narrow preload. Link unresolved presentation detail to the gaps file.
- **Test scenarios:**
  - **Success:** Shared app and Electron main use the existing daemon client and local socket transport.
  - **Edge:** Multiple windows keep presentation state without duplicating daemon authority.
  - **Failure:** Remote web content never receives the BITCH preload API.
  - **Integration:** Package tests cover bundled daemon and CLI compatibility.
  - **Authorization:** IPC validates each request and exposes no arbitrary shell or filesystem API.
- **Verification:** Compare package and security boundaries with pinned Paseo source and R2.

### U3. Define deferred acceptance

- **Goal:** Specify future public checks without making them current MVP gates.
- **Requirements:** R3-R9, AE1-AE5.
- **Dependencies:** U1 and U2.
- **Files:** `docs/product/deferred-acceptance.md`.
- **Approach:** Define stage start, managed daemon, multiple daemons, canvas, Terminal, packaged app, and later iOS workflows. Mark all workflows deferred.
- **Test scenarios:**
  - **Success:** A packaged app uses matching daemon and CLI resources.
  - **Edge:** Removing localhost stops only a desktop-owned daemon and preserves data.
  - **Failure:** Renderer sandbox, signing, notarization, or notice failures deny package acceptance.
  - **Integration:** iOS reuses shared behavior with remote-only daemon access.
  - **Authorization:** Pairing and direct route rules remain unchanged.
- **Verification:** Confirm these workflows do not enter `docs/product/acceptance.md` or the MVP release gate.

## Verification Contract

| Check | Command or manual check | Proves |
|---|---|---|
| Whitespace | `git diff --check` | Changed text has no whitespace error. |
| Scope | `git diff --name-status origin/main -- docs/product/macos.md docs/product/deferred-acceptance.md docs/architecture/macos-client.md docs/plans/2026-08-14-070-docs-deferred-macos-client-contract-plan.md` | The owner sees the complete issue diff. |
| Selected stack | `rg -n 'Expo|React Native Web|Electron' docs/product/macos.md docs/architecture/macos-client.md docs/product/deferred-acceptance.md` | All documents use the selected architecture. |
| Rejected direction | Review every result of `rg -n 'SwiftUI' docs/product/macos.md docs/architecture/macos-client.md docs/product/deferred-acceptance.md` and accept only explicit rejection text. | The former direction is not active. |
| Deferred state | `rg -n 'deferred|after the CLI and TUI MVP|Phase 7' docs/product/macos.md docs/architecture/macos-client.md docs/product/deferred-acceptance.md` | Graphical work does not become an MVP gate. |
| Local links | Run the repository-relative Markdown link scan from issue #70 against the three changed documents. | Every local target resolves at merge time. |
| Gap audit | Compare unresolved choices with `plan/gaps.md` and reject any silent resolution. | This slice does not start Phase 7 design decisions before #62 moves the phase directory. |
| Security audit | Check sandbox, context isolation, Node integration, preload, IPC validation, navigation, and remote-content statements together. | Renderer authority is bounded consistently. |

No behavioral test applies because this slice changes deferred documentation only. No CI exists on `origin/main`. Issue #63 tracks that gap.

## Rollback

Revert the plan and all three deferred documents together. Restore the former direction only as one coherent rollback. No app, process, or user data migration applies.

## Definition of Done

- R1-R9 and AE1-AE5 are represented without contradiction.
- Product, architecture, and acceptance select one shared Expo, React Native Web, and Electron direction.
- Every unresolved Phase 7 choice remains deferred.
- The owner reviews the actual diff and reruns verification after accepted review fixes.
- One focused pull request uses `Closes #70`.
- No CI success is claimed while issue #63 remains open.
