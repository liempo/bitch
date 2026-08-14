# Project and Workspace Behavior

## Status

Approved MVP product specification. Implementation is pending.

## Resource hierarchy

BITCH follows Paseo's hierarchy:

```text
Daemon
└── Project
    └── Workspace
        ├── Pi Conversations
        ├── interactive Terminals
        └── client panels
```

The Workspace is the primary work container. A Conversation and a Terminal are peer resources with independent lifecycles.

## Project identity

A Project represents one exact root selected on one daemon.

The daemon normalizes the root lexically with the platform path resolver. It does not use `realpath` as Project identity.

A new Project gets an opaque daemon-local ID. Project membership remains stable. Later Git discovery can change metadata, but it does not change the Project ID, root, or Workspace foreign keys.

Project identity belongs to one daemon. Clients do not merge Projects across daemons. A copied persisted `projectKey` can group equivalent roots for presentation in a later multi-host client, but it never changes ownership or identity.

## Workspace identity

A Workspace belongs to exactly one Project and has one concrete `cwd`.

The Workspace ID is opaque. Clients must not parse it as a path. Filesystem operations use `cwd` or another explicit directory field.

Multiple Workspaces can use the same `cwd`. They keep these items separate:

- Conversations.
- Terminals.
- panel layout.
- names.
- lifecycle state.
- other Workspace-owned client state.

Directory-derived state can be shared when Paseo keys it by daemon and `cwd`.

## Isolation kinds

The MVP supports Paseo's two user-facing isolation choices:

- **Local** uses an existing directory.
- **Worktree** creates or opens a managed Git worktree.

A local Workspace does not create filesystem isolation. A managed-worktree Workspace uses a separate checkout and branch.

A Workspace can exist before it contains a Conversation. The user can open Terminals or other retained Workspace surfaces first.

## Directory opening

Directory opening follows Paseo's complete deterministic exact-path selection behavior.

- If active exact-path Workspaces exist, opening the path selects one deterministically.
- Multiple active matches do not cause creation only because there is more than one match.
- If the selected exact-path Workspace is archived and its Project can be used, opening restores it according to Paseo's path flow.
- If no reusable exact-path Workspace exists, the daemon creates the needed local Project and Workspace.

Explicit Workspace creation always mints a new Workspace. A bare Conversation run without explicit or ambient Workspace context creates a new local Workspace for the current directory. This remains true when another Workspace already uses that directory.

An explicit Workspace selection, an agent-scoped invocation, or a Workspace Terminal context reuses its existing Workspace.

## Archive behavior

Archive is the Paseo-native lifecycle action for Projects, Workspaces, and Conversations.

Archiving a local Workspace:

- archives its BITCH-owned records and resources.
- preserves the existing directory and files.
- never recursively deletes an ordinary directory that BITCH does not own.

Archiving a managed-worktree Workspace:

- archives its owned resources.
- removes the backing BITCH-managed worktree only after its final active Workspace reference is archived.
- retains placement metadata needed for recovery.

Workspace archive ends its live Terminals and archives its Conversations through Paseo's retained lifecycle path.

## Recovery

A local Workspace can recover when its referenced directory remains available.

A managed worktree can recover from its persisted main-repository root, backing worktree root, relative `cwd`, and base-branch metadata.

Recovery uses the Workspace record as placement authority. It does not infer ownership from an arbitrary directory after that directory is missing.

BITCH-specific Workspace Trash, tombstones, retention periods, and permanent file deletion are deferred.

## Concurrent work

A Workspace can own multiple concurrent Pi Conversations and multiple Terminals.

Different Conversations and Terminals can modify the same directory concurrently. The MVP copies Paseo behavior and does not add a Workspace write lock.

## Trust and host access

The daemon runs on the machine that owns the Workspace directory. Pi, Pi extensions, and terminal processes receive the daemon user's host permissions.

Remote clients do not send client filesystem paths as local resources. Every Workspace path refers to the selected daemon's host filesystem.

Project-local Pi trust and resource behavior follows the installed Pi process and Paseo's launch path. BITCH does not declare every remote Workspace trusted through a separate BITCH policy.

## Deferred behavior

Defer these non-baseline additions until after the MVP:

- generic BITCH-managed folders.
- a separate Folder resource.
- rootless Projects.
- BITCH-owned Git clone management beyond retained Paseo workflows.
- Workspace Trash and permanent directory deletion.
- Docker-based isolation.
- cross-daemon Workspace synchronization or movement.
