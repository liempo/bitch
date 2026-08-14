# Local Daemon Runtime

## Status

Approved MVP technical specification. Implementation is pending.

## Host-native process

The local daemon runs directly on the host. The MVP does not require Docker for the daemon or Workspace execution.

A detached daemon process owns Pi subprocesses and PTY workers. The CLI can also run it in the foreground for diagnostics and supervision.

## Startup paths

BITCH copies Paseo's lifecycle split:

- `bitch onboard` starts the daemon when it is absent.
- `bitch daemon start` starts it explicitly.
- `bitch daemon start --foreground` runs it in the foreground.
- ordinary client commands only connect.
- a missing daemon causes a connection error with startup guidance.

The daemon remains active after a CLI process exits.

## Runtime files

One effective daemon home, selected by the current import or branded environment variable, owns:

- a PID file.
- stable daemon identity.
- the active listen target.
- logs.
- configuration.
- persistent stores.

The heartbeat PID lock prevents two owners from using one daemon home concurrently. Startup removes a lock for a non-running process. It does not reclaim an ordinary live lock. The copied desktop-managed recovery exception requires prior unreachability evidence and a heartbeat older than five minutes.

## Status

The status command combines local process evidence with a live WebSocket daemon-status request when possible.

It reports at least:

- running or stopped state.
- owner PID when known.
- daemon home.
- listen target.
- stable daemon ID when reachable.
- relay state.
- log path.

A stale PID file is not proof that the daemon is running.

## Stop

A normal stop first requests the daemon lifecycle shutdown operation.

If the daemon cannot receive that operation, the CLI can signal the recorded owner process. A bounded wait precedes optional force termination.

Shutdown affects all clients and live resources. The MVP does not add a connected-client veto.

During shutdown, the daemon:

1. freezes WebSocket ingress and new Conversation registrations.
2. closes every live Pi session and persists its closed Conversation snapshot.
3. drains copied background persistence and registration tasks.
4. kills all PTYs.
5. stops relay and other retained transports.
6. closes WebSocket and HTTP sockets and removes a Unix-socket file.
7. releases the PID lock through the copied worker lifecycle.

The daemon worker has a 10-second graceful-shutdown ceiling before forced process exit. An interrupted Pi turn is not replayed on next startup.

## Restart

Restart performs the copied stop and start sequence. Clients reconnect through their existing daemon routes.

A new process reads the same stable daemon identity, Conversation records, Projects, Workspaces, and Pi handles. It rebuilds a Conversation timeline from Pi history when that Conversation is loaded.

Prior Terminals do not return because they are runtime-only.

## Managed graphical daemon

The deferred graphical client can start a managed local daemon subprocess.

It stops only a daemon that it started. A daemon started independently through the CLI remains unaffected when the graphical client quits.

The deferred graphical client retains Paseo's setting that can keep its owned daemon running after app quit.

## Local registration

A client installation includes a local daemon connection by default.

Removing that connection disables built-in daemon management. A managed graphical client stops the daemon only when it owns that process. CLI and TUI removal does not stop an independently started daemon. Removal does not delete daemon home data or project files.

Re-enabling the connection can start the daemon against the preserved home.

## Listen targets

The default direct endpoint is `127.0.0.1:6767`. Copied clients also recognize `localhost:6767`. The CLI supports Unix-socket targets as paths or `unix://` URLs. Copied Windows-capable clients also recognize named-pipe routes, although Windows is outside the MVP support target.

A direct remote listen target requires explicit operator configuration. See [`../operations.md`](../operations.md) for security requirements.

## Logs

The detached launcher writes daemon output to `daemon.log` in the effective home. The copied logger supports configured JSON or pretty output, levels, and file paths. Although the copied config schema accepts rotation fields, the pinned logger does not apply them. Automatic log rotation is not an MVP guarantee.

Logs must not include:

- Pi credentials.
- relay secret keys.
- password plaintext.
- full prompts or tool output by default.
- authorization headers.

## Failure behavior

Startup failure leaves durable daemon data intact.

The CLI reports recent daemon logs when a detached process exits during its startup grace period. A readiness timeout does not create a new daemon identity over existing data.

A daemon crash ends Pi subprocesses and PTYs. Clients remain targeted at that daemon and reconnect when it returns. They do not fall back.

## Deferred runtime behavior

Defer these non-Paseo additions:

- `launchd` login service installation.
- host-reboot Terminal recreation.
- tmux-based Terminal persistence.
- Docker daemon execution.
- per-client shutdown leases.
- automatic failover.
