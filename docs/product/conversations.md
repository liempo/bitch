# Conversation Behavior

## Status

Approved first-release product specification. Implementation is pending.

## Conversation source of truth

Each conversation uses one Pi session. Pi JSONL is the source of truth for completed messages, tool calls, and final tool results.

BITCH uses the `id` in the Pi JSONL session header as the conversation ID. It does not add a second conversation ID.

A conversation ID is unique only within its gateway or Directory-mode data store. Gateway clients use `(gatewayId, conversationId)` when they store or exchange a cross-gateway reference.

The Agent Server discovers valid Pi JSONL sessions under `/data/sessions` at startup. Existing sessions do not require manual import.

## New conversation

**New Conversation** opens a blank draft without a setup dialog.

In Directory mode, the draft uses the fixed `cwd`. In Gateway mode, it uses the default workspace unless the user selects another workspace.

The Gateway-mode workspace selector remains visible until the first message. The conversation workspace becomes fixed after that message.

Model and thinking-level controls remain visible before and after the first message.

## Conversation list

A client shows conversations from its selected gateway or Directory-mode data store. It does not merge lists from multiple gateways.

Gateway-mode TUI startup opens this list unless the invocation supplies an exact conversation ID. Merely listing conversations does not mark them viewed. Directory-mode TUI startup opens a blank draft for its fixed `cwd`. Existing sessions remain available through resume.

In Gateway mode, the list groups conversations by workspace. It sorts workspace groups and conversations by recent activity.

A conversation can show these states:

- **Working**.
- **Needs input**.
- **Failed**.
- **Completed since last viewed**.

Viewed state is gateway-global for the single self-hosted user. Opening a conversation as a visible foreground TUI view marks it viewed for every client. A non-interactive `mark-viewed` command can do the same explicitly.

Read-only CLI and HTTP queries do not mark a conversation viewed. Listing, showing metadata, reading state, downloading messages, exporting, and monitoring events therefore cannot clear completion state by accident. If a successful run settles while no client views the conversation, the server sets **Completed since last viewed**. Opening it clears that state globally.

When at least one client views the conversation as a successful run settles, the server treats the completion as viewed. **Working**, **Needs input**, and **Failed** do not depend on the completion-viewed state.

Gateway conversations in the default workspace appear in the **Default** group. Trashed conversations do not appear in the normal list.

## Titles and deletion

BITCH follows pinned Pi session naming behavior:

- Before the first text message, show **New conversation**.
- Use the first user-message text as the derived display title when the session has no manual name.
- Use the latest nonempty Pi session name as the manual title.
- Allow the user to set or clear that name through Pi `set_session_name` behavior.
- After a clear, return to the derived first-message title.

Clients can truncate a title visually, but they do not store the truncated form. An image-only session without a manual name shows **Untitled conversation**.

The first release has no model-generated title action. BITCH does not make a hidden title request, add title-specific model cost, or ship a privileged title extension.

Moving a conversation to Session Trash is recoverable. The explicit CLI verb is sufficient confirmation. The TUI asks once. Permanent deletion requires the exact conversation ID through the CLI `--confirm` option or a dedicated destructive TUI sheet. No non-interactive path reads stdin.

Moving a conversation to Session Trash retains its export artifacts. Permanently deleting the conversation deletes its Pi JSONL, command receipts, and server-owned export artifacts in the same recoverable operation. It does not delete copies that a client already downloaded.

Permanently deleting a workspace retains artifacts because its conversations remain as read-only history. Deleting one of those conversations later removes that conversation's artifacts.

The first release has no archive state.

## Live session lifecycle

Each live conversation owns one Pi `AgentSession`. Different conversations can generate responses and run tools concurrently.

The Agent Server releases an idle session after five minutes. The timer starts only when the session has no active generation, tool execution, compaction, queued continuation, or pending extension dialog.

Opening a released conversation creates a new `AgentSession` from its Pi JSONL session. Client disconnection does not release or stop the session.

A pending extension dialog keeps a session live while all clients are disconnected.

## Multiple clients

Multiple clients can use one conversation:

- all clients observe the same `AgentSession`.
- all clients observe the same gateway-global viewed and completion state.
- all clients receive the same live events.
- all commands target the shared session.
- a newly connected client receives pending extension dialogs.
- the first valid dialog response wins.
- later responses fail as duplicates.

The Agent Server preserves Pi command behavior. It orders only simultaneous client requests before it delegates them to Pi.

## Reconnection

The client reloads completed messages and final tool results from Pi JSONL. It then subscribes to live events.

The Agent Server sends a current snapshot before new live events. The snapshot includes the current run status, accumulated active response, and pending extension dialogs.

BITCH does not replay missed token deltas, thinking deltas, live shell chunks, or intermediate tool progress. A sequence gap or changed stream ID makes the client reload durable state.

Reconnection must not duplicate completed messages or leave the client in a false running state.

## Server restart

A server restart stops active work and cancels pending dialogs. The Agent Server preserves completed Pi JSONL history and marks the interrupted run **Stopped by server restart**.

The server does not retry the interrupted command. A retry could repeat tool side effects. The user can send a new message to continue.

## Model and agent controls

Clients list models configured on the Agent Server. They allow model selection and selection of a supported thinking level.

[`../architecture/pi-capabilities.md`](../architecture/pi-capabilities.md) defines the public operation, client path, persistence, reconnection, and support status for each pinned Pi RPC command.

BITCH preserves the pinned Pi behavior for:

- prompts, steering, follow-up messages, abort, and new sessions.
- model and thinking-level discovery and selection.
- steering and follow-up queue modes.
- manual and automatic compaction.
- automatic retries.
- shell commands and shell abort.
- session statistics and HTML export.
- session switching, forks, clones, entries, and tree queries.
- session naming and last-assistant-text queries.
- extension, prompt-template, and skill commands.
- image attachments.

## Extension interaction

BITCH loads configured Pi extensions with `ctx.mode === "rpc"`.

Clients support these pinned Pi RPC extension UI operations:

- `select`.
- `confirm`.
- `input`.
- `editor`.
- `notify`.
- `setStatus`.
- string-array `setWidget`.
- `setTitle`.
- `set_editor_text`.

The extension runtime uses `ctx.mode === "rpc"` and `ctx.hasUI === true`. Dialogs and supported fire-and-forget requests cross the BITCH protocol.

BITCH preserves the pinned Pi RPC behavior for terminal-only methods. `custom()` returns `undefined`. Component widgets, headers, footers, custom editors, working indicators, themes, shortcuts, autocomplete providers, and terminal renderer functions do not cross the protocol. Getter methods return the pinned RPC defaults. The TUI uses its standard fallback for custom tool, message, and entry content that has no transferable renderer.

Extension discovery, trust, provenance, and reload remain server-side Pi behavior. Directory mode applies Pi project trust before loading project-local extensions. Gateway workspaces are trusted. `/reload` reloads the selected conversation's server-side extension runtime. The TUI never loads the extension module. Extension failures appear as errors.

A pending dialog or custom UI remains scoped to its conversation. Only a foreground-conversation dialog opens as a modal. A background request sets **Needs input** without changing the active view or viewed state. Opening that conversation shows the still-pending dialog.

A pending dialog remains pending after all clients disconnect. Stateful status, widget, and title UI remains in the live runtime snapshot. One-shot editor events are not replayed. A non-interactive Gateway-mode client can disconnect with `interaction_required` while the dialog remains pending for a TUI. A non-interactive Directory-mode invocation cancels the dialog before its temporary Agent Server stops. A server restart cancels any remaining dialog.

## Diffs and notifications

The TUI renders the `details.diff` value from the pinned Pi `edit` tool. It uses Pi's local diff renderer and expansion behavior.

BITCH does not infer a diff from arbitrary tool output. Extension edit tools use their transferable result content or the standard fallback. The first release has no accumulated Changes pane.

Native notifications are deferred with the native macOS app.
