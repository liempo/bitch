# Phase 3: Pi Capabilities, TUI, and Directory Mode

## Outcome

Make the CLI and TUI the first complete clients for the approved Pi capability boundary.

## Dependencies

Complete the Phase 2 core Gateway-mode vertical slice.

Use the approved capability matrix in [`../docs/architecture/pi-capabilities.md`](../docs/architecture/pi-capabilities.md) and API contract in [`../docs/architecture/api.md`](../docs/architecture/api.md).

## Pending work

- [ ] Add prompt images, steering, follow-up, abort, and new-session operations.
- [ ] Add model discovery, selection, cycling, and thinking-level operations.
- [ ] Add the pinned `/settings` server-persistence and client-presentation mapping.
- [ ] Add steering mode, follow-up mode, compaction, and retry operations.
- [ ] Add Pi shell commands, direct bash commands, and shell abort.
- [ ] Add session statistics, HTML export, naming, and last-assistant-text queries.
- [ ] Add session tree, switch, fork, clone, entry, and tree operations.
- [ ] Add extension, prompt-template, and skill command discovery and invocation.
- [ ] Add selected-conversation resource reload through the protocol, CLI, and TUI.
- [ ] Load extensions with one `DefaultResourceLoader` runtime for each live conversation.
- [ ] Add extension dialogs, fire-and-forget UI, and approved custom UI behavior.
- [ ] Add Directory project-trust preflight, one-run overrides, saved decisions, and `/trust` behavior.
- [ ] Add multiple-client delivery and first-valid dialog resolution.
- [ ] Add five-minute idle release and JSONL restoration.
- [ ] Add stopped-by-restart state without automatic command replay.
- [ ] Add a public CLI path and integration test for each supported non-interactive server capability.
- [ ] Add TUI and integration coverage for provider authentication, callback routing, and extension interaction surfaces.
- [ ] Vendor the pinned Pi TUI integration and replace runtime access with `AgentServerClient`.
- [ ] Show the selected mode, gateway alias, and connection state in the TUI.
- [ ] Preserve upstream license notices and BITCH branding.
- [ ] Implement the shared Docker runtime driver for image, container, mount, network, port, and inspection operations.
- [ ] Implement Directory-mode Docker startup, identity mounts, ports, readiness, ownership leases, shutdown, and cleanup.
- [ ] Implement `BITCH_HOME`, local image build caching, image retention, and stale temporary-container cleanup.
- [ ] Implement shared Pi configuration and session mounts for concurrent Directory-mode processes.
- [ ] Add the built-CLI Directory-mode Docker workflow from [`../docs/testing.md`](../docs/testing.md).
- [ ] Add observable Pi TUI and extension compatibility tests.

## Exit condition

Every supported Pi RPC capability has a protocol operation, server delegation, CLI or TUI path, persistence rule, and behavioral integration test. Directory mode passes its complete Docker workflow.
