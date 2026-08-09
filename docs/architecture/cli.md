# CLI Contract

## Status

Approved first-release CLI contract. Implementation is pending.

## Command boundary

The built `bitch` executable is the public CLI boundary. Tests execute it as a subprocess.

Gateway management commands never read stdin. They write human-readable success output to stdout by default. `--json` writes one JSON result to stdout. `--jsonl` is valid only for streaming agent commands and is invalid for gateway management.

Directory mode accepts the mutually exclusive global options `--approve` (`-a`) and `--no-approve` (`-na`). They apply Pi project trust for one invocation and do not write `trust.json`. Gateway mode rejects them as usage errors.

Human-readable diagnostics use stderr. Machine-readable results use stdout and do not contain ANSI control codes. This rule includes typed problem results.

## Interactive startup

```text
bitch [--gateway [ALIAS]] [--conversation CONVERSATION_ID]
```

Without a print option or command group, this form starts the TUI. Gateway mode without `--conversation` opens the selected gateway home and does not mark a conversation viewed. Directory mode without it opens a client-only blank draft for the invocation cwd.

`--conversation` opens only the exact ID in the selected mode. It has no title, recency, or priority fallback. A missing, trashed, cross-mode, cross-gateway, or damaged conversation reports its stable resource or recovery error without opening another one.

## Conversation execution model

The reference CLI exposes a typed command for every supported operation in [`pi-capabilities.md`](pi-capabilities.md). It has no public raw-RPC or arbitrary-JSON command escape hatch.

Conversation mutations accept `--command-id UUID`, `--json`, and `--jsonl`. Gateway-mode conversation mutations also accept `--detach`. Omission of `--command-id` creates a UUID v4.

Normal execution waits for a terminal command receipt. `--detach` returns after durable acceptance. `--jsonl` keeps the command attached, emits ordered SSE envelopes, and finishes with one typed result. `--detach` cannot be combined with `--jsonl` and fails in Directory mode with `detach_requires_gateway`.

A Gateway-mode command that reaches **Needs input** returns `interaction_required` without aborting server work. Directory mode follows its approved cancellation and shutdown behavior.

### Interrupt behavior

For an attached mutation, the first SIGINT marks abort requested. If durable acceptance is still in flight, the CLI waits for that acceptance result and then sends the typed abort command to the known conversation. It does not treat closing the HTTP request as proof that acceptance failed.

After the abort request, the CLI waits up to 10 seconds for the original operation to settle and for durable flushes. It then exits 130. If the wait expires, it reports `abort_settlement_timeout` and exits 130. The server retains the accepted abort request. It does not interpret client exit as a second command.

A second SIGINT closes the client immediately. The CLI makes no claim that an abort request which was not yet accepted succeeded.

When possible, JSONL writes one final `interrupted` envelope to stdout before exit. `--json` writes one typed interruption problem to stdout. Human-readable interruption diagnostics use stderr. Network loss, pipe closure, client crash, and Gateway-mode terminal closure are disconnections, not abort commands. `--detach` exits normally after acceptance and has no attached interrupt phase.

## Conversation targeting

A non-interactive command that operates on an existing conversation requires its Pi conversation ID as a positional argument. The CLI has no implicit current conversation, last-conversation file, title lookup, list-index selector, or `--last` shortcut.

Gateway selection and conversation selection remain separate. `--gateway` selects one Agent Server, and `CONVERSATION_ID` selects a resource on that server. A conversation ID from another gateway fails with `gateway_scope_mismatch`.

New-conversation commands do not take a conversation ID. Machine output returns the resulting structured gateway and conversation reference.

## Conversation command tree

These metavariables apply:

```text
TARGET   := [--gateway [ALIAS]]
MUTATION := [--command-id UUID] [--detach] [--json | --jsonl]
QUERY    := [--json]
IMAGE    := [--image FILE]...
```

`--json` and `--jsonl` are mutually exclusive. `--detach` and `--jsonl` are mutually exclusive. An image flag is repeatable.

### Prompt and run control

```text
bitch TARGET -p MESSAGE [--workspace WORKSPACE_ID]
    [--provider PROVIDER --model MODEL_ID] [--thinking LEVEL]
    [--streaming-behavior steer|follow-up] IMAGE MUTATION

bitch TARGET conversation create MESSAGE [--workspace WORKSPACE_ID]
    [--provider PROVIDER --model MODEL_ID] [--thinking LEVEL]
    [--streaming-behavior steer|follow-up] IMAGE MUTATION

bitch TARGET conversation prompt CONVERSATION_ID MESSAGE
    [--streaming-behavior steer|follow-up] IMAGE MUTATION
bitch TARGET conversation steer CONVERSATION_ID MESSAGE IMAGE MUTATION
bitch TARGET conversation follow-up CONVERSATION_ID MESSAGE IMAGE MUTATION
bitch TARGET conversation abort CONVERSATION_ID MUTATION
bitch TARGET conversation new CONVERSATION_ID
    [--parent PARENT_CONVERSATION_ID] MUTATION
```

`-p` and `conversation create` are equivalent. `--workspace` is valid only in Gateway mode and fixes the workspace at first-prompt acceptance. `--provider` and `--model` must occur together. `LEVEL` is `off`, `minimal`, `low`, `medium`, `high`, `xhigh`, or `max`.

The client reads each `FILE`, validates supported image bytes and MIME type, and sends `ImageContent`. A file path never becomes a server attachment path.

### State, messages, and commands

```text
bitch TARGET conversation state CONVERSATION_ID QUERY
bitch TARGET conversation messages CONVERSATION_ID
    [--cursor CURSOR] [--limit 1..200] QUERY
bitch TARGET conversation commands CONVERSATION_ID QUERY
bitch TARGET conversation reload CONVERSATION_ID MUTATION
bitch TARGET conversation stats CONVERSATION_ID QUERY
bitch TARGET conversation last-assistant CONVERSATION_ID QUERY
```

### Models and thinking

```text
bitch TARGET conversation model list QUERY
bitch TARGET conversation model set CONVERSATION_ID PROVIDER MODEL_ID MUTATION
bitch TARGET conversation model cycle CONVERSATION_ID MUTATION

bitch TARGET conversation thinking list CONVERSATION_ID QUERY
bitch TARGET conversation thinking set CONVERSATION_ID LEVEL MUTATION
bitch TARGET conversation thinking cycle CONVERSATION_ID MUTATION
```

Model list is server-scoped and therefore takes no conversation ID. Thinking-level availability is model-specific and requires an existing conversation.

### Queues, compaction, and retries

```text
bitch TARGET conversation queue steering CONVERSATION_ID all|one-at-a-time MUTATION
bitch TARGET conversation queue follow-up CONVERSATION_ID all|one-at-a-time MUTATION

bitch TARGET conversation compact CONVERSATION_ID
    [--instructions TEXT] MUTATION
bitch TARGET conversation compact auto CONVERSATION_ID on|off MUTATION

bitch TARGET conversation retry auto CONVERSATION_ID on|off MUTATION
bitch TARGET conversation retry abort CONVERSATION_ID MUTATION
```

### Direct bash

```text
bitch TARGET conversation bash run CONVERSATION_ID COMMAND
    [--exclude-from-context] MUTATION
bitch TARGET conversation bash abort CONVERSATION_ID MUTATION
```

`COMMAND` is one shell argument and usually requires shell quoting. The CLI does not read command text or process input from stdin and does not allocate a PTY.

### Session tree and artifacts

```text
bitch TARGET conversation export CONVERSATION_ID
    [--output CLIENT_FILE] [--overwrite] MUTATION
bitch TARGET conversation switch CONVERSATION_ID TARGET_CONVERSATION_ID MUTATION
bitch TARGET conversation fork CONVERSATION_ID ENTRY_ID MUTATION
bitch TARGET conversation clone CONVERSATION_ID MUTATION
bitch TARGET conversation fork-messages CONVERSATION_ID QUERY
bitch TARGET conversation entries CONVERSATION_ID [--since ENTRY_ID] QUERY
bitch TARGET conversation tree CONVERSATION_ID QUERY
bitch TARGET conversation name CONVERSATION_ID NAME MUTATION
```

`switch` accepts only a target conversation in the selected gateway. Session file paths are never public arguments.

Export creates a server artifact. Without `--detach`, the CLI downloads it to `CLIENT_FILE` or a safe default file in the client cwd. It refuses to replace an existing file unless `--overwrite` is present. `--output` and `--overwrite` are invalid with `--detach`.

### Result behavior

Waiting human output prints the user-facing result after operation settlement. A prompt that starts generation prints the final assistant text.

A prompt accepted through `streamingBehavior`, steering, or follow-up settles after Pi accepts the queued message. Monitor the conversation stream to observe the later turn. `--json` prints one typed result that includes the conversation reference, terminal receipt, and command-specific result. `--jsonl` prints ordered event envelopes followed by one terminal result envelope.

Detached human output prints the command ID, conversation reference, and accepted state. Detached JSON output prints the complete accepted receipt. Query commands return their resource directly and never create receipts.

## Conversation and workspace lifecycle commands

These resource operations complete after their HTTP and durable filesystem transaction settles. They accept `--json` but not `--detach` or `--jsonl`.

```text
bitch TARGET conversation list [--workspace WORKSPACE_ID]
    [--cursor CURSOR] [--limit 1..200] [--json]
bitch TARGET conversation show CONVERSATION_ID [--json]
bitch --gateway [ALIAS] conversation mark-viewed CONVERSATION_ID [--json]
bitch TARGET conversation trash CONVERSATION_ID [--json]
bitch TARGET conversation restore CONVERSATION_ID [--json]
bitch TARGET conversation delete CONVERSATION_ID
    --confirm CONVERSATION_ID [--json]

bitch TARGET trash conversations list
    [--cursor CURSOR] [--limit 1..200] [--json]

bitch --gateway [ALIAS] workspace create empty DIRECTORY_NAME
    [--display-name NAME] [--json]
bitch --gateway [ALIAS] workspace create git DIRECTORY_NAME
    [--display-name NAME] [--json]
bitch --gateway [ALIAS] workspace create clone DIRECTORY_NAME REPOSITORY_URL
    [--display-name NAME] [--json]
bitch --gateway [ALIAS] workspace list
    [--cursor CURSOR] [--limit 1..200] [--json]
bitch --gateway [ALIAS] workspace show WORKSPACE_ID [--json]
bitch --gateway [ALIAS] workspace rename WORKSPACE_ID NAME [--json]
bitch --gateway [ALIAS] workspace trash WORKSPACE_ID [--json]
bitch --gateway [ALIAS] workspace restore WORKSPACE_ID [--json]
bitch --gateway [ALIAS] workspace delete WORKSPACE_ID
    --confirm WORKSPACE_ID [--json]

bitch --gateway [ALIAS] trash workspaces list
    [--cursor CURSOR] [--limit 1..200] [--json]

bitch --gateway [ALIAS] artifact download ARTIFACT_ID
    [--output CLIENT_FILE] [--overwrite] [--json]
bitch --gateway [ALIAS] artifact delete ARTIFACT_ID
    --confirm ARTIFACT_ID [--json]
```

Workspace and persistent artifact commands require Gateway mode. The conversation-list `--workspace` filter also requires Gateway mode. Directory mode supports conversation and Session Trash commands only.

Artifact download refuses to replace a client file unless `--overwrite` is present. Artifact deletion uses the same exact-ID safeguard as permanent conversation and workspace deletion.

The explicit `trash` verb is sufficient for non-interactive confirmation. Permanent `delete` requires `--confirm`, whose value must exactly equal the positional resource ID. A missing value returns `confirmation_required`. A different value returns `confirmation_mismatch`. Both fail with exit code 2 before any HTTP request.

The built TUI confirms a Trash action in one dialog. Its permanent-delete sheet identifies the resource and describes destroyed and retained data before it enables **Delete permanently**. For a conversation, the warning includes Pi JSONL, command receipts, and server-owned exports. It states that client-downloaded copies are outside BITCH control.

## Gateway command tree

```text
bitch gateway create ALIAS [--backend docker|apple] [--port auto|PORT] [--json]
bitch gateway register ALIAS URL [--replace] [--json]
bitch gateway list [--json]
bitch gateway show ALIAS [--json]
bitch gateway status ALIAS [--json]
bitch gateway rename OLD_ALIAS NEW_ALIAS [--json]
bitch gateway delete ALIAS [--json]

bitch gateway master show [--json]
bitch gateway master set ALIAS [--json]
bitch gateway master clear [--json]

bitch gateway local list [--json]
bitch gateway local start ALIAS [--json]
bitch gateway local stop ALIAS [--force] [--json]
bitch gateway local restart ALIAS [--force] [--json]
bitch gateway local configure ALIAS --port auto|PORT [--force] [--json]

bitch gateway soul seed DESTINATION [--from SOURCE] [--json]
```

`PORT` is an integer from 1 through 65535. `auto` lets the selected local backend assign an available host port on `127.0.0.1`.

## Command behavior

### `gateway create`

Creates and registers a local gateway. `--backend` selects its immutable container backend. The default backend is `docker`, and the default port policy is `auto`.

The first release implements only `docker`. It recognizes `--backend apple` but fails with `gateway_backend_unavailable` before any image, data, container, identity, or registry side effect. When Apple `container` support ships, `--backend apple` creates a separate gateway with a new gateway ID and data root. It never converts an existing Docker gateway.

The command:

1. When necessary, build the pinned image.
2. Create the data root.
3. Start the container.
4. Wait for readiness.
5. Record the gateway ID and backend.
6. Leave the gateway running.

The first registered gateway becomes master.

### `gateway register`

Registers one reachable externally managed endpoint. The URL must satisfy the endpoint rules in [`../product/clients.md`](../product/clients.md).

`--replace` requires an existing externally managed alias. It changes only the endpoint and succeeds only when the new endpoint reports the stored gateway ID. It rejects a managed local alias.

### `gateway list` and `gateway local list`

`gateway list` reads the registry and lists all entries. `gateway local list` lists only registered BITCH-managed local entries. In the first release, all such entries use Docker.

Neither command contacts an endpoint or Docker. Both sort results by ascending ASCII alias.

### `gateway show`

Reads one registry entry without contacting its endpoint or Docker. A local result includes its runtime configuration and BITCH-owned data-root path.

### `gateway status`

Contacts one registered endpoint and returns its live `/v1/status` result. For a managed local gateway that is stopped, the command reports `stopped` without starting it.

### `gateway rename`

Changes only the alias. It preserves gateway identity, endpoint, runtime configuration, data, and master status. The old alias becomes unknown immediately.

### `gateway delete`

Removes only the registry entry. It requires no confirmation option. It does not contact the endpoint or change any container or gateway data.

### `gateway master`

`show` reports the selected master or that no master exists. `set` requires an existing alias. `clear` sets the master reference to `null`.

### `gateway local`

`start`, `stop`, `restart`, and `configure` accept only a registered BITCH-managed local gateway and dispatch to its recorded backend. The backend and data root cannot be configured after creation.

Normal stop, restart, or live reconfiguration fails when the gateway has active work. `--force` uses the forced lifecycle behavior in [`../operations.md`](../operations.md).

A port configuration change replaces the container while preserving its data root and gateway ID. The registry commits the new port policy only after readiness and identity verification succeed.

### `gateway soul seed`

Seeds a missing destination `SOUL.md`. `--from` selects another registered gateway. Without `--from`, or when the source is unavailable, the command installs the packaged default.

## JSON result types

Every success result has a stable `type` discriminator.

| Command | Result `type` |
|---|---|
| `create` | `gateway.created` |
| `register` | `gateway.registered` |
| `register --replace` | `gateway.registration.replaced` |
| `list` | `gateway.list` |
| `show` | `gateway.show` |
| `status` | `gateway.status` |
| `rename` | `gateway.renamed` |
| `delete` | `gateway.registration.deleted` |
| `master show` | `gateway.master` |
| `master set` | `gateway.master.set` |
| `master clear` | `gateway.master.cleared` |
| `local list` | `gateway.local.list` |
| `local start` | `gateway.local.started` |
| `local stop` | `gateway.local.stopped` |
| `local restart` | `gateway.local.restarted` |
| `local configure` | `gateway.local.configured` |
| `soul seed` | `gateway.soul.seeded` |

A gateway summary has this shape:

```json
{
  "gatewayId": "550e8400-e29b-41d4-a716-446655440000",
  "alias": "work",
  "kind": "local",
  "backend": "docker",
  "endpoint": "http://localhost:49152",
  "master": true
}
```

`kind` is `local` or `remote`. A local summary has `backend` set to `docker` or `apple`. A remote summary omits this field. List results contain a `gateways` array of summaries. Show results add the local `runtime` object when applicable. A status result has `state: "running" | "stopped"`.

A running result includes the canonical `status` object from [`protocol.md`](protocol.md). A stopped managed-local result omits that object.

Mutation results contain the affected gateway ID and alias. Rename also contains `oldAlias` and `newAlias`. Master results contain nullable `gatewayId` and `alias` fields.

Deletion reports only the removed registry identity:

```json
{
  "type": "gateway.registration.deleted",
  "gatewayId": "550e8400-e29b-41d4-a716-446655440000",
  "alias": "work"
}
```

`gateway.soul.seeded` contains the destination reference and `source`, which is a gateway reference or `default`.

## Human-readable results

List commands print a table with alias, kind, local backend, master status, and endpoint. `show` prints registry fields as labeled values. `status` prints connection state followed by the non-sensitive status fields.

Mutation commands print one sentence. Registry deletion prints:

```text
Deleted gateway registration "ALIAS".
```

Human output does not print credentials, authorization values, prompts, messages, tool data, or secret paths.

## Errors

With `--json`, failures write this object to stdout:

```json
{
  "type": "error",
  "code": "gateway_not_found",
  "message": "Gateway alias \"work\" was not found. Run `bitch gateway list` to see registered aliases.",
  "retryable": false
}
```

With `--jsonl`, a failure writes the equivalent terminal problem envelope to stdout. Human-readable failures write a message to stderr.

The message states what failed and gives the next safe action when one is available. It does not blame the user.

The object can add typed gateway, conversation, workspace, artifact, command, request, or dialog identifiers. It never adds stack traces or secrets.

## Process exit codes

| Exit code | Meaning | Example stable codes |
|---:|---|---|
| `0` | Success | none |
| `2` | Usage or validation failure | `gateway_alias_invalid`, `gateway_endpoint_invalid`, `repository_url_invalid`, `attachment_type_unsupported`, `confirmation_required`, `confirmation_mismatch` |
| `3` | Selection or resource not found | `master_gateway_missing`, `gateway_not_found`, `resource_not_found`, `workspace_missing`, `default_workspace_missing` |
| `4` | Conflict or busy state | `gateway_alias_conflict`, `gateway_identity_mismatch`, `gateway_active_work`, `conversation_busy`, `conversation_locked`, `workspace_directory_conflict`, `local_lifecycle_busy`, `soul_already_exists` |
| `5` | Selected service unavailable | `gateway_unavailable`, `directory_start_failed`, `readiness_timeout`, `local_port_unavailable` |
| `6` | Unsupported or incompatible behavior | `protocol_incompatible`, `capability_missing`, `gateway_not_locally_managed`, `gateway_backend_unavailable`, `detach_requires_gateway` |
| `7` | Storage or recovery required | `registry_recovery_required`, `catalog_recovery_required`, `session_recovery_required`, `gateway_identity_recovery_required`, `local_gateway_recovery_required`, `operation_recovery_required`, `registry_schema_unsupported`, `schema_version_unsupported` |
| `8` | Permission or security boundary failure | `local_data_permission_denied`, `gateway_data_permission_denied`, `browser_origin_not_allowed` |
| `9` | User interaction required | `interaction_required` |
| `10` | Accepted operation failed | `command_failed`, `local_lifecycle_failed`, `workspace_clone_failed` |
| `130` | Interrupted by SIGINT | `interrupted`, `abort_settlement_timeout` |

An unavailable, missing, incompatible, or damaged selected gateway never causes fallback.
