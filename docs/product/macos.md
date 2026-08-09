# Native macOS Client

## Status

Approved gateway registry and navigation contract for the deferred native client. Implementation is pending. [`deferred-acceptance.md`](deferred-acceptance.md) defines approved registry acceptance.

## Product boundary

The native app is a Gateway-mode client. It does not provide Directory mode and does not read gateway conversations or workspaces from local files.

The app uses the same BITCH HTTP and SSE protocol as the CLI and TUI. It does not import the Pi SDK or depend on a running `bitch` CLI process.

## Shared gateway registry

The CLI, TUI, and native app use one canonical registry under `BITCH_HOME`. The app does not copy, import, synchronize, or maintain an app-specific gateway registry.

A registration, alias, endpoint replacement, local backend record, deletion, or master change made by one client is visible to the others. All clients use the same validation, stable gateway identity, atomic mutation, locking, and recovery rules.

The app can store its last selected gateway ID in app preferences. It does not copy aliases, endpoints, runtime configuration, master state, or gateway resources into those preferences.

## First launch

When the registry is empty, the app shows gateway setup instead of an empty conversation view. Setup offers the approved local creation and external endpoint registration workflows.

A successful first registration:

- verifies or creates the gateway through the normal client control plane.
- writes the canonical registry.
- makes the first gateway master.
- selects it in the app.
- records its gateway ID as the app's last selection.

Canceling setup leaves the registry empty and keeps the setup screen available.

When the registry already contains entries, startup selects in this order:

1. The app's last selected gateway ID, if that ID remains registered.
2. The master gateway, if it remains registered.
3. No gateway. Show the gateway picker.

An unavailable selected gateway remains selected and displays its connection failure. The app does not fall back to the master, another gateway, or Directory mode.

## One-active-gateway navigation

The app presents one active gateway at a time. A gateway switcher is always available from the primary window and shows registered aliases, kind, local backend, master state, and connection state.

Selecting another gateway verifies its identity and compatibility before replacing the active connection. A failed selection preserves the prior gateway and view. A successful selection:

- closes only the old client connection.
- does not abort persistent gateway work.
- installs the selected gateway's conversation list.
- stores the selected gateway ID as the app's last selection.

Selection does not set or clear the master gateway. Master management is a separate explicit action.

The app never merges conversation lists, workspace lists, completion-viewed state, search results, or actions across gateways. Resource navigation always keeps the gateway ID with the conversation or workspace ID.

## Registry changes from another client

The app observes canonical registry revisions while it runs.

- An alias change updates the visible label without changing active resource identity.
- A master change updates its badge but does not switch the active gateway.
- A compatible endpoint replacement reconnects the active gateway and reconciles its view.
- Deletion of the active registration closes its connection and shows the gateway picker.
- Addition or deletion of another registration updates the picker only.

Registry deletion retains its approved behavior. It does not contact the gateway, stop work, stop a local container, or change gateway data.

## Multiple windows

All app windows share one active gateway selection. Switching in one window switches every window after target verification. The app does not use one gateway per window.

Each window can show a different conversation from that active gateway. Closing a window does not abort gateway work.

## Failure behavior

Registry corruption shows registry recovery guidance and does not create an empty replacement or discover gateways from containers. A permission failure shows the selected `BITCH_HOME` path and does not create an app-owned fallback registry.

A connection failure keeps local registry management available. No failure changes master or last selection automatically.
