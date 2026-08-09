# Interactive TUI Gateway Hub

## Status

Approved contract for a deferred feature. The first release does not implement this hub. [`../product/deferred-acceptance.md`](../product/deferred-acceptance.md) defines its acceptance workflow.

## Product boundary

`/gateway` opens a full client-owned Gateway Hub. It can manage the gateway registry and local lifecycle, and it can replace the TUI's active Directory-mode or Gateway-mode connection without restarting the process.

The hub is available:

- before an Agent Server connection exists.
- after initial Directory-mode or Gateway-mode connection failure.
- while the current endpoint is disconnected.
- from an active Directory-mode conversation.
- from an active Gateway-mode conversation.

The TUI still presents only one active target at a time. The hub does not merge conversations, workspaces, status, or credentials from different gateways.

## Pi and client integration boundary

`/gateway` is a reserved local TUI command. The client registers it before it merges Pi and extension slash-command discovery. A server extension cannot replace or intercept it. The command is never sent as a prompt or Agent Server command.

The Gateway Hub runs in `packages/tui` and uses components from the pinned Pi TUI package. It does not run as a Pi extension and does not create a second extension runtime.

The hub calls the same client control-plane application service as the public `bitch gateway` CLI. That service owns:

- registry reads and atomic mutations.
- live status verification.
- local backend lifecycle operations.
- lifecycle locks and recovery records.
- connection-target preparation.

The hub uses `AgentServerClient` only after it selects an Agent Server. It does not import the Pi SDK, inspect Pi sessions, or send registry operations through an Agent Server.

Terminal components remain local. No component factory, renderer, key handler, or Pi TUI object crosses HTTP, SSE, or the extension RPC boundary.

## Client shell

The interactive executable creates a small client shell before it starts the selected Agent Server. The shell owns:

- the Gateway Hub route.
- the current invocation cwd.
- the active-target descriptor.
- the active `AgentServerClient`, if any.
- a monotonically increasing connection generation.
- the pinned Pi-compatible conversation view.

An initial selection or startup failure displays the stable error and keeps the shell open on the Gateway Hub. This is not automatic fallback. No alternate target starts until the user selects it.

The hub includes a **Current directory** target. Selecting it starts a new temporary Directory-mode Agent Server for the invocation cwd. Gateway rows come from the local registry.

## Hub presentation

Gateway rows sort by ascending ASCII alias. Each row shows:

- alias and stable gateway ID.
- local or remote kind.
- Docker or Apple local backend when applicable.
- master status.
- stored endpoint.
- stored local lifecycle state when known.
- live reachability and compatibility when the user requests status or selects the row.

A failed live check does not remove or rewrite a row. Registry data remains usable while every endpoint is offline.

The details view exposes the same data and safe output fields as `gateway show` and `gateway status`. It does not show credentials, authorization values, prompts, messages, tool data, or secret paths.

## Management operations

The hub provides interactive forms and actions for every non-interactive gateway operation:

- create a local gateway with alias, immutable backend, and port policy.
- register or replace an externally managed endpoint.
- list, inspect, and request live status.
- rename or delete a registration.
- show, set, or clear the master gateway.
- list, start, stop, restart, or configure a managed local gateway.
- seed a missing `SOUL.md` from another gateway or the packaged default.

Validation, stable error codes, locking, identity checks, active-work rules, rollback, and side effects are identical to [`cli.md`](cli.md) and [`local-runtime.md`](local-runtime.md). The TUI gathers values in forms instead of reading terminal stdin.

Registry deletion keeps its approved one-step behavior and does not add confirmation. Deleting the active registration closes its client connection and returns to the disconnected hub. It does not contact the gateway, abort work, stop a local container, or change gateway data.

Renaming the active gateway updates its displayed alias without reconnecting. Setting or clearing the master never changes the active target. Target selection never changes the master unless the user invokes the separate master action.

## Active-target switch

A switch uses the target gateway ID, not its alias, as durable identity.

For a different Gateway-mode target, the client:

1. Assign a new connection generation.
2. Read the selected registry entry.
3. If necessary, start the selected local gateway on demand.
4. Verify live status, gateway identity, protocol compatibility, and required capabilities.
5. Create the new `AgentServerClient`.
6. Load the target gateway landing state.
7. Stop event application from the old generation.
8. Close the old client connection without sending abort.
9. Install the new target and conversation view atomically.

Preparation failure leaves the old target, view, and connection unchanged. A failure after the old connection closes attempts to reconnect the old target. If that also fails, the shell shows both safe errors and remains in the disconnected hub.

Selecting the already active gateway closes the hub and retains the current conversation. Selecting another gateway opens its conversation list. BITCH does not infer a conversation with the same ID or title.

Switching away from a persistent gateway does not abort generation, tools, compaction, queued continuations, or pending extension dialogs. Those operations continue at that gateway. Reopening the conversation uses normal HTTP and SSE reconciliation.

The client removes old-gateway dialogs and transient response state from its local view. It does not resolve a server dialog. A later snapshot restores a still-pending dialog. Another connected client can resolve it meanwhile.

Every asynchronous callback and SSE event carries its connection generation. The shell discards an event from a generation that is no longer active.

## Directory-mode switch

A Directory-mode Agent Server cannot continue after its owning TUI leaves it.

If Directory mode is idle, selecting a gateway uses these steps:

1. Flush durable state.
2. Stop the temporary Agent Server.
3. Remove its container.
4. Install the prepared gateway target.

If Directory mode has active work, a local dialog offers these actions:

- **Stay**: cancel the switch and preserve the current view.
- **Abort and switch**:
    1. Request Pi abort.
    2. Cancel pending dialogs.
    3. Wait up to 10 seconds for durable flushes.
    4. Stop the temporary container.
    5. Remove the temporary container.
    6. Install the prepared gateway target.

The hub does not offer a detach option for Directory mode. It never leaves a temporary Directory-mode container running without its owning client.

When a user selects **Current directory** from Gateway mode, the client prepares a fresh Directory-mode container for the invocation cwd. Gateway work continues after its client connection closes. A Directory-mode startup failure preserves the gateway connection and view.

## Local lifecycle effects

Stopping the active local gateway closes its conversation view only after the stop succeeds. The shell remains in the hub and shows the gateway as stopped.

Restarting the active local gateway follows normal active-work and `--force` behavior. After readiness and identity verification, the client reconnects to the same conversation when it still exists. Interrupted work is never replayed.

Replacing the endpoint of the active externally managed gateway first verifies the same gateway ID. After registry commit, the client moves its connection to the replacement endpoint and reconciles the current conversation. A verification failure changes neither registry nor active connection.

Only one mutation form can submit at a time. The shared lifecycle and registry locks still arbitrate requests from other processes.

## Failure and recovery

- Registry corruption opens the documented registry recovery state. The hub does not reconstruct entries from containers or endpoints.
- An unavailable target leaves the current connection selected and reports `gateway_unavailable`.
- An identity mismatch leaves the registry and active target unchanged.
- A busy lifecycle operation reports `local_lifecycle_busy` and does not retry automatically.
- A local recovery ambiguity reports `local_gateway_recovery_required` and changes no ambiguous resource.
- Loss of the active connection keeps the shell and registry hub available.
- No hub failure selects the master, another gateway, or Directory mode automatically.

Closing the TUI applies the normal lifecycle rule for its active mode. It disconnects from a gateway or stops its Directory-mode Agent Server.
