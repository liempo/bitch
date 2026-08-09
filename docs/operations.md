# Operations

## Status

Approved first-release operational architecture. Implementation is pending.

## Agent Server modes

One immutable Agent Server image and binary supports two startup modes:

```bash
bitch-agent-server --mode directory --cwd <path>
bitch-agent-server --mode gateway
```

The mode cannot change while one container runs because the modes use different mounts and storage responsibilities.

### Directory mode

Directory mode receives one fixed `cwd` and has no workspace registry or lifecycle.

Plain `bitch` starts a temporary Directory-mode Agent Server in Docker. The CLI identity-mounts the current host directory at the same absolute path inside the container.

The temporary Agent Server uses the shared per-user Directory-mode Pi configuration and session store.

### Gateway mode

Gateway mode owns `/data/workspaces` and uses one persistent `/data` root.

A gateway can be:

- a local gateway managed by BITCH through Docker.
- a remote gateway managed externally and reached through a registered endpoint.

External removal of one cataloged workspace does not stop the gateway. BITCH isolates it as **Workspace missing** and never recreates or renames filesystem content automatically. The operator restores a real directory at the recorded path or uses the documented destructive workflow.

Local and remote gateways run the same Agent Server image and protocol.

## Gateway selection

Plain `bitch` always uses Directory mode.

Gateway mode requires explicit selection:

```bash
bitch --gateway
bitch --gateway work
```

`--gateway` selects the registered master gateway. A name selects that exact registry entry.

A missing, stopped, or unavailable selected gateway does not cause fallback. BITCH reports the failure and does not run work elsewhere.

The first release removes direct unregistered `--server` connections.

## Gateway management

The non-interactive `bitch gateway` command group is the only first-release gateway management interface. It never prompts on stdin.

The first-release TUI does not manage or switch gateways. The user exits it and starts another invocation to change the selected gateway.

The approved deferred `/gateway` hub uses the host client control plane. It can manage registrations and local lifecycle before a server connection exists and can replace the active connection in place. It never sends registry or container operations to an Agent Server.

The first registered gateway becomes master. The master role is stored by stable gateway ID and has no server-side authority.

The registry can have no master. In that state, `bitch --gateway` fails.

## Directory-mode lifecycle

Each Directory-mode invocation creates one container named `bitch-directory-INVOCATION_UUID`. It never reuses another invocation's container.

The container has these labels:

```text
dev.bitch.owner=bitch
dev.bitch.kind=directory
dev.bitch.invocation-id=INVOCATION_UUID
dev.bitch.owner-uid=HOST_UID
dev.bitch.version=BITCH_VERSION
```

The CLI identity-mounts the current directory read-write at the same absolute path. It also bind-mounts the Directory-mode `config`, `sessions`, `trash`, `state`, and `recovery` subtrees at `/bitch/directory`. It does not mount the Docker socket.

Docker assigns an available host port bound only to `127.0.0.1`. The CLI polls `/health/ready` with a bounded backoff until the 30-second deadline. Readiness requires the fixed cwd, Pi configuration, session storage, receipt storage, and recovery scan.

If startup fails, the CLI reports `directory_start_failed` or `readiness_timeout`, preserves the Agent Server diagnostics, and removes only its temporary container. It does not delete shared Directory-mode data.

After a print command settles, the CLI flushes durable state and requests graceful shutdown. Closing the TUI or interrupting a print command first requests an abort. The CLI waits up to 10 seconds, then force-stops a container that did not exit. It always removes its temporary container.

Each temporary Agent Server requires an ownership lease from its CLI. The CLI supplies an opaque lease value through runtime-only state. It renews the lease through a private loopback endpoint.

The lease endpoint is not part of `/v1`. The lease value never enters shared storage, container labels, output, or logs.

If the lease expires, the Agent Server requests Pi abort and cancels pending dialogs. It waits up to 10 seconds for durable flushes and then exits. Directory containers have no restart policy.

Directory mode does not continue work after its client exits. A client crash therefore leaves a stopped container, not continuing agent work.

Before creation, the CLI lists containers with `dev.bitch.kind=directory` and the invoking owner UID. It removes only containers in a stopped, exited, or dead state. It never stops or adopts a running container from another invocation. Cleanup does not change shared configuration, sessions, receipts, Trash, or recovery copies.

## Local gateway lifecycle

BITCH can manage multiple local gateways. Each local gateway has:

- one stable gateway ID.
- one independent host data root.
- one runtime configuration.
- deterministic BITCH ownership labels.
- independent credentials and `SOUL.md`.

Creating a local gateway selects its immutable backend with `--backend`. Omission defaults to Docker. Creation starts it, waits for readiness, registers its backend and identity, and leaves it running. A stopped local gateway also starts on demand when the user selects it with `--gateway`. It does not start automatically at login.

After startup, the local gateway continues running when all CLI and TUI clients disconnect. It stops only after an explicit lifecycle operation, host shutdown, process failure, or container-runtime failure.

Disconnect, client crash, and network loss do not abort gateway commands. SIGINT from an attached CLI sends an explicit Pi abort. The CLI waits up to 10 seconds for settlement and flushes, then exits 130.

A normal `gateway local stop` or `gateway local restart` fails with `gateway_active_work` when any conversation has active generation, tool execution, compaction, queued continuation, or a pending extension dialog. It does not abort work or change the container.

The `--force` option requests an abort for each active conversation, cancels pending dialogs, and waits up to 10 seconds for durable-state flushes. BITCH then stops the container. A forced restart starts it again and waits for readiness. Receipts that remain accepted or running become interrupted at the next startup. BITCH never replays them.

Separate CLI processes can request the same local gateway concurrently. One host-side lifecycle lock must serialize create, start, stop, restart, and port-configuration operations.

BITCH must never run two containers against the same gateway data root.

After a host or Docker restart, BITCH requires four matching items before reconciliation:

- the registry entry.
- ownership labels.
- the mounted data root.
- the reported gateway ID.

With matching evidence, BITCH can update transient details, start one stopped owned container, or replace a missing container.

Ambiguous evidence returns `local_gateway_recovery_required`. BITCH does not change containers or data.

The selected local gateway uses a host port bound only to `127.0.0.1`. Port and container changes do not change its gateway ID.

`bitch gateway delete` is not a lifecycle operation. It removes the local gateway entry and its `localhost:<port>` endpoint from the client registry. It does not stop the container or alter its data. A running gateway continues to run after registry deletion.

After deletion, BITCH does not track or rediscover the local gateway. The container and data become operator-managed resources. The operator can make the endpoint available and register it again as an externally managed gateway. BITCH does not restore its former local lifecycle configuration.

## Container runtimes

The first release uses Docker for Directory mode and local gateways.

The host CLI invokes Docker with the invoking user's access. It does not mount the Docker socket into an Agent Server container. Agent tools and extensions cannot control Docker through BITCH.

A managed local container runs with the invoking user's numeric UID and primary GID. BITCH creates its host data directories with that ownership. It does not run a recursive ownership repair. An inaccessible data root fails readiness with `local_data_permission_denied` and operator repair instructions.

The local runtime boundary can support a later Apple `container` driver without changing Agent Server or client protocol behavior.

The runtime driver is immutable for one local gateway. Apple `container` support, if added, requires creation of a separate gateway with a new identity, data root, and registry entry. BITCH does not convert a Docker gateway, attach its data root to Apple `container`, or restore its backup through the Apple driver. The original Docker gateway remains unchanged.

BITCH must use staging and atomic registry commit for Apple gateway creation. It must verify identity and readiness. It must prove ownership before rollback.

The implementation must pin exact Apple tool and platform versions when work starts.

## Local image build and retention

The installed package includes the exact image build context, pinned Pi version, and dependency lockfiles.

On first Docker use, BITCH builds the exact image pinned by the installed release and caches it. The cache key contains the BITCH version and a build-context hash. A changed key causes a rebuild. Pi and TUI versions cannot float independently of this image.

After a successful build, BITCH keeps the current and immediately previous images that it built. It removes older BITCH-built images only after a successful upgrade and never removes unrelated images.

The CLI can automatically remove stopped temporary Directory-mode containers. Registry deletion never removes a persistent local gateway container or its data.

Published operator procedures must cover re-registration or manual cleanup of the retained operator-managed resources.

## Gateway isolation

Gateways do not synchronize configuration, credentials, sessions, workspaces, Trash, or runtime state.

Directory mode has its own shared per-user Pi state. It does not share that state with any gateway.

Agent Servers do not delegate tasks to each other.

## Git clone authentication

Gateway workspaces are trusted Pi projects. Project settings can load extensions and install configured packages with container permissions. Clone only repositories suitable for that gateway boundary.

Private workspace cloning uses credentials configured inside the selected gateway. An operator can install Git credential-helper configuration under `/data/config` and SSH keys or related secret material under `/data/secrets` with mode `0600`.

Clone requests contain only the validated repository URL and workspace fields. They never carry a token, password, private key, or credential payload.

Clone processes use:

```text
GIT_TERMINAL_PROMPT=0
GCM_INTERACTIVE=Never
```

SSH clone also uses batch mode and normal strict host-key verification. The operator must preconfigure host trust and a usable unlocked key or agent. BITCH does not open a credential dialog, weaken host checking, or retry with client-provided secrets.

## Network and authentication

Remote clients reach a gateway only through the user's Tailnet. Public internet and LAN exposure are not supported.

The gateway host and client device must belong to the same Tailnet. The operator must use Tailscale ACLs to limit access to the intended self-hosted user and devices. BITCH trusts any peer that the Tailnet permits to reach the gateway. Device enrollment, ACL administration, and compromised-device response remain Tailscale operator responsibilities.

The first release has no API tokens or application-level authentication. It does not ship a TLS proxy. An operator can add private TLS termination without changing the BITCH protocol.

The supported remote Docker Compose deployment requires an explicit Tailscale host IP. Docker publishes the Agent Server port only on that IP. The Agent Server listens on the container interface. The Compose file does not publish the port on these addresses:

- `0.0.0.0`.
- `127.0.0.1`.
- a LAN address.
- a public address.

The Agent Server rejects every request that contains an HTTP `Origin` header with `browser_origin_not_allowed`. It sends no CORS allow headers. The first-release remote interface supports non-browser CLI and TUI clients only.

Remote gateway registration records the Tailnet endpoint. Local Docker endpoints bind only to `127.0.0.1`.

## Remote Compose deployment

The release package contains `deploy/compose.yaml`. It uses the packaged Agent Server build context and does not pull a prebuilt BITCH image.

```yaml
name: bitch-gateway
services:
  agent-server:
    build:
      context: ${BITCH_BUILD_CONTEXT:?set BITCH_BUILD_CONTEXT}
      dockerfile: Dockerfile
    image: bitch-agent-server:${BITCH_VERSION:?set BITCH_VERSION}-${BITCH_BUILD_HASH:?set BITCH_BUILD_HASH}
    command: ["bitch-agent-server", "--mode", "gateway"]
    init: true
    user: "${BITCH_UID:?set BITCH_UID}:${BITCH_GID:?set BITCH_GID}"
    restart: unless-stopped
    stop_grace_period: 15s
    environment:
      BITCH_BIND_ADDRESS: 0.0.0.0
      BITCH_PORT: "7331"
      PI_CODING_AGENT_DIR: /data/config
      PI_CODING_AGENT_SESSION_DIR: /data/sessions
      PI_SKIP_VERSION_CHECK: "1"
    volumes:
      - type: bind
        source: ${BITCH_DATA_ROOT:?set BITCH_DATA_ROOT}
        target: /data
    tmpfs:
      - /tmp
      - /run/bitch
    ports:
      - name: agent-http
        target: 7331
        published: "${BITCH_PORT:-7331}"
        host_ip: ${TAILSCALE_IP:?set TAILSCALE_IP}
        protocol: tcp
    cap_drop: ["ALL"]
    security_opt:
      - no-new-privileges:true
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:7331/health/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
      interval: 5s
      timeout: 2s
      retries: 6
      start_period: 30s
```

The Compose environment file contains locations, numeric IDs, versions, hashes, ports, and the Tailscale IP. It must not contain provider credentials or application secrets.

### Remote data ownership

Use one dedicated non-root service account for each remote gateway deployment. Set `BITCH_UID` and `BITCH_GID` to its numeric IDs.

The host data root must:

- be a real directory on a local filesystem.
- be owned by the configured UID and GID.
- use mode `0700`.
- support atomic rename and file locking.
- have sufficient space for sessions, workspaces, Trash, and recovery copies.

BITCH-owned JSON, credentials, and secret files use mode `0600`. BITCH-owned directories use mode `0700`. BITCH does not recursively repair ownership.

Agent Server readiness fails with `gateway_data_permission_denied` when access is incompatible. Managed local startup maps its host-side failure to `local_data_permission_denied`.

### Deploy a remote gateway

Prerequisites:

- Install a supported Docker Engine and Compose plugin.
- Join the host to the intended Tailnet.
- Configure Tailnet ACLs for the self-hosted user.
- Create the dedicated service account.

Procedure:

1. Extract the exact build context from the installed BITCH package.
2. Create an empty host data root with mode `0700`.
3. Set its owner to `BITCH_UID:BITCH_GID`.
4. Set every required Compose environment value.
5. Verify that `TAILSCALE_IP` belongs to the host.
6. Run `docker compose build` from the deployment directory.
7. Run `docker compose up -d`.
8. Wait for the Compose health check to pass.
9. Read `/v1/status` through the Tailnet endpoint.
10. Record the reported gateway ID.
11. Register the endpoint from the client.

Expected result:

- Docker publishes one port only on `TAILSCALE_IP`.
- The Agent Server runs as the configured non-root user.
- `/health/ready` and `/v1/status` succeed.
- The gateway ID persists in the host data root.

If build or startup fails, do not create a new identity over nonempty data.

1. Run `docker compose down` without `--volumes`.
2. Preserve the complete data root.
3. Inspect the container diagnostics.

## Supported scale

The first release tests and supports one user with:

- eight registered gateways.
- two concurrently running conversations on each gateway.
- two connected clients on one conversation.

These values define the supported envelope, not hard quotas. BITCH does not reject a ninth registration or a third conversation only because it exceeds this envelope. Behavior beyond the envelope is unsupported.

The first release has no protocol-overhead latency target or service-level objective. Model, tool, storage, container, and Tailnet performance depend on operator resources and external services.

## Supported platform matrix

The minimal first-release support matrix is:

| Component | Supported platform or version |
|---|---|
| CLI, TUI, Directory mode, local gateways | macOS 26 on Apple silicon |
| macOS release test baseline | macOS 26.5.2 arm64 |
| Local container runtime | Docker Desktop 4.62.0, Engine client 29.2.1, Compose 5.0.2 |
| Remote Compose host | Ubuntu Server 24.04 LTS amd64 |
| Remote container runtime | Docker Engine 29.2.1 and Compose 5.0.2 |
| Node.js | 24.19.0 |
| `@earendil-works/pi-coding-agent` | 0.83.0 |
| `@earendil-works/pi-tui` | 0.83.0 |
| Agent Server base | pinned Node 24 Bookworm image digest from the release lock |

Newer operating-system patches or Docker patch versions can work, but they are outside the tested first-release matrix. Intel macOS, Linux clients, Windows clients, Podman, and Apple `container` are unsupported in the first release.

The npm lockfile pins every transitive package. A release does not use the caret ranges from Pi's package manifest as runtime resolution ranges.

## Release packaging

The first release publishes an npm package. It contains the built CLI and TUI, generated protocol artifacts, lockfiles, and the exact Agent Server Docker build context.

BITCH does not publish a prebuilt OCI image or standalone executable. Directory mode, managed local gateways, and remote Compose deployments build the Agent Server image from the packaged context.

The npm release uses registry provenance and integrity metadata. The release also publishes SHA-256 checksums for downloadable source archives, an SBOM, and third-party license notices. OCI signing does not apply because the release publishes no OCI image.

The remote Compose file uses the packaged build context and the BITCH version plus context hash as its image cache key.

## Upgrade and rollback

Each BITCH release pins Node.js, Pi SDK, Pi TUI, npm dependencies, and the Agent Server image. Operators must not replace a pinned Pi or TUI package independently.

The supported compatibility window contains the current and immediately previous BITCH release within one protocol major version. Other combinations can connect when capability negotiation succeeds, but they are unsupported.

### Upgrade a gateway

Do not skip an unsupported intermediate release.

1. Verify that the installed release is in the supported upgrade window.
2. Create a complete stopped-gateway backup.
3. Record the gateway ID and current image reference.
4. Install the next BITCH release.
5. Start the gateway with the new pinned image.
6. If the release reports an unknown migration, stop the upgrade.
7. Verify readiness, gateway identity, and required capabilities.
8. Keep the previous image until the next successful upgrade.

### Roll back a gateway

Do not start an older image against an incompatible newer schema.

1. Stop the upgraded gateway.
2. Determine whether the new release changed persistent schemas.
3. If persistent schemas remain compatible, start the previous image.
4. If a migration is incompatible, restore the complete pre-upgrade backup.
5. Before registration or client use, verify the original gateway ID.
6. Preserve the failed upgraded data for diagnosis.

BITCH never restores an older catalog or replays interrupted commands automatically. A rollback that needs older data always uses the operator-selected full backup.

## Backup and restore

A supported gateway backup is a complete, byte-for-byte copy of its persistent data root. It includes configuration, credentials, secrets, identity, sessions, workspaces, Trash, artifacts, and state.

Treat every backup as sensitive. The operator owns backup encryption, storage, access control, scheduling, and retention. BITCH does not upload or delete backups.

### Create a gateway backup

The SHA-256 manifest records each relative path, entry type, ownership, mode, link target, and regular-file digest. Treat the backup record and manifest as sensitive.

1. Record the gateway ID, installed BITCH version, and managed-local backend when applicable.
2. Stop the gateway without `--force`.
3. Verify that no container uses the data root.
4. Copy the complete data root with ownership, permissions, links, and timestamps.
5. Create the SHA-256 manifest for the copied tree.
6. Store the manifest separately.
7. Before moving the copy to shared or untrusted storage, encrypt it.
8. When downtime is no longer necessary, restart the gateway.

Expected result:

- The SHA-256 manifest verifies against the complete stopped-gateway copy.
- The backup record identifies its gateway ID, BITCH version, and applicable backend.
- The original gateway restarts with the same gateway ID.

Do not use a copy whose manifest verification fails. Back up the client registry separately while no CLI process mutates it. A registry backup is not a gateway-data backup.

### Restore a gateway backup

A restore preserves gateway identity. It does not create a second gateway. Do not run the original and restored data roots concurrently.

Restore a managed local backup through its recorded backend. Do not use a Docker backup to create an Apple gateway or the reverse.

If manifest verification fails, stop the procedure. Do not start the restored gateway.

1. Stop each container that can use the destination data root.
2. Verify the stored manifest against the backup.
3. Restore the backup into an empty runtime-neutral directory.
4. Restore the original ownership, permissions, links, and timestamps.
5. Start the Agent Server against the restored root.
6. Verify that `/v1/status` reports the recorded gateway ID.
7. If the gateway ID differs, stop recovery.
8. Register or rebind the verified endpoint explicitly.

Expected result:

- `/v1/status` reports the recorded gateway ID.
- Sessions, workspaces, configuration, credentials, Trash, artifacts, and state remain available.
- Client registration targets only the verified endpoint.

If readiness fails, keep the backup unchanged and inspect the restored copy. Do not overwrite the original data root during diagnosis.

## Export and secret exposure

The first-release content export is the Pi HTML export for one conversation. It does not attach provider credential files or `/data/secrets` files as resources.

An export is not a recoverable gateway backup. BITCH does not inspect or redact prompts, messages, or tool output. Exported conversation content can still contain secrets and must carry a sensitivity warning.

Pi tools and trusted extensions run with the Agent Server's container permissions. They can read secret files available to that process. BITCH does not send credential or secret files through normal protocol resources, logs, or conversation exports.

After registry deletion, retained local containers and data are operator-managed. The operator must use Docker and filesystem tools for final cleanup. BITCH does not track, stop, or delete those resources.

## Retention

BITCH does not expire gateway backups, server-owned gateway exports, Trash, migration backups, recovery copies, or failed creation receipts on a timer. The operator chooses their retention periods. Explicit permanent conversation deletion also deletes that conversation's server-owned export artifacts. It cannot delete copies already downloaded to a client.

BITCH removes settled operation records according to the recovery contracts. Failed creation receipts prevent matching retries from invoking Pi again.

BITCH keeps the current and previous BITCH-built local images. Docker or the host controls log retention.

## First-release exit gate

The first release can ship only when:

1. No first-release planning gap remains.
2. Every workflow in [`product/acceptance.md`](product/acceptance.md) passes through public interfaces.
3. Every pull-request and release gate passes without automatic retry.
4. The packed npm artifact installs on the supported macOS baseline.
5. Directory mode and managed local gateways pass on the supported Docker Desktop baseline.
6. Remote Compose deployment passes on the supported Ubuntu and Docker baseline.
7. Current and previous release compatibility checks pass when a previous release exists.
8. Backup, restore, upgrade, rollback, and recovery procedures pass.
9. The selected eight-gateway, two-conversation, and two-client envelope passes.
10. Generated schemas, checksums, SBOM, provenance, and license notices are current.
11. No known critical or high-severity security, identity, recovery, or data-loss defect remains.
12. Operator procedures contain verified prerequisites, failure behavior, and recovery steps.

A waived or quarantined failing behavioral test blocks release. Feature presence alone does not satisfy this gate.

## Health

`/health/live` reports only whether the process event loop is responsive.

`/health/ready` succeeds after configuration, startup recovery, and required storage access. In Gateway mode, it also requires a valid catalog and supported schema.

`/v1/status` reports non-sensitive versions, mode, capabilities, and the stable gateway ID in Gateway mode.

On SIGTERM, the Agent Server stops accepting mutations and makes readiness fail with `shutting_down`. It requests Pi abort and cancels pending dialogs.

The server waits up to 10 seconds for durable flushes and then exits. Startup recovery marks any remaining accepted or running receipt interrupted.

## Logging

The Agent Server writes minimal JSON Lines logs to stdout and stderr. Docker or the host stores and rotates logs.

The server logs:

- startup and shutdown.
- readiness failures.
- command acceptance and settlement.
- destructive workspace operations.
- unexpected errors.

It does not log successful read requests, SSE token events, prompts, messages, tool input or output, credentials, authorization headers, or environment values.

Relevant records include stable operation and error codes. They include request, command, gateway, conversation, workspace, or artifact IDs when available.

Recovery failures use the stable codes in [`architecture/recovery.md`](architecture/recovery.md). Logs identify affected resources without exposing sensitive paths.

The first release has no debug logging mode, internal retention system, OpenTelemetry, or Prometheus integration.

## `SOUL.md` seeding

Directory mode and each gateway own an independent `SOUL.md` in their Pi configuration directory.

Use this client-side command to seed a missing gateway file once:

```bash
bitch gateway soul seed DESTINATION [--from SOURCE]
```

Without `--from`, BITCH installs its packaged default file. With `--from`, the client reads `SOUL.md` from the registered source gateway and writes the same bytes to the registered destination gateway. If the source is unavailable or has no file, BITCH installs the packaged default.

An existing destination file makes the command fail with `soul_already_exists`. The file remains unchanged. BITCH does not merge files or synchronize later changes.

Shared conversation memory is outside the first release.
