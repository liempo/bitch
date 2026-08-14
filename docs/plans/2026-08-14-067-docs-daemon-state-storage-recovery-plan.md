---
title: Daemon State, Storage, and Recovery Contracts - Plan
type: docs
date: 2026-08-14
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: github-issue-67
execution: code
---

# Daemon State, Storage, and Recovery Contracts - Plan

## Goal Capsule

- **Objective:** Replace former Gateway storage and recovery rules with the approved Paseo daemon authority, identity, persistence, runtime, and recovery contracts.
- **Authority:** Issue #67, parent issue #64, issues #65 and #66, and the pinned Paseo store and recovery behavior.
- **Stop conditions:** Stop if a durability, identity, write, archive, recovery, or permission claim cannot be traced to approved behavior.
- **Tail ownership:** One delivery owner controls writes, reviews all three files as one authority model, runs verification, applies fixes, and creates the canonical commit.

## Product Contract

### Summary

BITCH needs one precise answer for where daemon, Pi, client, Project, Workspace, Conversation, timeline, and Terminal state lives and how each state recovers.

### Requirements

- R1. `docs/architecture/storage.md` must define daemon home, stable identity, Conversation records, runtime timeline, client state, Pi state, import, Projects, Workspaces, Terminals, archive, writes, and permissions.
- R2. `docs/architecture/recovery.md` must define client reconnect, Pi failure, daemon failure, timeline repair, invalid stores, PID recovery, Workspace recovery, route recovery, relay recovery, and localhost removal.
- R3. `docs/glossary.md` must define one required term for every product, host, resource, Conversation, Terminal, Pi, protocol, storage, and deferred-client concept.
- R4. One daemon home owns one stable daemon ID and cannot have two live owners.
- R5. Conversation records and native Pi handles are durable. Normalized timeline rows, Pi subprocesses, PTYs, Terminal snapshots, and scrollback are runtime-only.
- R6. The loaded normalized timeline is authoritative for clients. Pi JSONL remains native durable Pi authority and post-restart reconstruction input.
- R7. Project identity uses exact lexical roots. Workspace IDs are opaque, and multiple Workspaces can use one `cwd`.
- R8. Local archive preserves ordinary directories. Managed-worktree removal occurs only after the final active Workspace reference is archived.
- R9. Invalid store loads must not authorize later writes from an empty or partial in-memory view.
- R10. No route, `projectKey`, cache, path spelling, or fallback can merge authority across daemon IDs.

### Acceptance Examples

- AE1. **Covers R4-R6.** Given daemon restart, when a Conversation is opened, then durable records reload and a new runtime timeline is reconstructed from its exact Pi handle.
- AE2. **Covers R7.** Given two active Workspaces with the same `cwd`, when resources are created, then each Workspace keeps separate Conversations, Terminals, and layout keys.
- AE3. **Covers R8.** Given two active records for one managed worktree, when the first is archived, then the worktree remains until the final active reference is archived.
- AE4. **Covers R2 and R9.** Given an invalid Project or Workspace registry, when the daemon exposes an empty view, then operators stop mutations until repair or restore.
- AE5. **Covers R10.** Given equal `projectKey` values on two daemons, when a client changes routes, then no Project or Workspace identity merges.

### Scope Boundaries

**In scope**

- `docs/architecture/storage.md`, `docs/architecture/recovery.md`, `docs/glossary.md`, and this plan.

**Out of scope**

- Exact CLI procedures, implementation code, a new database, durable timeline, Trash, command receipts, migration journals, or cross-daemon replication.

### Dependencies and Risks

- Issues #65 and #66 are closed. They own the resources and protocol whose state is defined here.
- Pinned Paseo stores can skip invalid records or expose empty registries. The operator mutation stop must remain explicit.
- The current working tree contains unrelated pending documentation. The owner must isolate this exact scope.

### Open Questions

- **Blocking:** None.
- **Deferred:** Stronger transactions or durable timeline storage require a later approved behavior change if implementation evidence needs them.

## Planning Contract

### Key Technical Decisions

- KTD1. **Keep the pinned file-store model.** Do not invent a database or cross-store transaction before characterization proves a need. Governs R1, R5, and R9.
- KTD2. **Use the two-layer authority split.** Loaded timeline state repairs clients. Pi JSONL supports native persistence and reconstruction. Governs R5 and R6.
- KTD3. **Keep IDs opaque and daemon-local.** Paths and cross-host grouping keys never replace Project, Workspace, or daemon identity. Governs R4, R7, and R10.
- KTD4. **Keep Terminals runtime-only.** Screen restore applies only while the daemon still owns the PTY. Governs R5 and AE1.
- KTD5. **Preserve user-owned files.** Local archive never recursively removes ordinary directories, while managed worktrees follow final-reference ownership. Governs R8 and AE3.
- KTD6. **Use one glossary term per concept.** Former Gateway, Directory, Agent Server, and fallback terms remain only in the terms-to-avoid section. Governs R3.

### Implementation Constraints

- Keep the initial `PASEO_HOME`, `~/.paseo`, `agents/`, and `paseo.pid` compatibility boundary explicit until a tested branding migration.
- Do not promise recovery of runtime-only state.
- Do not expose daemon-private Pi paths as portable client paths.
- State sensitive state and daemon-user host authority explicitly.
- Use ASD-STE100-inspired Simplified Technical English.

### Sequencing

1. Define storage roots, authorities, identities, and lifecycle.
2. Define failure and recovery behavior against that storage model.
3. Replace glossary terms and cross-check every use.
4. Run link, terminology, invariant, and owner diff review.

## Implementation Units

### U1. Define storage and authority

- **Goal:** Specify every durable, runtime-only, Pi-owned, daemon-owned, and client-owned value.
- **Requirements:** R1, R4-R10, AE1-AE3, and AE5.
- **Dependencies:** None.
- **Files:** `docs/architecture/storage.md`.
- **Approach:** Replace Gateway layouts with the retained daemon stores. Define the initial and branded homes, Conversation records, timeline reconstruction, Pi discovery, Project and Workspace records, exact-path behavior, Terminal state, archive, writes, and permissions.
- **Test scenarios:**
  - **Success:** Durable records and Pi handles support a later resume.
  - **Edge:** Explicit Workspace creation at an existing `cwd` still mints a new ID.
  - **Failure:** Daemon restart cannot recreate a prior Terminal.
  - **Integration:** Client cache keys include daemon and Workspace identity without becoming authority.
  - **Authorization:** Secret keys, hashes, Pi handles, and host paths remain daemon-private.
- **Verification:** Trace every state item to one owner and lifecycle, then run the Verification Contract.

### U2. Define recovery behavior

- **Goal:** Specify repair after disconnect, process failure, invalid stores, route loss, and Workspace loss.
- **Requirements:** R2, R4-R10, AE1, AE3-AE5.
- **Dependencies:** U1.
- **Files:** `docs/architecture/recovery.md`.
- **Approach:** Use snapshots and authoritative reads for same-process reconnect, Pi JSONL reconstruction after daemon restart, safe PID evidence, operator mutation stop, placement metadata, and same-daemon route recovery.
- **Test scenarios:**
  - **Success:** Reconnect to one live daemon repairs timeline gaps without duplication.
  - **Edge:** A desktop-managed live PID can use only the copied unreachable and stale-heartbeat exception.
  - **Failure:** An interrupted prompt is never replayed automatically.
  - **Integration:** Relay key rotation preserves daemon identity while requiring explicit re-pairing.
  - **Authorization:** A route can recover only to the same daemon ID.
- **Verification:** Compare every failure with the resulting durable and runtime state.

### U3. Replace required terminology

- **Goal:** Make the glossary the consistent vocabulary for the revised specification.
- **Requirements:** R3-R7, R10.
- **Dependencies:** U1 and U2.
- **Files:** `docs/glossary.md`.
- **Approach:** Replace former mode, Gateway, HTTP/SSE, and SDK-host terms with daemon, route, registry, Workspace, normalized timeline, Pi RPC subprocess, and runtime-only definitions.
- **Test scenarios:**
  - **Success:** Every normative document can link one term for one concept.
  - **Edge:** Pi model provider remains distinct from BITCH agent runtime.
  - **Failure:** Terms-to-avoid do not create active requirements.
  - **Integration:** Product and architecture capitalization remains consistent.
  - **Authorization:** Pairing offers are explicitly treated as credentials.
- **Verification:** Review all terms and run the terminology scan.

## Verification Contract

| Check | Command or manual check | Proves |
|---|---|---|
| Whitespace | `git diff --check` | Changed text has no whitespace error. |
| Scope | `git diff --name-status origin/main -- docs/architecture/storage.md docs/architecture/recovery.md docs/glossary.md docs/plans/2026-08-14-067-docs-daemon-state-storage-recovery-plan.md` | The owner sees the complete issue diff. |
| Required terms | `rg -n '^### (daemon|daemon ID|Project|Workspace|Conversation|normalized timeline|Pi session|Pi RPC subprocess|Terminal|daemon protocol|client replica|runtime-only|authoritative)$' docs/glossary.md` | Core concepts have explicit definitions. |
| Former terms | Review every result of `rg -n 'Directory mode|Gateway mode|Agent Server|master gateway|fallback daemon' docs/architecture/storage.md docs/architecture/recovery.md docs/glossary.md` and accept only historical or terms-to-avoid text. | Superseded concepts are not normative. |
| Local links | Run the repository-relative Markdown link scan from issue #67 against the three changed documents. | Every local target resolves at merge time. |
| Authority audit | For each noun in R4-R10, identify its owner, durability, identity key, and recovery path in the diff. | No state has conflicting authority. |

No behavioral test applies because this slice changes approved documentation only. No CI exists on `origin/main`. Issue #63 tracks that gap.

## Rollback

Revert the plan and all three documents together. Do not leave glossary terms that disagree with storage or recovery authority. No runtime or data migration applies.

## Definition of Done

- R1-R10 and AE1-AE5 are represented without contradiction.
- Every state has one owner and documented lifecycle.
- Recovery does not promise persistence absent from the pinned baseline.
- The owner reviews the actual diff and reruns verification after accepted review fixes.
- One focused pull request uses `Closes #67`.
- No CI success is claimed while issue #63 remains open.
