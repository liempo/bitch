# Phase 7: macOS Desktop Client

## Outcome

Deliver a BITCH graphical macOS client by adapting Paseo's shared app and Electron desktop shell after the CLI and TUI MVP.

## Product stage

This phase is deferred and does not block Phase 6. Do not start desktop implementation until the CLI and TUI MVP passes its public acceptance workflows.

## Selected architecture

Use Paseo source with package version 0.3.1 at upstream commit [`163e7d1`](https://github.com/getpaseo/paseo/tree/163e7d1cc421cdfe4de67b971ff6cea4b51eb0ed) for the shared Expo and React Native app, React Native Web export, Electron shell, sandboxed preload bridge, desktop-managed daemon, bundled CLI, and macOS distribution path.

Do not create the former SwiftUI project. Keep the shared app suitable for a later iOS client. Add `expo-two-way-audio` only when retained behavior requires it.

## Dependencies

Complete Phase 6. Use [`../docs/product/macos.md`](../docs/product/macos.md), [`../docs/architecture/macos-client.md`](../docs/architecture/macos-client.md), and [`../docs/product/deferred-acceptance.md`](../docs/product/deferred-acceptance.md). Resolve only applicable deferred questions in [`gaps.md`](gaps.md).

## Phase boundaries

This phase owns attributed graphical package import, BITCH branding, Pi-only graphical surfaces, saved daemon selection, the graphical Workspace canvas, the preload security boundary, packaged daemon and CLI compatibility, and macOS packaging.

This phase does not add BITCH-specific graphical improvements before retained Paseo workflows pass. It does not start an iOS product stage.

## Required outcomes

- The attributed shared app and desktop shell build with BITCH package identities and protocol dependencies.
- Graphical discovery and controls expose only Pi.
- Local and remote daemon selection, no fallback, Projects, Workspaces, Conversations, Terminals, timeline catch-up, questions, controls, and diffs meet approved client behavior.
- The sandboxed preload bridge and desktop-managed daemon preserve daemon authority.
- Packaged-app, IPC, transport, relay, compatibility, signing, notarization, update, and license-notice gates pass for the selected distribution boundary.

## Exit condition

The packaged macOS app completes approved local and remote workflows, exposes only Pi as an agent runtime, and keeps daemon state authoritative.
