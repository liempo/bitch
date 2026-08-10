# Repository Instructions

## Documentation structure

Use these locations:

- `docs/product/` for product requirements and user-visible business rules.
- `docs/architecture/` for fixed technical design and component contracts.
- `docs/operations.md` for deployment and runtime operations.
- `docs/testing.md` for test requirements.
- `docs/glossary.md` for required terms.
- `plan/` for pending phase outcomes and unresolved questions only.

Do not create new root-level `PLAN.md`, `DECISIONS.md`, `GAPS.md`, or `GLOSSARY.md` files.

## Required reading

Before a change:

1. Read `docs/README.md`.
2. Read the applicable product document.
3. Read the applicable architecture or operations document.
4. Read `docs/testing.md` for behavior changes.
5. Read the current phase file under `plan/`.
6. For development work, read the linked GitHub issue and its project item.

For Pi behavior, use the documentation and source for the pinned Pi version. Copy standard Pi behavior instead of inventing BITCH behavior.

## Development tracking

Use the [BITCH GitHub Project](https://github.com/users/liempo/projects/5) as the authoritative tracker for development work and status. Parent issues track broad outcomes. Executable leaf issues are work specifications. The files under `plan/` define phase order, pending phase outcomes, and unresolved questions. Do not duplicate issue status or detailed implementation task lists in `plan/`.

Before an issue enters `Queue = Ready`:

1. Add the issue to the project.
2. Break the task into the smallest independently verifiable implementation slices.
3. Define each slice's scope, exclusions, dependencies, public completion boundary, and acceptance checks.
4. Set each project item's `Phase`, `Priority`, `Risk`, `Size`, and `Agent` fields.
5. Keep each executable issue at `Size = XS` or `Size = S` and within one reviewable pull request.

Only a leaf issue can enter `Queue = Ready`. Keep `Size = M` and `Size = L` issues as parent tracking issues with `Agent = Unassigned` and `Queue = Backlog`.

An agent must be able to identify the exact behavior, implementation boundary, required tests, and documentation updates before it claims an issue. If the agent cannot confidently describe and verify the complete change, split the issue again. Do not start implementation to discover the issue scope.

Use a parent issue to track a broad outcome. Use child issues for the smallest reviewable implementation slices. Split work across independent contracts, components, and review boundaries.

To claim work:

1. Select only an issue with `Queue = Ready` and `Status = Todo`.
2. Confirm that its dependencies are complete.
3. Set `Status = In Progress` before implementation.
4. Start from current `origin/main`.

Keep dependency-gated work in `Queue = Backlog`. Use `Queue = Blocked` only for an evidence-proven architectural or external impossibility.

Each pull request must link its issue. Use `Closes #N` only when the pull request meets all acceptance criteria for issue `N`. A direct push to `main` does not complete project work.

Work is complete only after CI passes, the pull request is merged, GitHub reports it as merged, `origin/main` contains the change, and the issue is closed. After completion, move each dependency-free leaf issue from `Queue = Backlog` to `Queue = Ready`.

GitHub CLI access requires the `read:project` scope to inspect the project and the `project` scope to change it. If these scopes are unavailable, stop and report the access problem. Do not infer project fields or status.

## Plan item lifecycle

The plan contains pending phase outcomes only. Do not leave completed `[x]` items in a plan file.

When you implement work for a plan item:

1. Implement the behavior through the documented public boundary.
2. Add or update behavioral tests.
3. Update the applicable document under `docs/` with the actual code paths, public interfaces, failure behavior, and operational effects.
4. Remove the plan item only after all required GitHub Project issues are complete.
5. Remove an empty phase file and update `plan/README.md` when the phase is complete.

Use merged pull requests and closed issues as the completion record. Do not create a completed-task archive in the repository.

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
