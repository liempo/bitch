# BITCH

**Barely Intelligent Task & Context Handler**

BITCH is a planned self-hosted terminal interface for Pi Conversations and interactive Terminals on local or remote machines.

## Status

The repository is in planning and pre-alpha status. It has no product code or installable package.

## Planned MVP

BITCH will copy and adapt the daemon architecture from [Paseo](https://github.com/getpaseo/paseo) source with package version 0.3.1 at upstream commit [`163e7d1`](https://github.com/getpaseo/paseo/tree/163e7d1cc421cdfe4de67b971ff6cea4b51eb0ed). The exact commit, not the earlier `v0.3.1` tag, is authoritative.

The MVP will:

- run Pi as its only agent runtime.
- use one host-native daemon for Pi processes, PTYs, Projects, Workspaces, and timelines.
- register a removable localhost daemon by default.
- support multiple explicitly selected remote daemons.
- keep work running after clients disconnect.
- provide a CLI and a TUI Workspace canvas with tabs and user-created splits.
- support direct and end-to-end encrypted relay routes.

If a selected daemon is unavailable, it remains selected and disconnected. BITCH does not run work on another daemon.

The graphical macOS app is deferred until after the CLI and TUI MVP. Its planned architecture uses Paseo's shared Expo and React Native app inside an Electron desktop shell.

## Architecture principles

- Copy pinned Paseo behavior before adding BITCH-specific improvements.
- Keep Pi as the only public agent runtime.
- Use Paseo's process-backed `pi --mode rpc` adapter.
- Keep the loaded normalized daemon timeline authoritative for BITCH clients.
- Keep Pi JSONL durable and native to Pi for discovery, import, resume, and post-restart history reconstruction.
- Keep clients behind the BITCH daemon protocol.
- Keep local and remote daemon behavior equivalent.
- Never merge, redirect, or replicate work across daemons implicitly.

## Source relationship

BITCH is an independent repository. It plans to copy selected Paseo source with attribution rather than use a GitHub fork relationship or published Paseo runtime dependency.

No Paseo package source or object code has been imported. The conservative policy treats copied Paseo material as `AGPL-3.0-only`, preserves upstream notices, and requires a file-level source inventory. See [`docs/architecture/licensing.md`](docs/architecture/licensing.md). The provenance gate must pass before any source-import pull request copies package source.

## Planned prerequisites

The personal MVP targets macOS on Apple silicon with:

- Node.js 24.19.0.
- `@earendil-works/pi-coding-agent` 0.83.0.
- Git for managed-worktree Workspaces.

A remote daemon runs the same server and requires its own Pi installation and host filesystem access.

## Development

Install current repository development dependencies:

```bash
npm install
```

The `prepare` script installs a Husky `commit-msg` hook. Commit messages must follow Conventional Commits and include a scope:

```text
docs(readme): explain local setup
```

Allowed types are `fix`, `feat`, `chore`, `docs`, and `ci`. See [`commitlint.config.cjs`](commitlint.config.cjs).

## Delivery workflow

Use the [BITCH GitHub Project](https://github.com/users/liempo/projects/5) as the execution queue. Claim only a leaf issue with `Queue = Ready`, `Status = Todo`, and no open native blocker. Change it to `Status = In Progress` before implementation.

Keep the planning levels separate:

- [`docs/plan/`](docs/plan/) defines program and phase outcomes.
- One GitHub delivery issue defines one pull-request-sized slice.
- [`docs/plans/`](docs/plans/) contains the executable plan for that slice.

Code work requires an implementation-ready `ce-unified-plan/v1` plan unless the narrow mechanical skip applies. [Project-local Pi settings](.pi/settings.json) pin Compound Engineering and its companion packages. Start a new trusted Pi session after this package configuration changes. Use `ce-plan`, `ce-work`, `ce-code-review`, and `ce-commit` for the normal delivery path.

One owner controls the working tree, reviews the actual diff, reruns final verification, and creates the canonical local commit. Use one linked pull request per delivery issue. See [`AGENTS.md`](AGENTS.md) for the normative workflow and [`.github/EXECUTABLE_PLAN_TEMPLATE.md`](.github/EXECUTABLE_PLAN_TEMPLATE.md) for the fallback plan template.

## Documentation

Start with [`docs/README.md`](docs/README.md).

- [`docs/product/scope.md`](docs/product/scope.md) defines the MVP boundary.
- [`docs/architecture/overview.md`](docs/architecture/overview.md) defines the copied package and runtime design.
- [`docs/architecture/protocol.md`](docs/architecture/protocol.md) defines WebSocket, timeline, Terminal, and relay behavior.
- [`docs/architecture/pi-capabilities.md`](docs/architecture/pi-capabilities.md) defines the Paseo-exposed Pi boundary.
- [`docs/testing.md`](docs/testing.md) defines behavioral test requirements.
- [`docs/glossary.md`](docs/glossary.md) defines required terms.
- [`docs/plan/README.md`](docs/plan/README.md) defines the program and phase sequence.
- [`AGENTS.md`](AGENTS.md) defines the repository workflow.
