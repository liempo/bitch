# Deferred Acceptance Workflows

## Status

Approved deferred workflows. These workflows do not block the CLI and TUI MVP.

## Start the macOS desktop stage

Before implementation:

1. Confirm that the CLI and TUI MVP is complete.
2. Add the attributed Paseo app and desktop source boundary.
3. Confirm the shared Expo, React Native Web, and Electron stack.
4. Confirm whether the same shared app will support the first iOS stage.
5. Update packaging and release requirements.

Expected result:

- Desktop work does not change the daemon protocol unnecessarily.
- The source and license boundary is documented.
- No SwiftUI implementation starts by accident.

## Managed local daemon

1. Start the desktop app with no running daemon.
2. Let Electron start its bundled daemon.
3. Open a Workspace and run a Pi Conversation.
4. Quit the app with the default managed-daemon policy.
5. Reopen the app.
6. Start the daemon independently through the CLI.
7. Open and quit the desktop app again.

Expected result:

- The app stops only the daemon it started.
- Reopen can start against preserved daemon data.
- Quitting does not stop the independently started daemon.

## Multiple daemons

1. Register localhost and two remote daemons.
2. Let the desktop app start and own the localhost daemon.
3. Remove localhost.
4. Verify that the desktop-owned daemon stops and its home remains.
5. Re-enable localhost.
6. Select one remote daemon.
7. Make it unavailable.
8. Restart the app.
9. Select another daemon explicitly.

Expected result:

- Removing localhost stops only the desktop-owned daemon and preserves its data.
- Re-enablement recovers localhost state.
- The unavailable remote daemon remains selected and disconnected after restart.
- The app does not execute on localhost.
- Explicit selection changes the active daemon.
- Resources from different daemons are not merged.

## Workspace canvas

1. Open one Workspace.
2. Add two Pi Conversation tabs and one Terminal tab.
3. Create a split.
4. Move and focus panels.
5. Close a Terminal view.
6. Close a root Conversation view and confirm archive.

Expected result:

- The layout follows retained Paseo behavior.
- Closing the Terminal view only detaches it.
- Closing the root Conversation view archives that Conversation globally.
- Unrelated resources remain active.
- Pi is the only agent runtime shown.

## Terminal restore

1. Run a live Terminal.
2. Close and reopen its panel.
3. Open the same Terminal in a second window.
4. Claim size from each window in turn.

Expected result:

- Both panels restore screen and scrollback.
- Both can write according to Paseo behavior.
- Size claims transfer ownership correctly.

## Desktop package

1. Build a clean macOS package.
2. Install it on the supported test system.
3. Verify the bundled daemon and CLI.
4. Verify app-protocol loading and renderer sandboxing.
5. Verify signing and notarization.
6. Verify source and license notices.

Expected result:

- The packaged app runs without development resources.
- The renderer cannot use unrestricted Node.js APIs.
- The bundled components use matching protocol versions.

## Later iOS stage

1. Build the shared app for iOS.
2. Connect to a remote daemon through direct and relay routes.
3. Open Conversations and Terminals in compact focused views.
4. Verify App Store and TestFlight packaging requirements.

Expected result:

- iOS reuses the shared app behavior.
- It does not bundle or start a local daemon.
- Compact presentation does not change daemon resource semantics.
