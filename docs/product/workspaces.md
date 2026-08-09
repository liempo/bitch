# Workspace Behavior

## Status

Approved first-release product specification. Implementation is pending.

## Mode boundary

Directory mode has one fixed `cwd` and no workspace management.

Gateway mode owns directories under `/data/workspaces`. It supports workspace discovery, creation, rename, Git initialization, repository cloning, Trash, restoration, and permanent deletion.

Each gateway has an independent workspace namespace. A client identifies a workspace with its gateway ID and workspace ID.

A gateway path always refers to that gateway's filesystem. It never refers to the client filesystem.

A local gateway does not mount the client's current directory automatically. Directory mode is the explicit path for work on the current host directory.

## Discovery and default workspace

Gateway mode discovers each immediate real directory under `/data/workspaces`. This includes directories added through the mounted volume, container administration, or agent tools.

`/data/workspaces/default` is the shared default workspace inside one gateway. A new gateway conversation uses it unless the user selects another workspace. The default workspace cannot move to Trash.

## Workspace actions

The first release can:

- open an existing workspace.
- create an empty folder.
- create a folder and initialize a Git repository.
- clone a Git repository.
- change a workspace display name.
- move a workspace to Trash.
- restore a workspace.
- delete a trashed workspace permanently.

New workspaces remain under `/data/workspaces` in their gateway.

If an operator or tool removes a workspace directory outside BITCH, the gateway marks only that workspace **Workspace missing**. It keeps unrelated workspaces available, makes the missing workspace's conversations read-only, and rejects new work there. It never recreates an empty replacement automatically.

A valid real directory restored at the recorded immediate path restores that workspace on the next reconciliation scan. It keeps the existing workspace ID.

A symbolic link is not a valid restoration. BITCH does not infer an external rename. The old workspace remains missing. BITCH discovers the new directory as a new workspace.

The gateway image includes `git` and `gh`. BITCH does not manage GitHub authentication or call the GitHub API. The operator configures authentication inside each gateway.

Repository clone supports HTTPS and SSH URLs. Private access uses credentials already configured inside the selected gateway, such as an SSH key, SSH agent, or Git credential helper. Clone requests never contain a token, password, private key, or credential payload.

BITCH disables interactive Git and SSH prompts. The operator must configure credentials, host trust, and any key unlocking before cloning. A failed authentication or unknown host fails the workspace operation without leaving a visible partial workspace.

Changing a display name does not rename or move the directory. Existing Pi sessions store the workspace path.

## Stable identity

Each workspace has a stable UUID within its gateway. A rename, Trash operation, or restoration does not change it.

Each gateway session is associated with one workspace ID. BITCH retains a minimal workspace tombstone after permanent workspace deletion. Preserved sessions keep their association and display name.

## Trash rules

A workspace or session has a nullable Trash timestamp. A null value means active.

A session appears in Session Trash when its own Trash timestamp is set or its workspace is trashed.

Moving a workspace to Trash:

1. Moves its directory under `/data/trash/workspaces`.
2. Sets only the workspace Trash timestamp.
3. Leaves its session files and session timestamps unchanged.

Restoring the workspace clears its Trash timestamp. Sessions without their own Trash timestamp become active again.

Restoration requires the original active path to be unused. A conflict returns `workspace_directory_conflict` and leaves the trashed workspace unchanged.

An individually trashed session remains in Session Trash after its workspace is restored.

Moving one session to Trash moves its JSONL file under `/data/trash/sessions` and sets the session Trash timestamp.

The user must stop an active session before moving it to Trash. The user must stop all active sessions before moving their workspace to Trash.

## Destructive-action safeguards

Moving an item to Trash is recoverable. The explicit non-interactive `trash` command is sufficient confirmation and does not require another flag. The TUI shows one confirmation dialog before it submits a Trash action.

Permanent deletion is not recoverable through BITCH. A non-interactive CLI command requires `--confirm RESOURCE_ID`, and that value must equal the resource ID being deleted. The CLI never asks on stdin. The TUI shows a separate destructive sheet that identifies the item and explains exactly which data is destroyed or retained.

A missing or different CLI confirmation fails before the HTTP request. API `DELETE` remains an explicit low-level operation and does not add a presentation-confirmation field.

Restore operations need no confirmation. Active-resource safeguards and the protected default workspace apply before every destructive action.

## Session Trash presentation

Normal conversation views hide trashed sessions. Session Trash includes:

- individually trashed sessions.
- sessions inherited from a trashed workspace.
- sessions retained after permanent workspace deletion.

An inherited session shows **Workspace trashed**. The user cannot restore it separately while its workspace remains trashed.

Permanently deleting a workspace removes its files. Its sessions remain in Session Trash with **Workspace missing**. These sessions are read-only and cannot be restored. Their server-owned exports remain associated with them. The user can delete each session permanently, which also deletes that session's exports.

Trashed items have no automatic retention deadline in the first release. They remain until the user removes them.

## Concurrent work

Different conversations can modify the same workspace concurrently. BITCH does not lock workspaces or manage worktrees.

## Trust and project resources

Directory mode copies Pi's project-trust behavior and supports `/trust`.

Gateway mode treats each workspace as trusted and does not show `/trust`. Project settings can load extensions and install configured packages. These processes receive container permissions.

Container mounts and filesystem permissions form the security boundary.

BITCH keeps Pi project-local resource discovery:

- `.pi/extensions/`.
- `.pi/skills/`.
- `.pi/prompts/`.
- `.pi/settings.json`.
- `.agents/skills/`.
- `AGENTS.md` files.

BITCH does not replace these paths with branded paths.
