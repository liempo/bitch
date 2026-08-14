# Phase 3: Projects, Workspaces, and Terminals

## Outcome

Deliver Paseo-native Project, Workspace, managed-worktree, and interactive Terminal behavior through the BITCH daemon protocol.

## Dependencies

Complete Phase 2. Use [`../product/workspaces.md`](../product/workspaces.md), [`../architecture/storage.md`](../architecture/storage.md), [`../architecture/protocol.md`](../architecture/protocol.md), and [`../testing.md`](../testing.md).

## Phase boundaries

This phase owns Project and Workspace identity, local and managed-worktree placement, archive and recovery, PTY lifecycle, Terminal stream restoration, and multi-client Terminal behavior.

This phase does not complete the full CLI, implement the TUI canvas, or add remote-daemon routes.

## Required outcomes

- Projects use exact lexical roots, and Projects and Workspaces use opaque stable IDs.
- Local and managed-worktree Workspaces preserve placement, same-path isolation, deterministic selection, archive, and recovery rules.
- One Workspace can own multiple Pi Conversations and named interactive Terminals.
- Real PTYs support binary input, output, resize, snapshots, bounded scrollback, revision replay, detach, explicit kill, and shutdown teardown.
- Multiple clients can observe and write to one Terminal while Paseo size-claim ownership remains authoritative.
- Public protocol tests use real directories, Git repositories, worktrees, and PTYs.

## Exit condition

One Workspace can contain multiple Pi Conversations and interactive Terminals. Workspace identity, filesystem effects, reconnect, and multi-client size behavior match the pinned Paseo baseline.
