---
title: CLI, TUI, and Daemon Operations Contracts - Plan
type: docs
date: 2026-08-14
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: github-issue-68
execution: code
---

# CLI, TUI, and Daemon Operations Contracts - Plan

## Goal Capsule

- **Objective:** Replace former Gateway runtime and TUI Hub rules with the retained CLI, BITCH TUI, host-native daemon, remote-security, and operations contract.
- **Authority:** Issue #68, parent issue #64, issues #65-#67, and pinned Paseo CLI, server lifecycle, client, Terminal, and relay behavior.
- **Stop conditions:** Stop if a command, lifecycle transition, limit, security instruction, or backup claim lacks approved product or source evidence.
- **Tail ownership:** One delivery owner controls writes, reviews the removal and three replacements, runs verification, applies fixes, and creates the canonical commit.

## Product Contract

### Summary

A user and operator need one executable description of daemon targeting, CLI and TUI interaction, process lifecycle, remote access, backup, restore, logs, and failures.

### Requirements

- R1. `docs/architecture/cli.md` must define global daemon targeting, onboarding, daemon registry, retained command families, output, interruption, and TUI architecture.
- R2. `docs/architecture/local-runtime.md` must define host-native startup, PID ownership, status, stop, restart, managed graphical ownership, local registration, listen targets, logs, and failure behavior.
- R3. `docs/operations.md` must define prerequisites, effective home, startup, shutdown, local and remote routes, relay pairing, Pi administration, Workspace and Terminal operations, backup, restore, logging, failure response, and the MVP release gate.
- R4. Remove `docs/architecture/tui-gateway.md` and every normative link to its former Gateway Hub.
- R5. `bitch onboard` and explicit daemon commands can start the local daemon. Ordinary commands only connect and report startup guidance.
- R6. One action targets one selected daemon. A failed route does not select or execute on another daemon ID.
- R7. The BITCH TUI must use the copied client and `@earendil-works/pi-tui` 0.83.0 without running Pi `InteractiveMode` or loading extension modules.
- R8. Terminal panels must use copied binary subscription, snapshot, input, and size-claim behavior. Closing a panel does not kill the Terminal.
- R9. Direct remote guidance must distinguish access authentication from encryption. Relay use must remain explicit and paired.
- R10. Backup and restore must cover daemon, client, Pi, and project state without claiming runtime-only continuity.

### Acceptance Examples

- AE1. **Covers R2 and R5.** Given no running daemon, when `bitch onboard` completes, then one detached daemon remains active, while an ordinary command would only have reported connection guidance.
- AE2. **Covers R1, R6, and R7.** Given a saved remote selection, when the TUI opens, then it targets only that daemon and presents its Workspace canvas through the copied client.
- AE3. **Covers R7 and R8.** Given a live Terminal, when a focused panel subscribes, then it restores a snapshot, receives live output, sends input, and claims size through binary frames.
- AE4. **Covers R2, R5, and R10.** Given daemon restart, when clients reconnect, then durable records remain, interrupted work is not replayed, and old Terminals are absent.
- AE5. **Covers R9.** Given direct access on an untrusted network without TLS or VPN, when an operator reviews the guide, then the configuration is explicitly denied even if password authentication is enabled.

### Scope Boundaries

**In scope**

- `docs/architecture/cli.md`, `docs/architecture/local-runtime.md`, `docs/operations.md`, removal of `docs/architecture/tui-gateway.md`, and this plan.
- Stale-link-only updates in `README.md`, `docs/README.md`, and `plan/README.md`.

**Out of scope**

- CLI, TUI, server, or relay code, graphical-client implementation, Docker, service installation, automatic failover, Terminal persistence, packaging, and CI.

### Dependencies and Risks

- Issues #65 through #67 are closed. They own the product, protocol, and state boundaries used here.
- Operations commands and values are source-sensitive and need pinned Paseo characterization.
- The current working tree contains unrelated pending changes. The owner must isolate this exact scope.

### Open Questions

- **Blocking:** None.
- **Deferred:** Broad platform support, service installation, graphical lifecycle controls, and public packaging remain deferred.

## Planning Contract

### Key Technical Decisions

- KTD1. **Use explicit startup.** Onboarding and daemon lifecycle commands start processes. Ordinary resource commands never start an absent daemon. Governs R1, R2, and R5.
- KTD2. **Target one daemon ID.** Registry selection and explicit route overrides cannot redirect work across daemon IDs. Governs R1 and R6.
- KTD3. **Build a client TUI, not a Pi TUI.** Use Pi's component package for rendering while all agent behavior stays in daemon-owned RPC processes. Governs R7.
- KTD4. **Keep PTYs daemon-owned.** Panels attach, restore, write, and claim geometry without owning process lifecycle. Governs R8.
- KTD5. **Retain host-native Paseo lifecycle.** Use copied PID, RPC shutdown, signal fallback, bounded wait, and worker shutdown behavior. Governs R2 and AE4.
- KTD6. **State remote trust precisely.** Direct password authentication is access control. VPN or TLS supplies confidentiality. Relay supplies copied paired encryption. Governs R9 and AE5.
- KTD7. **Back up each authority.** Stop the daemon and preserve daemon home, client state, Pi state, and project sources according to their owners. Governs R10.

### Implementation Constraints

- Verify command names and copied defaults before publication.
- Preserve `127.0.0.1:6767`, the 10-second graceful ceiling, PID heartbeat values, permissions, and environment-variable precedence only when source supports them.
- Do not put secrets in command examples, logs, URIs, or tracked fixtures.
- Keep strict warnings before destructive or security-sensitive procedures.
- Use ASD-STE100-inspired Simplified Technical English.

### Sequencing

1. Define CLI targeting, commands, and the TUI client boundary.
2. Define daemon process lifecycle and local registration.
3. Define operational procedures and security guidance.
4. Remove the obsolete TUI Gateway Hub document and stale links.
5. Run source-value, link, safety, and owner diff review.

## Implementation Units

### U1. Define CLI and TUI architecture

- **Goal:** Specify retained commands, target selection, output, interruption, TUI panels, and Terminal flow.
- **Requirements:** R1, R5-R8, AE1-AE3.
- **Dependencies:** None.
- **Files:** `docs/architecture/cli.md`, remove `docs/architecture/tui-gateway.md`, and update stale links in `README.md`, `docs/README.md`, and `plan/README.md`.
- **Approach:** Adapt copied command families to user-facing Conversation terms and Pi-only discovery. Add only the smallest BITCH daemon-registry surface. Define the TUI as a copied-client Workspace canvas.
- **Test scenarios:**
  - **Success:** One explicit selected daemon receives retained commands.
  - **Edge:** `Ctrl-C` detaches where copied behavior does not define stop.
  - **Failure:** No missing daemon, failed route, or ambient Workspace changes daemon selection.
  - **Integration:** TUI Conversation and Terminal panels share one Workspace and daemon connection.
  - **Authorization:** Pending Pi questions resolve through daemon permissions, not extension code in the client.
- **Verification:** Compare commands and panel gestures with product and pinned source contracts.

### U2. Define local daemon runtime

- **Goal:** Specify process ownership, startup, status, shutdown, restart, local registration, listen targets, and logs.
- **Requirements:** R2, R5, R6, R10, AE1, and AE4.
- **Dependencies:** U1.
- **Files:** `docs/architecture/local-runtime.md`.
- **Approach:** Use the copied detached and foreground launch split, heartbeat PID evidence, lifecycle RPC, signal fallback, shutdown order, and managed graphical ownership exception.
- **Test scenarios:**
  - **Success:** Detached startup survives CLI exit and status combines process and live evidence.
  - **Edge:** Removing localhost does not stop an independently started daemon.
  - **Failure:** An ordinary live PID lock is never reclaimed only due to age.
  - **Integration:** Restart preserves durable identity and records but loses runtime-only state.
  - **Authorization:** Logs omit credentials, full prompts, and authorization headers.
- **Verification:** Check values and ordering against pinned server and CLI source.

### U3. Define operator procedures

- **Goal:** Specify safe local, direct, relay, Pi, Workspace, Terminal, backup, restore, logging, and failure procedures.
- **Requirements:** R3, R5-R10, AE4, and AE5.
- **Dependencies:** U1 and U2.
- **Files:** `docs/operations.md`.
- **Approach:** Put prerequisites before actions and warnings before unsafe network or destructive operations. Distinguish each state owner in backup and restore. End with the approved MVP release gate.
- **Test scenarios:**
  - **Success:** A stopped-home backup plus Pi, client, and project state can restore one daemon identity.
  - **Edge:** Relay key rotation preserves `server-id` and requires all clients to pair again.
  - **Failure:** Two restored copies never run concurrently with one daemon identity.
  - **Integration:** Failure guidance matches recovery authority and runtime persistence.
  - **Authorization:** Passwordless public binding and secret-bearing command URIs are explicitly denied.
- **Verification:** Run safety-language and exact-value review in the Verification Contract.

## Verification Contract

| Check | Command or manual check | Proves |
|---|---|---|
| Whitespace | `git diff --check` | Changed text has no whitespace error. |
| Obsolete TUI Hub | `test ! -e docs/architecture/tui-gateway.md` | The former Gateway Hub authority is removed. |
| Scope | `git diff --name-status origin/main -- README.md docs/README.md plan/README.md docs/architecture/cli.md docs/architecture/local-runtime.md docs/architecture/tui-gateway.md docs/operations.md docs/plans/2026-08-14-068-docs-cli-tui-daemon-operations-plan.md` | The owner sees the complete issue diff, including stale-link removal. |
| Exact values | `rg -n '127\.0\.0\.1:6767|10-second|five minutes|30 seconds|PI_COMMAND|PI_ACP_PI_COMMAND|PI_CODING_AGENT_DIR' docs/architecture/cli.md docs/architecture/local-runtime.md docs/operations.md` | Source-sensitive operational values remain visible for review. |
| Former terms | Review every result of `rg -n 'Gateway|Directory mode|Agent Server' docs/architecture/cli.md docs/architecture/local-runtime.md docs/operations.md` and accept only historical or compatibility text. | Former components are not active architecture. |
| Local links | Run the repository-relative Markdown link scan from issue #68 against the changed documents. | Every local target resolves at merge time. |
| Safety review | Manually verify each network, secret, process-stop, backup, restore, and file-removal warning before its action. | Procedures do not hide unsafe effects. |
| Source review | Compare commands, defaults, lifecycle ordering, PID rules, and logger behavior with pinned Paseo source. | Operational claims are characterized rather than invented. |

No behavioral test applies because this slice changes approved documentation only. No CI exists on `origin/main`. Issue #63 tracks that gap.

## Rollback

Revert the plan and three replacement documents, then restore `docs/architecture/tui-gateway.md` in the same reversal. No process or data migration applies.

## Definition of Done

- R1-R10 and AE1-AE5 are represented without contradiction.
- CLI, TUI, runtime, and operations agree on selection, ownership, shutdown, and recovery.
- Every security-sensitive procedure includes its denied configuration or failure boundary.
- The owner reviews the actual diff and reruns verification after accepted review fixes.
- One focused pull request uses `Closes #68`.
- No CI success is claimed while issue #63 remains open.
