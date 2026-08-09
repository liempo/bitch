# Recovery Architecture

## Status

Approved first-release technical specification. Implementation is pending.

## Recovery principle

Preserve data before restoring availability. Repair only when durable evidence proves the intended result.

Never infer destructive intent, discard ambiguous data, or replay a command with an uncertain outcome.

## Pi JSONL behavior

The pinned Pi 0.83.0 session loader:

- skips blank and malformed JSONL lines.
- requires the first parsed entry to be a valid session header.
- rejects a nonempty file without a valid header.
- rewrites valid older session versions during migration.
- omits malformed lines when a migration rewrites the file.

BITCH keeps Pi behavior for valid files. It adds safeguards for damaged files.

### Valid sessions

Open a valid session through Pi. Do not replace Pi parsing, migration, or runtime behavior.

Create a byte-for-byte recovery copy before Pi rewrites an older valid session.

### Incomplete final line

Treat an invalid final line after a valid session as an interrupted append.

1. Preserve the original bytes in a recovery copy.
2. Add only the missing line boundary.
3. Let Pi ignore the incomplete entry.
4. Keep earlier valid entries available.
5. Report that recovery occurred.

Do not invent or reconstruct the incomplete entry.

### Ambiguous damage

Damage is ambiguous when a session contains an invalid interior line, missing header, duplicate header, or unsupported newer version.

For ambiguous damage:

- do not rewrite or append to the file.
- keep the original file unchanged.
- make the conversation unavailable for mutation.
- report `session_recovery_required`.
- keep unrelated valid conversations available.

This safeguard is an intentional difference from Pi's permissive malformed-line behavior.

## Gateway identity recovery

At startup, validate `/data/state/gateway.json`. Restore `/data/state/gateway.json.bak` when only the primary record is invalid.

If neither record is valid for a nonempty data root, do not generate a new gateway ID. Keep the process live for diagnosis, fail `/health/ready`, and report `gateway_identity_recovery_required`.

A restored gateway must use the gateway ID in its backup. A copied data root remains the same gateway and must not run concurrently as a second gateway.

## Catalog recovery

At startup:

1. Validate `catalog.json`.
2. If the primary file is valid, use it.
3. If only the primary file is invalid, restore `catalog.json.bak`.
4. Reconcile the restored catalog with operation records and the filesystem.
5. If both files are invalid, refuse to create an empty catalog.

When neither catalog is valid, the process remains live for diagnosis. Gateway metadata APIs remain unavailable, `/health/ready` fails, and the server reports `catalog_recovery_required`.

A missing cataloged workspace directory does not invalidate the catalog or gateway readiness. Reconciliation isolates that workspace as missing and leaves unrelated resources available. It does not create a directory, tombstone the workspace, move sessions, or infer an external rename.

A later real immediate directory at the exact recorded path restores availability with the same workspace ID. A symbolic link, non-directory, or path escape remains missing. If the protected default workspace is missing, implicit conversation creation fails with `default_workspace_missing`. Explicitly selected valid workspaces remain usable.

## Operation records

Write and flush an accepted operation record atomically before changing files. The record contains:

- the operation type.
- affected resource IDs.
- source and destination paths.
- the expected catalog revision.

After restart:

- complete the operation when the record and filesystem prove the next step.
- remove the record when no filesystem change started.
- do not choose between conflicting source and destination states.
- make only affected resources unavailable when the state is ambiguous.
- report `operation_recovery_required` for ambiguous state.

## Trash and restoration

Use a same-volume rename before committing the catalog change.

Permanent deletion uses these steps:

1. Move the item to an internal deletion-staging area.
2. For a conversation, also stage its receipt directory, successful creation receipt, and server-owned export directory.
3. Commit the catalog change or workspace tombstone.
4. Delete the staged files.

A workspace deletion does not stage conversation receipts or exports because its conversations remain as read-only history.

A crash before catalog commit must not remove the only recoverable file copy.

## Runtime recovery boundary

Persist only:

- command receipts.
- interrupted-run status.
- gateway catalog and filesystem operation records.

Do not persist:

- token deltas.
- active partial responses.
- pending extension dialogs.
- extension UI state.
- transient event streams.
- in-memory Pi runtime state.

A restart cancels pending dialogs.

## Client registry and local lifecycle

At client startup, validate `BITCH_HOME/client/registry.json`. Use the primary when valid. Restore `registry.json.bak` atomically when only the backup is valid.

If neither registry file is valid, report `registry_recovery_required`. Do not create an empty registry, scan local data roots, contact endpoints, change containers, or select a gateway. An unknown newer registry schema reports `registry_schema_unsupported`.

A missing primary and backup initializes an empty registry only when no registry recovery evidence exists. Registry recovery never modifies gateway data.

The deferred native macOS app uses the same primary, backup, cross-process lock, schema migration, and recovery contract. It does not create an app-owned fallback registry. A registry repair or migration committed by Swift must remain readable by the current and immediately previous supported TypeScript clients.

The local lifecycle layer must not start two containers against the same gateway data root. It reconciles runtime state only when the registry entry, BITCH ownership labels, mounted data root, and `/v1/status` prove the same gateway ID.

Proven recovery can update transient container and port details, start one stopped owned container, or replace a missing container against the verified data root. It must preserve the gateway ID and runtime configuration.

A missing ownership label, gateway ID mismatch, mount mismatch, multiple candidate containers, or conflicting operation record is ambiguous. BITCH does not start, stop, remove, or adopt a container in that state. It reports `local_gateway_recovery_required` and leaves gateway data unchanged.

A failed container start must not change the recorded gateway identity. No lifecycle or recovery operation changes a gateway's runtime driver or data root.

## Uncertain commands

Change conversation and creation receipts left in `accepted` or `running` to `interrupted` during startup. In Directory mode, first acquire the affected Pi session lock.

Leave receipts unchanged when another process holds that lock. Remove only new-conversation content or metadata that the creation record proves uncommitted.

Never replay an interrupted command. Preserve content that Pi already wrote to JSONL. Do not infer completion from nearby session entries.

The client reloads durable conversation state and lets the user decide whether to continue.

## Catalog schema migration

Migrate only from a recognized older schema version.

1. Create a versioned backup.
2. Apply the known migration.
3. Validate the result.
4. Replace the catalog atomically.

Do not open an unknown newer schema for mutation. Report `schema_version_unsupported`.

Application rollback never restores an older catalog automatically. The operator must select a backup because automatic restoration could discard writes from the newer version.

## Failure information

Recovery errors use these stable codes:

- `gateway_identity_recovery_required`.
- `local_gateway_recovery_required`.
- `registry_recovery_required`.
- `registry_schema_unsupported`.
- `session_recovery_required`.
- `catalog_recovery_required`.
- `operation_recovery_required`.
- `schema_version_unsupported`.

Errors and logs include resource IDs when available. They do not include prompts, credentials, tool data, or sensitive paths.
