# Phase 6: First Release

## Outcome

Produce a supported, recoverable, and verifiable CLI and TUI release for Directory mode and Gateway mode.

## Dependencies

Use the approved operational, security, compatibility, and release gates in [`../docs/operations.md`](../docs/operations.md) and [`../docs/testing.md`](../docs/testing.md).

Complete Phases 1 through 5 and the first-release workflows in [`../docs/product/acceptance.md`](../docs/product/acceptance.md). Do not include the deferred macOS app or Apple `container` driver.

## Pending work

- [ ] Create and test the remote Gateway-mode Docker Compose deployment.
- [ ] Document `/data` ownership, permissions, backup, and restore procedures.
- [ ] Document `BITCH_HOME`, gateway registry, and local gateway backup procedures.
- [ ] Implement and document supported upgrade and rollback paths.
- [ ] Apply bind-address, Tailnet, origin, and secret-exposure rules.
- [ ] Define and verify operator-visible startup, storage, registry, identity, and recovery failures.
- [ ] Pin and publish the supported platform and dependency version matrix.
- [ ] Add behavioral compatibility checks for Pi and the TUI.
- [ ] Verify performance and concurrency limits across multiple gateways.
- [ ] Implement packaging, artifact signing, and license-notice checks.
- [ ] Run all pull-request gates for Directory mode and Gateway mode.
- [ ] Verify local Docker gateway creation, persistence, replacement, and registry-only deletion.
- [ ] Verify that unavailable gateways never cause fallback.
- [ ] Verify the final first-release acceptance workflows and exit criteria.

## Exit condition

A user can install BITCH, use Directory mode, manage multiple local and remote gateways, and recover supported deployments from the published documentation.
