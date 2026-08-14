# Storage Architecture

## Status

Approved MVP technical specification. Implementation is pending.

## Storage roots

The daemon uses one BITCH-owned home directory. The final branded environment variable is `BITCH_HOME`.

The initial source import can retain Paseo's `PASEO_HOME` and `~/.paseo` default. A later tested migration introduces `BITCH_HOME` and a BITCH default without moving or overwriting existing data silently.

The initial layout follows the retained part of Paseo's file-based stores:

```text
BITCH_HOME/
├── config.json
├── server-id
├── daemon-keypair.json
├── paseo.pid               # planned later name: bitch.pid
├── daemon.log
├── agents/                 # renamed in a tested follow-up when safe
│   └── {sanitized-cwd}/
│       └── {conversationId}.json
├── projects/
│   ├── projects.json
│   └── workspaces.json
├── worktrees/
└── runtime/
```

The daemon can also create sensitive authentication and relay configuration files required by the copied server. Operations treat every file below the daemon home as private.

The first import retains `agents/`, `paseo.pid`, and other Paseo file names where compatibility requires them. Branding and migration occur only through a tested follow-up change.

## Stable daemon identity

One home directory owns one stable daemon ID.

The ID survives process restart and route changes. Two live daemons must not use the same home directory concurrently.

The relay keypair also belongs to the daemon home. Store its secret material with private file permissions.

## Conversation records

Each BITCH Conversation record follows Paseo's persisted agent record shape where the Pi-only product needs it.

The record includes:

- stable BITCH Conversation ID.
- `provider: "pi"`.
- Workspace ID.
- `cwd`.
- last lifecycle state.
- title and labels.
- timestamps and attention state.
- Pi model and thinking metadata.
- Pi native persistence handle.
- archive state.

It does not contain normalized timeline rows in the pinned Paseo baseline.

The BITCH Conversation ID is not required to equal the Pi session-header ID. The Pi session path and session ID remain provider-native data.

## Timeline state

The normalized timeline is runtime state in the pinned Paseo baseline. It is not stored in the Conversation JSON record.

Timeline order uses daemon-assigned epochs and sequence values. Projection can merge source rows for display without changing source coverage.

For a loaded Conversation, the timeline is authoritative for BITCH clients. It supports:

- latest-tail reads.
- older-page reads.
- forward gap recovery.
- exact source coverage.
- rewind epoch changes.
- canonical submitted-message identity.

After daemon restart, the first open, fetch, or prompt resumes Pi for history access and reconstructs normalized rows from Pi JSONL. Reconstruction creates a new runtime epoch and sequence range.

Client caches are not durable authority. A separately persisted normalized timeline is deferred.

## Client state

The CLI and TUI persist their daemon registry, selected daemon ID, display cache, and Workspace panel layouts outside daemon authority. Every resource cache key includes daemon ID. Workspace layout keys also include opaque Workspace ID.

Removing a daemon registry entry clears that daemon's client replica and layouts. It does not change daemon-owned resources.

## Pi state

By default, Pi subprocesses use the user's standard Pi agent directory:

```text
~/.pi/agent
```

`PI_CODING_AGENT_DIR` overrides the Pi agent directory. The retained adapter's `sessionDir` provider setting and `PI_CODING_AGENT_SESSION_DIR` can override import-session discovery according to copied precedence.

Pi owns:

- credentials.
- settings.
- extensions and packages.
- skills and prompts.
- themes and project resources.
- native JSONL sessions.

BITCH does not copy these resources into its daemon home for the MVP.

A Conversation persistence handle stores the native Pi session path needed for resume. BITCH treats that path as daemon-private data and does not expose it as a portable client path.

## Pi import

The daemon scans Pi's configured session directory recursively and produces a bounded, most-recent-first descriptor list. Import discovery defaults to 20 results, reads bounded head and tail windows, and can filter by a realpath-aware `cwd` match.

Import is explicit. It creates a BITCH Conversation record and hydrates the normalized timeline from Pi history. It preserves readable model and thinking metadata.

A standalone Pi session remains a Pi resource before import. The daemon does not create a BITCH record during discovery alone.

## Project store

A Project record includes:

- opaque daemon-local Project ID.
- exact lexically normalized root path.
- display name and optional user override.
- persisted opaque `projectKey` for copied cross-host grouping presentation.
- mutable Git-derived kind and key metadata.
- optional custom icon revision retained by the copied schema, although graphical icon management is deferred.
- creation and update timestamps.
- archive timestamp.

`projectKey` never merges daemon authority, resources, or IDs. CLI and TUI views remain scoped to one selected daemon.

The exact root is idempotent for active Project creation. Archived-only matches do not silently become active unless the copied Paseo workflow explicitly restores them.

## Workspace store

A Workspace record includes:

- opaque Workspace ID.
- stable Project ID foreign key.
- exact `cwd`.
- local or managed-worktree kind.
- display name and optional title.
- branch and base-branch metadata.
- backing worktree root where applicable.
- main repository root where applicable.
- BITCH-owned-worktree flag.
- creation, update, archive, and recovery metadata.

The Workspace record is placement authority. Reconciliation does not change Project membership, `cwd`, or user-owned names.

## Same-path Workspaces

Multiple active Workspaces can have the same `cwd`.

Workspace-owned resources use Workspace ID as their key. Directory-derived state can use daemon ID and `cwd` when copied Paseo behavior defines it that way.

Do not parse a Workspace ID into a path or use `cwd` as a replacement Workspace identity.

Path equality uses lexical normalization, not `realpath`. Symlink spellings can identify separate records. Explicit Workspace creation from a directory always mints a new Workspace ID, even when another Workspace already has the same `cwd`. Creating a Conversation without a requested Workspace ID also mints a fresh Workspace. Compatibility find-or-create paths deterministically reuse the oldest active exact path match. Otherwise, they restore the oldest archived exact match only when its Project remains active. The stable tie-breaker is Workspace ID.

## Terminal state

Terminals are runtime-only.

The daemon keeps:

- PTY process state.
- headless screen state.
- bounded scrollback.
- input-mode state.
- output revision.
- title and activity.
- size claimant.

The daemon does not persist a Terminal record that can recreate process continuity after shutdown. Daemon restart removes every prior Terminal.

## Archive and recovery

Conversation archive preserves its record, Workspace reference, and Pi native handle while closing the Pi process. Pi has no native archive hook in the pinned adapter. Later history access reconstructs the normalized timeline from Pi history.

Hard Conversation deletion removes the BITCH record and live timeline. It does not remove Pi JSONL.

Local Workspace archive preserves ordinary directory files.

Managed-worktree archive can remove the backing worktree after the final active Workspace reference disappears. Persisted placement metadata supports recovery.

The MVP does not add the former BITCH Trash directories, tombstones, staged permanent deletion, or export-artifact store.

## Write ownership

Retain Paseo's copied store write and serialization behavior during source import. Each store owns access to its files. Conversation, Project, and Workspace stores serialize writes and use atomic JSON replacement on their normal write paths.

Do not promise cross-store transactions or a new durability algorithm that the baseline does not provide. If later tests show that one MVP mutation requires stronger crash consistency, define and approve that behavior before implementation.

## Permissions

Daemon-owned private directories use restrictive permissions. Relay secret keys and password hashes are sensitive.

Pi and extensions run as the daemon operating-system user. They can access files that user can access. Remote client authorization therefore protects host-level authority, not only chat content.

## Deferred storage additions

Defer these BITCH-specific stores until after the MVP:

- durable command receipts.
- BITCH session locks against standalone Pi.
- a separately persisted normalized timeline or searchable timeline index.
- Workspace Trash and tombstones.
- `SOUL.md` seeding.
- Docker data roots.
- cross-daemon replication.
