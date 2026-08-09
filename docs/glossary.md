# BITCH Glossary

## Purpose

This glossary defines the terms used in BITCH product, architecture, and planning documents. Use these terms consistently in code, documentation, and interface text.

## Product terms

### BITCH

**Barely Intelligent Task & Context Handler.** Always write the product name as `BITCH`.

### BITCH Agent Server

The service that owns Pi runtimes, sessions, persistence, and live agent work. Use **Agent Server** after the first reference.

The executable can use the code-style name `bitch-agent-server`.

### Agent Server endpoint

The URL and port used to connect to one Agent Server.

```text
http://agent-host:PORT
```

An endpoint is a connection location. It is not a gateway identity.

### CLI

The `bitch` command-line client. It is the first complete Agent Server client and the reference client for API behavior.

Plain `bitch` uses Directory mode. `bitch --gateway` uses the master gateway. `bitch --gateway NAME` uses a named gateway.

### TUI

The interactive terminal interface opened by the CLI. BITCH vendors the required integration from the pinned Pi TUI. It preserves the approved Pi-compatible behavior and layout with BITCH branding.

The first-release TUI uses the mode and gateway selected at startup. It does not manage the gateway registry or switch gateways.

### macOS app

The deferred native graphical BITCH client. It is not part of the first release.

It shares the canonical gateway registry and presents one active gateway across its windows.

## Operating modes

### Directory mode

The default BITCH mode. It starts a temporary Agent Server with one fixed current working directory (`cwd`) and no workspace management.

The CLI identity-mounts the current host directory into a temporary Docker container. The container stops when its client exits.

Directory-mode invocations share per-user Pi configuration and session storage. They do not share this storage with gateways.

### Directory ownership lease

The temporary Agent Server lease renewed by its owning CLI. Lease expiry stops Directory-mode work after client death.

### Gateway mode

The mode used when the CLI receives `--gateway`.

Gateway mode connects to one persistent local or remote gateway. A gateway owns managed workspaces, conversations, configuration, credentials, Trash, `SOUL.md`, and runtime state.

### current working directory (`cwd`)

The directory in which Pi reads files and runs tools for a session.

In Directory mode, `cwd` is the identity-mounted client directory. In Gateway mode, it is the selected gateway workspace path.

### identity mount

A container bind mount that uses the same absolute path on the host and inside the container.

```text
Host:      /Users/alice/project
Container: /Users/alice/project
```

Identity mounts keep paths in tool output, diagnostics, and Pi sessions consistent.

## Gateway terms

### gateway

A persistent Agent Server with managed workspaces and an independent `/data` root.

A gateway can be local or remote. Gateways do not synchronize, delegate, move, or redirect work automatically.

### local gateway

A gateway whose container lifecycle BITCH manages on the client host.

The first release uses Docker. A local gateway starts on demand when selected and continues after all clients disconnect.

BITCH can manage multiple local gateways. Each one has a separate data root and runtime configuration.

### remote gateway

A gateway managed outside the local BITCH installation and reached through a registered endpoint.

BITCH does not manage the remote host, container runtime, or deployment lifecycle.

### gateway ID

A stable server-owned identifier for one gateway.

The ID survives endpoint, alias, port, and container changes. It scopes conversation and workspace IDs.

### gateway alias

A user-facing name stored in the client gateway registry.

An alias selects a gateway with `bitch --gateway NAME`. Changing an alias does not change the gateway ID.

### master gateway

The gateway selected when the user runs `bitch --gateway` without a name.

Master is a client-side registry role stored by gateway ID. It is not a reserved alias and gives one gateway no authority over another.

The first registered gateway becomes master. The registry can later have no master.

### gateway registry

The client-owned store of registered gateways, aliases, endpoints, local lifecycle references, runtime configurations, and the master gateway reference.

The CLI, TUI, and deferred macOS app share one canonical registry under `BITCH_HOME`. The registry does not store conversation content or workspace metadata.

### gateway reference

A client-side composite identity for a gateway-owned resource.

```text
(gatewayId, conversationId)
(gatewayId, workspaceId)
```

The Agent Server API does not add a gateway path prefix because one connection already targets one gateway.

### `--gateway`

The CLI option that selects Gateway mode.

Without a value, it selects the master gateway. With a value, it selects the named gateway.

A missing or unavailable selection returns an error. BITCH does not fall back automatically.

### `bitch gateway`

The non-interactive CLI command group for gateway registration, configuration, lifecycle, and deletion.

Commands in this group do not prompt on stdin. It is the only first-release gateway management interface.

### gateway home

The first-release TUI screen that lists one selected gateway's conversations by workspace. Opening the gateway home does not mark a conversation viewed.

Do not call this screen the Gateway Hub.

### `/gateway`

The approved deferred interactive Gateway Hub command. It is not part of the first release.

It remains client-side, uses pinned Pi TUI components, manages gateways, and can replace the active connection. It does not run as an Agent Server extension.

### container runtime

The system that starts a local BITCH container.

Docker is the only first-release runtime. Apple `container` support is deferred.

### backend

The user-facing container-runtime choice for local gateway creation. The values are `docker` and `apple`.

One gateway keeps its creation-time backend. Apple creation makes a new gateway instead of converting a Docker gateway.

### runtime driver

The BITCH adapter for one container backend. It handles image, container, mount, port, and lifecycle operations.

### runtime configuration

The client-owned settings that record and configure a local gateway's runtime driver.

The driver and data root are immutable after creation. Do not call a gateway registration a runtime profile.

## Client architecture

### AgentClient

The client interface consumed by the CLI and TUI. It represents Agent Server operations without exposing HTTP or SSE details.

### AgentServerClient

The HTTP and SSE implementation of `AgentClient`.

The CLI and TUI use `AgentServerClient`. They do not create or import Pi `AgentSession` objects directly.

### AgentServerConnection

An active connection to one Agent Server endpoint.

## Conversation terms

### conversation

The user-facing term for an exchange with Pi. Each conversation uses one Pi session.

### session

The durable Pi record behind a conversation. Pi stores session content as JSONL.

Use **conversation** in user-facing interface text. Use **session** for Pi storage, protocol, and runtime concepts.

### conversation ID

The `id` in the Pi JSONL session header.

The ID is unique within its gateway or Directory-mode data store. A cross-gateway client reference also includes the gateway ID.

### Pi JSONL

Pi's durable session format. It is the source of truth for completed messages, tool calls, and final tool results.

Pi JSONL does not contain every transient streaming or progress event.

### command receipt

The durable BITCH record for one accepted conversation command. It records command identity, payload hash, state, result, and failure information.

A receipt prevents duplicate command acceptance. It does not guarantee exactly-once tool side effects.

### lifecycle operation record

The durable client record for one managed local gateway mutation. Its operation ID is a UUID v4 and is not a conversation command ID.

### foreground view

A Gateway-mode TUI view that visibly shows one conversation. Its foreground SSE subscription marks that conversation viewed.

Read-only requests and background subscriptions do not create a foreground view.

### Completed since last viewed

The Gateway-mode state for a successful completion that no foreground client viewed. An explicit foreground view or `mark-viewed` command clears it globally.

### live session

A session with an in-memory Pi `AgentSession` owned by the Agent Server.

### released session

A session whose in-memory `AgentSession` was released after five idle minutes. The Agent Server can restore it from Pi JSONL.

### read-only session

A session that can display history but cannot accept prompts or run tools. Sessions with missing or permanently deleted workspaces are read-only.

## Workspace terms

### workspace

A directory managed by one gateway. A workspace can contain one project, multiple projects, or ordinary files.

Do not call the fixed `cwd` in Directory mode a workspace.

### default workspace

The gateway workspace at `/data/workspaces/default`. A new gateway conversation uses it when the user does not select another workspace.

The default workspace cannot move to Trash.

### workspace display name

The user-visible workspace name. Changing it does not rename or move the workspace directory.

### workspace ID

A stable BITCH identifier that binds sessions to a workspace inside one gateway. It does not change when the workspace moves or its display name changes.

### workspace tombstone

The minimal metadata retained after permanent workspace deletion. It preserves the workspace name and session association for read-only session history.

### project-local resources

Pi resources discovered from a working directory:

- `.pi/extensions/`.
- `.pi/skills/`.
- `.pi/prompts/`.
- `.pi/settings.json`.
- `.agents/skills/`.
- `AGENTS.md` files.

Directory mode copies Pi's project-trust behavior and supports `/trust`. Gateway mode treats every workspace as trusted and does not show `/trust`.

## Storage terms

### `/data`

The persistent data root used by one gateway.

```text
/data/
├── config/
├── sessions/
├── workspaces/
├── trash/
├── artifacts/
├── state/
└── secrets/
```

Each gateway has an independent `/data` root. Temporary process state, locks, and sockets use `/run/bitch`.

### `BITCH_HOME`

The per-user host root for BITCH client state, Directory-mode state, and local gateway data.

The environment variable `BITCH_HOME` overrides the default root.

### Workspace Trash

The Gateway-mode area under `/data/trash/workspaces`. A trashed workspace hides its bound sessions from normal views.

### Session Trash

The area under `/data/trash/sessions` and the corresponding interface view.

Session Trash includes:

- individually trashed sessions.
- sessions inherited from a trashed workspace.
- read-only sessions retained after permanent workspace deletion.

### Trash timestamp

The nullable `trashedAt` catalog and protocol field for a workspace or session. A null value means the item is active.

A session appears in Session Trash when its own Trash timestamp is set or its workspace is trashed.

## Pi integration terms

### Pi

The agent runtime used internally by BITCH. BITCH does not reimplement Pi's model, tool, extension, skill, compaction, retry, or session logic.

### AgentSession

Pi's in-memory SDK object for one live session. Only the Agent Server owns `AgentSession` objects.

### runtime adapter

The thin BITCH-owned layer around Pi's SDK. It maps BITCH commands and events to pinned Pi RPC behavior without reimplementing agent logic.

### Pi extension

A trusted TypeScript module loaded by Pi's `DefaultResourceLoader` on the Agent Server.

Extensions can add tools, hooks, commands, and supported UI interactions. Terminal-only extension behavior cannot be assumed to cross an RPC client boundary.

### Pi TUI component

A component from the pinned `@earendil-works/pi-tui` package. BITCH uses these components for TUI behavior instead of creating a separate component system.

### Pi RPC extension UI boundary

The extension UI behavior supported by the pinned Pi RPC mode. Dialogs and supported fire-and-forget requests cross the protocol. Terminal component factories and renderer functions do not.

### export artifact

A server-owned HTML export associated with one conversation. Gateway mode keeps export artifacts until explicit deletion or permanent conversation deletion.

A client-downloaded copy is outside BITCH control.

### `SOUL.md`

The identity document owned independently by Directory mode and each gateway.

The user can seed a missing gateway file once from another registered gateway or the BITCH default. BITCH does not merge or automatically synchronize `SOUL.md`.

## Communication terms

### HTTP

The protocol used for Agent Server commands, queries, metadata, and durable state.

### Server-Sent Events (`SSE`)

The server-to-client stream used for live agent events. Commands and dialog responses use HTTP rather than SSE.

### gateway activity stream

The Gateway-mode SSE stream that carries conversation and workspace summaries for one selected gateway. It does not carry conversation content.

### Tailnet

The private Tailscale network that provides the first-release remote access boundary. The first release does not use API tokens or application-level authentication.

## Terms to avoid

### single mode

Use **Directory mode**.

### managed mode

Use **Gateway mode**.

### `--server`

The first release does not provide this option. Use a registered gateway and `--gateway`.

### backend for a client connection

Do not use **backend** for the client connection layer. Use `AgentClient`, `AgentServerClient`, or **Agent Server** as appropriate.

### profile

Do not use **profile** for a gateway registration or endpoint. Use **gateway alias**, **gateway registry entry**, or **runtime configuration**.

### instance

Avoid **instance** when referring to a gateway or endpoint. Use **local gateway**, **remote gateway**, or **Agent Server connection**.

### Local mode

Avoid this unqualified term. Use **Directory mode**, **local gateway**, or **deferred macOS app** as appropriate.
