# macOS Desktop Client

## Status

Approved deferred product specification. Implementation is pending after the CLI and TUI MVP.

## Product direction

The macOS client follows Paseo's graphical product behavior at the pinned baseline.

Use a shared Expo and React Native app, export it for React Native Web, and run that export inside an Electron desktop shell. This replaces the former SwiftUI direction.

The shared app foundation should also remain usable by a later iOS client.

## Daemon behavior

The desktop shell can bundle and manage one local daemon and CLI.

It starts only the daemon that it owns. By default, quitting the desktop app stops that managed daemon so reopening the app performs a complete daemon restart. Phase 7 retains Paseo's setting that lets the desktop-owned daemon remain running after app quit.

A daemon started independently through the CLI is not stopped when the desktop app quits.

The app uses the same daemon protocol for local and remote connections.

## Host registry

The app supports multiple saved daemon connections.

It registers localhost by default and lets the user remove or re-enable it. Removing localhost stops the daemon only when the desktop shell owns that process. It preserves daemon and filesystem data and leaves an independently started daemon running.

One active route targets one daemon ID. An unavailable selected daemon remains selected and disconnected. The app does not fall back to another daemon.

## Workspace canvas

The app copies Paseo's Workspace canvas:

- Project and Workspace navigation.
- tabs.
- user-created splits.
- Pi Conversation panels.
- interactive Terminal panels.
- retained file and diff surfaces when approved for the desktop stage.

Pi remains the only agent runtime. Remove other agent choices from creation, configuration, and presentation.

## Conversation behavior

The app renders the daemon's normalized timeline and lifecycle state. It uses authoritative tail and pagination reads to repair live delivery.

It presents the Pi controls and question permissions that the Paseo-derived Pi adapter exposes. It does not load Pi extension code or attempt to render terminal-only Pi components.

## Terminal behavior

The app uses the copied binary Terminal protocol and client runtime.

It restores screen and scrollback for live Terminals, sends binary input, and follows Paseo's size claim and update behavior.

## Desktop security boundary

The Electron renderer remains sandboxed and does not receive unrestricted Node.js access.

A narrow preload bridge exposes approved desktop functions, including managed-daemon lifecycle, native file selection, app links, and window behavior.

The desktop shell validates every renderer request. Browser guest content does not receive the BITCH preload API.

## Packaging

The deferred stage must define and test:

- universal or architecture-specific macOS packaging.
- code signing.
- notarization.
- entitlements.
- daemon and CLI bundling.
- update behavior.
- source and license notices.

## Deferred beyond desktop MVP

Do not add BITCH-specific graphical features before the copied Paseo desktop workflows work.

A later revision can change layout, navigation, lifecycle, or platform presentation after behavioral tests protect the baseline.
