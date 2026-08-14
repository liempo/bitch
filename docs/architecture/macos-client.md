# macOS Desktop Architecture

## Status

Approved deferred architecture. Implementation starts only after the CLI and TUI MVP.

## Selected stack

Use Paseo's desktop structure as the implementation baseline:

```text
shared Expo and React Native app
        │ React Native Web export
        ▼
Electron renderer
        │ sandboxed preload bridge
        ▼
Electron main process
├── window lifecycle
├── managed local daemon
├── bundled CLI
├── native file integration
└── package and update integration
```

Do not create the former SwiftUI project.

## Package boundary

The deferred source import can add and adapt:

- Paseo `packages/app`.
- Paseo `packages/desktop`.
- Paseo `packages/expo-two-way-audio` only if retained mobile or audio dependencies require it.

The graphical app uses the already adapted BITCH `protocol`, `client`, `server`, and `cli` packages. It does not create a second daemon protocol.

## Shared-app rule

Keep platform-independent navigation, daemon runtime state, Workspace canvas, Conversation presentation, and Terminal client behavior in the shared app.

Put Electron-only behavior behind platform adapters and the preload bridge. This boundary keeps a later iOS client possible.

## Managed daemon

Electron main owns its managed daemon subprocess.

It records whether it started the daemon. Quit and restart actions stop only that owned process. A daemon started through the CLI remains external.

The renderer requests lifecycle operations through the preload bridge. It does not spawn processes directly.

## Local transport

The desktop shell uses Paseo's local Unix-socket or named-pipe WebSocket transport. The renderer still communicates through the standard daemon client.

Remote routes use the same direct or encrypted-relay client path as other clients.

## Renderer security

Use:

- context isolation.
- sandboxing.
- no renderer Node integration.
- a narrow, typed preload API.
- explicit IPC validation.
- navigation and window-open restrictions.

Do not expose arbitrary filesystem, shell, process, or daemon APIs to web content.

## Static application loading

Export the shared web app and load it from the packaged application through a controlled application protocol such as Paseo's `paseo://app` equivalent.

Do not load the production renderer from an untrusted remote origin.

## State authority

Each window can hold client presentation state, but daemon resources remain authoritative.

The shared host runtime manages saved daemon connections and per-host replicas. Local display caches do not replace authoritative daemon snapshots and timeline reads.

## Multi-window behavior

BITCH retains Paseo's multi-window foundation. Each window shows the full daemon and Project navigation. A pending-open request targets one window without transferring Project ownership.

Exact window geometry, menu, and deep-link presentation remain Phase 7 questions in [`../../plan/gaps.md`](../../plan/gaps.md).

## Build and release

The desktop stage must adapt Paseo's Electron build configuration for:

- app identifiers and branding.
- entitlements.
- signing.
- notarization.
- universal or selected-architecture artifacts.
- daemon and CLI resources.
- update metadata.
- source and `AGPL-3.0-only` notice distribution under [`licensing.md`](licensing.md).

## Tests

Required deferred tests include:

- preload bridge validation.
- renderer sandbox checks.
- managed versus external daemon ownership.
- packaged daemon and CLI startup.
- local socket transport.
- remote direct and relay connections.
- Workspace canvas behavior.
- packaged-app smoke tests.
- signing, notarization, and update checks.

Use public app and IPC boundaries. Do not inspect imports as proof of security or behavior.
