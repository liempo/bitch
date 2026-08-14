# Storage Architecture

## Status

Approved first-release storage architecture and deferred native registry-sharing contract. See [`recovery.md`](recovery.md) for recovery behavior.

## Ownership rule

Pi JSONL is the source of truth for conversation content. BITCH must not copy completed messages or tool results into a second store.

Directory mode has no BITCH-owned workspace catalog. It derives conversation data from Pi JSONL and filesystem state.

Each gateway stores only BITCH-owned metadata that Pi does not provide.

## Storage isolation

BITCH uses separate storage domains:

- one shared per-user Directory-mode store.
- one independent `/data` root for each local gateway.
- one independent `/data` root owned by each remote gateway operator.
- one client gateway registry under `BITCH_HOME`.

A local gateway never shares credentials, sessions, workspaces, Trash, or `SOUL.md` with another gateway.

The client registry stores connection and local lifecycle data. It does not store conversation content or workspace metadata.

## Gateway persistent layout

Each gateway uses one writable persistent data root mounted at `/data`:

```text
/data/
├── config/       # Pi settings, credentials, extensions, and instructions
├── sessions/     # Pi JSONL sessions
├── workspaces/   # gateway workspaces
│   └── default/
├── trash/
│   ├── sessions/
│   └── workspaces/
├── artifacts/
├── state/        # identity, catalog, receipts, and recovery operations
└── secrets/
```

Temporary process state, locks, and sockets use `/run/bitch`. They do not use the persistent data root.

BITCH-owned state files use mode `0600`. BITCH-owned state directories use mode `0700`.

A local gateway uses a runtime-neutral host data directory. Docker mounts that directory at `/data`.

Each local backend uses this gateway storage layout. A gateway keeps its creation-time backend. Deferred Apple `container` support creates a separate gateway and does not open or convert an existing Docker gateway data root.

## Gateway identity

Each gateway stores one server-owned stable ID in its persistent state. The ID survives:

- endpoint changes.
- alias changes.
- port changes.
- container replacement.
- Agent Server upgrades.

The gateway ID is a UUID v4. Gateway initialization creates it before the gateway creates a catalog, workspace, or session. Managed local creation uses the shared identity-store adapter before container startup. An externally managed gateway initializes it inside the Agent Server. The identity record uses these files:

```text
/data/state/gateway.json
/data/state/gateway.json.bak
```

The versioned JSON record contains only its schema version and gateway ID. The initializer generates the ID once. It writes the backup atomically before it writes the primary atomically.

Each write flushes its temporary file and the state directory. A crash between writes leaves a valid backup for startup recovery. The gateway never generates a replacement ID for a nonempty data root.

At startup, the gateway validates the primary record. It restores the backup when only the primary record is invalid. If neither record is valid, the gateway remains unavailable until the operator restores a valid identity record from backup.

A complete data-root copy preserves the gateway ID and represents restoration of the same gateway. The first release does not support cloning a gateway as a new gateway or changing its ID. Clients reject concurrent registrations of copied data that report the same gateway ID.

A gateway ID scopes its conversation and workspace IDs. It does not identify a client registry entry or endpoint.

## Gateway metadata

Gateway mode uses a versioned JSON catalog:

```text
/data/state/
├── catalog.json
├── catalog.json.bak
├── creation-receipts/
├── operations/
└── receipts/
```

The version 1 catalog has this top-level shape:

```json
{
  "schemaVersion": 1,
  "revision": 42,
  "workspaces": [],
  "sessions": [],
  "workspaceTombstones": []
}
```

Arrays sort by stable resource ID before serialization. The revision starts at zero and increases for each committed catalog mutation.

A compatible catalog reader preserves unknown additive fields during rewrite. It rejects an unknown enum value that changes required behavior.

### Workspace record

```typescript
interface WorkspaceRecord {
  workspaceId: string;
  directoryName: string;
  relativePath: string;
  displayName: string;
  isDefault: boolean;
  gitState: "none" | "initialized" | "cloned";
  repositoryUrl: string | null;
  createdAt: string;
  discoveredAt: string;
  updatedAt: string;
  activityAt: string;
  trashedAt: string | null;
}
```

`directoryName` is one filesystem segment. An active `relativePath` is `workspaces/DIRECTORY_NAME`. A trashed `relativePath` is `trash/workspaces/WORKSPACE_ID`.

The default record always has `workspaceId`, `directoryName: "default"`, `relativePath: "workspaces/default"`, `isDefault: true`, and `trashedAt: null`.

Discovery assigns `createdAt` and `discoveredAt` to the discovery time when filesystem birth time is unavailable. Changing a display name changes only `displayName` and `updatedAt`.

A catalog record whose `relativePath` has no real immediate directory projects as `state: "missing"`. The catalog record remains unchanged and receives no tombstone or Trash timestamp. Its sessions remain in their existing locations and project as read-only **Workspace missing** conversations.

### Gateway session record

```typescript
interface GatewaySessionRecord {
  conversationId: string;
  workspaceId: string;
  sessionPath: string;
  createdAt: string;
  discoveredAt: string;
  activityAt: string;
  viewedAt: string | null;
  completedAt: string | null;
  lastOutcome: "none" | "success" | "failed" | "stopped";
  trashedAt: string | null;
  interruptedRun: {
    commandId: string;
    interruptedAt: string;
    reason: "serverRestart";
  } | null;
}
```

`conversationId` is the Pi session-header ID. `sessionPath` is normalized below `/data/sessions` or `/data/trash/sessions`. The record does not copy a title, message, tool call, result, model, or branch entry from Pi JSONL.

`activityAt` is the latest accepted command, durable Pi entry, run settlement, name change, Trash change, or restoration for that conversation. `completedAt` is the latest successful `agent_settled` time. `viewedAt` is gateway-global and changes only through an explicit viewed mutation or foreground TUI stream. Read-only requests do not change it. `completedSinceViewed` is derived as `completedAt > viewedAt`, with `null` older than every timestamp.

`lastOutcome` records only the latest settled user-visible outcome. Live **Working** and **Needs input** states come from the runtime snapshot. A failed or stopped outcome remains until later successful work changes it.

### Workspace tombstone

```typescript
interface WorkspaceTombstone {
  workspaceId: string;
  displayName: string;
  formerDirectoryName: string;
  deletedAt: string;
}
```

Permanent workspace deletion removes its `WorkspaceRecord` and creates one tombstone in the same catalog commit. Session records retain the tombstoned workspace ID and become read-only with **Workspace missing**.

### Conversation projection

The public Conversation projection follows [`protocol.md`](protocol.md). It combines the retained record, Workspace state, provider history, and live runtime state without storing a second record.

The projected Trash fields use this precedence:

1. If a workspace tombstone exists, use `trashReason: "workspaceMissing"` and the tombstone `deletedAt` value.
2. If the session has `trashedAt`, use `trashReason: "individual"` and that value.
3. If the active workspace has `trashedAt`, use `trashReason: "workspace"` and that value.
4. Otherwise, use `trashReason: null` and `trashedAt: null`.

An externally missing active workspace follows the fourth rule. Its conversations are read-only but are not in Session Trash.

### Catalog invariants

- Workspace IDs, conversation IDs, and active directory names are unique.
- Each session references one workspace record or tombstone.
- Only the protected default record has `isDefault: true`.
- A tombstone and active workspace cannot share an ID.
- A trashed session path and timestamp change in one recoverable operation.
- An inherited Trash state comes from the workspace and does not change the session `trashedAt`.
- UTC timestamps use RFC 3339 with millisecond precision.

Crash-recovery operation records use `/data/state/operations/OPERATION_ID.json`.

One server-owned mutation queue serializes catalog writes. A write validates the next state and flushes a temporary file. It retains the previous valid catalog as `catalog.json.bak`.

The server replaces `catalog.json` atomically and flushes the state directory.

At startup, the server validates the catalog. If necessary, it restores the backup and reconciles catalog records with sessions, workspaces, Trash, and operation records. [`recovery.md`](recovery.md) defines failure, operation recovery, and schema migration behavior.

### Gateway command receipts

Each gateway command has one receipt at:

```text
/data/state/receipts/CONVERSATION_ID/COMMAND_ID.json
```

The version 1 file contains `schemaVersion` and all fields from the public `CommandReceipt`. The command variant determines the stored result schema. A failed or interrupted receipt includes `ProblemDetails` with a stable code.

Command IDs are unique among retained receipts in the gateway data store. New-conversation acceptance first writes `/data/state/creation-receipts/COMMAND_ID.json`.

The creation receipt records the allocated Pi session ID, payload hash, and acceptance state. A recoverable operation commits the addressable session record and conversation receipt before Pi can request interaction. Successful preflight updates and retains the creation receipt for later POST retries.

A matching retry reads the creation receipt. Terminal preflight failure retains a failed creation receipt but removes uncommitted session content, metadata, and the conversation receipt.

Each receipt transition flushes a temporary file, replaces the target atomically, and flushes the containing directory.

Moving a conversation to Trash leaves its receipt directory in place. Restoration reuses the receipts. Permanent conversation deletion stages the receipt directory with the Pi JSONL and export directory.

## Client gateway registry

The registry uses these paths:

```text
BITCH_HOME/client/
├── registry.json
├── registry.json.bak
├── registry.lock
├── operations/
└── recovery/
```

`registry.json` uses this version 1 shape:

```json
{
  "schemaVersion": 1,
  "revision": 7,
  "masterGatewayId": "550e8400-e29b-41d4-a716-446655440000",
  "gateways": [
    {
      "alias": "work",
      "gatewayId": "550e8400-e29b-41d4-a716-446655440000",
      "kind": "local",
      "endpoint": "http://localhost:49152",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z",
      "runtime": {
        "driver": "docker",
        "dataRoot": "gateways/550e8400-e29b-41d4-a716-446655440000/data",
        "containerName": "bitch-gateway-550e8400e29b41d4a716446655440000",
        "port": null,
        "uid": 501,
        "gid": 20,
        "imageKey": "BITCH_VERSION:BUILD_CONTEXT_HASH"
      }
    }
  ]
}
```

`masterGatewayId` is a gateway UUID or `null`. `kind` is `local` or `remote`. A remote entry omits `runtime`.

A local runtime driver is `docker` or `apple`. Only Docker is implemented in the first release. A local `port` is an integer from 1 through 65535 or `null` for automatic host-port selection. All record paths are relative to `BITCH_HOME` and normalized.

The gateway array sorts entries by ascending ASCII alias. Aliases and gateway IDs are unique. Timestamps use UTC RFC 3339 with millisecond precision. The revision starts at zero and increases by one for each committed mutation.

A compatible reader preserves unknown additive fields during rewrite. It rejects an unknown enum value that changes required behavior.

The first registered gateway becomes master. Renaming an alias does not change the master UUID. Deleting the master sets `masterGatewayId` to `null`.

The registry is the only client-owned gateway inventory. BITCH keeps no separate inventory for unregistered gateways. Deleting an entry removes its endpoint and local runtime information without changing the Agent Server or its data.

### Registry writes and recovery

Every registry mutation acquires `registry.lock` through `proper-lockfile`, reloads the latest valid primary file, validates the next state, and increments the revision.

The writer completes these steps while it holds the lock:

1. Create a mode `0600` temporary file in the client directory.
2. Flush the temporary file.
3. Preserve the previous valid primary as `registry.json.bak`.
4. Replace the primary atomically.
5. Flush the client directory.
6. Release the lock.

`BITCH_HOME` and its directories use mode `0700`.

At startup, BITCH uses the valid primary file. If only the backup is valid, it restores the primary atomically and reports recovery. If neither file is valid, registry operations fail with `registry_recovery_required`. BITCH does not create an empty registry, scan gateway data, delete containers, or select a fallback gateway.

A new installation creates an empty version 1 registry only when neither registry file nor recovery evidence exists. An unknown newer schema fails with `registry_schema_unsupported`. A recognized older schema receives a recovery copy before atomic migration.

### Deferred native macOS access

The deferred native app reads and writes these same registry files. It implements the same lock lease, permission, backup, atomic replacement, revision, migration, and recovery rules. It does not import or copy the registry and does not use the CLI as a broker.

The app observes revisions from other processes and keys presentation by gateway ID. It stores only its last selected gateway ID in non-synchronized app preferences. [`macos-client.md`](macos-client.md) defines startup and active-connection behavior.

## Identifiers

A conversation ID is the `id` from its Pi JSONL session header. Moving the session file into or out of Trash does not change it.

A gateway workspace receives a UUID when first discovered. Rename, Trash, restoration, and display-name changes do not change it.

Clients use these composite references outside one gateway connection:

```text
(gatewayId, conversationId)
(gatewayId, workspaceId)
```

Command IDs and event stream IDs use separate UUID namespaces. They do not identify durable domain objects.

The catalog stores normalized paths relative to `/data`. It does not store host paths or container-specific absolute paths.

## `BITCH_HOME` layout

`BITCH_HOME` selects the per-user BITCH data root. Its default macOS location is:

```text
~/Library/Application Support/BITCH/
```

The complete first-release host layout is:

```text
BITCH_HOME/
├── client/
│   ├── registry.json
│   ├── registry.json.bak
│   ├── registry.lock
│   ├── operations/
│   └── recovery/
├── directory/
│   ├── config/
│   ├── sessions/
│   ├── trash/sessions/
│   ├── state/creation-receipts/
│   ├── state/receipts/
│   └── recovery/sessions/
└── gateways/
    ├── .creating/OPERATION_ID/data/
    └── GATEWAY_ID/data/
```

Client operation records cover registry and managed-local lifecycle mutations. A successful local creation moves its staged data root from `.creating/OPERATION_ID` to the stable gateway-ID path before it commits the registry entry.

An unregistered local data root can remain under `gateways/`, but BITCH does not scan or track it. The operator owns it after registry deletion.

The first release uses host directories rather than Docker named volumes. A later backend uses the same layout for a newly created gateway with its own identity and root.

## Directory-mode local storage

Directory-mode Agent Servers share Pi configuration, sessions, Session Trash, command receipts, and recovery copies across invocations. Each process keeps transient state separate and receives its own fixed identity-mounted `cwd`.

The container uses these Pi overrides:

```text
PI_CODING_AGENT_DIR=/bitch/directory/config
PI_CODING_AGENT_SESSION_DIR=/bitch/directory/sessions
```

The CLI bind-mounts the matching `BITCH_HOME/directory` subdirectories at those container paths. It does not use Pi's default cwd-derived session directory outside the mounted session root.

Directory mode does not use gateway workspaces, a gateway catalog, persistent artifacts, or a `/data/secrets` directory.

### Directory-mode command receipts

Each validated command has one receipt at:

```text
BITCH_HOME/directory/state/receipts/CONVERSATION_ID/COMMAND_ID.json
```

Command IDs are unique among retained receipts in the shared Directory-mode data store. New-conversation acceptance first writes `state/creation-receipts/COMMAND_ID.json`.

The creation receipt records the allocated Pi session ID, payload hash, and acceptance state. The process publishes the addressable conversation receipt before Pi can request interaction. Successful preflight updates and retains the creation receipt for later POST retries.

A matching retry reads the creation receipt. Terminal preflight failure retains a failed creation receipt but removes uncommitted session content and the conversation receipt.

A version 1 receipt contains:

- `schemaVersion`.
- `commandId`.
- `conversationId`.
- `commandType`.
- the lowercase SHA-256 digest of the RFC 8785 canonical validated payload.
- `state`: `accepted`, `running`, `completed`, `failed`, or `interrupted`.
- `acceptedAt` and `updatedAt` timestamps.
- `settledAt` for a terminal state.
- the command-specific `result` for a successful command when that command returns data.
- the public `ProblemDetails` value with a stable code for a failed or interrupted command.

These fields match the former public command-receipt contract. The file also contains `schemaVersion: 1`. Receipt and creation-receipt files use mode `0600`.

The Agent Server writes and flushes `accepted` atomically before it invokes Pi. Each later state transition uses atomic replacement and flushes the containing directory. A retry with the same command ID and payload returns the receipt. Reuse with another payload returns `command_id_conflict`.

Receipts remain while their Pi session exists. Moving a session to Trash leaves its receipt directory under `state/receipts`. Restoring the session reuses those receipts. Permanent session deletion removes the JSONL file, conversation receipt directory, and successful creation receipt. Directory mode does not use a gateway catalog for receipt lookup.

Concurrent Directory-mode processes cannot mutate one conversation because the Pi session lock is exclusive. During startup recovery, a process does not interrupt receipts for a session locked by another process. After it acquires an unlocked session, it changes receipts left in `accepted` or `running` to `interrupted` and never invokes Pi for them again.

## Local gateway storage

Each local gateway owns a separate host data directory under the BITCH-controlled data root. BITCH mounts it at `/data` and never mounts another gateway's data at the same time.

Local gateway workspaces remain under that data root. The current host directory is not mounted into a local gateway automatically.

The local lifecycle layer must prevent two containers or runtime drivers from opening the same gateway data concurrently.

A managed local container uses the invoking user's numeric UID and primary GID. Host files remain owned by that user. Runtime configuration records these numeric values so container replacement uses the same identity.

BITCH validates access before startup. It reports `local_data_permission_denied` when the configured user cannot read and write the required data. It does not recursively change ownership or permissions. The operator repairs incompatible files outside BITCH.

## Locks

Shared Pi configuration files use the pinned Pi version's atomic-write and `proper-lockfile` behavior. BITCH does not add another configuration lock.

Directory-mode command acceptance uses a cross-process `proper-lockfile` lock keyed by command ID. The process releases this lock after publishing the creation or conversation receipt. It does not hold the lock while Pi runs.

Provider login uses a separate cross-process lock keyed by provider ID. The process holds it for the login operation and releases it at terminal settlement.

BITCH holds an exclusive `proper-lockfile` lock for each active Pi JSONL session. It holds the lock for the full `AgentSession` lifetime. A second Agent Server rejects an attempt to open the locked session with `conversation_locked`.

These Directory-mode and session locks use the pinned dependency defaults. The current values are a 10-second stale timeout and an update every five seconds.

## Gateway path boundary

Gateway API operations use workspace IDs and normalized relative paths. They do not accept arbitrary absolute paths.

The server rejects:

- null bytes.
- `..` traversal.
- a canonical target outside the selected workspace.
- symbolic-link workspace roots.
- symbolic-link escapes in API file operations.

A workspace root must be a real immediate directory under `/data/workspaces`.

Server-owned Trash and recursive operations do not follow internal symbolic links. These checks do not change Pi tool behavior. Pi and trusted extensions retain filesystem access allowed by the container.

## Export artifact storage

Gateway HTML exports use:

```text
/data/artifacts/exports/CONVERSATION_ID/
├── ARTIFACT_ID.html
└── ARTIFACT_ID.json
```

The mode `0600` JSON sidecar contains the `ArtifactDescriptor` fields, a SHA-256 content digest, and no server path. The server writes and flushes HTML and metadata through temporary files before it publishes the descriptor.

Moving a conversation to Trash does not move or delete this directory. Permanent conversation deletion stages the Pi JSONL, command receipts, artifact directory, and metadata mutation before commit. Recovery either completes or rolls back the proven operation without leaving a reachable orphan artifact.

Explicit artifact deletion stages its HTML and sidecar together. Permanent workspace deletion does not delete artifacts because its conversations remain as read-only history.

Directory mode keeps exports only under `/run/bitch/exports` until the owning CLI downloads them. It has no persistent artifact sidecars.

## Configuration and secrets

`/data/config` contains Pi settings, provider credentials, Git configuration, skills, extensions, trust data, and instructions. Gateway-owned SSH and other operator-managed secret files belong under `/data/secrets` with restrictive permissions. BITCH reads these files and writes only state it owns.

Directory mode and each gateway own separate provider credentials. `/login` updates the credentials of the selected mode or gateway.

The first release has no server configuration editor outside Pi's standard interfaces. The operator uses the mounted data root or container administration.

Secret values and encryption keys remain outside Git. [`../operations.md`](../operations.md) defines backup, retention, export, and secret-exposure rules.
