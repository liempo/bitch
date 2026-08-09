# Deferred Feature Acceptance Workflows

## Status

Approved acceptance specification for the deferred interactive Gateway Hub and native registry sharing. These workflows do not block the first release.

## Use the TUI Gateway Hub

### Prerequisites

- A post-first-release build includes the approved `/gateway` feature.
- Two gateway registrations have different gateway IDs.
- One local gateway can be stopped, and one target can be made unavailable.
- A Gateway-mode conversation can hold active work and a pending dialog.
- A Directory-mode conversation can hold active work.

### Actions

1. Start the interactive client with an unavailable initial target.
2. Before any Agent Server connection succeeds, open `/gateway`.
3. Exercise each gateway management action in the hub.
4. Connect to the first gateway.
5. Start work in one conversation.
6. Trigger a dialog in that conversation.
7. Switch to the second gateway.
8. Return to the first gateway.
9. Reopen the conversation.
10. Set a different master.
11. Select a gateway without using the master action.
12. Attempt to switch from a healthy gateway to the unavailable target.
13. Select **Current directory**.
14. Start active Directory-mode work.
15. Attempt a gateway switch with **Stay**.
16. Repeat the switch with **Abort and switch**.
17. Delete the active gateway registration from the hub.

### Expected result

- The client shell and registry actions remain available without an Agent Server connection.
- Hub operations use the same validation, errors, locks, identity checks, and side effects as the gateway CLI.
- Selecting a target does not change the master gateway.
- Gateway switching replaces the active view without restarting the process or aborting gateway work.
- Returning to the first gateway reconciles durable state, active output, and any pending dialog.
- The unavailable target leaves the healthy current target and view unchanged.
- **Stay** preserves the Directory-mode conversation and cancels only the switch.
- **Abort and switch** aborts and flushes Directory-mode work.
- **Abort and switch** also removes the temporary container and opens the selected gateway.
- Registry deletion needs no confirmation and disconnects an active deleted target.
- Registry deletion does not contact or change that gateway.
- Events from an old connection generation never enter the new target view.

### Failure and recovery

Registry corruption uses registry recovery and does not discover entries from runtimes. A failed target preparation preserves the old connection.

If target installation and old-target reconnection both fail, the client remains in the disconnected hub. It shows both safe errors without fallback.

## Share the registry with the native macOS app

### Prerequisites

- The CLI and native app use the same canonical `BITCH_HOME`.
- The registry contains a master gateway and another gateway.
- The app has a last selected gateway ID.
- A test can run concurrent Swift and TypeScript registry mutations.

### Actions

1. While the app runs, change an alias through the CLI.
2. Change the master through the CLI.
3. Register another gateway through the app.
4. List that gateway through the CLI.
5. Race valid app and CLI mutations.
6. Restart the app with a still-registered last selection.
7. Remove that entry.
8. Restart with a valid master.
9. Clear the master.
10. Restart without a valid last selection.
11. Make the selected endpoint unavailable.
12. While work runs on the first gateway, switch gateways.
13. Delete the active registration through another client.
14. Damage only the primary registry.
15. Damage both the primary and backup in a separate case.

### Expected result

- Both clients observe one canonical revision history without import or synchronization.
- Cross-process locks serialize mutations. Each writer reloads before commit.
- Startup uses the existing last gateway when that entry exists.
- Startup uses the master only when the last entry no longer exists.
- Startup shows the picker when neither selection exists.
- Endpoint unavailability does not select another gateway.
- Switching replaces the process-wide app connection and preserves work on the old gateway.
- Switching does not change the master.
- Every app window uses the same active gateway without merged cross-gateway resources.
- External deletion closes the active connection and shows the picker without changing the gateway.
- A valid backup restores the primary.
- Two invalid copies produce `registry_recovery_required` without an app-owned fallback.

### Failure and recovery

A failed target preparation preserves the current app connection and last-selection preference.

An unsupported registry schema remains unchanged. Both clients report `registry_schema_unsupported`.
