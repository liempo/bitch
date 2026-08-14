---
title: Development Workflow and Compound Engineering Adoption - Plan
type: docs
date: 2026-08-13
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-plan-bootstrap
execution: code
---

# Development Workflow and Compound Engineering Adoption - Plan

## Goal Capsule

- **Objective:** Define one repository delivery workflow from queue selection through merged completion.
- **Authority:** The user request and issue #62 govern this slice. `AGENTS.md` will own the durable workflow rules.
- **Execution profile:** Documentation, repository templates, and project-local Compound Engineering configuration.
- **Stop conditions:** Stop if a change would alter product behavior, architecture, GitHub field definitions, branch protection, or CI design.
- **Tail ownership:** One delivery owner reviews the diff, runs verification, applies review fixes, and creates the canonical local commit when requested.

---

## Product Contract

### Summary

The repository needs one workflow that keeps phase planning, delivery specification, and executable implementation planning separate. The workflow must use the existing GitHub Project fields and the pinned Compound Engineering package.

### Actors

- A1. The delivery owner controls the working tree, final verification, review fixes, and canonical local commit.
- A2. A contributor or coding agent claims one ready delivery issue and implements only its approved plan.
- A3. A read-only reviewer can inspect the diff without writing to the owner's working tree.

### Requirements

**Queue and planning authority**

- R1. The BITCH GitHub Project is the authoritative execution queue.
- R2. Delivery execution can start only from a selected leaf issue with `Queue = Ready`, `Status = Todo`, and no open native blocker. Backlog grooming and executable-plan authoring do not authorize implementation.
- R3. Program or phase plans define sequence, boundaries, and outcomes without delivery status or executable task lists.
- R4. A delivery issue defines one pull-request-sized slice, including scope, exclusions, dependencies, scenarios, verification, rollback, and definition of done.
- R5. Each code-changing delivery issue requires one `ce-unified-plan/v1` executable plan with `artifact_readiness: implementation-ready` and `execution: code` before repository mutation.
- R6. A requirements-only plan cannot authorize implementation.

**Execution and evidence**

- R7. The mechanical plan skip applies only when the change is atomic, non-behavioral, decision-free, scope-obvious, and traceability-free.
- R8. Unclear product behavior routes to `ce-brainstorm`, planning routes to `ce-plan`, implementation routes to `ce-work`, non-mechanical review routes to `ce-code-review`, and the canonical local commit routes to `ce-commit`.
- R9. Behavior-preserving work starts with characterization evidence, and new enforceable behavior starts with failing proof when a practical seam exists.
- R10. The owner runs focused checks during implementation and the full issue verification contract before delivery.
- R11. An unresolved question about behavior, authorization, evidence, migration safety, or architecture stops implementation.

**Ownership, review, and safety**

- R12. One owner controls repository writes, reviews the actual diff, applies accepted fixes, reruns verification, and creates the canonical local commit.
- R13. Parallel help is read-only or uses isolated worktrees. Multiple writers cannot mutate one working tree concurrently.
- R14. The project item remains `Status = In Progress` through implementation and owner review. An open linked pull request is the repository's review signal.
- R15. `Status = Done` requires accepted scope, passing verification and CI when present, merged pull request, merged `origin/main`, and a closed issue.
- R16. Local development and automated tests cannot use production services, production data, credentials, private records, or bearer tokens.
- R17. Generated dependencies, build output, coverage, caches, local service state, and secrets remain untracked unless an authoritative repository contract requires them.

**Repository artifacts**

- R18. `AGENTS.md` owns the normative workflow. `README.md`, `docs/README.md`, phase plans, and templates link to it instead of copying the full policy.
- R19. The repository adopts the exact Compound Engineering package pin and companion packages already declared in `.pi/settings.json`.
- R20. The repository supplies a delivery issue form, pull-request checklist, executable-plan location, and manual fallback template.
- R21. This slice does not restore CI. Issue #63 owns CI planning and implementation.
- R22. Delivery uses one focused local commit and one linked pull request. It does not push directly to `main`.

### Key Flows

- F1. Claim work: A2 selects an R2-compliant issue, confirms its implementation-ready plan, changes `Status` to `In Progress`, and starts from current `origin/main`.
- F2. Execute work: A1 uses the R8 route, gathers R9 evidence, runs R10 checks, and stops on an R11 blocker.
- F3. Review and deliver: A3 reviews without shared-tree writes, A1 applies accepted fixes, reruns verification, creates the canonical commit when requested, and opens one linked pull request.
- F4. Complete work: GitHub reports the pull request merged, `origin/main` contains it, CI passes when present, the issue closes, and the project item moves to `Done`.

### Acceptance Examples

- AE1. **Covers R2, R5, R6.** Given a ready leaf issue with an implementation-ready plan and closed blockers, when the owner claims it, then repository work can start.
- AE2. **Covers R2, R6.** Given a backlog, blocked, parent, dependency-blocked, or requirements-only item, when a contributor tries to start delivery execution, then the workflow denies the start.
- AE3. **Covers R7.** Given a typo-only one-commit change with no decision or traceability need, when the owner uses a bounded work prompt, then the plan skip is valid.
- AE4. **Covers R7.** Given a change that affects behavior or requires a scope choice, when the owner considers the plan skip, then the workflow requires an executable plan.
- AE5. **Covers R12, R13.** Given parallel review help, when reviewers inspect the change, then only the owner writes to the canonical working tree.
- AE6. **Covers R14, R15.** Given an open linked pull request, when review is active, then `Status` remains `In Progress`. It becomes `Done` only after merged completion.
- AE7. **Covers R16, R17.** Given local tests and installed Pi packages, when checks run, then they use isolated local resources and leave package caches and secrets untracked.

### Scope Boundaries

**In scope**

- Repository workflow instructions, summaries, maps, phase-plan alignment, templates, plan artifact, Pi project settings, and ignore rules.
- Remote creation, dependency state, and queue state of issue #62.
- Remote backlog issue #63 for CI restoration.
- GitHub Project description alignment, including specification parent #64 and leaves #65 through #71.

**Deferred to follow-up work**

- Issue #63 defines and restores repository CI after this workflow is authoritative.

**Out of scope**

- Product behavior, architecture, source import, branch protection, release gates, and direct pushes to `main`.

### Dependencies and Risks

- Issues #53 and #64 are closed. Their merged contracts supply the licensing target and separated specification changes.
- Issues #65 through #71 own the pre-existing specification changes. The owner must preserve their merged content and isolate this workflow slice during diff review.
- Compound Engineering is pinned at commit `0a2957852e2034d04eb01120fd7da6ed5307dc56`. A later package update requires its own reviewed change.
- GitHub Project 5 has no `In Review` status option. The linked pull request provides the review signal without remote field redesign.

### Open Questions

None. No launch-blocking or deferred question remains for issue #62.

### Sources

- License and provenance issue #53: `https://github.com/liempo/bitch/issues/53`
- Specification parent issue #64: `https://github.com/liempo/bitch/issues/64`
- Issue #62: `https://github.com/liempo/bitch/issues/62`
- Follow-up issue #63: `https://github.com/liempo/bitch/issues/63`
- BITCH GitHub Project: `https://github.com/users/liempo/projects/5`
- `AGENTS.md`
- `README.md`
- `docs/README.md`
- `docs/plan/README.md`
- `.pi/git/github.com/EveryInc/compound-engineering-plugin/skills/ce-plan/references/plan-sections.md`

---

## Planning Contract

### Product Contract preservation

Product Contract created by `ce-plan` bootstrap from the user-approved workflow contract. No upstream Product Contract exists.

### Key Technical Decisions

- KTD1. **One normative workflow.** `AGENTS.md` owns queue, planning, execution, ownership, review, completion, and safety rules. Other files contain summaries or artifact-specific instructions and link back to it. Governs R1-R18.
- KTD2. **Keep existing Project fields.** Ready work remains `Queue = Ready` plus `Status = Todo`. An open linked pull request supplies the review signal while `Status = In Progress` remains active. Governs R2, R14, R15.
- KTD3. **Adopt pinned Compound Engineering.** (session-settled: user-directed, chosen over a repository-native-only plan format: the repository already has a pinned project package configuration and the user selected CE adoption.) Track `.pi/settings.json`, keep CE-generated package caches untracked, and use CE's default `docs/plans/` artifact root. Governs R5, R6, R8, R19.
- KTD4. **Keep CI restoration separate.** (session-settled: user-approved, chosen over restoring CI in this slice: the only old workflow targets a superseded architecture and needs an independent verification design.) Track the work in dependency-blocked issue #63. Governs R21.
- KTD5. **Keep the fallback template outside `docs/plans/`.** Put the manual template at `.github/EXECUTABLE_PLAN_TEMPLATE.md` so CE latest-plan discovery does not treat a template as an executable plan. Governs R20.
- KTD6. **Keep phase plans separate.** Store phase plans under `docs/plan/`. They retain outcomes, boundaries, dependencies, and exit gates. Delivery issue bodies and executable plans own implementation detail. Governs R3, R4, R18.

### Implementation Constraints

- Preserve current product, architecture, testing, and licensing rules in `AGENTS.md`.
- Do not claim Compound Engineering behavior beyond the pinned package source.
- Do not install another tool or add `.compound-engineering/config.yaml`. The default artifact root is already `docs`.
- Keep all new links repository-relative where the target is in this repository.
- Use ASD-STE100-inspired Simplified Technical English.

### Sequencing

1. Establish the tracked CE configuration and fallback artifact contract.
2. Make `AGENTS.md` normative and align summary documents.
3. Remove execution-state semantics from phase plans.
4. Add issue and pull-request templates.
5. Review the complete diff, verify local links and configuration syntax, then align the remote Project description.

---

## Implementation Units

### U1. Establish Compound Engineering artifacts

- **Goal:** Track the pinned CE package declaration and provide an executable-plan fallback without tracking local package state.
- **Requirements:** R5-R8, R17, R19, R20.
- **Dependencies:** None.
- **Files:** `.pi/settings.json`, `.gitignore`, `.github/EXECUTABLE_PLAN_TEMPLATE.md`, `docs/plans/2026-08-13-001-docs-development-workflow-plan.md`.
- **Approach:** Preserve the exact package pin already installed in project settings. Ignore Pi package clones, npm package state, CE local config, and CE scratch state. Make the fallback template match the stable CE section and metadata contract.
- **Test scenarios:**
  - Given `.pi/settings.json`, parse it as JSON and verify the CE pin plus both companion package pins remain exact.
  - Given a generated `.pi/git` or `.pi/npm` file, ask Git which ignore rule applies and verify it stays untracked.
  - Given the fallback template, verify it contains stable R, KTD, and U identifiers plus all implementation-ready sections.
- **Verification:** Project settings parse, ignore probes identify repository rules, and no cache path enters the intended diff.

### U2. Declare the normative workflow

- **Goal:** Make one contributor path authoritative and link all summaries to it.
- **Requirements:** R1-R18, R21, R22, F1-F4, and AE1-AE7.
- **Dependencies:** U1.
- **Files:** `AGENTS.md`, `README.md`, `docs/README.md`.
- **Approach:** Extend existing queue controls instead of replacing them. Define all three planning levels, the CE readiness gate, mechanical skip, skill routes, evidence rules, owner responsibilities, review mapping, delivery states, and environment boundaries in `AGENTS.md`. Preserve the specification, architecture, and testing text merged through #71. Keep the other documents concise.
- **Test scenarios:**
  - Covers AE1. Follow links from `README.md` and identify the exact ready state and executable-plan gate.
  - Covers AE2. Search the normative workflow for each denied start condition and verify no summary weakens it.
  - Covers AE3 and AE4. Compare a typo change and a behavioral change against every mechanical-skip condition.
  - Covers AE5 and AE6. Trace one change through ownership, review, final verification, commit, pull request, merge, and `Done`.
  - Covers AE7. Verify the workflow bans production resources and tracked secrets for local development and tests.
- **Verification:** The three files use one term for each artifact and contain no contradictory start, review, or completion rule.

### U3. Move phase plans without changing their contract

- **Goal:** Move the program and phase plan from root `plan/` to `docs/plan/` while preserving the contract merged through #71.
- **Requirements:** R3, R4, R18.
- **Dependencies:** U2 and merged issue #71.
- **Files:** Move `plan/README.md`, `plan/01-paseo-baseline.md`, `plan/02-pi-daemon.md`, `plan/03-workspaces-terminals.md`, `plan/04-cli-tui.md`, `plan/05-remote-daemons.md`, `plan/06-release.md`, `plan/07-macos-client.md`, and `plan/gaps.md` to the matching paths under `docs/plan/`. Update the moved-gap link in `docs/architecture/macos-client.md`.
- **Approach:** Perform a path-only move, then update repository-relative links and workflow path references. Do not change phase order, dependencies, outcomes, boundaries, exit conditions, or deferred questions.
- **Test scenarios:**
  - Given any file under `docs/plan/`, verify it contains no `- [ ]` or `- [x]` progress marker.
  - Given a phase file, verify a contributor must use the GitHub Project and `docs/plans/` to find issue-sized executable work.
  - Given the Phase 1 plan, verify its license-before-import dependency and exit condition remain intact.
  - Given the deferred Phase 7 plan and gaps, verify deferred desktop scope remains deferred.
- **Verification:** Phase order and gates remain complete, while no phase file acts as an issue or executable plan.

### U4. Add delivery templates

- **Goal:** Make new delivery issues and pull requests collect the workflow's required evidence.
- **Requirements:** R4, R5, R7, R10-R17, R20.
- **Dependencies:** U2.
- **Files:** `.github/ISSUE_TEMPLATE/delivery.yml`, `.github/PULL_REQUEST_TEMPLATE.md`.
- **Approach:** Use a GitHub issue form for scope, exclusions, dependencies, plan metadata, scenarios, verification, rollback, and done criteria. Use the pull-request template for issue linkage, plan path or mechanical-skip proof, evidence, review, verification, rollback, environment safety, and owner attestation.
- **Test scenarios:**
  - Given a code-changing issue, verify the form requests the plan path, artifact readiness, exact files, all applicable scenario classes, exact verification, rollback, and definition of done.
  - Given a valid mechanical skip, verify the form captures evidence for every skip condition.
  - Given an authorization change, verify the form requests both allowed and denied scenarios.
  - Given a pull request, verify the template distinguishes focused checks from final authoritative verification and identifies the owner.
  - Given a secret or production-resource risk, verify the pull-request template requires an explicit safety attestation.
- **Verification:** YAML parses, required fields are not hidden in descriptive prose, and the pull-request template has no progress-state role.

### U5. Align remote tracker documentation

- **Goal:** Make the GitHub Project and delivery issues match the repository workflow, phase-plan location, and specification split.
- **Requirements:** R1, R2, R5, R14, R15, R18, R21.
- **Dependencies:** U2, U3, U4.
- **Files:** None. This unit updates Project 5, issues #52 through #71, parent and sub-issue links, native dependencies, and item metadata.
- **Approach:** Summarize the artifact hierarchy and gates. Change root `plan/` references to `docs/plan/`. Keep #62 at `Status = In Progress` through owner review and pull-request merge. Record #53 and #64 as completed prerequisites and #65 through #71 as completed specification leaves.
- **Test expectation:** None. This unit changes tracker documentation, not repository or product behavior.
- **Test scenarios:**
  - Given issue #62, verify its project item is `Queue = Ready`, `Status = In Progress`, `Size = S`, and `Agent = Autonomous agent` before merge.
  - Given issue #62, verify native blockers #53 and #64 are closed.
  - Given issue #63, verify it is `Queue = Backlog`, `Status = Todo`, and natively blocked by open issue #62 before merge.
  - Given parent #64, verify #65 through #71 are closed sub-issues with complete metadata and executable-plan paths.
  - Given the Project description, verify it identifies the current workflow delivery state without claiming that #63 can start.
  - Given issues #52 through #62, verify phase-plan references use `docs/plan/` and the focused-diff command includes both the old and new locations.
- **Verification:** Read the Project description, issues #52 through #71, native relationships, and relevant project items through the GitHub API after the update.

---

## Verification Contract

| Check | Command or method | Proves |
|---|---|---|
| Whitespace | Run `git diff --check` before staging and `git diff --cached --check` after staging. | Tracked and newly added text has no whitespace errors. |
| CE settings | `node -e "const s=JSON.parse(require('fs').readFileSync('.pi/settings.json','utf8')); const e=['git:github.com/EveryInc/compound-engineering-plugin@0a2957852e2034d04eb01120fd7da6ed5307dc56','npm:pi-subagents@0.48.0','npm:pi-ask-user@0.14.0']; if (JSON.stringify(s.packages)!==JSON.stringify(e)) process.exit(1); console.log('CE settings OK')"` | The adopted package set and pins are exact. |
| YAML syntax | Parse `.github/ISSUE_TEMPLATE/delivery.yml` with the already installed `yaml` module under `.pi/npm/node_modules/`. | The issue form is valid YAML. |
| Plan state | `! rg -n --glob '*.md' -- '- \[[ xX]\]' docs/plan` | Program and phase plans contain no progress checkboxes. |
| Local links | Run a Node link scan over changed Markdown files and fail on any missing repository-relative target. | Changed local documentation links resolve. |
| Hygiene | `git check-ignore -v .pi/git/example .pi/npm/example .compound-engineering/config.local.yaml .context/example` | Adopted tools leave generated and local state untracked. |
| Staged scope | Review `git diff --cached --name-status` and reject every path outside issue #62. | The canonical commit contains only the owning delivery slice. |
| Focused diff | `git diff --cached -- AGENTS.md README.md docs/README.md docs/architecture/macos-client.md docs/plan docs/plans plan .github .gitignore .pi/settings.json` | The owner can inspect the complete staged issue #62 diff, including additions and removal of the root `plan/` location. |
| Remote tracker | Read issues #53 and #62 through #71, their project fields, native relationships, and Project 5 description through `gh api`. | Remote queue, specification split, dependencies, and documentation match the repository workflow. |

No product behavioral test applies because this slice changes governance, templates, and local tool declaration only. No repository CI exists on `origin/main`. Issue #63 owns that gap.

---

## Rollback

Revert the issue #62 repository diff and restore its prior Project 5 description and item fields. Remove #62 dependency links only if the specification split is also reverted or no longer blocks a focused workflow diff. Remove the issue and pull-request templates, executable-plan fallback, tracked `.pi/settings.json`, and issue #62 plan only if no later delivery depends on them. No product data or runtime migration requires reversal.

---

## Definition of Done

- R1-R22 are represented in `AGENTS.md` or linked artifact-specific instructions without contradictory duplicate policy.
- U1-U5 satisfy their listed scenarios and verification outcomes.
- The plan remains `artifact_readiness: implementation-ready` with no launch blocker.
- The GitHub Project identifies why issue #62 can proceed and why issue #63 remains dependent on it.
- The complete diff contains no product behavior, architecture, CI, or branch-protection change.
- The owner reviews the actual diff and records all verification results.
- Reverting this focused slice restores the prior workflow without changing product data or runtime state.
- Abandoned or duplicate policy text introduced during this slice is removed before delivery.
