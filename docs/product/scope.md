# Product Scope

## Status

Approved MVP product specification. Implementation is pending.

## Goal

BITCH gives one self-hosted user a terminal interface for Pi conversations and interactive shell terminals on local or remote machines.

BITCH follows the observable behavior of Paseo source with package version 0.3.1 at upstream commit [`163e7d1`](https://github.com/getpaseo/paseo/tree/163e7d1cc421cdfe4de67b971ff6cea4b51eb0ed). The exact commit is authoritative. BITCH removes user-visible support for non-Pi agent runtimes. BITCH-specific improvements are deferred until the Paseo-native MVP works.

## MVP workflows

The MVP supports these workflows:

1. Start or resume Pi work in a Workspace on an explicitly selected local or remote daemon.
2. Disconnect a client without stopping daemon-owned Pi work or terminals.
3. Reconnect and repair client state from daemon snapshots and authoritative timeline reads.
4. Open or reattach an interactive terminal beside a Pi conversation.
5. Select another registered daemon without moving, merging, or redirecting work.

The MVP does not include the graphical desktop, mobile, or browser clients.

## Daemon model

The BITCH daemon replaces the former Directory mode and Gateway mode.

Each client installation registers a removable local daemon on `localhost` by default. A client can also register multiple remote daemons. One client action targets one explicitly selected daemon.

Removing localhost disables built-in management. It stops that daemon only when a managed graphical client owns the local process. It does not stop an independently CLI-started daemon.

A daemon owns its host resources:

- Pi RPC subprocesses.
- interactive PTYs.
- Projects and Workspaces.
- live normalized conversation timelines.
- daemon metadata and runtime state.
- access to the host filesystem.

A client observes and controls daemon-owned resources. A client does not own live work.

If the selected daemon is unavailable, it stays selected and appears disconnected. BITCH does not run the action on the local daemon or another remote daemon.

## Pi boundary

Pi is the only supported agent runtime. Each live conversation uses one daemon-managed `pi --mode rpc` subprocess.

The user installs and authenticates Pi separately. The Pi process uses standard Pi configuration and resource discovery, including:

- credentials and model providers.
- settings.
- extensions.
- skills.
- prompt templates.
- themes and project resources where the selected client can present them.
- Pi JSONL sessions.

The daemon maps Pi events into Paseo's normalized timeline and permission model. Pi JSONL remains the durable Pi source for discovery, import, resume, and post-restart history hydration. While loaded, the normalized timeline is authoritative for BITCH client synchronization and rendering.

Terminal-only Pi extension components do not cross the daemon protocol. This limitation includes custom terminal renderers, editors, overlays, and raw terminal input handlers.

## Workspace model

A Project represents one exact selected root on one daemon.

A Workspace belongs to one Project and supplies one concrete `cwd`. A Workspace can contain multiple Pi conversations, interactive terminals, and client panels.

A local Workspace uses an existing directory. A managed-worktree Workspace uses a daemon-created Git worktree. Multiple Workspaces can use the same `cwd` without sharing Workspace-owned state.

## Client model

The MVP includes:

- a non-interactive CLI adapted from Paseo.
- an interactive TUI with Workspace tabs and user-created splits.
- one daemon protocol for local and remote connections.
- direct remote connections.
- Paseo's encrypted relay and pairing behavior.

The TUI copies Paseo's Workspace canvas behavior in a terminal interface. This TUI implementation is BITCH-owned because Paseo implements the canvas in its graphical app.

## Included Paseo-native behavior

The MVP includes the Paseo behavior needed for:

- daemon lifecycle, identity, status, and recovery.
- multiple saved local and remote daemon connections.
- explicit daemon selection without fallback.
- concurrent Pi conversations.
- conversation lifecycle, attention, history, archive, unarchive, and deletion.
- authoritative timeline pagination and live catch-up.
- Pi session discovery, explicit import, and resume.
- Pi model and thinking controls exposed by Paseo.
- Paseo's message queue, stop, rewind, compaction, and auto-compaction controls.
- Pi extension commands and the Paseo question and permission bridge.
- image prompts.
- normalized tool calls, including edit and diff data.
- local and managed-worktree Workspaces.
- Workspace archive and recovery.
- named interactive terminals.
- terminal screen and scrollback restoration while the daemon remains active.
- multiple terminal observers and writers.
- Paseo terminal-size claim and update behavior.
- host-native local daemon operation.
- direct and relay-based remote daemon access.

## Deferred improvements

Defer behavior that is not part of the retained Paseo baseline or is not necessary for the CLI and TUI MVP:

- direct Pi steering and follow-up controls beyond Paseo's queue behavior.
- additional Pi retry controls.
- full Pi tree, fork, clone, naming, and export parity.
- additional transferable Pi extension UI operations.
- terminal-only Pi extension UI.
- BITCH-specific Conversation Trash and permanent-deletion workflows.
- generic managed folders and BITCH-specific Workspace Trash.
- JSONL CLI output not provided by the retained Paseo CLI.
- durable command retry receipts beyond Paseo's protocol behavior.
- provider login managed by BITCH.
- `SOUL.md` management.
- Docker-based Workspace isolation.
- browsers, voice, schedules, services, BITCH or Paseo Agent MCP orchestration, and subagents.
- the shared graphical app and Electron desktop shell.
- mobile and browser clients.
- public packaging and broad platform compatibility.

Other agent runtimes are excluded from the BITCH product. The MVP disables the copied agent-launch Terminal profile UI because it advertises other runtimes and is not needed by the CLI or TUI workflows. Ordinary shell Terminals remain available. A later Pi-only profile catalog is a deferred improvement. Dormant copied source can remain temporarily until tested Pi-only pruning is safe.

## MVP delivery target

The MVP is a personal usable prototype for macOS on Apple silicon.

The daemon runs directly on the host. The same daemon protocol supports the managed local daemon and registered remote daemons. Remote daemon support is part of the MVP.

Source import and adaptation must follow the approved conservative license and provenance policy in [`../architecture/licensing.md`](../architecture/licensing.md).

## Success criteria

The MVP succeeds when:

1. A user can start the local daemon through onboarding or an explicit daemon command.
2. A user can register and select multiple local or remote daemons.
3. An unavailable selected daemon does not cause fallback execution.
4. Pi work and terminals continue after every client disconnects.
5. Reconnection restores daemon state without duplicate timeline items or terminal output.
6. A Workspace can contain multiple Pi conversations and terminals.
7. Multiple clients can observe and control one Pi conversation.
8. Multiple clients can write to one terminal, and size claims follow Paseo behavior.
9. Daemon shutdown ends live Pi RPC subprocesses and PTYs without replaying interrupted turns.
10. Pi sessions can resume through their persisted native handles and rebuild client history from Pi JSONL.
11. Direct and encrypted-relay remote connections pass behavioral tests.
12. No non-Pi agent runtime is available through the public product.
13. Deferred BITCH-specific improvements do not delay the Paseo-native baseline.
