# BITCH Documentation

## Purpose

This directory contains the approved product and technical specification for BITCH. The documents describe required behavior and fixed architecture decisions.

The repository is in planning and pre-alpha status. The planned first release contains the CLI and TUI. The native macOS app is deferred.

A documented requirement is not proof that code implements it. See [`../plan/README.md`](../plan/README.md) for pending implementation work.

## Reading order

Read only the documents needed for the current task:

1. Read [`product/scope.md`](product/scope.md) for the product boundary.
2. Read the applicable behavior document under [`product/`](product/).
3. Read [`architecture/overview.md`](architecture/overview.md) for the system boundary.
4. Read the applicable technical document under [`architecture/`](architecture/).
5. Before changing behavior or tests, read [`testing.md`](testing.md).
6. Read the current phase under [`../plan/`](../plan/).
7. Use [`glossary.md`](glossary.md) for required terms.

## Product specification

- [`product/scope.md`](product/scope.md): goal, scope, non-goals, success criteria, and deferred work.
- [`product/conversations.md`](product/conversations.md): conversation behavior, lifecycle, reconnection, and extension interaction.
- [`product/workspaces.md`](product/workspaces.md): managed workspace and Trash behavior.
- [`product/clients.md`](product/clients.md): shared CLI, TUI, and macOS client behavior.
- [`product/macos.md`](product/macos.md): deferred native registry and one-active-gateway navigation.
- [`product/acceptance.md`](product/acceptance.md): first-release acceptance workflows.
- [`product/deferred-acceptance.md`](product/deferred-acceptance.md): deferred Gateway Hub and native registry workflows.

## Technical specification

- [`architecture/overview.md`](architecture/overview.md): copied package boundary, component responsibilities, and version policy.
- [`architecture/protocol.md`](architecture/protocol.md): WebSocket messages, timeline synchronization, binary Terminal frames, and relay transport.
- [`architecture/cli.md`](architecture/cli.md): retained CLI commands and the BITCH TUI Workspace canvas.
- [`architecture/pi-capabilities.md`](architecture/pi-capabilities.md): pinned Pi command, CLI, TUI, persistence, and reconnection mapping.
- [`architecture/macos-client.md`](architecture/macos-client.md): deferred native registry sharing and connection coordination.
- [`architecture/storage.md`](architecture/storage.md): Pi JSONL, managed metadata, identifiers, locks, and paths.
- [`architecture/local-runtime.md`](architecture/local-runtime.md): Docker driver, local lifecycle, locks, and recovery.
- [`architecture/recovery.md`](architecture/recovery.md): crash, corruption, operation, and migration recovery.
- [`operations.md`](operations.md): Directory mode, gateways, containers, configuration, networking, health, and logging.
- [`testing.md`](testing.md): required behavioral test strategy and CI gates.

## Planning documents

The [`../plan/`](../plan/) directory contains pending work and unresolved questions. Do not put completed implementation details there.

Follow [`../AGENTS.md`](../AGENTS.md) when a plan item is implemented.
