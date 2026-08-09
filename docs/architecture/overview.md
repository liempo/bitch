# Architecture Overview

## Status

Approved first-release technical specification and deferred client-control boundaries. Implementation is pending.

## System boundary

```text
BITCH CLI and TUI
├── client gateway registry
├── local Docker lifecycle adapter
└── AgentServerClient
            │
            ├── Directory mode: temporary directory-bound Agent Server
            │
            └── Gateway mode: selected persistent Agent Server
                         │
                         ├── Fastify transport
                         ├── live-runtime registry
                         ├── thin Pi command and event adapters
                         │       └── AgentSessionRuntime and AgentSession
                         ├── gateway workspace metadata
                         └── Pi JSONL sessions
```

Clients depend on the BITCH protocol. Pi SDK types do not cross the protocol boundary.

## Mode boundary

Directory mode starts a temporary Agent Server with one fixed `cwd`. It has no workspace registry. The client owns the container lifecycle.

Gateway mode connects to one persistent Agent Server. A gateway can run in a BITCH-managed local Docker container or at an externally managed remote endpoint.

The client can register multiple gateways. Each client invocation connects to one gateway at a time.

## Client control plane

The client side owns:

- registered gateway aliases and endpoints.
- the master gateway reference.
- local gateway runtime configuration.
- local container discovery and lifecycle for registered local gateways.
- gateway selection for each invocation.

The client keeps no inventory of unregistered gateways. It does not discover an unregistered local gateway from container labels or data roots.

The deferred native app shares this canonical registry directly and coordinates one process-wide active gateway. It does not use an app-specific registry or a CLI broker. [`macos-client.md`](macos-client.md) defines that boundary.

The host client owns container-runtime access. Agent Server containers do not receive the Docker socket.

The master gateway is a client-side selection role. It creates no server hierarchy.

The client control plane does not copy conversation state. It uses stable gateway IDs to qualify conversation and workspace references. [`local-runtime.md`](local-runtime.md) defines its managed Docker boundary.

## Thin Pi host

The Agent Server is a thin Pi RPC host in one Node.js process. It does not implement a separate conversation engine or agent state machine.

Pi public runtime state remains authoritative. A live handle retains only transport state that Pi does not expose for snapshots. This state includes transferable tool progress and extension UI state.

The design follows the pinned Pi RPC mode:

```text
Pi RPC mode: stdin command → RPC dispatcher → AgentSessionRuntime → session event → stdout
BITCH:       HTTP command  → thin adapter   → AgentSessionRuntime → session event → SSE
```

A live-runtime registry keeps one small handle for each live conversation. A handle owns:

- one `AgentSessionRuntime`.
- its event subscription.
- connected event sinks.
- one BITCH session lock.

The registry creates, finds, releases, and disposes handles. It does not decide Pi behavior.

## Pi ownership

The command adapter follows the pinned Pi RPC dispatcher. It delegates directly to `AgentSession` or `AgentSessionRuntime`.

Pi owns:

- model calls.
- tools.
- prompts and message queues.
- steering and follow-up behavior.
- retries and compaction.
- tool concurrency.
- branching and session replacement.
- settings and model runtime.
- extension execution and persistence.
- JSONL conversation content.
- runtime lifecycle rules.

BITCH reads live state from Pi. It does not copy Pi state into a second conversation model. Transient transport state resets when the live handle is disposed.

BITCH uses Pi's `DefaultResourceLoader`, `ModelRuntime`, `SettingsManager`, and `SessionManager` directly when they meet the requirement.

## BITCH additions

The Agent Server adds only behavior required by the client-server product:

- HTTP and SSE transport.
- stable protocol types.
- a stable gateway ID in Gateway mode.
- multiple-client event delivery and transient snapshot transport state.
- session locks.
- command retry protection.
- five-minute idle disposal.
- gateway workspace metadata and lifecycle.
- gateway-global viewed and completion state.
- health and operational logging.

The client adds behavior that does not belong to one Agent Server:

- gateway registration and selection.
- master gateway selection.
- local container lifecycle management.
- non-interactive gateway commands.
- the deferred interactive Gateway Hub.

Gateway workspace behavior stays beside the Pi host. It does not enter the Pi command path.

The first release does not use `pi --mode rpc` subprocesses, runtime workers, or separate internal services.

## Gateway identity

Each gateway owns one stable ID. The ID survives endpoint, alias, port, and container replacement.

Conversation and workspace IDs are scoped to their gateway. Clients use composite references:

```text
(gatewayId, conversationId)
(gatewayId, workspaceId)
```

The HTTP API does not add a gateway path prefix. One connection already targets one gateway.

Directory-mode Agent Servers are not registered gateways. They do not receive a durable gateway identity.

## Extension runtime

Each live conversation creates its own Pi extension runtime through `DefaultResourceLoader`. The Agent Server binds it to the conversation with `ctx.mode === "rpc"`.

Conversation-specific handlers, tools, closure state, lifecycle events, `cwd`, and `SessionManager` remain separate. Releasing a conversation disposes its extension runtime. Restoring the conversation creates a new runtime from Pi JSONL.

Extensions run in the Agent Server process with full container permissions. Process-global state and external resources can be shared. Extensions are trusted server code.

The TUI uses pinned Pi TUI components and extension contracts for supported client presentation. BITCH does not create an unrelated general extension system.

Gateway selection occurs before the first-release TUI starts. The first release does not host a client-side gateway management extension runtime.

The approved deferred `/gateway` feature remains client-owned and uses local pinned Pi TUI components. It replaces the active `AgentServerClient`. It does not run as an extension or transport terminal components. [`tui-gateway.md`](tui-gateway.md) defines this boundary.

BITCH copies the pinned Pi RPC extension UI boundary. Dialogs and supported fire-and-forget UI requests cross the protocol. Terminal component factories and renderer functions stay server-side and use Pi RPC no-op, default-return, or client fallback behavior.

## Technical stack

The Agent Server and CLI use:

- Node.js 24.
- strict TypeScript.
- ESM modules.
- npm workspaces.
- a committed npm lockfile.
- Fastify for HTTP and SSE.
- TypeBox for protocol schemas.
- Vitest for TypeScript tests.
- Docker for first-release local containers.

The deferred native macOS project remains in the monorepo but does not join npm workspaces.

## Repository structure

```text
apps/
├── agent-server/
├── cli/
└── macos/                 # deferred product stage

packages/
├── protocol/
├── agent-client/
├── pi-runtime/
├── metadata-store/
├── workspace/
└── tui/
```

`packages/pi-runtime` is a thin anti-corruption boundary. Pi SDK types must not leave it.

`packages/protocol` contains transport data only. It must not import Pi.

`packages/metadata-store` and `packages/workspace` contain Gateway-mode behavior that Pi does not provide.

## Pi version policy

Each BITCH release pins `@earendil-works/pi-coding-agent`, the Pi TUI, Node.js, npm dependencies, and its Agent Server image. Pi documentation and source for the pinned version are normative for standard behavior.

The supported client-server compatibility window contains the current and immediately previous BITCH release within one protocol major version. Pi and TUI versions change only through a BITCH release with behavioral compatibility checks.

Do not fork or copy Pi internals by default. The vendored TUI integration is the exception because it replaces direct runtime access with `AgentServerClient`.

[`pi-capabilities.md`](pi-capabilities.md) identifies each supported command and intentional difference from Pi.
