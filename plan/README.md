# Program and Phase Plan

## Purpose

This directory defines the delivery sequence, phase boundaries, dependencies, and public outcomes for BITCH. Approved product and architecture decisions are under [`docs/`](../docs/).

The repository has no product code yet. Start with Phase 1.

## Authority boundary

A phase plan does not authorize implementation. It does not contain issue-sized implementation units, execution status, or progress checkboxes.

Use these artifacts for delivery:

1. The [BITCH GitHub Project](https://github.com/users/liempo/projects/5) selects the next delivery issue and owns status.
2. A delivery issue defines one pull-request-sized slice and its acceptance contract.
3. Git, commits, and merged pull requests record progress and completion.

Follow [`../AGENTS.md`](../AGENTS.md) for the complete repository workflow.

## Phase maintenance

Keep only pending phase outcomes and unresolved questions in this directory.

After all delivery issues for an outcome are complete:

1. Update the authoritative product, architecture, operations, and testing documents.
2. Remove the satisfied outcome from its phase file.
3. Remove an empty phase file and update this phase order.

Do not retain completed items or create a completed-task archive.

## MVP phase order

1. [`01-paseo-baseline.md`](01-paseo-baseline.md): import the attributed Paseo daemon package baseline and preserve its tests.
2. [`02-pi-daemon.md`](02-pi-daemon.md): run one durable Pi-only Conversation through the copied daemon and CLI.
3. [`03-workspaces-terminals.md`](03-workspaces-terminals.md): implement Paseo-native Projects, Workspaces, worktrees, PTYs, and Terminal reconnect.
4. [`04-cli-tui.md`](04-cli-tui.md): complete the retained CLI and BITCH TUI Workspace canvas.
5. [`05-remote-daemons.md`](05-remote-daemons.md): implement multiple selected daemons, direct remote access, and encrypted relay pairing.
6. [`06-release.md`](06-release.md): pass the personal macOS arm64 MVP gate.

## Deferred product stage

7. [`07-macos-client.md`](07-macos-client.md): adapt Paseo's shared Expo app and Electron desktop shell after the CLI and TUI MVP.

Work can overlap only when phase dependencies permit it. Each delivery still uses one ready leaf issue and one focused pull request.

## MVP rule

Copy the pinned Paseo behavior first. Restrict public agent execution to Pi. Defer non-Paseo improvements until the baseline works.

The BITCH TUI is the approved exception that presents Paseo's Workspace canvas in a terminal interface.

## Open questions

[`gaps.md`](gaps.md) contains only deferred graphical-client presentation and release questions. No unresolved question blocks the CLI and TUI MVP.
