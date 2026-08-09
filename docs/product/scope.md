# Product Scope

## Status

Approved first-release product specification. Implementation is pending.

## Goal

BITCH provides command-line and terminal clients for one self-hosted user. The user can work through temporary directory-bound Agent Servers and multiple persistent gateways.

The first release supports these primary workflows:

1. Run BITCH against the current directory without gateway configuration.
2. Connect the CLI or TUI to a selected local or remote gateway.
3. Disconnect while gateway work continues.
4. Reconnect and restore the current or completed conversation state.

The first release does not include the native macOS app.

## Operating modes

**Directory mode** is the default. It starts a temporary Agent Server for one fixed current working directory (`cwd`). It has no workspace registry and stops when the client exits.

**Gateway mode** requires `--gateway`. It connects to a persistent Agent Server with managed workspaces and conversations.

A gateway can be local or remote. BITCH can register multiple gateways, but each client invocation targets only one gateway.

## Included behavior

The first release includes:

- the BITCH Agent Server.
- a reference CLI with human-readable, JSON, and JSONL output.
- an interactive TUI based on the pinned Pi TUI.
- Directory mode through Docker.
- a non-interactive CLI command group for gateway management.
- multiple registered local and remote gateways.
- persistent local gateways managed through Docker.
- externally managed remote gateways.
- stable gateway identities and gateway-scoped client resource references.
- separate persistent conversations.
- a shared default gateway workspace and an optional workspace picker.
- concurrent work in different conversations.
- behavior equivalent to every command type in the pinned Pi RPC protocol, as mapped in [`../architecture/pi-capabilities.md`](../architecture/pi-capabilities.md).
- server-configured model and thinking-level selection.
- streaming assistant and tool activity.
- extension dialogs and fire-and-forget UI supported by the pinned Pi RPC protocol.
- Pi-compatible extension tools, hooks, and commands.
- Pi-compatible image attachments in both modes.
- reconnection to active gateway conversations.
- restoration from Pi JSONL sessions.
- inline diffs for the pinned Pi `edit` tool.
- text input.

The TUI uses the pinned Pi extension and TUI systems. BITCH does not define a second general extension framework.

## Pi capability boundary

BITCH supports Pi-compatible direct `!` shell commands and RPC bash behavior in both modes. A separate interactive PTY terminal is outside the first release.

The TUI supports Pi-compatible `/login` and `/logout` and Pi's multiple-provider authentication model. Directory mode and each gateway persist their own provider credentials.

Image attachments are included. General non-image file attachments are not included.

Pi documentation and source for the pinned version define standard Pi behavior. BITCH adds behavior only when the client-server design or this specification requires a difference.

## Gateway isolation

Each gateway owns separate conversations, workspaces, credentials, Trash, `SOUL.md`, and runtime state.

BITCH does not synchronize, delegate, or move work automatically between gateways. An unavailable gateway reports an error. BITCH does not select another gateway or Directory mode as a fallback.

Local gateway workspaces remain inside the gateway data root. A local gateway does not mount the client's current directory automatically.

A local gateway keeps the backend selected by `gateway create --backend docker|apple`. Omission defaults to Docker. Future Apple `container` support requires the user to create a separate gateway. BITCH does not convert an existing Docker gateway or move its state automatically.

## Non-goals

The first release does not include:

- the native macOS app.
- Apple `container` support.
- interactive gateway management or switching inside the TUI.
- automatic gateway failover.
- merged conversation feeds from multiple gateways.
- cross-gateway actions.
- cross-gateway delegation.
- conversation or workspace synchronization between gateways.
- a Jobs page or Pi-dispatch.
- a Changes pane for accumulated workspace changes.
- worktree management.
- a separate interactive PTY terminal.
- general non-image file attachments.
- provider credential management outside Pi's standard flows.
- client-side Git or GitHub credential management.
- Pi package-management CLI commands or self-update.
- Pi `/import`, `/share`, or `/llama` application commands.
- custom multi-agent orchestration.
- a `pi-subagents` dashboard.
- Vikunja or a task-board interface.
- public internet exposure.
- horizontal scaling.
- multi-user support.
- conversation archiving.
- API tokens or client credential management.

## Success criteria

The first release succeeds when:

1. Plain `bitch` uses Directory mode for the current directory.
2. `bitch --gateway` uses the registered master gateway.
3. `bitch --gateway NAME` uses the named gateway.
4. Missing or unavailable gateway selection fails without fallback.
5. Multiple local and remote gateways remain independent.
6. A local gateway continues after all CLI and TUI clients disconnect.
7. Reconnection restores durable history and active response state without duplication.
8. The clients expose behavior equivalent to every supported Pi RPC command type.
9. Configured Pi extensions retain their supported tools, hooks, commands, and UI behavior.
10. Multiple clients can observe and control one shared gateway conversation.
11. Different conversations can run concurrently.
12. Idle sessions release after five minutes and restore from Pi JSONL.
13. Image attachments work in Directory mode and Gateway mode.
14. Inline edit diffs render in the conversation timeline.
15. Deferred features remain outside the release.

The first release supports a tested single-user envelope of eight registered gateways, two concurrently running conversations per gateway, and two clients per conversation. BITCH does not enforce these values as quotas, but behavior above them is outside the supported envelope.

The first release has no protocol-overhead latency target. [`acceptance.md`](acceptance.md) defines the approved first-release workflows.

## Deferred roadmap

Review these items after the first release:

- the native macOS app.
- Apple `container` runtime support.
- an interactive TUI `/gateway` command.
- a dedicated Changes pane.
- shared local and remote memory.
- cross-runtime delegation.
- `pi-subagents` integration.
- Pi-dispatch and a Jobs page.
- worktrees and other workspace-isolation options.
- general non-image file attachments.
- provider, skill, and extension management outside Pi's standard flows.
- native notifications.
- conversation archiving.
