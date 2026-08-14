# Phase 5: Gateway Workspaces and Recovery

## Outcome

Provide the complete gateway workspace, metadata, and Trash lifecycle without changing Pi conversation behavior.

## Dependencies

Use the approved state and recovery rules in [`../docs/architecture/storage.md`](../docs/architecture/storage.md), [`../docs/architecture/protocol.md`](../docs/architecture/protocol.md), and [`../docs/operations.md`](../docs/operations.md).

Complete the Gateway-mode core and Phase 4 local lifecycle before adding full workspace lifecycle behavior.

## Pending work

- [ ] Create `packages/metadata-store` with the versioned JSON catalog adapter.
- [ ] Create `packages/workspace` with canonical path validation and workspace operations.
- [ ] Implement atomic catalog replacement, backup restoration, and startup reconciliation.
- [ ] Implement durable operation records for catalog and filesystem recovery.
- [ ] Discover real immediate directories under `/data/workspaces` and assign stable UUIDs.
- [ ] Implement the protected default workspace.
- [ ] Implement empty-folder creation, Git initialization, repository clone, and display-name changes.
- [ ] Implement Workspace Trash, restoration, permanent deletion, and tombstones.
- [ ] Implement Session Trash, restoration, permanent deletion, and inherited Trash state.
- [ ] Reject destructive operations while affected sessions are active.
- [ ] Preserve read-only session history after permanent workspace deletion.
- [ ] Implement viewed, completion, failure, and interrupted-run metadata.
- [ ] Qualify client workspace and conversation references with the gateway ID.
- [ ] Add real-filesystem tests for paths, symbolic links, catalog recovery, Trash, and restoration.
- [ ] Add Agent Server integration tests for workspace and session lifecycle operations.
- [ ] Run workspace behavior against both local and remote Gateway-mode deployments.

## Exit condition

Gateway workspace and session operations preserve stable gateway-scoped identities and recover to a documented state after interruption.
