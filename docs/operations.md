# Operations

## Status

Approved MVP operational specification. Implementation is pending.

## Supported deployment model

The MVP uses a host-native BITCH daemon.

The required tested client and local-daemon platform is macOS on Apple silicon. Remote daemons use the same Node.js server and protocol on an operator-selected host that can run the pinned dependencies and Pi.

Public packaging and a broad support matrix are deferred.

## Prerequisites

Install:

- Node.js 24.19.0.
- the pinned BITCH dependencies.
- `@earendil-works/pi-coding-agent` 0.83.0, which provides the `pi` executable.
- valid Pi credentials and configuration for the intended model providers.
- Git for managed-worktree behavior.

The daemon runs as the operating-system user who owns the development environment.

## Daemon home

`BITCH_HOME` is the final branded daemon data-root selector. The initial copied baseline can still use `PASEO_HOME` and `~/.paseo` until the tested branding migration is complete. Never point two active daemons at the same effective home.

Protect this directory. It can contain:

- daemon identity.
- relay secret keys.
- password hashes.
- normalized prompts and tool output.
- Project and Workspace paths.
- Pi native session handles.
- logs.

Do not run two daemons against one home.

## Start

The explicit `bitch onboard` command starts the local daemon when needed.

The explicit lifecycle commands are:

```bash
bitch daemon start
bitch daemon start --foreground
bitch daemon status
bitch daemon stop
bitch daemon restart
```

A background start detaches and writes diagnostics to the daemon log. A foreground start inherits terminal output and exits with the daemon.

Ordinary client commands do not start an absent daemon. They report connection guidance.

## Stop and restart

A normal stop requests graceful daemon shutdown. If the daemon cannot receive the request, the CLI can signal the recorded owner process.

Use force termination only after the bounded graceful wait fails.

Stopping or restarting the daemon:

- disconnects every client.
- ends every Pi RPC subprocess.
- ends every PTY.
- preserves durable daemon stores and Pi sessions.
- does not replay interrupted prompts.

## Local connection

The default direct listener is `127.0.0.1:6767`.

A client installation registers the local daemon by default. The user can remove it and operate with remote daemons only.

Removing localhost disables built-in management for that client. It stops the daemon only when a managed graphical client owns the process. It does not stop an independently CLI-started daemon, and it does not delete the effective daemon home, Pi state, Workspace records, or project files.

## Direct remote connection

A direct network connection gives the client the daemon user's filesystem and Pi authority.

Use one of these secure boundaries:

- Tailscale or another trusted VPN.
- private TLS through an operator-managed reverse proxy.
- a trusted private network with explicit password authentication when confidentiality is not required.

Password authentication controls access. It does not encrypt traffic. `bitch daemon set-password` stores a bcrypt hash in daemon configuration and requires restart. The copied compatibility environment variable can provide plaintext at daemon startup. Do not persist that plaintext in shell history or service files. A direct CLI route can take a password from its saved route or compatibility environment variable.

Do not put a password directly in a command-line URI on a multi-user host because process listings and shell history can expose it.

Do not bind a passwordless daemon to `0.0.0.0`, a public interface, or an untrusted LAN.

Configure host-header allow rules for direct browser-capable endpoints. CORS alone does not prevent DNS rebinding. The copied empty host list permits `localhost`, `*.localhost`, and IP-address Host values. Add explicit DNS suffixes for named routes. Do not set the copied `true` allow-any value on an untrusted network.

## Encrypted relay

Relay use is disabled on a new daemon until the user enables it.

Pairing procedure:

1. Run `bitch daemon pair` or the equivalent onboarding action.
2. Consent to relay enablement when prompted.
3. Transfer the QR code or pairing link through a trusted channel.
4. Verify that the client records the expected daemon ID and public key.
5. Connect through the encrypted relay route.

Treat a pairing offer as a credential. It contains the trust material needed to reach the daemon.

To rotate relay trust, stop the daemon, back up and remove `daemon-keypair.json`, restart, and pair every relay client again. Do not remove or edit `server-id` for routine key rotation.

The relay sees connection metadata, timing, and ciphertext sizes. It must not receive plaintext application messages.

## Pi administration

BITCH does not manage Pi authentication in the MVP.

Use standalone Pi to:

- log in or configure API keys.
- install or update Pi packages.
- configure extensions, skills, prompts, settings, and themes.
- test project trust behavior.

The daemon launches `pi` from `PATH` by default. `PI_COMMAND` selects another executable. The copied legacy `PI_ACP_PI_COMMAND` fallback remains during compatibility. It uses the daemon user's environment and standard Pi agent directory. `PI_CODING_AGENT_DIR` selects another Pi agent directory, and the retained adapter also supports its explicit session-directory override for import discovery.

A Pi extension runs with the daemon user's permissions. Install only trusted extensions.

## Workspaces

A local Workspace references an existing host directory. Archive does not delete that directory.

A managed-worktree Workspace uses a daemon-owned Git worktree. The daemon can remove it after the final active Workspace reference is archived.

Before archive or recovery, verify the Workspace ID and recorded paths. Do not treat an opaque Workspace ID as a filesystem path.

## Terminals

Terminals exist only while the daemon remains active.

A client detach does not stop a Terminal. Daemon stop, crash, host shutdown, explicit kill, or Workspace archive does.

The daemon can restore screen and scrollback only for a still-live Terminal. Do not depend on Terminal continuity across daemon restart.

Multiple clients can write to one Terminal. Coordinate human input operationally when concurrent writes would be unsafe.

## Backup

For the personal MVP, create a consistent backup by stopping the daemon and copying its complete home directory with permissions and links preserved.

Pi state lives outside the daemon home by default. Back up the relevant Pi agent directory separately if recovery must include Pi credentials, settings, extensions, and JSONL sessions.

A complete recovery set therefore includes:

- the stopped daemon home.
- the client daemon registry and display cache when it lives outside that home.
- the Pi agent directory.
- project directories or repositories.
- any managed-worktree source repositories needed for recreation.

Treat every copy as sensitive.

## Restore

1. Stop every daemon that can use the destination home.
2. Restore the daemon home into an empty destination.
3. Restore ownership and private permissions.
4. Restore Pi state when required.
5. Start the daemon.
6. Verify the stable daemon ID.
7. Verify Project and Workspace records.
8. Open a Conversation and verify Pi resume and normalized-history reconstruction.
9. Re-register routes explicitly when client state was not restored.

Do not run the original and restored copy concurrently with the same daemon identity.

## Logging

Use the daemon status command to locate logs.

Logs include lifecycle and operational failures. The copied logger removes authorization and WebSocket-protocol credential fields. BITCH must not add relay private keys, password plaintext, Pi credential values, or full environment dumps.

The pinned baseline does not implement automatic rotation even though its config schema accepts rotation fields. Monitor and rotate or truncate `daemon.log` while the daemon is stopped when disk use requires it.

When startup fails, preserve the daemon home and inspect recent logs. Do not initialize a new identity over nonempty data.

If logs report an invalid Project, Workspace, or Conversation record, stop mutation commands. Back up the full home, repair or restore the reported JSON file, and restart. The copied stores can skip invalid records or expose an empty registry, so a later mutation can overwrite recoverable data.

## Failure behavior

### Selected daemon unavailable

The client stays selected on that daemon and reports disconnection. Select another daemon explicitly if desired.

### Pi process exits

The current turn fails. Open or prompt the Conversation later to resume from its persisted Pi handle.

### Daemon exits

Every Pi process, live normalized timeline, and Terminal ends. Restart the daemon and reconnect. Conversation history is rebuilt from Pi JSONL when loaded. Do not expect an interrupted turn to replay.

### Workspace directory missing

Do not create an empty replacement. Restore the directory or use Paseo-native recovery for a managed worktree.

### Relay unavailable

Use a saved direct route to the same daemon ID when available. Do not accept a different daemon as fallback.

## MVP release gate

The MVP is usable when:

1. the `AGPL-3.0-only` policy, license, dated modification notices, source inventory, interactive legal notices, and remote Corresponding Source offer pass their checks.
2. the copied package baseline builds from a clean checkout.
3. Pi-only public discovery is enforced.
4. local and remote daemon acceptance workflows pass.
5. Conversation reconnect and timeline repair pass.
6. terminal restore and multi-client size claims pass.
7. daemon restart recovery passes without turn replay.
8. the built CLI and PTY-driven TUI tests pass on macOS arm64.
9. no known critical daemon-authority, authentication, data-loss, or process-ownership defect remains.

Public artifact signing, App Store delivery, broad compatibility, and formal upgrade windows are deferred.
