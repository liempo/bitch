# BITCH Documentation

## Purpose

This directory contains the approved product and technical specification for BITCH.

The repository is in planning and pre-alpha status. The MVP copies Paseo's daemon behavior, limits agent execution to Pi, and delivers CLI and TUI clients. Graphical clients are deferred.

A documented requirement is not proof that code implements it. See [`../plan/README.md`](../plan/README.md) for the program and phase sequence.

## Normative references

- Paseo source with package version 0.3.1 at upstream commit [`163e7d1`](https://github.com/getpaseo/paseo/tree/163e7d1cc421cdfe4de67b971ff6cea4b51eb0ed) defines the initial daemon baseline. This pin is 30 commits after the `v0.3.1` tag.
- `@earendil-works/pi-coding-agent` 0.83.0 defines native Pi RPC and extension behavior.
- BITCH documents define intentional differences, including Pi-only agent support and the TUI client.

When a BITCH document does not define a difference, copy the pinned Paseo behavior instead of inventing new behavior.

## Reading order

Before a change:

1. Read [`product/scope.md`](product/scope.md).
2. Read the applicable product document.
3. Read [`architecture/overview.md`](architecture/overview.md).
4. Read the applicable architecture or operations document.
5. Read [`testing.md`](testing.md) for behavior changes.
6. Read the active phase under [`../plan/`](../plan/).
7. Read the selected delivery issue and its GitHub Project item.
8. Use [`glossary.md`](glossary.md) for required terms.

## Product specification

- [`product/scope.md`](product/scope.md): MVP boundary, Pi-only rule, Paseo baseline, and deferred improvements.
- [`product/conversations.md`](product/conversations.md): Conversation authority, lifecycle, timeline, Pi controls, and extensions.
- [`product/workspaces.md`](product/workspaces.md): Project and Workspace identity, path selection, archive, and recovery.
- [`product/clients.md`](product/clients.md): daemon registry, CLI, TUI canvas, Terminal presentation, and remote access.
- [`product/acceptance.md`](product/acceptance.md): public MVP acceptance workflows.
- [`product/macos.md`](product/macos.md): deferred graphical macOS product stage.
- [`product/deferred-acceptance.md`](product/deferred-acceptance.md): deferred graphical-client acceptance.

## Technical specification

- [`architecture/overview.md`](architecture/overview.md): copied package boundary and component responsibilities.
- [`architecture/licensing.md`](architecture/licensing.md): conservative AGPL policy, attribution, and source inventory.
- [`architecture/protocol.md`](architecture/protocol.md): WebSocket, timeline synchronization, binary Terminal frames, and relay transport.
- [`architecture/cli.md`](architecture/cli.md): retained CLI families and BITCH TUI architecture.
- [`architecture/pi-capabilities.md`](architecture/pi-capabilities.md): Paseo-exposed Pi capability matrix.
- [`architecture/storage.md`](architecture/storage.md): daemon stores, normalized timeline, Pi state, Projects, Workspaces, and Terminals.
- [`architecture/local-runtime.md`](architecture/local-runtime.md): host-native daemon lifecycle.
- [`architecture/recovery.md`](architecture/recovery.md): reconnect, crash, process, timeline, and Workspace recovery.
- [`architecture/macos-client.md`](architecture/macos-client.md): deferred desktop architecture.
- [`operations.md`](operations.md): startup, remote connectivity, security, backup, restore, and MVP release gate.
- [`testing.md`](testing.md): required behavioral test strategy.

## Planning documents

The [`../plan/`](../plan/) directory contains program and phase plans. These plans define sequence and pending outcomes. They do not authorize implementation or record progress.

Follow [`../AGENTS.md`](../AGENTS.md) for the repository delivery workflow.
