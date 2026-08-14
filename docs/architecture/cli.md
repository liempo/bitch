# CLI and TUI Architecture

## Status

Approved MVP technical specification. Implementation is pending.

## CLI source

The CLI copies and adapts Paseo's Commander-based CLI from the pinned source commit.

BITCH retains the command families required for the Pi-only MVP. It disables or removes commands for excluded agent runtimes and deferred higher-level features.

## Global daemon target

A CLI invocation targets one selected daemon.

An explicit host or daemon option can override the saved selection for that invocation. Without an override, the invocation uses the client registry's selected daemon. When the registry is initialized for the first time, the registered built-in localhost daemon is selected by default.

Ambient Workspace or Conversation context can select a resource only inside that target daemon. It cannot change the daemon target implicitly.

The retained explicit override is `--host <target>`. New registry commands use daemon IDs from the client registry. Selection never falls back after a target has been chosen.

A route can be direct TCP, local IPC, or an encrypted relay offer. The stable daemon ID must match the selected registry entry.

## First-run behavior

The explicit `bitch onboard` flow handles first use when no usable local setup exists. Onboarding:

- initializes daemon configuration.
- starts the local daemon when absent.
- waits for readiness.
- asks before enabling relay unless a non-interactive option supplies the decision.
- prints direct and pairing guidance.

Ordinary commands do not start a missing daemon implicitly.

## Daemon commands

The MVP provides Paseo-equivalent daemon commands for:

```text
bitch daemon start
bitch daemon start --foreground
bitch daemon stop
bitch daemon restart
bitch daemon status
bitch daemon pair
bitch daemon set-password
```

The local lifecycle implementation uses the daemon home and PID evidence. Stop prefers the daemon lifecycle RPC before owner-process signals.

## Daemon registry commands

BITCH adds the smallest CLI surface needed to expose the approved multi-daemon client registry:

- list saved daemons.
- add a direct or pairing route.
- select one daemon.
- show the selected daemon.
- remove a route or daemon connection.
- enable or disable the managed localhost daemon.

These commands mutate client connection state only. They do not move Projects, Workspaces, Conversations, or Terminals.

Removing localhost disables built-in management. The CLI and TUI do not stop an independently started daemon. The deferred graphical client stops localhost only when it owns that managed process. Removing a remote route never stops its daemon.

## Conversation commands

Use **Conversation** in BITCH user-facing text even when copied internal code uses `agent`.

Retain Paseo-equivalent operations for:

- list.
- run or create.
- attach to live output.
- inspect.
- send a queued or immediate message according to lifecycle state.
- wait for settlement.
- stop.
- import a Pi session.
- archive.
- reload or auto-unarchive through open, fetch, resume, or prompt paths.
- delete.
- update title, labels, and thinking settings.
- select the initial model on create or run.
- invoke available Pi commands.

A command can accept a full ID or an unambiguous retained Paseo reference where its copied behavior does so. BITCH does not preserve the former requirement that every command use only a full Conversation ID.

## Workspace commands

Retain Paseo-equivalent operations for:

- open a directory.
- create a local Workspace.
- create a managed-worktree Workspace.
- list.
- rename.
- archive.
- recover.

Workspace IDs are opaque. An explicit path goes through the daemon's deterministic path resolver and provisioning service.

## Terminal commands

Retain Paseo-equivalent operations for:

- create.
- list.
- capture screen or scrollback text.
- send keys.
- kill.

Interactive terminal attachment is part of the TUI panel. Non-interactive send-keys writes directly and does not require a writer lease.

## Permission commands

Retain the Paseo permit workflow needed to list, allow, or deny pending question permissions.

A Pi extension question remains pending in the daemon until a valid client response, Pi cancellation, process exit, or daemon shutdown resolves it.

## Provider commands

Public provider discovery contains only Pi.

Model listing can expose Pi's model-provider catalog. Do not call Pi model providers separate BITCH agent runtimes.

## Output

Copy Paseo's supported human and machine output formats for retained commands.

The MVP does not require the former exact JSON and JSONL schemas. Phase 1 records the copied command outputs before implementation changes them.

Machine output must remain non-interactive and must not include ANSI control sequences or credentials.

## Exit and interruption

A connection failure exits without changing the selected daemon or starting work elsewhere.

`Ctrl-C` while attached detaches unless the command explicitly defines stop behavior. A detach does not abort daemon-owned work.

An explicit stop command requests Pi cancellation. Conversation lifecycle changes only after Pi acknowledges the request or emits terminal turn state.

## TUI process

The TUI uses the built BITCH client package and one selected daemon connection.

It implements:

- a Project and Workspace navigator.
- Workspace tabs.
- user-created horizontal or vertical splits up to the copied four-level depth limit.
- Conversation panels.
- interactive Terminal panels.
- normalized timeline rendering.
- Pi question permission dialogs.
- connection and reconnect state.

The TUI uses `@earendil-works/pi-tui` 0.83.0 from the pinned Pi distribution. It does not run Pi's `InteractiveMode` and does not attach to a raw Pi TUI.

## TUI panel ownership

Panel layout is persistent client state keyed by daemon ID and Workspace ID. It stores panel trees and split sizes, not resource snapshots. Moving or closing a Terminal panel does not change daemon lifecycle. Closing a root Conversation tab invokes Paseo's archive gesture and its running-turn confirmation. Closing a future child-Conversation tab is layout-only.

Daemon resources remain authoritative. Another client can keep a Terminal open after one client closes its panel. A root Conversation archive is global and appears on every client.

## TUI terminal path

A Terminal panel:

1. subscribes and receives a stream slot.
2. restores the current snapshot and scrollback.
3. starts live binary output.
4. sends user input through binary frames.
5. claims PTY size on focus or direct interaction.
6. sends later geometry changes as owner updates.

Unsubscribing detaches the panel without killing the Terminal.

## Deferred commands

Do not include these Paseo commands in the MVP unless a retained dependency requires an internal path:

- non-Pi provider selection.
- scripts and services.
- schedules and heartbeats.
- Hub.
- speech and voice.
- browser automation.
- Agent MCP orchestration or injection.
- subagent management.

Also defer BITCH-specific commands for full Pi RPC parity, `SOUL.md`, Docker gateways, Trash, and durable receipts.
