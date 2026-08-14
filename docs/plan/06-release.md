# Phase 6: Personal MVP Gate

## Outcome

Produce a recoverable personal CLI and TUI MVP for macOS on Apple silicon with local and remote daemon support.

## Dependencies

Complete Phases 1 through 5 and every workflow in [`../product/acceptance.md`](../product/acceptance.md). Use [`../testing.md`](../testing.md) and [`../operations.md`](../operations.md).

## Phase boundaries

This phase validates and documents the personal MVP. It does not publish a public package, add broad platform support, define current-to-previous release compatibility, or deliver graphical clients.

## Release outcomes

- A clean supported macOS arm64 checkout installs the pinned Node.js, Pi, and npm dependency set.
- Copied package tests and BITCH public-boundary suites pass without automatic retry.
- Real Pi, built CLI, real PTY, TUI, direct-route, and encrypted-relay workflows pass.
- Restart, interrupted-turn handling, backup, restore, localhost removal, remote-only use, and localhost recovery meet documented behavior.
- Public surfaces exclude non-Pi runtimes.
- License, provenance, modification notice, interactive notice, package license, and Corresponding Source requirements pass.
- Installation, lifecycle, security, pairing, backup, restore, and failure recovery procedures match the built system.
- No known critical daemon-authority, authentication, process-ownership, recovery, or data-loss defect remains.

## Exit condition

One user can use the built CLI and TUI on macOS arm64 to control Pi Conversations and Terminals on selected local or remote daemons. Paseo-native acceptance workflows pass, and deferred BITCH improvements remain outside the MVP.
