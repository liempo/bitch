# Implementation Plan

## Purpose

This directory contains pending implementation work. Approved product and technical decisions are in [`../docs/`](../docs/).

The repository has no product code yet. Start with Phase 1.

## Working rule

Plan files contain incomplete work only. Follow [`../AGENTS.md`](../AGENTS.md) when a task is complete:

1. Test the implemented behavior.
2. Update its authoritative document under `docs/`.
3. Remove the task from the phase file.

Do not mark completed tasks with `[x]`. Git history records completion.

## First-release phase order

1. [`01-contracts.md`](01-contracts.md): complete Pi-derived transport details and materialize exact protocol, CLI, and provider fixtures.
2. [`02-core-vertical-slice.md`](02-core-vertical-slice.md): run one complete gateway conversation through the built CLI.
3. [`03-pi-capabilities.md`](03-pi-capabilities.md): cover pinned Pi behavior, the TUI, and Directory mode.
4. [`04-local-gateways.md`](04-local-gateways.md): use the shared Docker driver to implement persistent local gateway lifecycle.
5. [`05-gateway-workspaces.md`](05-gateway-workspaces.md): implement gateway metadata, workspaces, Trash, and recovery.
6. [`06-release.md`](06-release.md): complete remote deployment, security, compatibility, and first-release gates.

## Deferred product stage

7. [`07-macos-client.md`](07-macos-client.md): implement the native macOS client only after the CLI and TUI release and explicit activation of that product stage.

The TUI Workspace canvas is part of the CLI and TUI MVP. See [`../docs/architecture/cli.md`](../docs/architecture/cli.md).

Work can overlap only when phase dependencies permit it. Keep each change as a vertical slice through protocol, server, CLI, tests, and documentation.

## Open questions

[`gaps.md`](gaps.md) contains only deferred macOS conversation, workspace, destructive-action, and verification questions. The first-release contracts, future Apple `container` gateway-creation policy, and deferred interactive Gateway Hub are approved under [`../docs/`](../docs/).
