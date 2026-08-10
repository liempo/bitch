# BITCH

**Barely Intelligent Task & Context Handler**

BITCH is a planned self-hosted interface between command-line or terminal clients and Pi. It uses a containerized Agent Server.

## Status

The repository is in planning and pre-alpha status. The `@bitch/protocol` contract package and its version 1 fixtures are implemented. The Agent Server, CLI, TUI, and installable product package are pending.

The product commands below show the approved interface contract. They do not work yet.

## Planned first release

The first release supports one self-hosted user through the CLI and TUI. The native macOS app is deferred to the next product stage.

BITCH has two modes:

- **Directory mode** works on the current directory through a temporary Agent Server. It is the default.
- **Gateway mode** connects to a persistent local or remote Agent Server with managed workspaces.

Plain commands use Directory mode:

```bash
cd ~/project
bitch
bitch -p "Edit the code and run tests"
```

Gateway mode requires explicit selection:

```bash
bitch --gateway          # Use the master gateway
bitch --gateway work     # Use a named gateway
```

The non-interactive `bitch gateway` command group manages registered gateways. The first-release TUI uses the gateway selected when it starts and does not manage or switch gateways.

BITCH supports multiple independent local and remote gateways. The first release uses Docker for Directory mode and local gateways. Apple `container` support is deferred.

## Planned prerequisites

The local CLI and TUI target macOS 26 on Apple silicon with Docker Desktop 4.62.0. Remote gateways target the approved Ubuntu and Docker matrix.

See [`docs/operations.md`](docs/operations.md) for the complete supported platform matrix.

## Architecture principles

- Use Pi as the agent runtime. Do not reimplement its agent logic.
- Keep the Agent Server a thin HTTP and SSE host around Pi's SDK.
- Keep Pi JSONL as the conversation source of truth.
- Keep clients independent of Pi SDK internals.
- Route Directory mode and Gateway mode through an Agent Server.
- Implement each Agent Server capability in the CLI before later clients.
- Keep gateways independent. Do not synchronize, delegate, or redirect work automatically.

## Protocol development

Use Node.js `24.19.0`.

```bash
npm ci
npm run validate
npm run build
npm audit
```

Run `npm run fixtures:generate` after a canonical schema, fixture, or HTTP operation changes. Commit the generated artifacts with the source change.

## Documentation

Start with [`docs/README.md`](docs/README.md).

- [`docs/product/scope.md`](docs/product/scope.md) defines the product boundary.
- [`docs/architecture/overview.md`](docs/architecture/overview.md) defines the fixed technical design.
- [`docs/architecture/cli.md`](docs/architecture/cli.md) defines the complete CLI contract.
- [`docs/architecture/pi-capabilities.md`](docs/architecture/pi-capabilities.md) defines pinned Pi compatibility.
- [`docs/architecture/api.md`](docs/architecture/api.md) defines the HTTP and SSE API.
- [`docs/architecture/tui-gateway.md`](docs/architecture/tui-gateway.md) defines the deferred interactive Gateway Hub.
- [`docs/product/macos.md`](docs/product/macos.md) defines approved native-client behavior.
- [`docs/product/deferred-acceptance.md`](docs/product/deferred-acceptance.md) defines deferred feature acceptance.
- [`docs/testing.md`](docs/testing.md) defines behavioral testing requirements.
- [`docs/glossary.md`](docs/glossary.md) defines required terms.
- [`plan/README.md`](plan/README.md) contains pending implementation work.
- [`plan/gaps.md`](plan/gaps.md) contains unresolved questions.
- [`AGENTS.md`](AGENTS.md) defines the documentation and plan-item workflow.
