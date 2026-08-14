# Phase 1: Paseo Source Baseline

## Outcome

Import a coherent and attributed Paseo daemon stack that builds in the BITCH repository before product pruning starts.

## Dependencies

Use Paseo source with package version 0.3.1 at upstream commit [`163e7d1`](https://github.com/getpaseo/paseo/tree/163e7d1cc421cdfe4de67b971ff6cea4b51eb0ed). This commit is 30 commits after the `v0.3.1` tag. The exact commit is authoritative.

Use the source boundary in [`../docs/architecture/overview.md`](../docs/architecture/overview.md) and the policy in [`../docs/architecture/licensing.md`](../docs/architecture/licensing.md). The license, notice, author snapshot, and source inventory gate must exist before source import.

## Phase boundaries

This phase includes the retained `protocol`, `relay`, `highlight`, `client`, `server`, and `cli` package baseline. It includes required root build and test support, safe BITCH package identities, and Pi 0.83.0 adapter compatibility evidence.

This phase does not perform Pi-only product pruning, implement the BITCH TUI, or add later Workspace and remote-daemon product behavior. Keep the imported baseline coherent before removing dormant provider or higher-level code.

## Required outcomes

- Every copied or adapted path has exact provenance, approved license treatment, and required notices.
- Unverified third-party binaries remain excluded.
- Retained packages use local workspaces and cannot publish under Paseo identities.
- Node.js 24.19.0, Pi 0.83.0, Pi TUI 0.83.0, and npm dependencies have one reproducible lockfile contract.
- The copied Pi adapter has public evidence for cumulative updates, retry settlement, compaction outcomes, dialogs, import, resume, and rewind.
- Every imported package builds from a clean checkout and applicable upstream tests pass.
- Each unavailable upstream test has a documented reason and a public-boundary replacement where required.

Parent issue [#52](https://github.com/liempo/bitch/issues/52) tracks this broad outcome. The GitHub Project and its ready leaf issues define delivery order and status.

## Exit condition

The attributed Paseo package subset builds and its applicable tests pass in BITCH without a runtime dependency on published Paseo packages.
