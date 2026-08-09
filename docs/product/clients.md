# Client Behavior

## Status

Approved first-release product specification and deferred Gateway Hub contract. Implementation is pending.

## Shared boundary

The CLI and TUI use the BITCH HTTP and SSE API. They do not import the Pi SDK or read Agent Server session files.

`AgentClient` is the interface consumed by the TypeScript CLI and TUI. `AgentServerClient` implements it with HTTP and SSE.

The native macOS client is deferred to the next product stage.

## CLI-first delivery

The CLI is the first complete client and the reference for Agent Server behavior.

Before a later client exposes a non-interactive Agent Server capability, that capability must have:

1. A stable protocol contract.
2. An Agent Server implementation.
3. A public CLI path.
4. Behavioral tests.

Interactive provider authentication, project trust, and extension dialogs are explicit exceptions to the CLI-path rule. They require a stable protocol, an Agent Server implementation, and behavioral tests before TUI use.

## Mode selection

Plain `bitch` uses Directory mode for the current directory:

```bash
bitch
bitch -p "Edit the code and run tests"
bitch --approve -p "Use this project's configured resources"
```

`--approve` and `--no-approve` apply pinned Pi project trust for one Directory-mode invocation. They do not save a trust decision.

Gateway mode always requires `--gateway`:

```bash
bitch --gateway          # Master gateway
bitch --gateway work     # Named gateway
```

`--gateway` without a name selects the master gateway recorded in the client registry. The master role refers only to client selection. It gives one gateway no control over another.

The first registered gateway becomes the master gateway. Deleting its registration clears the master reference. BITCH does not promote another gateway automatically.

An unavailable endpoint or identity mismatch does not clear or replace the master reference. Selection fails until the registered gateway becomes valid again or the user changes the master explicitly.

The registry can have no master. In that state, `bitch --gateway` returns an error. Named gateway selection remains available.

A missing or unavailable gateway returns an error. BITCH does not redirect the invocation to Directory mode, the master gateway, or another gateway.

The first release has no `--server` option for unregistered endpoints.

## Gateway management

The `bitch gateway` command group manages local and remote gateway registrations. It supports gateway creation, registration, inspection, master selection, lifecycle control, runtime configuration, and deletion. [`../architecture/cli.md`](../architecture/cli.md) defines its exact command, output, and exit-code contract.

The command group uses separate verbs for local provisioning and endpoint registration:

```bash
bitch gateway create ALIAS
bitch gateway register ALIAS URL
```

`create` provisions and registers a local gateway with its immutable `--backend` selection. Docker is the default and only first-release backend. It waits for readiness, records the reported gateway ID and backend, and leaves the gateway running. `register` records a reachable, externally managed endpoint.

Master selection uses a nested command group:

```bash
bitch gateway master show
bitch gateway master set ALIAS
bitch gateway master clear
```

`show` reports the current master or the absence of one. `set` requires an existing alias. `clear` leaves the registry without a master.

Local lifecycle operations and local-only listing use a `local` subgroup:

```bash
bitch gateway local list
bitch gateway local start ALIAS
bitch gateway local stop ALIAS
bitch gateway local restart ALIAS
bitch gateway local configure ALIAS
```

These commands include or accept only registered, BITCH-managed local gateways.

Registry inspection and live status use separate commands:

```bash
bitch gateway list
bitch gateway show ALIAS
bitch gateway status ALIAS
```

`list` shows all registered gateways. `show` reads one entry without contacting its endpoint. `status` contacts the endpoint and reports its live identity, mode, versions, and capabilities.

Deleting a local or remote gateway has the same effect. It removes only the client registry entry. For a local gateway, this includes its recorded `localhost:<port>` endpoint and local lifecycle reference. Deletion does not contact the Agent Server, stop active work, stop or remove a local container, or change gateway data. Registry-only deletion does not require a confirmation option.

A successful deletion prints this human-readable result:

```text
Deleted gateway registration "ALIAS".
```

JSON output reports only the deleted registry identity:

```json
{
  "type": "gateway.registration.deleted",
  "gatewayId": "uuid",
  "alias": "ALIAS"
}
```

BITCH does not track an unregistered gateway. It does not retain a separate local-runtime inventory or rediscover an unregistered local gateway from container labels or data roots. After registry deletion, BITCH cannot select or manage that gateway.

To use a deleted local gateway again, the operator makes its endpoint available and runs `bitch gateway register ALIAS URL`. BITCH applies the same live identity verification as any other remote registration. The new entry is externally managed. BITCH does not recover its former local lifecycle configuration.

Gateway management commands do not prompt. They return human-readable output by default and stable machine-readable output when requested.

The CLI has no automatic setup flow. The user runs a gateway management command explicitly.

The first-release TUI does not manage the gateway registry or switch gateways. To change gateways, the user exits the TUI and starts it with another `--gateway` selection.

Pi-compatible `/login` and `/logout` operate on the selected Agent Server:

- In Directory mode, they update Directory-mode provider credentials.
- In Gateway mode, they update credentials owned by the selected gateway.

## Gateway registry

The client registry can contain multiple local and remote gateways. Each entry has a user-facing alias and the stable ID reported by its gateway.

A gateway alias is a lowercase ASCII DNS label with 1 through 63 characters. It starts and ends with a letter or number. Interior characters can also contain hyphens. The alias `master` is permitted and has no special meaning.

The CLI rejects uppercase, invalid, and duplicate aliases. It reports `gateway_alias_invalid` for invalid syntax and `gateway_alias_conflict` when the alias already exists. Gateway lists sort aliases in ascending ASCII order.

Renaming an alias validates the new alias and changes only that field. It does not change the gateway ID, master status, endpoint, runtime configuration, or gateway data. The old alias becomes unknown immediately and does not redirect to the new alias.

Conversation and workspace references in client state include the gateway ID. Renaming an alias does not change resource identity.

Each CLI invocation and TUI connection targets one gateway at a time. Work on other gateways continues independently.

A registered endpoint is one bare HTTP or HTTPS origin. It can use a Tailnet IP, Tailscale MagicDNS name, private TLS name, or localhost address. The CLI normalizes the scheme and host, removes a default port, and stores no trailing slash.

The CLI rejects user information, credentials, query strings, fragments, non-root paths, and unsupported schemes with `gateway_endpoint_invalid`. It does not store authorization headers or API tokens. HTTPS uses normal certificate validation.

Registering a remote gateway requires a live `/v1/status` response. The CLI accepts the registration only when the response reports Gateway mode and a gateway ID. It stores the reported gateway ID in the registry. An unavailable endpoint or an invalid status response makes registration fail without creating the registry entry.

An endpoint change reuses the registration command:

```bash
bitch gateway register ALIAS URL --replace
```

`--replace` requires an existing externally managed alias. It rejects a BITCH-managed local gateway. The CLI updates the endpoint only when the new endpoint reports the gateway ID already stored for that entry. An unavailable endpoint, invalid status response, identity mismatch, or managed local alias fails without changing the entry.

The registry can contain only one entry for each gateway ID. To use a different gateway ID, the user must delete the old registration and register the new gateway.

## Conversation CLI interaction

Every supported conversation capability has a typed, discoverable `bitch conversation` command. The public CLI does not require users to construct a generic RPC command or JSON payload for advanced Pi behavior.

A command for an existing conversation requires its conversation ID. The CLI does not remember an implicit current or last conversation and does not select by mutable title or list position. New work uses `bitch -p` or `bitch conversation create`.

CLI reads never imply human viewing. `list`, `show`, `state`, `messages`, exports, and attached event monitoring preserve **Completed since last viewed**. Gateway-mode `conversation mark-viewed` is the only non-interactive CLI operation that clears it. Directory mode has no global completion-viewed state.

A command that starts or changes agent work waits for its command receipt to settle by default. `--jsonl` streams typed events and then writes one final result. In Gateway mode, `--detach` returns the accepted receipt without waiting for settlement. `--detach` and `--jsonl` are mutually exclusive.

For an attached command, the first `Ctrl-C` is an intentional abort. The CLI requests Pi abort, waits up to 10 seconds for settlement and durable flushes, and exits 130. A second `Ctrl-C` exits immediately after the first abort attempt. Unexpected connection loss only disconnects and does not abort Gateway-mode work.

Directory mode rejects `--detach` because its temporary Agent Server cannot continue after the invoking client exits. Query commands complete immediately and do not accept `--detach` or `--jsonl`.

The CLI generates a command ID unless the caller supplies one for retry protection. No non-interactive conversation command reads stdin.

An explicit conversation or workspace `trash` command needs no extra CLI flag. Permanent deletion requires `--confirm RESOURCE_ID`. A missing or mismatched value fails locally. The TUI confirms Trash in one dialog and uses a stronger destructive sheet for permanent deletion.

## CLI output

Human-readable output is the default.

The public CLI supports:

- `--json` for completed results.
- `--jsonl` for streaming results.
- documented process exit codes.
- non-interactive operation.

Machine-readable modes use stable protocol types. They write results to stdout, diagnostics to stderr, and no ANSI control codes.

Non-interactive CLI paths never request answers from stdin. User interaction, including extension dialogs, belongs to the TUI.

When an extension requests input during a non-interactive Gateway-mode command, the CLI exits with the stable code `interaction_required`. It leaves the conversation in **Needs input** and does not abort the run. A TUI can connect later and answer the pending dialog.

In Directory mode, the CLI reports `interaction_required`, cancels the pending request, flushes durable state, and stops the temporary Agent Server. The interaction cannot resume after that invocation.

Print mode writes the diagnostic to stderr. JSON mode writes one typed problem result to stdout. JSONL mode writes the preceding stream events and one final typed problem event. Machine-readable results include the mode, conversation reference, dialog ID, and a `resumable` boolean. They do not read stdin or emit ANSI control codes.

Developers use the built CLI for manual and automated testing. Tests execute it as a subprocess. Tests do not import CLI implementation modules.

## Interactive TUI

Interactive agent mode vendors the required integration from the pinned Pi TUI. It preserves Pi layout, editor behavior, rendering, themes, keyboard shortcuts, dialogs, tool calls, and diffs, with BITCH branding.

The TUI replaces direct Pi runtime access with `AgentServerClient`. BITCH preserves upstream MIT license notices.

The TUI shows whether it uses Directory mode or Gateway mode. In Gateway mode, it also shows the selected gateway alias and connection state.

Without an explicit conversation ID, Gateway mode opens a gateway home screen. It lists active conversations grouped by workspace and shows **Working**, **Needs input**, **Failed**, and **Completed since last viewed** state. Loading this list does not mark any conversation viewed.

Without an explicit conversation ID, Directory mode opens a blank draft for its fixed `cwd`. The draft creates no Pi session until first-prompt acceptance. Existing Directory-mode sessions remain available through the resume list.

`--conversation CONVERSATION_ID` opens that exact conversation in the selected mode. In Gateway mode, successful opening marks it viewed. Directory mode has no global viewed state.

BITCH does not automatically resume the most recent or highest-priority conversation.

Configured Pi extensions execute only with the selected Agent Server runtime. The TUI does not load or execute extension code. BITCH carries the extension commands and UI operations supported by the pinned Pi RPC protocol.

A dialog from the foreground conversation opens normally. A dialog from another conversation never switches views or takes keyboard focus. The gateway home marks that conversation **Needs input**. Opening it loads and displays any still-pending dialog.

A background `notify` request shows a toast labeled with its conversation title. Selecting the toast explicitly opens that conversation. Background status, widget, and title state remains scoped to its conversation. Background `set_editor_text` never changes the foreground editor.

Pi and TUI compatibility tests verify observable behavior. They do not inspect source text or internal symbols.

## Deferred interactive Gateway Hub

An interactive TUI `/gateway` command is outside the first release. Its approved deferred contract is a full client-owned Gateway Hub.

The hub is available before connection, after connection failure, while disconnected, and from both operating modes. It provides the approved registration, master, local lifecycle, status, deletion, and `SOUL.md` operations. It can replace the active connection without restarting the TUI.

Switching away from Gateway mode only disconnects that client. Gateway work continues. Switching away from Directory mode shuts down its temporary Agent Server. Active work requires an explicit **Abort and switch** action.

Selecting a gateway does not set it as master. A failed target connection preserves the current target and view. Deleting the active registration disconnects the client but does not stop or change the gateway.

The feature uses pinned Pi TUI components and the shared client control plane. It is not a Pi extension, sends no registry operation to an Agent Server, and does not transport terminal components over RPC. [`../architecture/tui-gateway.md`](../architecture/tui-gateway.md) defines the exact boundary and switch transaction. [`deferred-acceptance.md`](deferred-acceptance.md) defines its acceptance workflow.

## Deferred macOS client

The native macOS app is outside the first release. It is a Gateway-mode client that uses the BITCH protocol and gateway identity model.

The app shares the canonical `BITCH_HOME` gateway registry with the CLI and TUI. It stores only its last selected gateway ID separately. It presents one active gateway across all app windows, never merges gateway resources, and never changes the master as a side effect of navigation.

On launch, it uses a still-registered last selection, then a valid master reference, or otherwise shows setup or the gateway picker. An unavailable selected gateway does not cause fallback. [`macos.md`](macos.md) defines the product behavior. [`../architecture/macos-client.md`](../architecture/macos-client.md) defines registry and connection coordination. [`deferred-acceptance.md`](deferred-acceptance.md) defines approved deferred acceptance.

## Gateway independence

Each gateway owns independent configuration, provider authentication, sessions, workspaces, and runtime state. Gateways do not synchronize or delegate tasks.
