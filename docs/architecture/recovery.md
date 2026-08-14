# Recovery Architecture

## Status

Approved MVP technical specification. Implementation is pending.

## Recovery principle

Copy Paseo's recovery behavior before adding BITCH-specific repair systems.

Durable daemon records and Pi JSONL survive process failure. Runtime-only Pi processes, normalized timeline rows, and Terminals do not.

## Client disconnect

A client disconnect changes no daemon resource lifecycle.

The daemon keeps:

- live Pi turns.
- pending questions.
- PTYs.
- Conversation records.
- Projects and Workspaces.

A reconnect repairs state through snapshots and authoritative reads.

## Pi process failure

A Pi process failure during a turn produces a failed Conversation turn and the normalized error or closed state defined by the copied adapter.

A valid native Pi persistence handle remains available. A later open or prompt can start a replacement Pi process.

BITCH does not replay the interrupted prompt automatically because tools can have side effects.

## Daemon crash or shutdown

A daemon stop ends:

- Pi RPC subprocesses.
- PTYs.
- runtime-only terminal snapshots and scrollback.
- live subscriptions.

A restart reloads:

- stable daemon identity.
- configuration.
- Conversation records.
- Projects and Workspaces.
- native Pi persistence handles.

The client treats every previous Terminal as gone. The first Conversation history operation resumes Pi as needed and rebuilds normalized rows from Pi JSONL. The rebuilt timeline can have a new epoch and sequence positions.

## Timeline recovery

After reconnect to the same daemon process, the client fetches the current authoritative tail.

- Same epoch and tail means no display replacement.
- Adjacent or overlapping data advances the existing range.
- A forward gap triggers paged catch-up.
- An epoch change, rewind, daemon restart, or true middle gap replaces stale canonical history.

The replacement keeps only live or local rows that the copied Paseo reconciliation rules permit. It does not create two discontiguous canonical ranges.

## Store writes

Persistent stores use copied Paseo serialization and atomic JSON replacement on normal Conversation, Project, and Workspace writes.

Keep copied failure behavior in the MVP:

- invalid `config.json` prevents startup and reports the validation error.
- an invalid Project or Workspace registry logs a load error and presents an empty in-memory registry for that process.
- an invalid Conversation record logs an error and is skipped.

Do not mutate the affected store after such a load error until the operator restores or repairs its file. A later write from the empty or partial in-memory view can otherwise replace recoverable data.

The MVP does not add the former BITCH catalog backup, migration journal, operation record, atomic cross-store transaction, or Trash staging protocol unless the retained Paseo store already has an equivalent.

## PID recovery

Daemon status checks process liveness rather than trusting the PID file alone.

A copied PID lock contains PID, start time, hostname, user ID, listen target, and a heartbeat marker. The owner refreshes its file time every 30 seconds. An ordinary live lock is never reclaimed only because it is old. The copied desktop recovery exception can reclaim a desktop-managed live PID only after the client proved the daemon unreachable and the lock heartbeat is older than five minutes.

A stale PID file for a non-running process can be removed by the copied lifecycle path. Stop prefers the live lifecycle RPC and validates PID safety before signaling. One daemon home cannot have two active owners.

## Workspace recovery

A missing local Workspace directory leaves its record recoverable or archived according to Paseo's reconciliation and route behavior. BITCH never creates an empty replacement silently.

A managed-worktree recovery uses persisted placement metadata:

- main repository root.
- backing worktree root.
- Workspace `cwd` relative to that root.
- base branch.
- BITCH ownership flag.

The daemon removes a managed worktree only after no active Workspace refers to it.

## Remote route recovery

A failed direct or relay route does not remove the daemon registry entry.

The client remains targeted at that daemon. It reconnects through another saved route for the same daemon ID when copied Paseo route behavior permits it. It never selects a different daemon ID automatically.

## Relay recovery

The daemon's relay keypair persists in its home. A relay reconnect retains daemon identity.

If pairing trust is compromised, stop the daemon, remove `daemon-keypair.json` from the protected daemon home, start the daemon, and pair every relay client again. The client does not accept the regenerated daemon key as the same trusted route without explicit pairing.

## Localhost removal

Removing the managed localhost connection stops the local daemon only when that client owns the process. It preserves the daemon home. An independently started daemon continues to run.

Re-enablement uses that home and recovers durable state. It does not restore prior runtime-only Terminals or interrupted Pi processes.

## Deferred recovery additions

Defer these BITCH-specific systems until after the MVP:

- durable command receipts and retry recovery.
- durable normalized timeline persistence.
- automatic Pi JSONL repair or migration.
- BITCH catalog backup pairs.
- permanent-deletion staging.
- cross-process standalone Pi session locking.
- automatic daemon failover.
- terminal continuity across daemon restart or host reboot.
