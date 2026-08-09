# Product Acceptance Workflows

## Status

Approved first-release acceptance specification. Implementation is pending.

## Restore a released conversation

### Prerequisites

- A valid Pi JSONL session exists.
- Its live `AgentSession` was released after five idle minutes.
- The session is not locked by another Agent Server.

### Actions

1. Open the conversation from a client.
2. Request its durable state.
3. Send a supported command.

### Expected result

- The Agent Server acquires the session lock.
- Pi creates a new `AgentSession` from the existing JSONL file.
- Completed messages and final tool results remain unchanged.
- The conversation accepts commands according to normal Pi behavior.

### Failure and recovery

If another Agent Server holds the session lock, return `conversation_locked` and do not create another runtime.

If the session has ambiguous JSONL damage, keep it unchanged and return `session_recovery_required`. Other conversations remain available.

## Disconnect and reconnect during active work

### Prerequisites

- A Gateway-mode conversation has durable history.
- A command is producing assistant deltas and tool progress.
- The client has received a valid stream ID and sequence.

### Actions

1. After transient output, disconnect the client.
2. Let gateway work continue.
3. Reconnect to the same conversation.
4. Introduce a sequence gap on the client.
5. After the run settles, reconnect again.

### Expected result

- Client disconnection does not abort the command.
- The client reloads durable messages before applying a new snapshot.
- The snapshot contains current status, accumulated active response, queues, and pending dialogs.
- Missed token deltas and intermediate progress are not replayed.
- A sequence gap stops live application and starts full reconciliation.
- Completed Pi entries appear once after settlement.
- The client never remains in a false running state.

### Failure and recovery

A changed stream ID discards the old active projection. If the server restarted, the command is interrupted and never replayed. Damaged durable state uses the documented recovery errors.

## Restart during active work

### Prerequisites

- A conversation has an accepted or running command.
- Pi can have durable entries and transient output for that command.

### Actions

1. Before the command settles, stop the Agent Server.
2. Restart the Agent Server with the same persistent data.
3. Reopen the conversation.

### Expected result

- Receipts left in `accepted` or `running` become `interrupted`.
- The Agent Server does not replay the command.
- Completed Pi JSONL entries remain visible.
- Transient token and tool-progress events are not restored.
- Pending extension dialogs are canceled.
- The conversation shows **Stopped by server restart** when the interrupted run has no completed outcome.
- The user can send a new message to continue.

### Failure and recovery

A damaged session follows the JSONL recovery rules. A damaged gateway catalog keeps the process live but makes gateway metadata APIs unavailable until recovery.

## Start the TUI without implicit conversation selection

### Prerequisites

- A gateway has conversations in multiple workspaces with each user-visible status.
- Directory mode has existing sessions for the invocation cwd.
- One completed gateway conversation has not been viewed.

### Actions

1. Start `bitch --gateway` without a conversation ID.
2. Open one conversation from the gateway home.
3. Start plain `bitch` in Directory mode.
4. Open the Directory-mode resume list.
5. Start Gateway mode with `--conversation CONVERSATION_ID`.
6. Start Directory mode with `--conversation CONVERSATION_ID`.
7. Supply a missing conversation ID.
8. Supply a cross-gateway conversation ID.

### Expected result

- Gateway mode opens the grouped conversation home without creating a session or clearing any viewed state.
- Only explicit conversation opening marks that conversation viewed.
- Directory mode opens a blank draft without creating a Pi session.
- Existing Directory-mode sessions remain available through resume.
- `--conversation` opens only the exact selected-mode resource.
- Invalid selection fails without opening a recent, master, or priority conversation.

### Failure and recovery

An unavailable gateway or damaged selected session reports its normal error. TUI startup does not create or select fallback work.

## Select master and named gateways

### Prerequisites

- The registry contains a master gateway and another named gateway.
- Each gateway has a distinct gateway ID.
- A test can make either endpoint unavailable.

### Actions

1. Run `bitch --gateway`.
2. Run `bitch --gateway ALIAS` for the non-master gateway.
3. Select an unknown alias.
4. Make the named gateway unavailable.
5. Select the unavailable gateway.
6. Clear the master.
7. Run `bitch --gateway`.

### Expected result

- Selection without a name uses the gateway ID stored as master.
- Named selection uses only the exact alias.
- An unknown alias fails with `gateway_not_found` and exit code 3.
- An unavailable endpoint fails with `gateway_unavailable` and exit code 5.
- A missing master fails with `master_gateway_missing` and exit code 3.
- No failure selects another gateway or Directory mode.

### Failure and recovery

Restoring the exact endpoint makes the existing selection usable again. The client changes master only after an explicit `gateway master set` command.

## Register and delete local and remote gateways

### Prerequisites

- Docker is available for local creation.
- A remote Gateway-mode endpoint is reachable through the Tailnet.
- The client registry is empty.

### Actions

1. Create a local gateway.
2. Register the remote endpoint with another alias.
3. Delete the remote registration.
4. While its container runs, delete the local registration.
5. Register the retained localhost endpoint with a new alias.

### Expected result

- Local creation returns a ready running gateway and makes it master.
- Remote registration stores its normalized endpoint and verified gateway ID.
- Each deletion removes only its registry entry and requires no confirmation.
- Remote deletion does not contact or change the remote server.
- Local deletion does not stop the container or change its data.
- BITCH does not track the deleted local gateway.
- Registering the retained endpoint creates an externally managed entry.
- Deleting the master clears the master reference without promotion.

### Failure and recovery

A creation failure before registry commit removes only proven creation resources. An unavailable or mismatched registration leaves the registry unchanged. Retained unregistered local resources remain operator-managed.

## Register and use a remote gateway

### Prerequisites

- A Gateway-mode Agent Server is reachable through the Tailnet.
- `/v1/status` reports Gateway mode, a gateway ID, and compatible capabilities.
- The endpoint is a bare HTTP or HTTPS origin.

### Actions

1. Register the endpoint with a valid alias.
2. Select the alias.
3. Run a non-interactive prompt.
4. Reconnect to the endpoint.
5. Reopen the conversation.
6. Replace the endpoint with one that reports the same gateway ID.
7. Attempt replacement with a different gateway ID.
8. Attempt registration with credentials in the URL.
9. Attempt registration with a path in the URL.

### Expected result

- Registration stores the normalized endpoint and reported gateway ID.
- Prompting and reconnection use the registered gateway without fallback.
- Replacement succeeds only for the same gateway ID.
- Identity mismatch fails with `gateway_identity_mismatch` and preserves the entry.
- Invalid URL syntax fails with `gateway_endpoint_invalid` and stores no credentials.

### Failure and recovery

An unavailable endpoint leaves the registry unchanged. The user retries registration or replacement after restoring the exact selected gateway.

## Derive and rename a conversation title

### Prerequisites

- A new conversation has no manual Pi session name.
- The configured provider can record whether an unexpected model request occurs.

### Actions

1. Open the blank conversation draft.
2. Send a text first message.
3. Set a manual conversation name.
4. Clear the manual name.
5. Create an image-only conversation.

### Expected result

- The blank draft shows **New conversation**.
- The first text message becomes the derived display title without a separate model request.
- The manual Pi session name overrides the derived title and survives reload.
- Clearing the name restores the first-message title.
- The image-only unnamed conversation shows **Untitled conversation**.
- No client exposes a model-generated **Generate title** action.

### Failure and recovery

A failed manual-name mutation leaves the prior title unchanged. Title presentation never changes Pi message content or creates a second title store.

## Create a conversation in both modes

### Prerequisites

- Directory mode has a fixed current directory.
- Gateway mode has a default workspace and another selectable workspace.
- Configured models and thinking levels are available.

### Actions

1. Open a new Directory-mode draft.
2. Select a model.
3. Select a thinking level.
4. Send its first prompt.
5. Open a new Gateway-mode draft.
6. Select the non-default workspace.
7. Select a model.
8. Select a thinking level.
9. Send its first prompt.
10. After acceptance, inspect the Gateway-mode workspace control.
11. Retry the first prompt with the same command ID.

### Expected result

- Opening either draft creates no server conversation or empty Pi session.
- The first prompt creates one Pi session and uses its header ID as the conversation ID.
- Directory mode fixes the conversation cwd to the invocation directory.
- Gateway mode fixes the selected workspace after first-prompt acceptance.
- Model and thinking controls remain available after acceptance.
- After acceptance, the workspace selector is unavailable and the client sends no workspace mutation.
- The command-ID retry returns the existing receipt and creates no duplicate message.

### Failure and recovery

Failure before command acceptance removes the uncommitted Pi session and metadata. Failure after acceptance follows command-receipt and interrupted-run recovery without replay.

## Send image attachments in both modes

### Prerequisites

- PNG, JPEG, WebP, and GIF test images are available.
- The scripted provider accepts image content.
- One Directory-mode conversation and one Gateway-mode conversation are available.

### Actions

1. Send each supported image type with a text prompt in Directory mode.
2. Send each supported image type with a text prompt in Gateway mode.
3. Disconnect from the Gateway-mode conversation.
4. Reopen the Gateway-mode conversation.
5. Attempt to attach a non-image binary file.

### Expected result

- The client sends typed Pi `ImageContent` without using a server filesystem path.
- Pinned Pi conversion, orientation, and resize settings apply.
- The provider receives the accepted image and text prompt.
- Pi JSONL durably stores the image content with the user message.
- Reopening restores the image message without duplication.
- The non-image attachment fails with `attachment_type_unsupported`.

### Failure and recovery

Invalid image bytes or unsupported types fail before model invocation. A failed attachment does not append a partial user message or command side effect.

## Interrupt attached Gateway-mode work

### Prerequisites

- An attached CLI command is accepted on a persistent gateway.
- The scripted provider can keep generation or a tool active.
- The test can also interrupt while command acceptance is in flight.

### Actions

1. Press `Ctrl-C` once during active work.
2. While durable acceptance remains in flight, repeat the interrupt.
3. Start another command.
4. Close its network connection without SIGINT.
5. Start a third command.
6. Press `Ctrl-C` twice.

### Expected result

- The first SIGINT sends a typed Pi abort, waits up to 10 seconds for settlement and flushes, and exits 130.
- An in-flight acceptance is resolved before the CLI decides whether and where to send abort.
- Network loss disconnects only the client, and gateway work continues.
- A second SIGINT exits immediately and does not falsely report abort settlement.
- No interrupted command is replayed.

### Failure and recovery

An abort settlement timeout reports `abort_settlement_timeout` and exits 130. The user reconciles through the command receipt and conversation state. An uncertain client exit never changes a receipt to failed by itself.

## Run a non-interactive Directory-mode command

### Prerequisites

- Docker is available.
- The built CLI runs from a writable test directory.
- The scripted model provider returns deterministic text and a tool call.
- No gateway option is present.

### Actions

1. Run `bitch -p "PROMPT" --jsonl`.
2. Observe the streamed output.
3. Verify the tool cwd.
4. Wait for command settlement and CLI exit.
5. Run another Directory-mode command from the same directory.
6. While a third command runs, interrupt it.

### Expected result

- Each invocation starts a unique temporary Directory-mode container.
- The host port binds only to `127.0.0.1`.
- The tool uses the identity-mounted current directory as its fixed cwd.
- JSONL output is typed, contains no ANSI codes, and never requests stdin.
- Pi JSONL and command receipts persist in the shared Directory-mode store.
- Normal exit flushes state and removes the temporary container.
- The later invocation can reopen the durable conversation.
- The CLI requests an abort, waits up to 10 seconds, and then removes the container.

### Failure and recovery

After startup or readiness failure, the CLI removes only the invocation's container. On a later startup, it removes a stopped stale Directory-mode container.

The CLI does not stop or adopt a running container from another invocation.

## Use the interactive Directory-mode TUI

### Prerequisites

- Docker is available.
- The current directory is a trusted test project.
- Test extensions exercise dialogs, fire-and-forget UI, `custom()`, and custom renderers.

### Actions

1. Run `bitch` without `--gateway`.
2. Send a text prompt.
3. Invoke each supported extension UI operation.
4. Invoke terminal-only extension UI methods.
5. Exit the TUI.

### Expected result

- The CLI starts one temporary Directory-mode Agent Server with the fixed current directory.
- The TUI preserves pinned Pi layout, editing, commands, keybindings, themes, tool activity, and diffs.
- Pi RPC dialogs and fire-and-forget UI work through the BITCH protocol.
- `custom()` returns `undefined`.
- Terminal-only methods use pinned Pi RPC no-op or default-return behavior.
- Unsupported custom renderers use the standard TUI fallback.
- Exit flushes durable state and removes the temporary container.

### Failure and recovery

Startup or readiness failure removes the temporary container. An extension failure appears as an extension error and does not create a client-side extension runtime.

## Preserve completion state during automated reads

### Prerequisites

- A gateway conversation has **Completed since last viewed**.
- The built CLI, HTTP client, and TUI are available.

### Actions

1. List conversations.
2. Show the target conversation.
3. Read its state.
4. Read its messages.
5. Export it.
6. Monitor its background events.
7. Run `conversation mark-viewed CONVERSATION_ID`.
8. While a foreground TUI stream is open, complete another run.
9. Complete another run with only background clients connected.

### Expected result

- Every read and background stream preserves **Completed since last viewed**.
- `mark-viewed` clears it globally.
- A foreground stream marks the conversation viewed when opened.
- Completion while a foreground sink exists commits completion and viewed time together.
- Completion with only background clients sets **Completed since last viewed**.

### Failure and recovery

A failed viewed mutation leaves the prior timestamp unchanged. Reconnection does not infer foreground status unless the client explicitly requests a foreground stream.

## Use one conversation from multiple clients

### Prerequisites

- Two clients connect to the same gateway conversation.
- The conversation has one live `AgentSession`.

### Actions

1. Send commands from both clients.
2. While a successful run continues, disconnect both clients.
3. Let the run settle.
4. Reconnect the first client.
5. Open the conversation.
6. Refresh the second client.

### Expected result

- Both clients observe the same ordered commands and live events.
- Completed messages and final tool results appear once.
- Completion while both clients are disconnected sets **Completed since last viewed**.
- Opening the conversation from the first client clears that state globally.
- The second client observes the cleared state after reconciliation.
- Client disconnection does not stop gateway work.

### Failure and recovery

A sequence gap makes the affected client reload durable state and the current snapshot. It does not create another `AgentSession` or duplicate content.

## Continue an extension dialog after disconnection

### Prerequisites

- A Gateway-mode conversation is running.
- An extension requests user input.
- No valid dialog response has settled the request.

### Actions

1. Disconnect the current client.
2. Connect a TUI to the same conversation.
3. Submit a valid dialog response.
4. Submit a second response for the same dialog.

### Expected result

- The pending dialog keeps the live session active while no client is connected.
- The TUI receives the dialog in its initial snapshot.
- The first valid response resumes the shared run.
- The second response fails with `dialog_already_resolved`.
- Completed messages and tool results are not duplicated.

### Failure and recovery

A server restart cancels the pending dialog and does not replay the interrupted command. The user can send a new message after reconnection.

## Keep background extension input scoped

### Prerequisites

- The Gateway-mode TUI displays one foreground conversation.
- Another conversation can request a dialog and fire-and-forget UI while working.
- The gateway activity stream is connected.

### Actions

1. Trigger a dialog in the background conversation.
2. Trigger each supported fire-and-forget UI operation from it.
3. Continue editing the foreground conversation.
4. Open the background conversation.
5. Repeat the setup in a separate test run.
6. Before opening the background conversation, resolve its dialog from another client.
7. Open the background conversation.

### Expected result

- The background dialog never opens a foreground modal, changes editor focus, marks the conversation viewed, or switches conversations.
- The gateway home marks only its source conversation **Needs input**.
- A notification toast identifies its source and opens it only when selected.
- Background status, widget, and title state appears when that conversation opens.
- Background `set_editor_text` never changes another conversation's editor.
- Opening loads any still-pending dialog. A dialog already resolved elsewhere is absent.

### Failure and recovery

A gateway activity sequence gap reloads collection state. A server restart clears transient extension UI state and cancels pending dialogs without replay.

## Handle extension input in a non-interactive command

### Prerequisites

- A configured extension requests user input during a non-interactive CLI command.
- The command uses print, JSON, or JSONL output.

### Actions

1. Run the command in Gateway mode.
2. Run the command in Directory mode.

### Expected result

- Neither invocation reads stdin.
- Gateway mode reports `interaction_required` and `resumable: true`.
- The Gateway-mode conversation enters **Needs input** and retains the pending dialog.
- A TUI can connect and answer the Gateway-mode dialog.
- Directory mode reports `interaction_required` and `resumable: false`.
- Directory mode cancels the dialog, flushes durable state, and removes its temporary container.
- JSON and JSONL output remain typed and contain no ANSI control codes.

### Failure and recovery

If the Gateway-mode server restarts before a response, it cancels the dialog. Directory mode does not restore the canceled interaction in a later invocation.

## Seed `SOUL.md` between gateways

### Prerequisites

- The destination is a registered gateway without `SOUL.md`.
- The optional source is another registered gateway.

### Actions

1. With the source available, seed the destination with `--from SOURCE`.
2. After the destination file exists, repeat the command.
3. Remove the destination file through operator administration.
4. With the source unavailable, seed the destination.

### Expected result

- The first command copies the source file byte for byte.
- The second command fails with `soul_already_exists` and preserves the destination.
- The unavailable source causes installation of the packaged default.
- Later source changes do not alter the destination.

### Failure and recovery

A failed destination write leaves no partial file. The user can retry while the destination file is absent.

## Operate a persistent local gateway

### Prerequisites

- Docker is available to the host user.
- The registry has no entry for the proposed alias.
- The scripted model provider can hold one tool operation active.

### Actions

1. Create the local gateway without `--backend` and with automatic port selection.
2. Create another gateway with `--backend docker`.
3. Before the Apple backend ships, attempt creation with `--backend apple`.
4. Disconnect every client.
5. Reconnect to a Docker gateway conversation.
6. Continue that conversation.
7. Stop the idle gateway.
8. Start the idle gateway.
9. Start active work.
10. Request a normal restart.
11. Repeat the restart with `--force`.
12. Replace its container while preserving its data root.
13. Simulate a concurrent lifecycle command.

### Expected result

- Omission and explicit `docker` both create independent ready Docker gateways with stable identities.
- Unavailable Apple creation fails with `gateway_backend_unavailable` and creates no data, identity, container, or registry entry.
- Each registry entry records its immutable backend.
- Creation returns a ready running gateway with stable identity.
- The gateway continues after client disconnection.
- Reconnection restores durable and live state without duplication.
- Idle stop and start preserve the gateway ID and data.
- Normal restart fails with `gateway_active_work` and changes nothing.
- Forced restart aborts work, waits up to 10 seconds, and never replays it.
- Container and port replacement preserve gateway identity.
- The per-gateway lock serializes competing lifecycle operations.
- The gateway never starts automatically at login.

### Failure and recovery

Proven runtime state reconciles automatically. Conflicting identity, labels, mounts, containers, or operation records fail with `local_gateway_recovery_required` without changing data.

## Keep multiple gateways isolated

### Prerequisites

- Two gateways have different gateway IDs and data roots.
- Both gateways are registered in one client registry.
- Each gateway has independent configuration, credentials, sessions, workspaces, Trash, and `SOUL.md`.

### Actions

1. Start work in one conversation on each gateway.
2. Change configuration on the first gateway.
3. Change workspace files on the first gateway.
4. Disconnect every client from the first gateway.
5. Make the first gateway unavailable.
6. Continue work through the second gateway.

### Expected result

- Both conversations can run concurrently.
- Neither gateway reads or changes the other gateway's data.
- The first gateway continues its work after client disconnection.
- The unavailable gateway reports an error when selected.
- BITCH does not redirect its work to the second gateway or Directory mode.
- Changes to credentials, configuration, Trash, and `SOUL.md` remain isolated.

### Failure and recovery

Failure or recovery on one gateway does not mutate the other gateway. The user must restore or select the unavailable gateway explicitly.

## Isolate an externally missing workspace

### Prerequisites

- A gateway has two non-default workspaces and conversations in each.
- One workspace can be removed and restored through operator filesystem access.

### Actions

1. Remove one workspace directory outside BITCH.
2. Reconcile the gateway catalog.
3. Use the unrelated workspace.
4. Attempt new work in the missing workspace.
5. Attempt a mutation in the missing workspace.
6. Put a symbolic link at the missing path.
7. Restore a real directory at the exact recorded path.
8. Externally rename a different workspace directory.

### Expected result

- Only the removed workspace becomes **Workspace missing**.
- Its conversations remain visible and read-only without moving to Trash.
- Unrelated work and gateway readiness continue.
- New work fails with `workspace_missing`, or `default_workspace_missing` for an implicit missing default.
- A symbolic link does not restore availability.
- Exact-path real-directory restoration preserves the workspace ID.
- External rename creates a missing old workspace and a newly discovered workspace. BITCH does not infer identity transfer.

### Failure and recovery

Reconciliation never creates replacement content, tombstones the record, or moves its sessions. Ambiguous filesystem evidence stays isolated.

## Safeguard destructive conversation and workspace actions

### Prerequisites

- An idle conversation and an idle non-default workspace can move to Trash.
- Trashed equivalents are available for permanent deletion.
- The built CLI and TUI are available.

### Actions

1. Move each active item to Trash through its explicit CLI command.
2. Move equivalent items to Trash through the TUI.
3. Attempt permanent CLI deletion without `--confirm`.
4. Repeat with another resource ID.
5. Repeat with the exact positional resource ID.
6. Open each permanent-delete sheet in the TUI.
7. Cancel each sheet.
8. Open each sheet again.
9. Confirm each deletion.

### Expected result

- Explicit CLI Trash operations need no additional flag and never read stdin.
- The TUI asks once before moving an item to Trash.
- Missing confirmation fails locally with `confirmation_required` and exit code 2.
- Mismatched confirmation fails locally with `confirmation_mismatch` and exit code 2.
- Neither failed command sends an HTTP request or changes durable state.
- Exact confirmation deletes only the identified trashed resource.
- Permanent conversation deletion removes its JSONL, receipts, and server-owned exports but not a downloaded client copy.
- Permanent workspace deletion retains exports with its read-only conversations.
- The TUI sheet identifies destroyed and retained data and performs no action when canceled.

### Failure and recovery

Active-resource, default-workspace, operation-record, and recovery safeguards still apply after valid client confirmation. Confirmation never bypasses a server invariant.

## Clone public and private gateway workspaces

### Prerequisites

- Public HTTPS and SSH test repositories are reachable.
- One private repository is reachable through credentials preconfigured in the gateway.
- An unknown SSH host and an invalid credential case are available.

### Actions

1. Clone each public repository form.
2. Clone the private repository without putting a secret in the request.
3. Attempt an HTTPS URL with user information.
4. Attempt an HTTPS URL with query credentials.
5. Attempt an HTTPS URL with a fragment.
6. Attempt a local path.
7. Attempt a `file://` URL.
8. Attempt private clone with missing credentials.
9. Attempt SSH clone with unknown host trust.

### Expected result

- Valid HTTPS, `ssh://`, and SCP-like SSH forms clone successfully.
- Private access uses only gateway-owned Git or SSH configuration.
- Requests, receipts, logs, and errors contain no Git secret.
- Credential-bearing and local URL forms fail with `repository_url_invalid` before Git starts.
- Git and SSH never request interactive input.
- Authentication and host-trust failures return `workspace_clone_failed` without publishing a partial workspace.

### Failure and recovery

Clone uses the normal staged workspace operation. BITCH removes proven failed staging. It does not adopt ambiguous filesystem evidence.

## Move and restore a workspace

### Prerequisites

- The workspace is not the default workspace.
- No session in the workspace is active.
- The client confirmed the Trash or permanent-delete action.

### Actions

1. Move the workspace to Trash.
2. Restart the Agent Server at each recorded operation stage.
3. Restore the workspace.
4. Move the workspace to Trash again.
5. After confirmation, delete it permanently.

### Expected result

- A durable operation record exists before the filesystem change.
- Recovery completes only a next step proven by the record and filesystem.
- Trash and restoration preserve the workspace ID.
- Restoration makes sessions without their own Trash timestamp active.
- Permanent deletion retains the required workspace tombstone and read-only sessions.
- The operation record is removed after settlement.

### Failure and recovery

When source and destination evidence conflict, do not move or delete more data. Make the affected workspace unavailable and return `operation_recovery_required`.

## Move and restore a session

### Prerequisites

- The session is not active.
- The client confirmed the Trash or permanent-delete action.

### Actions

1. Move the session to Session Trash.
2. Restart the Agent Server at each recorded operation stage.
3. Restore the session.
4. Move the session to Session Trash again.
5. After confirmation, delete it permanently.

### Expected result

- A durable operation record exists before the filesystem change.
- Moving and restoring the JSONL file does not change its conversation ID.
- An individually trashed session remains trashed when its workspace is restored.
- A session inherited from a trashed workspace cannot be restored separately.
- The operation record is removed after settlement.

### Failure and recovery

When operation evidence is ambiguous, preserve each existing copy. Make the affected session unavailable and return `operation_recovery_required`.
