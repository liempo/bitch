# BITCH Glossary

## Purpose

Use these terms consistently in product, architecture, plan, code, and interface text.

## Product terms

### BITCH

**Barely Intelligent Task & Context Handler.** Write the product name as `BITCH`.

### MVP

The first personal usable BITCH delivery. It copies the pinned Paseo daemon baseline, supports only Pi, and includes CLI and TUI clients.

### Paseo-native

Observable behavior copied from Paseo source with package version 0.3.1 at the pinned commit. The pinned commit is later than the `v0.3.1` tag.

A Paseo-native behavior can use BITCH names and Pi-only provider filtering without becoming a BITCH-specific improvement.

### BITCH-specific improvement

Behavior that the pinned Paseo baseline does not provide or that changes its observable contract.

Defer these improvements until the MVP works unless an approved document explicitly includes one.

## Host terms

### daemon

The host-native BITCH server process. It owns Pi RPC subprocesses, PTYs, Projects, Workspaces, Conversations, timelines, and host filesystem access.

Use **daemon**, not **Gateway**, **Agent Server**, or **backend**, for this component.

### local daemon

The daemon on the client's own machine. A client registers it on `localhost` by default and can manage its lifecycle.

### remote daemon

A daemon on another machine. The client reaches it through a direct or encrypted relay route.

### daemon ID

The stable server-owned identity for one daemon home. It survives route and process changes.

### daemon route

One direct, IPC, or relay connection path to a daemon.

A route is not daemon identity. Multiple routes can refer to one daemon ID.

### daemon registry

The client-owned set of saved daemon identities, routes, labels, and current selection.

It contains no authoritative Conversation or Workspace state.

### selected daemon

The one daemon targeted by a client action or active client view.

If it is unavailable, it remains selected. BITCH does not select a different daemon automatically.

### managed localhost daemon

The local daemon whose lifecycle a client installation manages.

Removing localhost disables that management. It stops the daemon only when that client owns the managed process. It preserves durable data and leaves an independently started daemon running.

## Resource terms

### Project

A stable daemon record for one exact lexically normalized root directory.

A Project contains Workspaces.

### Workspace

The primary work container. It belongs to one Project, has one concrete `cwd`, and contains Conversations, Terminals, and client panels.

### local Workspace

A Workspace that uses an existing directory without creating isolation.

### managed-worktree Workspace

A Workspace backed by a Git worktree that BITCH owns and can remove after its final active reference is archived.

### Workspace ID

An opaque daemon-local identifier. Never parse it as a path.

### current working directory (`cwd`)

The daemon-host directory in which Pi or a Terminal runs.

A remote Workspace `cwd` is a path on the remote daemon host, not on the client.

### panel

A client view inside a Workspace canvas. Conversation and Terminal panels can appear as tabs or split panes.

### Workspace canvas

The tab-and-split client presentation for one Workspace.

Paseo provides this behavior in its graphical app. BITCH implements it in the TUI.

## Conversation terms

### Conversation

A BITCH-managed Pi chat resource. It has one BITCH identity, one Workspace, one live normalized timeline when loaded, and one native Pi persistence handle.

Use **Conversation** in BITCH user-facing text.

### Pi session

The native Pi JSONL conversation used for Pi history, import, and resume.

A Pi session ID is not necessarily the BITCH Conversation ID.

### Pi RPC subprocess

The `pi --mode rpc` process owned by a live Conversation.

Daemon shutdown ends the subprocess. A later operation can resume the Pi session in a new subprocess.

### normalized timeline

The daemon-owned, Paseo-derived sequence of projected Conversation items used by BITCH clients.

It is authoritative for client synchronization, pagination, and rendering while the Conversation is loaded. The pinned baseline reconstructs it from Pi history after daemon restart.

### timeline row

One runtime daemon source event with epoch and sequence coverage. Timeline rows are runtime-only in the MVP.

Projection can merge rows into one display item without losing source coverage.

### live timeline

Immediate WebSocket delivery of new timeline events.

Live delivery is not a substitute for authoritative timeline reads.

### native Pi handle

Provider-private data used to resume a Pi session. For Pi, this includes the JSONL session path.

### Conversation archive

Paseo's soft-delete lifecycle. It hides the Conversation and closes its live Pi process while preserving durable records and history.

### question permission

The normalized daemon request created from a Pi extension `select`, `confirm`, `input`, or `editor` dialog.

## Terminal terms

### Terminal

A daemon-owned interactive PTY in one Workspace.

A Terminal is not Pi's `!` command, the model's `bash` tool, or a Pi TUI process.

### Terminal snapshot

A daemon-produced screen and bounded scrollback state used when a client subscribes or catches up.

### terminal stream slot

A connection-local byte used to identify one subscribed Terminal in binary frames.

### terminal size claimant

The client session that currently owns PTY resize updates for one Terminal.

A claim transfers ownership. A non-owner update is ignored. This ownership does not restrict input.

### terminal writer lease

A proposed single-writer restriction. The MVP does not use one because Paseo permits multiple writers.

## Pi terms

### Pi

The only supported BITCH agent runtime.

Pi can use multiple model providers. A Pi model provider is not a separate BITCH agent runtime.

### Pi extension

Trusted code loaded by the Pi subprocess through standard Pi discovery.

Clients do not load Pi extensions.

### Pi integration extension

The small Paseo-derived extension injected into Pi for stable entry capture, submitted-message identity, and tree navigation.

### transferable Pi UI

Pi extension interaction that the Paseo adapter can map into daemon protocol data.

The MVP transfers question dialogs. Terminal components and render functions are not transferable.

### terminal-only Pi UI

Pi extension components, custom renderers, editors, overlays, shortcuts, themes, headers, footers, and raw terminal input that require Pi's native TUI.

This behavior is deferred.

## Protocol terms

### daemon protocol

The Paseo-derived WebSocket protocol used by every BITCH client.

### direct route

A client connection directly to a daemon TCP or IPC listener.

### relay route

A connection through the Paseo-derived relay using authenticated end-to-end encryption.

### pairing offer

A QR code or link that carries the daemon identity, relay endpoint, and daemon public key needed to create a trusted relay route.

Treat it as a credential.

### client replica

A non-authoritative client display cache for daemon snapshots and timeline items.

### request ID

A protocol correlation value for one request and response. It is not a durable command receipt.

## Storage terms

### `BITCH_HOME`

The planned branded daemon data root selected by the environment variable of the same name.

The initial Paseo source import can retain `PASEO_HOME` and `~/.paseo` until a tested migration introduces `BITCH_HOME`. Client registry and display cache files remain client-owned state outside daemon authority.

### Pi agent directory

Pi's standard configuration and session root, normally `~/.pi/agent`.

### runtime-only

State that ends with the daemon process. PTYs, terminal scrollback, and normalized timeline rows are runtime-only in the MVP.

### authoritative

The source a component must use to repair or decide state.

The loaded daemon timeline is authoritative for BITCH clients. Pi JSONL is the durable authority for Pi and for native discovery, import, resume, and post-restart timeline reconstruction.

## Deferred client terms

### graphical app

The deferred shared Expo and React Native application inspired by Paseo's app package.

### desktop shell

The deferred Electron wrapper around the graphical app. It can bundle and manage a local daemon and CLI.

### macOS desktop app

The deferred BITCH graphical client for macOS. It uses the approved shared Expo, React Native Web, and Electron architecture. Do not call it a native SwiftUI app.

## Terms to avoid

### Directory mode

Removed. Use a local daemon and local Workspace.

### Gateway mode

Removed. Use a selected daemon.

### gateway

Removed as a product object. Use **daemon**.

### master gateway

Removed. Use **selected daemon** or an explicit saved daemon.

### Agent Server

Do not use for the revised runtime. Use **daemon**.

### agent provider

Avoid this phrase when it can confuse agent runtimes with Pi model providers. Say **Pi runtime** or **Pi model provider**.

### fallback daemon

BITCH has no fallback execution. A route can reconnect to the same daemon ID, but work never moves to another daemon automatically.
