# Phase 2: Pi-Only Daemon Vertical Slice

## Outcome

Run one durable Pi Conversation through the copied daemon and built BITCH CLI while excluding every non-Pi runtime from the public product.

## Dependencies

Complete Phase 1. Use [`../docs/architecture/pi-capabilities.md`](../docs/architecture/pi-capabilities.md), [`../docs/product/conversations.md`](../docs/product/conversations.md), and [`../docs/testing.md`](../docs/testing.md).

## Phase boundaries

This phase owns the Pi-only provider boundary, one complete Conversation lifecycle, authoritative normalized timeline behavior, native Pi import and resume, and the built CLI Conversation path.

This phase does not deliver Projects, managed Workspaces, interactive Terminals, the BITCH TUI, or remote-daemon routing.

## Required outcomes

- Real Pi 0.83.0 RPC integration uses a deterministic scripted local model provider.
- Public discovery, configuration, creation, import, and resume expose only Pi and reject non-Pi requests before process start.
- One durable Conversation supports normalized streaming, latest-tail reads, reconnect, stop, compaction, rewind, model and thinking controls, and contained failures.
- Pi extensions, skills, prompts, images, and supported question dialogs cross the retained daemon boundary without loading extension UI in clients.
- Pi JSONL supports listing, explicit import, exact native resume, and post-restart normalized-history reconstruction with a new timeline epoch.
- Public daemon-client integration tests and a built-CLI subprocess workflow prove the vertical slice.

## Exit condition

The built CLI can create, observe, disconnect from, reconnect to, stop, and resume one Pi Conversation. No public operation can start a non-Pi runtime.
