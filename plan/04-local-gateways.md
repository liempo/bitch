# Phase 4: Local Gateways and Docker Lifecycle

## Outcome

Create and operate multiple persistent local gateways without weakening gateway identity or data isolation.

## Dependencies

Complete Phase 3 and reuse its tested Docker runtime driver.

Use [`../docs/architecture/cli.md`](../docs/architecture/cli.md) and [`../docs/architecture/local-runtime.md`](../docs/architecture/local-runtime.md).

Use only the approved Docker runtime in the first release. Keep Apple `container` outside this phase.

## Pending work

- [ ] Implement the host-side local gateway lifecycle boundary.
- [ ] Create one runtime-neutral host data root for each local gateway.
- [ ] Implement non-interactive local gateway creation through `bitch gateway`.
- [ ] Make the first registered gateway master without creating a server hierarchy.
- [ ] Implement on-demand local gateway startup through `--gateway`.
- [ ] Keep local gateways running after all clients disconnect.
- [ ] Do not start local gateways automatically at login.
- [ ] Implement explicit start, stop, restart, status, and runtime configuration behavior.
- [ ] Implement registry-only deletion without stopping the local container, changing gateway data, or retaining an unregistered-gateway inventory.
- [ ] Serialize lifecycle operations with one host-side lock for each local gateway.
- [ ] Prevent two containers from mounting the same gateway data root concurrently.
- [ ] Preserve the stable gateway ID across port and container replacement.
- [ ] Keep local gateway workspaces separate from the current host directory.
- [ ] Implement BITCH-owned container labels, stale-state detection, and safe cleanup.
- [ ] Add behavioral tests for multiple local gateways, lifecycle races, persistence, identity, and failure recovery.
- [ ] Document local data ownership, backup prerequisites, and operator-visible failures.

## Exit condition

The built CLI can create, select, stop, and restart independent local Docker gateways. It can delete their registry entries without stopping their containers, changing gateway data, or tracking them afterward. Gateway data and identity survive client and container replacement.
