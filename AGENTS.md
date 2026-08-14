# Repository Instructions

## Documentation structure

Use these locations:

- `docs/product/` for product requirements and user-visible business rules.
- `docs/architecture/` for fixed technical design and component contracts.
- `docs/plans/` for executable plans for one delivery issue.
- `docs/operations.md` for deployment and runtime operations.
- `docs/testing.md` for test requirements.
- `docs/glossary.md` for required terms.
- `docs/plan/` for program and phase sequence, boundaries, outcomes, and unresolved questions.

Do not create new root-level `PLAN.md`, `DECISIONS.md`, `GAPS.md`, or `GLOSSARY.md` files.

## Required reading

Before a change:

1. Read `docs/README.md`.
2. Read the applicable product document.
3. Read the applicable architecture or operations document.
4. Read `docs/testing.md` for behavior changes.
5. Read the current phase file under `docs/plan/`.
6. Read the selected GitHub issue and its project item.
7. Read the issue's executable plan when the plan gate applies.

For Pi behavior, use the documentation and source for the pinned Pi version. Copy standard Pi behavior instead of inventing BITCH behavior.

## Artifact authority

Keep these three planning levels separate:

1. A program or phase plan under `docs/plan/` defines sequence, boundaries, dependencies, and public outcomes. It does not define executable units or status.
2. A delivery issue defines one queued slice, its acceptance criteria, dependencies, rollback, and pull-request boundary.
3. An executable plan under `docs/plans/` defines the implementation units and verification contract for one delivery issue.

A program or phase plan cannot authorize implementation. The GitHub Project, Git history, commits, and pull requests hold execution status. Do not put progress checkboxes or completed-task archives in durable plans.

## Authoritative work queue

Use the [BITCH GitHub Project](https://github.com/users/liempo/projects/5) as the authoritative execution queue. Parent issues track broad outcomes. Leaf issues define delivery slices.

Backlog items can be refined and can receive executable plans. `Queue = Ready` authorizes delivery execution, not backlog grooming. Do not implement or create a delivery commit for a backlog item.

Before a leaf issue enters `Queue = Ready`:

1. Add the issue to the project.
2. Define its goal, scope, exclusions, dependencies, public completion boundary, scenarios, exact verification, rollback, and definition of done.
3. Close every native blocking issue.
4. Set `Phase`, `Priority`, `Risk`, `Size`, and `Agent`.
5. Keep the issue at `Size = XS` or `Size = S` and within one focused pull request.
6. Complete the executable-plan gate when it applies.

Keep `Size = M` and `Size = L` parent issues at `Agent = Unassigned` and `Queue = Backlog`. Keep dependency-gated work in `Queue = Backlog`. Use `Queue = Blocked` only for an evidence-proven architectural or external impossibility.

To claim work:

1. Select one issue explicitly.
2. Confirm that it is a leaf with `Queue = Ready` and `Status = Todo`.
3. Confirm that all native blockers are closed and all dependencies are complete.
4. Confirm that the issue, executable plan, and current decisions agree.
5. Set `Status = In Progress` before implementation.
6. Start from current `origin/main`.

If the complete behavior, implementation boundary, evidence, tests, or documentation cannot be identified before coding, split or re-plan the issue. Do not start implementation to discover its scope.

GitHub CLI access requires the `read:project` scope to inspect the project and the `project` scope to change it. If these scopes are unavailable, stop and report the access problem. Do not infer project fields or status.

## Executable-plan gate

Require one unified executable plan for each code-changing delivery issue. Also require a plan for any non-mechanical repository change that needs a decision, scope boundary, or traceability.

The plan must use:

- `artifact_contract: ce-unified-plan/v1`.
- `artifact_readiness: requirements-only` while a launch blocker remains.
- `artifact_readiness: implementation-ready` only when the execution contract is complete and no launch blocker remains.
- `execution: code` for code work.

An implementation-ready plan must define:

- the goal and non-goals.
- governing requirements, decisions, open questions, and relevant risks or gaps. State when no open question remains.
- stable local IDs for requirements, technical decisions, and implementation units.
- exact repository-relative files.
- success, edge, failure, integration, and authorization scenarios when applicable.
- exact verification commands or manual checks.
- rollback expectations.
- a definition of done.

`ce-work` cannot start from a requirements-only plan. Use [`.github/EXECUTABLE_PLAN_TEMPLATE.md`](.github/EXECUTABLE_PLAN_TEMPLATE.md) only when `ce-plan` is unavailable. Report the unavailable skill and preserve every plan gate. Do not install or configure replacement tooling without approval.

### Mechanical plan skip

A bounded work prompt can replace an executable plan only when all these conditions are true:

- The change is atomic and fits one commit.
- The change has no behavioral effect.
- The change requires no technical decision or scope boundary.
- No requirement, decision, incident, or deferred item needs traceability.

A documentation typo or a mechanical identifier rename can qualify. If any condition fails, write a plan. The issue and focused pull-request rules still apply.

## Compound Engineering routing

The project-local package set in [`.pi/settings.json`](.pi/settings.json) is the authoritative Compound Engineering pin.

- Use `ce-brainstorm` when product behavior or scope is unclear.
- Use `ce-plan` to create or enrich the unified executable plan.
- Use `ce-work` only with an approved implementation-ready plan, except for a valid mechanical skip.
- Use `ce-code-review` before delivery for every non-mechanical change.
- Use `ce-commit` for the canonical local commit after owner review and final verification.

If a required skill is unavailable, follow its gates with the repository fallback artifacts and report the missing capability. Do not claim that an unavailable skill ran.

## Evidence-driven implementation

- Use characterization-first work when preserving, copying, or importing existing behavior.
- Use proof-first work for new enforceable behavior when a practical test seam exists.
- Run focused checks during implementation.
- Run the delivery issue's complete verification contract before review and again after accepted review fixes.
- Test allowed and denied behavior when authorization applies.
- Stop when an unresolved question affects behavior, authorization, evidence, migration safety, or architecture.
- Apply database, immutability, provenance, and migration controls only when they fit BITCH and its approved architecture.

## Delivery ownership and review

One owning session or developer must:

1. Confirm that the issue, dependencies, plan, and current decisions agree.
2. Control writes to the canonical working tree.
3. Review the actual diff.
4. Apply accepted review fixes.
5. Rerun authoritative verification.
6. Create the canonical local commit before delivery.

Use read-only reviewers or isolated worktrees for parallel help. Do not allow multiple writers to mutate the same working tree concurrently. A helper cannot own the final commit or delivery state.

Each pull request must link one delivery issue. Use `Closes #N` only when the pull request meets all acceptance criteria for issue `N`. A direct push to `main` does not complete project work.

Keep `Status = In Progress` during implementation and owner review. An open linked pull request is this project's `In Review` signal.

Set `Status = Done` only after:

- all acceptance criteria pass.
- all configured CI passes.
- GitHub reports the pull request as merged.
- `origin/main` contains the merge.
- the issue closes.

If no CI exists, disclose that gap and link its tracker issue instead of claiming CI passed.

After completion, move each dependency-free leaf issue from `Queue = Backlog` to `Queue = Ready` only after its plan and metadata gates pass.

Complete the current phase gate before starting dependent work in the next phase.

## Program and phase plan lifecycle

Phase plans contain pending outcomes and unresolved questions. They do not contain issue-sized implementation steps or execution state.

When a phase outcome is implemented:

1. Verify behavior through the documented public boundary.
2. Update behavioral tests.
3. Update the authoritative document under `docs/` with actual interfaces, paths, failure behavior, and operational effects.
4. Remove the completed outcome only after all required delivery issues and pull requests are complete.
5. Remove an empty phase file and update `docs/plan/README.md` when the phase is complete.

Use merged pull requests and closed issues as the completion record. If implementation differs from an approved document, stop and resolve the difference. Do not silently change product behavior or architecture.

## Environment and repository hygiene

- Do not connect local development or automated tests to production services or production data.
- Use local, temporary, or isolated test services and data.
- Keep credentials, personal data, private records, bearer tokens, and secret-bearing logs out of Git.
- Keep generated dependencies, build output, coverage, caches, and local service state untracked unless an authoritative repository contract requires an exception.
- Do not install or configure external development tooling without user approval.
- Preserve stronger security, privacy, licensing, and compliance controls in this repository.

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

- Copy observable behavior from the pinned Paseo source before adding BITCH-specific behavior.
- Keep the daemon as the host authority for Pi RPC subprocesses, PTYs, Projects, Workspaces, Conversations, and normalized timelines.
- Delegate agent behavior to the pinned Pi executable through process-backed RPC. Do not embed the Pi SDK.
- Do not create a second BITCH conversation engine or duplicate Pi live state outside the Paseo-derived adapter and normalized timeline.
- Keep Pi RPC types inside the daemon's Pi provider adapter.
- Keep clients behind the BITCH WebSocket daemon protocol.
- Keep the loaded normalized timeline authoritative for BITCH client synchronization and rendering.
- Keep Pi JSONL durable and native to Pi for discovery, import, resume, and post-restart history reconstruction.
- Add BITCH-owned state only for an approved difference from Paseo.
- Never merge, redirect, replicate, or fall back across daemon IDs.

## Testing rules

- Preserve applicable pinned Paseo tests, including package-internal regression tests.
- Prove new or changed BITCH behavior through public interfaces.
- Do not inspect source text, imports, private methods, or internal symbols as proof of behavior.
- Use a real pinned Pi RPC process with the scripted local model provider for deterministic integration tests.
- Execute the built CLI as a subprocess for end-to-end tests.
- Use real PTYs for Terminal integration tests.
- Treat type checks, lint checks, and generated-file checks as build checks, not behavioral tests.
