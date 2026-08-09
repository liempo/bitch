# Local Runtime Architecture

## Status

Approved local runtime contract. Docker implementation is pending. Apple `container` implementation is deferred and does not replace an existing gateway.

## Boundary

The host client owns local container lifecycle. The Agent Server does not receive the Docker socket and does not know whether its endpoint is locally managed.

The runtime driver performs container operations only. Gateway selection, registry mutation, identity policy, and recovery decisions remain in the client lifecycle layer.

## Driver interface

The first-release internal driver contract provides these operations:

```text
ensureImage(imageKey, buildContext)
inspect(containerName)
listByGatewayId(gatewayId)
create(spec)
start(containerName)
stop(containerName, timeout)
remove(containerName)
rename(oldName, newName)
readLogs(containerName, limit)
```

Each operation returns transport-neutral data. It does not return Docker SDK objects outside the driver.

`create(spec)` receives:

- the deterministic container name.
- the pinned image key.
- the gateway data root.
- numeric UID and GID.
- fixed or automatic host-port policy.
- BITCH ownership labels.
- the Agent Server command and health endpoint.
- Directory-mode ownership-lease configuration when applicable.

The driver never persists or logs a Directory ownership-lease value. It never creates Docker named volumes and never mounts the Docker socket.

## Runtime configuration

A registered local gateway stores this version 1 runtime configuration inside its registry entry:

```json
{
  "driver": "docker",
  "dataRoot": "gateways/GATEWAY_ID/data",
  "containerName": "bitch-gateway-GATEWAY_ID_WITHOUT_HYPHENS",
  "port": null,
  "uid": 501,
  "gid": 20,
  "imageKey": "BITCH_VERSION:BUILD_CONTEXT_HASH"
}
```

`port` is `null` for automatic selection or an integer from 1 through 65535. Driver, UID, GID, data root, and gateway ID do not change through normal configuration. The first release configures only the port policy.

## Runtime immutability and future drivers

`bitch gateway create --backend docker|apple` selects the runtime driver at creation. The option defaults to `docker`. A local gateway keeps that backend permanently. BITCH does not convert or switch an existing gateway between Docker and Apple `container`.

If Apple `container` support is added, the user must create a new local gateway. That operation creates:

- a new gateway ID.
- a new independent data root.
- a new registry entry.
- runtime ownership evidence that is specific to Apple `container`.

The new gateway uses the same Agent Server protocol, identity schema, storage schema, and observable lifecycle behavior. The Apple driver must implement the transport-neutral driver boundary and pass the same driver conformance tests. Its tool and platform versions must be pinned when support ships.

Apple creation uses the normal staged-create transaction. It verifies the newly generated gateway ID before registry commit and rolls back only resources proven to belong to that creation. It never opens, mounts, modifies, imports, or deletes an existing Docker gateway data root.

A data root and complete backup remain associated with their creating runtime driver. The backup procedure records that driver with its gateway metadata.

BITCH does not use a Docker gateway backup to create an Apple gateway or the reverse. Cross-gateway movement remains limited to explicit user-visible exports that the product supports.

No lifecycle request or registry edit can change `runtime.driver` or `runtime.dataRoot`. The public `backend` value maps directly to the internal driver identifier. The user can keep both gateways registered and select either one normally.

## Gateway initialization

Local creation uses `BITCH_HOME/gateways/.creating/OPERATION_ID/data` as a staging root.

1. Acquire the creation lock.
2. Acquire the registry lock.
3. Verify that the alias and staging target are unused.
4. Record the current registry revision.
5. Release the registry lock.
6. Create a lifecycle operation record with that revision.
7. Initialize the UUID v4 gateway identity through the shared identity-store adapter.
8. Verify that the stable gateway data-root target does not exist.
9. Move the staged root atomically to `BITCH_HOME/gateways/GATEWAY_ID/data`.
10. Create the deterministic container.
11. Start the container.
12. Wait for readiness.
13. Verify the gateway ID.
14. Acquire the registry lock.
15. Reload the registry.
16. Revalidate the intended mutation.
17. Commit the registry entry.
18. Release the registry lock.
19. Remove the settled operation record.
20. Release the creation lock.

On every exit path, the client releases each lock that it holds. It never removes a lock owned by another process.

A remote gateway initializes the same identity record inside its externally managed data root. The client never supplies an identity during remote registration.

If local creation fails before registry commit, BITCH removes only a container and data root proven to belong to that creation operation. Ambiguous resources remain unchanged and require recovery.

## Names and labels

A managed local container has this name:

```text
bitch-gateway-GATEWAY_ID_WITHOUT_HYPHENS
```

It has these labels:

```text
dev.bitch.owner=bitch
dev.bitch.kind=gateway
dev.bitch.gateway-id=GATEWAY_ID
dev.bitch.data-root-hash=SHA256_OF_CANONICAL_HOST_DATA_ROOT
dev.bitch.owner-uid=HOST_UID
dev.bitch.version=BITCH_VERSION
dev.bitch.image-key=IMAGE_KEY
```

A container created during a lifecycle operation also has `dev.bitch.operation-id=OPERATION_ID`. Docker labels are immutable, so this historical label remains for that container's lifetime.

After settlement, the missing operation record proves that the label does not identify active work.

A name collision without matching identity, ownership, and data-root labels is ambiguous. BITCH reports `local_gateway_recovery_required` and does not alter the container.

## Ports and endpoints

Docker publishes the Agent Server port only on `127.0.0.1`.

For automatic policy, Docker selects an available port during each container creation. BITCH stores the resulting normalized endpoint after readiness. Container replacement can change that endpoint without changing gateway identity.

For fixed policy, startup fails with `local_port_unavailable` when the port is unavailable. BITCH does not select another port silently.

## Registered-only discovery

BITCH performs discovery only for a registry entry already marked `local`. It queries the deterministic name and the exact gateway-ID label, then validates every ownership, mount, identity, and image field.

BITCH does not enumerate discovered containers into the registry. It ignores a labeled gateway whose ID has no registry entry. Registry deletion therefore ends all BITCH tracking even when the container continues to run.

## Lifecycle locks

Lifecycle locks use `proper-lockfile` under:

```text
BITCH_HOME/client/operations/locks/
├── gateway-GATEWAY_ID.lock
├── create-SHA256_OF_ALIAS.lock
└── image-SHA256_OF_IMAGE_KEY.lock
```

The current `proper-lockfile` defaults apply: a 10-second stale timeout and an update every five seconds.

One gateway lock serializes start, stop, restart, and configure. One creation lock serializes operations for a proposed alias. One image lock serializes a build for an image key.

A command waits up to 30 seconds for its lifecycle lock, then fails with `local_lifecycle_busy`. It does not retry the lifecycle operation automatically.

Long Docker operations never hold the registry lock. The lifecycle layer records the expected registry revision, performs the operation under its lifecycle lock, then acquires the registry lock and revalidates before commit.

If registry deletion occurs during a lifecycle operation, the operation does not recreate the entry. Any retained container and data become operator-managed after the operation reaches a safe stopping point.

## Durable operation records

Local lifecycle records use:

```text
BITCH_HOME/client/operations/local/OPERATION_ID.json
```

A version 1 record contains:

- `schemaVersion` and `operationId`.
- operation type: `create`, `start`, `stop`, `restart`, or `configure`.
- alias and nullable gateway ID.
- expected registry revision.
- canonical data-root hash.
- previous endpoint, runtime configuration, and container identity.
- requested endpoint and runtime configuration.
- phase and timestamps.

Phases are:

```text
accepted
runtime_changed
readiness_verified
registry_committed
rolling_back
recovery_required
```

The client writes and flushes `accepted` before a filesystem, image, container, or registry mutation. It atomically replaces the record at each phase. A settled operation removes its record only after the registry and runtime agree.

Records never contain prompts, credentials, environment values, tool data, or raw sensitive paths.

## Recovery and rollback

Recovery uses the evidence rules in [`recovery.md`](recovery.md).

### Create

If no runtime mutation started, remove the record. If all labels and paths prove an uncommitted creation, stop and remove its container and staged data. Preserve ambiguous resources.

### Start

If a proven owned container reached readiness with the expected gateway ID, commit its endpoint. If a newly created replacement failed, remove only that proven replacement and preserve the data root.

### Stop

If the proven container is stopped, settle the operation. If it remains running, preserve it and report the stop failure.

### Restart

If stop completed but start failed, leave the gateway stopped and retry only after a new explicit command. Never replay conversation commands.

### Configure

Keep the previous registry configuration until the replacement reaches readiness with the same gateway ID. If replacement fails, restore the previous container and configuration when evidence proves this safe. Otherwise report `local_gateway_recovery_required`.

### Registry deletion race

If the registry entry no longer exists, do not restore it. Remove the operation record after runtime mutation stops, and leave all retained resources operator-managed.

## Active work

Normal stop, restart, and live configure fail with `gateway_active_work` when any conversation has active generation, tools, compaction, queued continuation, or a pending dialog.

`--force` requests aborts, cancels dialogs, waits up to 10 seconds for durable flushes, then performs the lifecycle action. Receipts left accepted or running become interrupted after startup and are never replayed.
