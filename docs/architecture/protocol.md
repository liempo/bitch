# Agent Server Protocol

## Status

Approved first-release protocol architecture. The version 1 schema and fixture package is implemented. The Agent Server transport is pending. [`api.md`](api.md) defines the exact resources, schemas, pagination, events, and ordering.

## Transport

[`api.md`](api.md) is the normative `/v1` interface contract.

Clients use HTTP for commands, metadata, settings, and durable state. They use Server-Sent Events (SSE) for live Pi events.

The API uses `/v1`. Additive fields and event types can be added within version 1. Breaking contract changes require a new major path.

## Gateway connection context

One HTTP and SSE connection targets one Agent Server. The API does not use a gateway path prefix.

In Gateway mode, `/v1/status` reports the stable server-owned `gatewayId`. Clients record this ID when they register an endpoint.

Conversation and workspace IDs are unique only within their gateway. A client qualifies stored cross-gateway references with `gatewayId`. Requests sent to one gateway contain only that gateway's resource ID.

Machine-readable CLI output and saved client state use structured gateway references:

```json
{
  "gatewayId": "550e8400-e29b-41d4-a716-446655440000",
  "conversationId": "pi-session-id"
}
```

A workspace reference replaces `conversationId` with `workspaceId`. A gateway artifact reference uses `gatewayId` and `artifactId`.

Logs use separate gateway, conversation, workspace, and artifact ID fields as applicable.

CLI arguments select a gateway with `--gateway` and pass the conversation or workspace ID separately. They do not accept alias-qualified or URI-like composite identifiers. The client verifies the selected gateway ID before it sends the resource ID.

Directory mode does not report a durable gateway ID.

## Canonical schemas

The internal package `@bitch/protocol` owns canonical TypeBox schemas for:

- HTTP requests and responses.
- command envelopes.
- SSE events.
- errors.

TypeScript types are inferred from these schemas. The protocol build generates JSON Schema and OpenAPI 3.1 artifacts.

The repository stores generated artifacts. CI regenerates them and fails when the committed output is stale. This check is a build check, not a behavioral test.

The version 1 contract implementation is in `packages/protocol`:

- `src/schemas/` contains canonical TypeBox schemas grouped by protocol domain.
- `src/fixtures/` contains authored fixture values, coverage requirements, and the version 1 corpus.
- `src/http/` binds each HTTP operation to its parameters, bodies, statuses, and fixture variants.
- `src/receipts/` contains the RFC 8785 command-payload hash function.
- `src/validation/` contains schema, coverage, semantic, and transport-safety validation.
- `src/generation/` creates JSON Schema, OpenAPI, fixture, and manifest artifacts.
- `fixtures/v1/` contains the committed protocol and HTTP operation fixtures.
- `generated/json-schema/v1/`, `generated/openapi-v1.json`, and `generated/manifest.json` contain deterministic generated artifacts.

The package root exports each schema and `SchemaType<Name>`. A consumer can infer a DTO without importing TypeBox implementation files.

The package root also exports `canonicalPayloadHash(payload)`. This function returns the lowercase SHA-256 digest of the RFC 8785 canonical JSON payload. It throws `TypeError` when the value is not valid JSON.

Run `npm run fixtures:generate` to replace the committed generated set. The command also removes an artifact that is no longer canonical. `npm run check:generated` fails for missing, changed, or unexpected generated files.

Run `npm run validate` from the repository root to type-check, lint, test, check generated files, and validate the complete fixture corpus. `npm run fixtures:validate` is the focused fixture-validation command. It exits nonzero for these conditions:

- A fixture does not match its schema.
- A request contains an unknown field.
- A known response field conflicts with its discriminated state.
- A documented schema or union variant has no direct fixture.
- A receipt payload hash, capability list, binary digest, byte count, or descriptor is inconsistent.
- A transport value contains a credential-shaped field or an internal server path.

The validator returns and prints deterministic errors with fixture, path, code, and message fields. `.github/workflows/ci.yml` uses the pinned Node.js version. It runs validation, the package build, and a full dependency audit.

When Phase 7 starts, the macOS app will use Apple Swift OpenAPI Generator for HTTP payload models. A small Swift transport will decode SSE event models.

Raw Pi SDK values and objects never cross the protocol boundary.

## Resource and command API

Durable data uses resource-oriented `/v1` endpoints. This includes conversations, messages, workspaces, and settings.

Pi operations use one typed command endpoint:

```http
POST /v1/conversations/{conversationId}/commands
```

Each command contains:

- a client-generated `commandId` UUID.
- a discriminating `type`.
- a type-specific `payload`.

The TypeBox command schema is a discriminated union. The API does not accept untyped RPC parameters.

A dedicated resource resolves a server-owned pending dialog. The first valid response settles the dialog atomically.

A later response returns HTTP 409 and `dialog_already_resolved`. It also returns `retryable: false` and the conversation and dialog IDs. Invalid responses do not settle the dialog.

## Pi delegation

The Pi command adapter mirrors the pinned Pi RPC command dispatcher. It must preserve Pi names and behavior where the stable BITCH protocol does not require a transport difference.

A thin per-conversation gate orders simultaneous client requests before delegation. A data-store command-ID gate serializes reuse checks. Directory mode uses a cross-process lock for that gate.

Neither gate adds agent policy.

For a prompt, the gate writes its durable receipt before it invokes Pi. A normal success response waits for Pi's preflight result.

A preflight interaction can return `interaction_required` while the receipt remains accepted or running. An accepted prompt continues asynchronously. Steering, follow-up, abort, and dialog responses remain available while Pi runs.

## Command retry protection

The Agent Server records a durable receipt before it invokes Pi. The receipt includes:

- command ID.
- conversation ID.
- command type.
- the lowercase SHA-256 digest of the RFC 8785 canonical validated payload.

A command ID is unique among retained receipts in one Agent Server data store. A retry must match its conversation, command type, and validated payload hash.

A matching retry returns the existing receipt. Any other reuse returns `command_id_conflict`.

Receipt states are:

- `accepted`.
- `running`.
- `completed`.
- `failed`.
- `interrupted`.

At startup, the server marks receipts left in `accepted` or `running` as `interrupted`. It does not execute them again. The client reconciles through durable conversation state.

This design provides at-most-once command acceptance while its receipt exists. It does not claim exactly-once tool side effects.

Permanent conversation deletion removes its receipts and ends their retry lookup. A client must not reuse an old command ID for new work.

## Error format

HTTP errors use RFC 9457 Problem Details with these BITCH fields:

- stable `code`.
- `requestId`.
- `retryable`.
- relevant typed resource identifiers.
- validation issues when applicable.

The server maps Pi and Fastify errors into this format. `detail` states what failed and gives the next safe action when one exists.

Errors do not blame the user. They do not expose Pi objects, stack traces, credentials, or internal paths.

An SSE request that fails before stream setup returns the same HTTP problem schema. After setup, a transport failure closes the stream. The client then reconciles.

The first release rejects an HTTP request that contains an `Origin` header. It returns HTTP 403 with code `browser_origin_not_allowed` and `retryable: false`. The server sends no CORS allow headers.

## SSE connection

Each connection starts with a `conversation.snapshot` event. The server registers the subscriber before it creates the snapshot. It queues new events until the snapshot is sent.

Each event envelope contains:

- `streamId`.
- `sequence`.
- `conversationId`.
- `gatewayId` in Gateway mode.
- `emittedAt`.
- `type`.
- typed `data`.

Sequence numbers increase within one stream. Runtime replacement or server restart creates a new stream ID.

The snapshot contains durable state references, current run status, accumulated active response, pending dialogs, and stateful extension UI values.

The server sends SSE heartbeats. Clients reconnect after recoverable connection failures and check server state after network recovery or foreground activation.

## Reconciliation

The server does not persist or replay the transient live event stream. It also keeps no transient replay buffer.

A stream-ID change or sequence gap makes the client reload durable state over HTTP. The new SSE connection supplies a new snapshot.

Pi JSONL remains the source for completed messages and final tool results.

## Status endpoints

`GET /v1/status` returns this canonical shape:

```json
{
  "serverVersion": "BITCH_SEMVER",
  "protocolVersion": { "major": 1, "minor": 0 },
  "piVersion": "0.83.0",
  "mode": "gateway",
  "gatewayId": "550e8400-e29b-41d4-a716-446655440000",
  "capabilities": [
    "attachment.image.v1",
    "config.soul.v1",
    "conversation.commands.v1",
    "conversation.events.v1",
    "conversation.multi-client.v1",
    "conversation.reconciliation.v1",
    "conversation.reload.v1",
    "extension.rpc-ui.v1",
    "gateway.events.v1",
    "gateway.global-view-state.v1",
    "gateway.identity.v1",
    "gateway.trash.v1",
    "gateway.workspaces.v1",
    "pi.rpc.v1",
    "provider.auth.v1",
    "session.branching.v1",
    "session.export-html.v1",
    "settings.v1",
    "shell.rpc.v1"
  ]
}
```

`serverVersion` and `piVersion` are exact package versions. `mode` is `directory` or `gateway`.

Gateway mode requires `gatewayId`. Directory mode omits it. The capability list contains unique strings in ascending ASCII order.

Version 1 defines these capability identifiers:

- `attachment.image.v1`.
- `conversation.commands.v1`.
- `conversation.events.v1`.
- `conversation.multi-client.v1`.
- `conversation.reconciliation.v1`.
- `conversation.reload.v1`.
- `extension.rpc-ui.v1`.
- `pi.rpc.v1`.
- `provider.auth.v1`.
- `session.branching.v1`.
- `session.export-html.v1`.
- `settings.v1`.
- `shell.rpc.v1`.

Directory mode also reports:

- `directory.fixed-cwd.v1`.
- `directory.project-trust.v1`.

Gateway mode also reports:

- `config.soul.v1`.
- `gateway.events.v1`.
- `gateway.global-view-state.v1`.
- `gateway.identity.v1`.
- `gateway.trash.v1`.
- `gateway.workspaces.v1`.

An additive version 1 release can add capability identifiers. Clients ignore unknown identifiers and require each identifier needed by their requested workflow.

A client must not silently replace a recorded gateway identity when an endpoint reports another ID. It reports `gateway_identity_mismatch` with the recorded and reported gateway IDs and does not change the registry.

A client rejects a gateway-scoped reference when its gateway ID differs from the connected gateway. It reports `gateway_scope_mismatch` with both gateway IDs. It does not send the resource request.

The correct gateway returns `resource_not_found` for an unknown unscoped resource ID. The response does not disclose another gateway.

These identity and scope errors are not retryable until the user changes the endpoint, selection, or resource reference.

Clients require the same protocol major version and each capability needed for the requested workflow. They reject these conditions:

- the wrong server mode.
- an incompatible protocol major version.
- a missing required capability.

Clients accept compatible minor versions and unknown additive capabilities. They do not require exact BITCH or Pi version equality.
