# Phase 7: Native macOS Client

## Outcome

Deliver the gateway conversation workflow through a native SwiftUI client after the CLI and TUI first release.

## Product stage

This phase is deferred. It is not part of the first-release exit condition.

Do not resolve the remaining macOS decisions before the CLI and TUI release is complete. Start implementation only after explicit activation of the native product stage.

## Dependencies

Complete the first release and its stable gateway identity, registry, protocol, and CLI behavior.

Use these approved deferred contracts:

- [`../docs/product/macos.md`](../docs/product/macos.md).
- [`../docs/architecture/macos-client.md`](../docs/architecture/macos-client.md).
- [`../docs/product/deferred-acceptance.md`](../docs/product/deferred-acceptance.md).

Resolve deferred packets D04 through D06 in [`gaps.md`](gaps.md).

## Pending work

- [ ] Create the native Xcode project under `apps/macos`.
- [ ] Generate Swift models and client types from committed OpenAPI artifacts.
- [ ] Implement the Swift API client, SSE actor, and connection registry.
- [ ] Implement local and remote gateway registration and selection.
- [ ] Implement master and named gateway presentation without merged cross-gateway actions.
- [ ] Implement conversation listing, grouping, status, and completion-viewed presentation for one selected gateway.
- [ ] Implement a blank new-conversation draft and workspace selection.
- [ ] Implement text prompts, image attachments, streaming messages, and tool activity.
- [ ] Implement model and thinking-level controls.
- [ ] Implement reconnect, foreground reconciliation, and server-restart presentation.
- [ ] Implement extension dialogs and approved custom UI presentation.
- [ ] Implement inline edit diffs.
- [ ] Implement workspace creation, Trash, restore, and permanent-deletion flows.
- [ ] Add Swift protocol and client integration tests.
- [ ] Verify that each Agent Server operation exposed by the app already has a public CLI path and behavioral test.

## Exit condition

The macOS app completes its approved gateway workflows without depending on the CLI process or Pi SDK.
