# Native macOS Client Architecture

## Status

Approved registry-sharing and connection-navigation contract for the deferred native client. Implementation is pending. [`../product/deferred-acceptance.md`](../product/deferred-acceptance.md) defines approved registry acceptance.

## Boundaries

The app uses generated Swift HTTP and SSE types from the committed protocol artifacts. Pi SDK types remain inside `packages/pi-runtime` and never enter the Xcode project.

The native client has these local boundaries:

- `GatewayRegistryStore`: canonical registry reads, observation, locking, mutation, migration, and recovery.
- `GatewayControl`: create, register, replace, rename, delete, master, and local lifecycle behavior.
- `GatewayConnectionCoordinator`: one process-wide active gateway and connection generation.
- `AgentServerClient`: one selected gateway's HTTP and SSE operations.

The app does not spawn the `bitch` CLI as a registry broker. It does not add a background registry service or duplicate Agent Server state.

## Canonical root

The app uses the same default `BITCH_HOME` as the CLI:

```text
~/Library/Application Support/BITCH/
```

A user who configures another root must select that existing root in app settings. The app stores a security-scoped bookmark when sandbox access requires it. The bookmark grants access. It does not contain a registry copy.

The app does not merge two roots. Changing roots closes the active connection, validates the selected root, and then loads that root's registry.

## Shared schema

`registry.json` and `registry.json.bak` retain the schema in [`storage.md`](storage.md). One committed JSON Schema generates or validates both TypeScript and Swift registry models.

Swift preserves unknown additive fields while reading and rewriting a compatible schema version. It rejects unknown enum values that change required behavior. An unsupported newer schema reports `registry_schema_unsupported` and is never rewritten.

The app stores only its last selected gateway ID outside the registry. The value is keyed by the canonical `BITCH_HOME` path in app preferences. It has no alias, endpoint, master, runtime, conversation, or workspace data.

## Cross-process locking and writes

The Swift store implements the exact `registry.lock` lease used by the TypeScript client:

- one lock directory at `BITCH_HOME/client/registry.lock`.
- a 10-second stale threshold.
- a lease update every five seconds.
- bounded acquisition with the same stable busy error.
- owner metadata used only for safe stale-lock checks.

After acquiring the lock, every writer reloads the latest valid primary, validates the intended mutation, and checks the expected revision. It then:

1. Write a mode `0600` temporary file in `BITCH_HOME/client`.
2. Flush the temporary file.
3. Preserve the prior valid primary as `registry.json.bak`.
4. Replace `registry.json` atomically.
5. Flush the containing directory.
6. Release the lock.

`BITCH_HOME` and its directories remain mode `0700`. Swift and TypeScript lock, write, and migration fixtures must be byte-compatible where canonical serialization is required.

## Registry observation

A filesystem observer marks the registry stale. It does not treat a file notification as a complete write.

The store debounces notifications, waits for any active registry lock, reads a complete valid revision, and applies only a revision newer than its current projection. Missing intermediate revisions are valid because the registry is a current-state file, not an event log.

The app publishes registry projections on the main actor. It keys rows and active selection by gateway ID. Alias is presentation data.

## Startup selection

The connection coordinator loads the registry before opening a network connection.

It chooses:

1. the app preference gateway ID when that entry exists.
2. otherwise, the registry master ID when that entry exists.
3. otherwise, no active target.

Availability is not part of this selection algorithm. The selected entry remains active when status verification fails. The app shows that failure and does not try another entry.

An empty valid registry opens setup. A damaged registry opens recovery. Neither condition scans local data roots, Docker, Apple `container`, mDNS, Tailnet peers, or prior app state for unregistered gateways.

## Registration and first setup

Native registration uses the same alias, endpoint-origin, identity, mode, protocol, capability, replacement, and duplicate-ID rules as [`cli.md`](cli.md).

Local creation uses the same backend selection and lifecycle contract as [`local-runtime.md`](local-runtime.md). The app owns its native host-control implementation and does not invoke the public CLI executable. A backend that is not installed fails before registry or runtime side effects.

The first successful mutation observes revision zero, commits revision one with the new gateway as master, then installs that gateway as the active target. A competing first registration reloads after acquiring the lock and follows the resulting normal alias, identity, and master rules.

## Active connection coordinator

The app has one process-wide `GatewayConnectionCoordinator`. It owns:

```text
activeGatewayId: GatewayId?
connectionGeneration: UInt64
client: AgentServerClient?
```

Windows observe this coordinator. They do not own independent active gateway connections.

A user-requested switch:

1. Capture the selected gateway ID and next generation.
2. Reload the current registry entry.
3. Start a stopped managed local gateway on demand.
4. Verify `/v1/status`, gateway identity, protocol compatibility, and required capabilities.
5. Create the replacement `AgentServerClient`.
6. Prepare the replacement client.
7. Stop applying events from the old generation.
8. Close the old client connection without aborting gateway work.
9. Install the replacement atomically on the main actor.
10. Store the successful gateway ID in app preferences.

A preparation failure leaves the old generation, client, selected gateway, windows, and preference unchanged. The coordinator discards callbacks and SSE events tagged with an old generation.

The new gateway opens at its conversation list. Window navigation does not infer equivalent conversations across gateways.

## External registry mutations

The coordinator applies a newer observed registry revision as follows:

- Active alias change: update presentation only.
- Master change: update presentation only.
- Active endpoint replacement with the same gateway ID: prepare a replacement connection and reconcile open resources.
- Active entry deletion: close the connection, clear the app preference, and open the picker.
- Active local runtime metadata change: revalidate through the recorded immutable backend before the next lifecycle operation.
- Unrelated entry change: update registry presentation only.

A conflicting or invalid external revision enters registry recovery instead of guessing intent.

## Registry migration and recovery

The app uses the same migration implementation contract and fixtures as the TypeScript client:

- make a recovery copy before a recognized migration.
- hold the cross-process lock through migration.
- increment the revision only for the migration's committed mutation.
- restore the backup when only the primary is damaged.
- report `registry_recovery_required` when neither copy is valid.
- never initialize empty state when recovery evidence exists.

No import step occurs when the native app first launches. Existing CLI registrations appear because both clients read the same file.

## Security

The app never places endpoints, aliases, local data paths, or registry contents in iCloud, ubiquitous preferences, CloudKit, or shared pasteboards. App preference synchronization is disabled for the last gateway ID and security-scoped bookmark.

Registry files retain their host permission requirements. Gateway credentials remain on their Agent Servers and do not enter the client registry.
