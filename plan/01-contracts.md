# Phase 1: Contracts and Fixtures

## Outcome

Complete Pi-derived transport details and produce executable fixtures from the approved first-release contracts.

## Dependencies

Use the pinned Pi version and the approved documents under [`../docs/`](../docs/). Resolve any conflict before implementation.

## Pending work

- [ ] Materialize the new-conversation creation-receipt, preflight, retry, and crash-recovery transaction.
- [ ] Define and fixture HTTP body, image input, SSE event, heartbeat, reconnect, Directory ownership-lease, and artifact-streaming limits.
- [ ] Materialize the process-scoped Directory project-trust preflight and interaction contract from pinned Pi behavior.
- [ ] Map each pinned `/settings` field to server persistence or client presentation and commit its exact protocol fixtures.
- [ ] Define provider-auth callback routing for containerized Agent Servers without weakening the browser-origin boundary.
- [ ] Create exact built-CLI argument, human-output, JSON, JSONL, detach, interrupt, and error fixtures for every first-release command family.
- [ ] Create a scripted local model-provider fixture with deterministic text streams, tool calls, images, retries, compaction, dialogs, and failures.

Swift generation and native-client fixtures remain deferred with Phase 7.

## Exit condition

Phase 2 can start when the protocol, CLI, and model-provider fixtures validate against the approved HTTP, SSE, persistence, capability, and acceptance contracts.
