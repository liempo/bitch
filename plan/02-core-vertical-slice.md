# Phase 2: Core Gateway and CLI Vertical Slice

## Outcome

Run one persistent gateway conversation through the built CLI, real Agent Server, and real pinned Pi SDK.

## Dependencies

Complete the Phase 1 protocol, CLI, and scripted-provider fixture corpus.

## Pending work

- [ ] Create the npm workspace, strict TypeScript configuration, ESM build, and committed lockfile.
- [ ] Create `apps/agent-server`, `apps/cli`, `packages/protocol`, `packages/agent-client`, and `packages/pi-runtime`.
- [ ] Create the approved client gateway registry package boundary.
- [ ] Pin Node.js and `@earendil-works/pi-coding-agent` versions.
- [ ] Implement TypeBox generation for TypeScript, JSON Schema, and OpenAPI artifacts.
- [ ] Implement Fastify startup, `/health/live`, `/health/ready`, `/v1/status`, and minimal JSON logging.
- [ ] Create and persist the stable Gateway-mode Agent Server ID.
- [ ] Implement gateway registration, master selection, and named selection through the built CLI.
- [ ] Implement the thin live-runtime registry with real `AgentSessionRuntime` creation and disposal.
- [ ] Implement prompt and state delegation based on the pinned Pi RPC dispatcher.
- [ ] Implement Pi event mapping, SSE snapshots, stream IDs, sequence numbers, and heartbeats.
- [ ] Implement Pi JSONL discovery, session locking, and conversation reopen.
- [ ] Implement the creation-receipt transaction, command-ID gate, and durable receipts for core commands.
- [ ] Implement `AgentClient` and the HTTP and SSE `AgentServerClient`.
- [ ] Implement public CLI JSON and JSONL output with gateway-scoped resource references.
- [ ] Implement the Gateway-mode Docker image with a persistent `/data` root and default workspace.
- [ ] Implement the scripted local model-provider test server.
- [ ] Add Vitest tests for BITCH-owned core rules through public interfaces.
- [ ] Add real HTTP, SSE, Pi SDK, and filesystem integration tests.
- [ ] Add the built-CLI Gateway-mode Docker workflow from [`../docs/testing.md`](../docs/testing.md).

## Exit condition

The built CLI can register a gateway, select it, prompt, stream, persist, replace its container, verify its identity, reconnect, and reopen one conversation in CI.
