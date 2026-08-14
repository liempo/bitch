# Executable Plan Fallback Template

Use this template only when `ce-plan` is unavailable. Report the unavailable skill. Do not weaken the plan gate.

Copy the template to `docs/plans/YYYY-MM-DD-NNN-<type>-<name>-plan.md`. Keep `artifact_readiness: requirements-only` until every implementation section is complete and no launch blocker remains.

```markdown
---
title: <Name> - Plan
type: <feat|fix|refactor|docs|chore|test>
date: <YYYY-MM-DD>
artifact_contract: ce-unified-plan/v1
artifact_readiness: requirements-only
product_contract_source: <source>
execution: code
---

# <Name> - Plan

## Goal Capsule

- **Objective:** <one bounded outcome>
- **Authority:** <issue and governing documents>
- **Stop conditions:** <questions or evidence that stop implementation>
- **Tail ownership:** <one delivery owner>

## Product Contract

### Summary

<Problem and intended outcome.>

### Requirements

- R1. <requirement>

### Acceptance Examples

- AE1. **Covers R1.** Given <state>, when <action>, then <result>.

### Scope Boundaries

**In scope**

- <scope>

**Out of scope**

- <non-goal>

### Dependencies and Risks

- <dependency or risk>

### Open Questions

- **Blocking:** <question that keeps readiness at requirements-only, or `None`>
- **Deferred:** <question that does not block this slice, or `None`>

## Planning Contract

### Key Technical Decisions

- KTD1. **<decision>.** <rationale and governed R-IDs>

### Implementation Constraints

- <constraint>

### Sequencing

1. <dependency order>

## Implementation Units

### U1. <unit name>

- **Goal:** <unit outcome>
- **Requirements:** R1, AE1.
- **Dependencies:** None.
- **Files:** `<exact/repository-relative/path>`.
- **Approach:** <unit-local implementation boundary that cites R and KTD owners>
- **Test scenarios:**
  - **Success:** <input, action, expected result>
  - **Edge:** <boundary input, action, expected result>
  - **Failure:** <failure input, action, expected result>
  - **Integration:** <cross-boundary action and expected result>
  - **Authorization:** <allowed and denied behavior when applicable>
- **Verification:** <exact command or manual check and expected result>

## Verification Contract

| Check | Command or manual check | Proves |
|---|---|---|
| <name> | `<exact command>` | <completion evidence> |

## Rollback

<Safe reversal steps and any irreversible effect.>

## Definition of Done

- Every applicable requirement and scenario passes.
- The owner reviews the actual diff and reruns authoritative verification.
- Accepted review fixes are present.
- The pull request stays within one delivery issue.
- Abandoned implementation code is removed.
```

Remove other empty optional sections only when they do not apply. Keep Open Questions and state `None` when no question remains. Do not remove required metadata, stable IDs, exact files, verification, rollback, or definition of done. Change `artifact_readiness` to `implementation-ready` only after the plan is executable.
