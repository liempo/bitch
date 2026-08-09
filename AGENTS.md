# Repository Instructions

## Documentation structure

Use these locations:

- `docs/product/` for product requirements and user-visible business rules.
- `docs/architecture/` for fixed technical design and component contracts.
- `docs/operations.md` for deployment and runtime operations.
- `docs/testing.md` for test requirements.
- `docs/glossary.md` for required terms.
- `plan/` for pending work and unresolved questions only.

Do not create new root-level `PLAN.md`, `DECISIONS.md`, `GAPS.md`, or `GLOSSARY.md` files.

## Required reading

Before a change:

1. Read `docs/README.md`.
2. Read the applicable product document.
3. Read the applicable architecture or operations document.
4. Read `docs/testing.md` for behavior changes.
5. Read the current phase file under `plan/`.

For Pi behavior, use the documentation and source for the pinned Pi version. Copy standard Pi behavior instead of inventing BITCH behavior.

## Plan item lifecycle

The plan contains pending work only. Do not leave completed `[x]` items in a plan file.

When you implement a plan item:

1. Implement the behavior through the documented public boundary.
2. Add or update behavioral tests.
3. Update the applicable document under `docs/` with the actual code paths, public interfaces, failure behavior, and operational effects.
4. Remove the completed item from its phase file.
5. Remove an empty phase file and update `plan/README.md` when the phase is complete.

Use Git history as the completion record. Do not create a completed-task archive.

If implementation differs from an approved document, stop and resolve the difference. Do not silently change product behavior or architecture.

## Documentation rules

- Keep product rules separate from implementation details.
- Keep pending tasks and unresolved questions out of normative documentation.
- Link to one authoritative document instead of copying the same rule.
- Use the terms in `docs/glossary.md`.
- Use ASD-STE100-inspired Simplified Technical English.
- State whether behavior is implemented when the distinction is necessary.
- Update links when moving or renaming a document.

When no document fits an implemented component, create a focused document under `docs/architecture/`. Do not create one large implementation journal.

## Architecture rules

- Keep the Agent Server a thin Pi RPC host.
- Delegate agent behavior to the pinned Pi SDK.
- Do not create a BITCH conversation engine or duplicate Pi live state.
- Keep Pi SDK types inside `packages/pi-runtime`.
- Keep clients behind the BITCH HTTP and SSE protocol.
- Keep Pi JSONL as the conversation source of truth.
- Add BITCH-owned state only for behavior that Pi does not provide.

## Testing rules

- Test observable behavior through public interfaces.
- Do not inspect source text, imports, private methods, or internal symbols as proof of behavior.
- Do not mock `AgentSession` or `AgentSessionRuntime` in integration tests.
- Use the scripted local model provider for deterministic integration tests.
- Execute the built CLI as a subprocess for end-to-end tests.
- Treat type checks, lint checks, and generated-file checks as build checks, not behavioral tests.
