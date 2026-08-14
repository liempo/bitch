# Architecture Overview

## Status

Approved MVP technical specification. Implementation is pending.

## Design source

BITCH copies and adapts the daemon stack from Paseo source with package version 0.3.1 at upstream commit [`163e7d1`](https://github.com/getpaseo/paseo/tree/163e7d1cc421cdfe4de67b971ff6cea4b51eb0ed). This exact commit, not the earlier `v0.3.1` tag, is authoritative.

BITCH remains an independent repository. [`licensing.md`](licensing.md) defines the approved conservative `AGPL-3.0-only` treatment, required attribution, and source-inventory gate for the pinned Paseo material.

## System boundary

```text
BITCH CLI and TUI
├── daemon registry and selected-daemon state
├── Paseo-derived daemon client
└── TUI Workspace canvas
             │
             │ WebSocket JSON and binary frames
             ▼
selected BITCH daemon
├── WebSocket server and client sessions
├── Project and Workspace registries
├── Conversation manager and live normalized timelines
├── Pi-only provider adapter
│   └── one `pi --mode rpc` subprocess per live Conversation
├── Terminal manager
│   └── node-pty workers and headless terminal snapshots
├── direct network listener
└── optional encrypted relay transport
```

The daemon runs on the host that owns the source files and Pi installation.

BITCH client text uses **Conversation** where Paseo source and protocol identifiers use `agent`. Internal `agent` names can remain during source adaptation when renaming them would break copied compatibility.

## Removed architecture

The MVP does not implement the former:

- Directory mode.
- Gateway mode.
- temporary Docker Agent Server.
- HTTP and SSE BITCH protocol.
- master gateway.
- local Docker gateway inventory.
- BITCH Pi SDK host.
- Pi JSONL-only client timeline.

The Paseo-derived daemon replaces those components.

## Daemon responsibilities

The daemon owns:

- stable daemon identity.
- client WebSocket sessions.
- Pi process lifecycle.
- Pi session import and resume handles.
- normalized Conversation lifecycle and live timeline rows.
- authoritative timeline pagination for loaded Conversations.
- pending question permissions.
- Project and Workspace records.
- managed Git worktrees.
- PTYs, terminal snapshots, and terminal activity.
- daemon configuration.
- direct and relay transports.
- host filesystem access.

Clients do not duplicate daemon live state.

## Pi provider boundary

Pi is the only registered public agent runtime.

The retained adapter starts an installed Pi binary in RPC mode. It maps Pi runtime events, tools, models, thinking levels, commands, questions, session handles, import records, and history into Paseo's provider and timeline contracts.

The adapter can keep Paseo's internal provider-neutral interfaces when they reduce source adaptation. No other agent provider can appear in public discovery, configuration, creation, or resume paths.

The user installs and authenticates Pi independently. BITCH does not proxy model calls or own Pi credentials.

## Conversation authority

The daemon owns the durable BITCH Conversation record and the live normalized timeline for each loaded Conversation. A timeline row has daemon-owned ordering information.

Pi owns the durable native session. Pi JSONL supplies provider-native history and the resume handle.

The loaded daemon timeline is authoritative for BITCH clients. After daemon restart, the adapter resumes Pi and rehydrates a new normalized timeline from Pi history. Pi JSONL is authoritative inside Pi and for discovery, import, resume, and that rehydration.

This split follows the pinned Paseo implementation. BITCH does not create a third Conversation store or persist normalized rows separately in the MVP.

## Client protocol

All clients use the copied Paseo WebSocket protocol.

The connection starts with a hello message. The daemon replies with server information, stable daemon identity, version, features, and capabilities.

JSON session messages carry commands, responses, snapshots, lifecycle updates, and timeline events. Request and response pairs use request IDs.

Binary frames carry terminal input, output, resize, and snapshots. Clients use the copied protocol codecs.

The MVP does not preserve the former REST, OpenAPI, Problem Details, command-receipt, or SSE contracts.

## Local and remote routes

Local and remote use the same daemon protocol.

A daemon can accept:

- loopback TCP.
- a Unix socket for supported local clients.
- a direct private network route.
- an outbound Paseo relay route with end-to-end encryption.

A client registry can store multiple routes for one stable daemon ID. The client explicitly selects one daemon. Route failure does not select a different daemon.

## Workspace boundary

A Project owns exact-root identity. A Workspace owns a concrete `cwd` and stable Project membership.

Workspace identity is opaque. Filesystem operations never derive a path from a Workspace ID.

Local and managed-worktree placement follows Paseo's registry and provisioning services. Multiple Workspaces can share a `cwd`.

## Terminal boundary

Terminals are runtime-only daemon resources. Each Terminal belongs to one Workspace.

The Terminal manager uses `node-pty` and a worker process. A headless terminal model creates screen and scrollback snapshots for reconnect.

The protocol permits multiple observers and writers. Size ownership uses a daemon-owned claimant per Terminal. BITCH does not add a terminal writer lease.

## Source-copy boundary

The initial source import includes the coherent Paseo packages needed for the daemon MVP:

- `packages/protocol`.
- `packages/relay`.
- `packages/highlight`.
- `packages/client`.
- `packages/server`.
- `packages/cli`.
- root `package.json` and `package-lock.json` adapted to the retained workspaces.
- root TypeScript, test, format, lint, patch, and generation files required by those packages.
- shared scripts or fixtures that imported package tests execute.

The import records every copied root path in the source inventory. It does not copy unrelated graphical packages only because a root script refers to them. Adapt that root script to the retained workspace set.

Keep these package boundaries during the first import. Rename package identities and BITCH branding in tested follow-up changes.

Defer these packages:

- `packages/app`.
- `packages/desktop`.
- `packages/website`.
- `packages/expo-two-way-audio`.
- other packages not required by the imported package dependency graph.

The TUI is BITCH-owned. It uses the copied client and protocol packages but implements a terminal Workspace canvas.

## Pruning rule

Import a coherent, runnable baseline before aggressive pruning.

Disable every non-Pi agent runtime at the public boundary first. Remove non-Pi defaults from provider discovery, agent creation, help, and configuration presentation. Disable the copied agent-launch Terminal profile surface for the MVP. Remove provider implementation code only after Pi-only behavioral tests cover the retained daemon workflows.

Disable Paseo-native higher-level features that are outside the MVP, including browsers, voice, schedules, services, Hub, Agent MCP injection, and multi-agent orchestration, at public boundaries. Defer their product delivery. Do not rewrite shared daemon foundations only to erase dormant code before the Pi MVP works.

## Package dependency rules

- `protocol` does not depend on the daemon.
- `client` depends on protocol and relay, not server internals.
- `server` can depend on protocol, relay, client, and highlight as in the pinned source.
- `cli` uses the client protocol and imports only the server exports needed for local daemon lifecycle.
- the TUI uses the BITCH client boundary and does not import server or Pi runtime types.
- Pi RPC types remain inside the server's Pi adapter.

## Version policy

BITCH pins:

- Paseo source commit `163e7d1cc421cdfe4de67b971ff6cea4b51eb0ed` for the initial baseline.
- `@earendil-works/pi-coding-agent` 0.83.0 as the external Pi executable and `@earendil-works/pi-tui` 0.83.0 for the TUI component boundary.
- Node.js 24.19.0 for BITCH development and the tested MVP unless the copied baseline proves an incompatibility that requires an explicit contract update.
- all npm dependencies through the committed lockfile.

Paseo launches the external Pi executable and does not declare Pi as an npm dependency. Phase 1 must verify that the copied adapter works with `@earendil-works/pi-coding-agent` 0.83.0 before source adaptation proceeds.

A later Paseo or Pi sync is an explicit BITCH change. It must preserve Pi-only product behavior and pass the public behavioral suite.
