---
title: Daemon Protocol and Pi Adapter Contract - Plan
type: docs
date: 2026-08-14
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: github-issue-66
execution: code
---

# Daemon Protocol and Pi Adapter Contract - Plan

## Goal Capsule

- **Objective:** Replace the former HTTP/SSE Agent Server contract with the pinned Paseo WebSocket daemon and external Pi 0.83.0 adapter contract.
- **Authority:** Issue #66, parent issue #64, issue #65, pinned Paseo commit `163e7d1cc421cdfe4de67b971ff6cea4b51eb0ed`, and Pi 0.83.0 RPC behavior.
- **Stop conditions:** Stop if source evidence conflicts with a documented wire value, Pi event, security claim, package boundary, or approved product rule.
- **Tail ownership:** One delivery owner controls writes, validates every source-sensitive claim, reviews the removal and replacements, reruns checks, and creates the canonical commit.

## Product Contract

### Summary

BITCH needs one technical boundary for clients, the daemon, retained Paseo packages, and Pi. The former HTTP/SSE and embedded-SDK design must no longer remain normative.

### Requirements

- R1. `docs/architecture/overview.md` must define the copied package boundary, component responsibilities, authority split, pruning rule, and exact version pins.
- R2. `docs/architecture/protocol.md` must define hello, JSON session messages, request correlation, authoritative timeline synchronization, binary Terminal frames, liveness, backpressure, direct security, relay security, and compatibility.
- R3. `docs/architecture/pi-capabilities.md` must define the external `pi --mode rpc` process, retained capability matrix, resource discovery, dialog mapping, failures, and version-change gate.
- R4. Remove `docs/architecture/api.md` and every normative link to its former REST, OpenAPI, Problem Details, and SSE contract.
- R5. The Pi 0.83.0 contract must cover strict LF framing, one optional record-final carriage return, cumulative updates, retry settlement, no-agent commands, and failed or aborted compaction.
- R6. Unknown or malformed Pi events must be contained to one Conversation without crashing another Conversation or the daemon.
- R7. The daemon protocol must preserve copied direct and authenticated encrypted-relay behavior without claiming that password authentication encrypts direct traffic.
- R8. Public discovery, creation, and resume must expose only Pi. Pi RPC types remain inside the daemon adapter.
- R9. The initial source boundary must retain coherent `protocol`, `relay`, `highlight`, `client`, `server`, and `cli` packages while deferring graphical packages.

### Acceptance Examples

- AE1. **Covers R1-R3.** Given one daemon route, when a client connects and opens a Conversation, then hello, snapshots, authoritative timeline reads, and live events use one copied WebSocket boundary.
- AE2. **Covers R2 and R5.** Given a live assistant prefix and a projected full message, when reconciliation runs, then text appears once with complete source coverage.
- AE3. **Covers R3, R5, and R6.** Given a retryable `agent_end`, when Pi continues and later emits `agent_settled`, then the accepted turn stays running until final settlement.
- AE4. **Covers R2 and R7.** Given a relay pairing offer, when peers establish the route, then the client authenticates the daemon key and the relay handles ciphertext rather than application plaintext.
- AE5. **Covers R4 and R8.** Given a former HTTP/SSE or non-Pi request, when a public client tries to use it, then no normative contract authorizes that surface.

### Scope Boundaries

**In scope**

- `docs/architecture/overview.md`, `docs/architecture/protocol.md`, `docs/architecture/pi-capabilities.md`, removal of `docs/architecture/api.md`, and this plan.
- Stale-link-only updates in `README.md`, `docs/README.md`, `docs/testing.md`, `docs/architecture/storage.md`, `plan/03-pi-capabilities.md`, and `plan/05-gateway-workspaces.md`.

**Out of scope**

- Store detail, operator procedures, CLI design, source import, protocol code, Pi adapter code, and new BITCH protocol features.

### Dependencies and Risks

- Issues #53 and #65 are closed. They supply the licensing target and user-visible product model.
- Pinned Paseo source is newer than the Pi 0.83.0 package. Adapter compatibility claims need both sources.
- The current working tree includes other pending documentation. The owner must isolate this exact scope.

### Open Questions

- **Blocking:** None.
- **Deferred:** A later tested minimal protocol extension can represent failed compaction only if existing terminal items cannot do so.

## Planning Contract

### Key Technical Decisions

- KTD1. **Copy the Paseo WebSocket boundary.** Do not preserve the former BITCH HTTP/SSE API. Governs R1, R2, and R4.
- KTD2. **Keep Pi process-backed.** Launch the installed Pi executable in RPC mode and keep all Pi RPC types inside the adapter. Governs R3 and R8.
- KTD3. **Use two timeline delivery paths.** Live events provide immediacy. Authoritative pages establish and repair canonical history. Governs R2 and AE2.
- KTD4. **Settle at the Pi 0.83.0 boundary.** Cumulative updates are snapshots, `agent_end` can be nonterminal, and `agent_settled` ends an agent run. Governs R5 and AE3.
- KTD5. **Preserve copied security semantics.** Direct password authentication is access control. Relay traffic uses the copied authenticated encryption and paired daemon key. Governs R7 and AE4.
- KTD6. **Import coherently before pruning.** Disable excluded features publicly before removing dormant provider and higher-level source. Governs R8 and R9.

### Implementation Constraints

- Verify exact numbers, opcodes, algorithms, environment variables, and Pi events against pinned source.
- Do not expose Pi native paths or credential values to clients.
- Do not invent protocol stability guarantees for the personal MVP.
- Keep user-facing Conversation terminology while allowing copied internal `agent` identifiers.
- Use ASD-STE100-inspired Simplified Technical English.

### Sequencing

1. Rewrite the system and package boundary.
2. Replace the wire and synchronization contract.
3. Replace the Pi capability and compatibility contract.
4. Remove the obsolete API document and stale links.
5. Run source, link, terminology, and owner diff review.

## Implementation Units

### U1. Define system and source boundaries

- **Goal:** Specify components, ownership, package import, pruning, dependencies, and pins.
- **Requirements:** R1, R8, R9, AE1, and AE5.
- **Dependencies:** None.
- **Files:** `docs/architecture/overview.md`.
- **Approach:** Replace old modes with the daemon diagram and authority model. State retained packages, deferred packages, public Pi-only pruning, and version policy.
- **Test scenarios:**
  - **Success:** Every MVP client reaches one selected daemon through the copied client package.
  - **Edge:** Dormant non-Pi code can remain only behind a denied public boundary during safe pruning.
  - **Failure:** No second Conversation engine or SDK host is authorized.
  - **Integration:** Package dependencies flow from protocol and client boundaries without leaking server or Pi types to the TUI.
  - **Authorization:** No route or `projectKey` changes daemon identity.
- **Verification:** Compare package and pin claims with the pinned tree and run the Verification Contract.

### U2. Define the daemon wire contract

- **Goal:** Specify connection, JSON and binary classes, timeline synchronization, liveness, limits, and route security.
- **Requirements:** R2, R4, R7, AE1, AE2, AE4, and AE5.
- **Dependencies:** U1.
- **Files:** `docs/architecture/protocol.md`, remove `docs/architecture/api.md`, and update stale links in `README.md`, `docs/README.md`, `docs/testing.md`, `docs/architecture/storage.md`, `plan/03-pi-capabilities.md`, and `plan/05-gateway-workspaces.md`.
- **Approach:** Replace REST/SSE authority with copied WebSocket messages and codecs. Define canonical versus live lanes and copied Terminal snapshot behavior. Remove every normative API link.
- **Test scenarios:**
  - **Success:** Tail fetch plus live events creates one canonical Conversation view.
  - **Edge:** Same-tail reads are no-ops and a size claim can transfer at unchanged geometry.
  - **Failure:** A 64 MiB outbound high-water breach closes only that physical socket.
  - **Integration:** Relay transports both JSON and binary application frames.
  - **Authorization:** Direct and relay failures disclose no credentials or plaintext secrets.
- **Verification:** Verify opcodes, 45-second lease, 10-second check, 64 MiB high-water mark, and copied Terminal thresholds against source.

### U3. Define the Pi adapter contract

- **Goal:** Specify retained capabilities, exact Pi 0.83.0 differences, extension discovery, dialogs, and process failure.
- **Requirements:** R3, R5, R6, R8, AE3, and AE5.
- **Dependencies:** U1 and U2.
- **Files:** `docs/architecture/pi-capabilities.md`.
- **Approach:** Separate Pi ownership from adapter mapping. Document supported and deferred capabilities, launch flags, framing, settlement, compaction, import, resume, rewind, and extension UI.
- **Test scenarios:**
  - **Success:** Text, tools, models, thinking, commands, import, resume, and questions map through RPC.
  - **Edge:** A handled local extension command with no agent run completes without settlement.
  - **Failure:** Unknown events and malformed records stay within one Conversation.
  - **Integration:** The generated integration extension supplies stable entry capture and tree navigation.
  - **Authorization:** Pi authentication and extensions remain daemon-user resources outside BITCH credential transport.
- **Verification:** Compare every launch flag and event claim with Pi 0.83.0 documentation and executable behavior recorded in the approved revision.

## Verification Contract

| Check | Command or manual check | Proves |
|---|---|---|
| Whitespace | `git diff --check` | Changed text has no whitespace error. |
| Obsolete API | `test ! -e docs/architecture/api.md` | The former HTTP/SSE authority is removed. |
| Scope | `git diff --name-status origin/main -- README.md docs/README.md docs/testing.md docs/architecture/overview.md docs/architecture/protocol.md docs/architecture/pi-capabilities.md docs/architecture/storage.md docs/architecture/api.md plan/03-pi-capabilities.md plan/05-gateway-workspaces.md docs/plans/2026-08-14-066-docs-daemon-protocol-pi-contract-plan.md` | The owner sees the complete issue diff, including stale-link removal. |
| Pins | `rg -n '163e7d1cc421cdfe4de67b971ff6cea4b51eb0ed|0\.83\.0|24\.19\.0' docs/architecture/overview.md docs/architecture/pi-capabilities.md` | Exact source and runtime pins remain visible. |
| Removed transport | Review every result of `rg -n 'HTTP|OpenAPI|Problem Details|SSE|Agent Server' docs/architecture/overview.md docs/architecture/protocol.md docs/architecture/pi-capabilities.md` and accept only explicit removal or comparison text. | The old transport is not normative. |
| Local links | Run the repository-relative Markdown link scan from issue #66 against the changed documents. | Every local target resolves at merge time. |
| Source review | Compare limits, opcodes, cryptography, Pi events, and launch flags with the pinned Paseo and Pi sources. | Source-sensitive claims are characterized rather than invented. |

No behavioral test applies because this slice changes approved documentation only. No CI exists on `origin/main`. Issue #63 tracks that gap.

## Rollback

Revert the plan and three replacement documents, then restore `docs/architecture/api.md` in the same reversal. No runtime or data migration applies.

## Definition of Done

- R1-R9 and AE1-AE5 are represented without contradiction.
- No normative link points to the removed API document.
- Source-sensitive values match the pinned Paseo and Pi contracts.
- The owner reviews the actual diff and reruns verification after accepted review fixes.
- One focused pull request uses `Closes #66`.
- No CI success is claimed while issue #63 remains open.
