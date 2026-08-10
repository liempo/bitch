# HTTP and SSE API

## Status

Approved first-release `/v1` resource, schema, pagination, and event contract. The canonical schemas, HTTP operation map, and version 1 fixtures are implemented. The Agent Server is pending.

## Common rules

The canonical TypeBox schemas in `packages/protocol/src/schemas/` implement this document and are exported by `@bitch/protocol`. `packages/protocol/src/http/operations.ts` binds each operation to its parameters, request variants, response statuses, and fixture variants. Generated JSON Schema under `packages/protocol/generated/json-schema/v1/` and `packages/protocol/generated/openapi-v1.json` are committed build artifacts. `npm run check:generated` fails when an expected artifact is missing or changed. It also fails when an unexpected artifact remains in a generated directory.

JSON field names use lower camel case. IDs use canonical lowercase UUID strings unless Pi defines the ID. Timestamps use UTC RFC 3339 with millisecond precision.

Request bodies reject unknown fields. Response readers accept unknown additive fields within `/v1`. A response schema still rejects a version 1 field that conflicts with its discriminated state. For example, an accepted receipt cannot contain `result`, `problem`, or `settledAt`.

## Access boundary

The first release has no application token or HTTP login for `/v1`. Local clients use a loopback endpoint. Remote clients use a Tailnet-protected endpoint.

The server rejects every request that contains an `Origin` header. It returns `browser_origin_not_allowed`. See [`../operations.md`](../operations.md) for network requirements.

JSON operations use `application/json`. Errors use `application/problem+json`. SSE operations use `text/event-stream`. Byte-preserving `SOUL.md` transfer uses `application/octet-stream`.

Artifact downloads use the media type in their `ArtifactDescriptor`.

## HTTP resources

### Process and status

| Method | Path | Result |
|---|---|---|
| `GET` | `/health/live` | Process liveness |
| `GET` | `/health/ready` | Startup and storage readiness |
| `GET` | `/v1/status` | Canonical server status and capabilities |

### Conversations

| Method | Path | Result |
|---|---|---|
| `POST` | `/v1/conversations` | Create a Pi session and accept its first prompt |
| `GET` | `/v1/conversations` | Paginated normal conversation list |
| `GET` | `/v1/conversations/{conversationId}` | One conversation projection |
| `POST` | `/v1/conversations/{conversationId}/viewed` | Mark Gateway-mode completion viewed globally |
| `POST` | `/v1/conversations/{conversationId}/trash` | Move an idle conversation to Session Trash |
| `POST` | `/v1/conversations/{conversationId}/restore` | Restore an individually trashed conversation |
| `DELETE` | `/v1/conversations/{conversationId}` | Permanently delete an idle trashed conversation |
| `GET` | `/v1/conversations/{conversationId}/state` | Current Pi and BITCH state |
| `GET` | `/v1/conversations/{conversationId}/messages` | Durable active-branch messages |
| `GET` | `/v1/conversations/{conversationId}/stats` | Pi session statistics |
| `GET` | `/v1/conversations/{conversationId}/entries` | Durable entries with optional entry cursor |
| `GET` | `/v1/conversations/{conversationId}/tree` | Pi session tree |
| `GET` | `/v1/conversations/{conversationId}/fork-messages` | Pi fork candidates |
| `GET` | `/v1/conversations/{conversationId}/last-assistant` | Last assistant text or `null` |
| `GET` | `/v1/conversations/{conversationId}/commands` | Extension, prompt-template, and skill commands |
| `GET` | `/v1/conversations/{conversationId}/thinking-levels` | Levels supported by the selected model |
| `POST` | `/v1/conversations/{conversationId}/commands` | Accept one typed Pi operation |
| `GET` | `/v1/conversations/{conversationId}/commands/{commandId}` | Read one command receipt and result |
| `GET` | `/v1/conversations/{conversationId}/events` | Conversation SSE stream |
| `POST` | `/v1/conversations/{conversationId}/dialogs/{dialogId}/response` | Settle one pending extension dialog |

A blank new-conversation draft exists only in the client. `POST /v1/conversations` runs when the first prompt is submitted.

The server allocates the Pi session ID and writes a durable creation receipt before it invokes Pi. It also commits enough recoverable metadata to address a pending interaction.

A normal success response waits for Pi preflight. If preflight pauses for interaction, the command remains accepted and the client receives `interaction_required`.

A terminal preflight failure removes uncommitted session content and metadata. It retains the failed creation receipt so a matching retry cannot invoke Pi again.

### Models and provider authentication

| Method | Path | Result |
|---|---|---|
| `GET` | `/v1/models` | Models configured on this Agent Server |
| `GET` | `/v1/providers` | Provider authentication status without secret values |
| `POST` | `/v1/providers/{providerId}/login` | Start or continue pinned Pi provider login |
| `POST` | `/v1/providers/{providerId}/logout` | Apply pinned Pi provider logout |

A login request and response use Pi's provider authentication interaction types. They can contain a browser URL, device code, or secret-input request. Stored credential values never appear in a response.

### Gateway activity and workspaces

These resources exist only in Gateway mode.

| Method | Path | Result |
|---|---|---|
| `GET` | `/v1/events` | Gateway summary and notification SSE stream |
| `POST` | `/v1/workspaces` | Create an empty, Git, or cloned workspace |
| `GET` | `/v1/workspaces` | Paginated active workspace list |
| `GET` | `/v1/workspaces/{workspaceId}` | One workspace |
| `PATCH` | `/v1/workspaces/{workspaceId}` | Change only the display name |
| `POST` | `/v1/workspaces/{workspaceId}/trash` | Move an idle non-default workspace to Trash |
| `POST` | `/v1/workspaces/{workspaceId}/restore` | Restore a trashed workspace |
| `DELETE` | `/v1/workspaces/{workspaceId}` | Permanently delete a trashed workspace and retain its tombstone |
| `GET` | `/v1/trash/conversations` | Paginated Session Trash view |
| `GET` | `/v1/trash/workspaces` | Paginated Workspace Trash view |

Directory mode returns `capability_not_supported` for every workspace resource.

### `SOUL.md` and artifacts

| Method | Path | Result |
|---|---|---|
| `GET` | `/v1/config/soul` | Existing `SOUL.md` bytes and digest, or not found |
| `PUT` | `/v1/config/soul` | Create `SOUL.md` only when absent |
| `GET` | `/v1/artifacts/{artifactId}` | Download a completed server artifact |
| `DELETE` | `/v1/artifacts/{artifactId}` | Explicitly delete one completed gateway artifact |

The `SOUL.md` endpoints exist only in Gateway mode. Directory mode returns `capability_not_supported`.

`GET /v1/config/soul` returns the exact file bytes as `application/octet-stream`. Its quoted `ETag` is `"sha256:DIGEST"`. `DIGEST` is lowercase hexadecimal SHA-256.

An absent file returns HTTP 404 `resource_not_found`.

`PUT /v1/config/soul` requires `If-None-Match: *` and an `application/octet-stream` body. It never replaces or merges an existing file. An existing file returns HTTP 412 with `soul_already_exists`.

A successful PUT returns this JSON descriptor:

```typescript
interface SoulDescriptor {
  byteCount: number;
  sha256: string;
  etag: string;
}
```

The server writes the bytes atomically. `sha256` is lowercase hexadecimal. `etag` contains the quoted ETag value.

An artifact GET streams the completed bytes and sets `Content-Length`. An incomplete or deleted artifact is unavailable. The response never exposes its server path.

Explicit artifact DELETE exists only in Gateway mode. Directory-mode artifacts disappear during invocation shutdown.

## Success status rules

- A successful GET returns HTTP 200.
- A new `POST /v1/conversations` returns HTTP 201 with a conversation and accepted receipt.
- A matching in-flight new-conversation retry returns HTTP 202 with the existing conversation and receipt.
- A matching successful new-conversation retry returns HTTP 200 with the existing conversation and receipt.
- A matching failed new-conversation retry returns the original problem status and code.
- A new command acceptance returns HTTP 202.
- A new provider login operation returns HTTP 202.
- Provider login continuation requests return HTTP 200.
- An idempotent command retry returns HTTP 200 with the existing receipt.
- Workspace creation and initial `SOUL.md` creation return HTTP 201.
- Other successful POST and PATCH mutations return HTTP 200 with their result.
- Successful DELETE operations return HTTP 204 without a body.

## Core schemas

### Health and problems

```typescript
interface HealthResult {
  status: "live" | "ready" | "notReady";
  code?: string;
}

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  code: string;
  requestId: string;
  retryable: boolean;
  gatewayId?: string;
  conversationId?: string;
  workspaceId?: string;
  artifactId?: string;
  commandId?: string;
  dialogId?: string;
  issues?: Array<{ path: string; code: string; message: string }>;
}
```

A successful liveness or readiness request returns HTTP 200. Failed readiness returns HTTP 503 and `status: "notReady"`. Every `/v1` error uses `application/problem+json`.

### Gateway references

```typescript
interface GatewayConversationRef {
  gatewayId: string;
  conversationId: string;
}

interface GatewayWorkspaceRef {
  gatewayId: string;
  workspaceId: string;
}

type ConversationRef =
  | { conversationId: string }
  | GatewayConversationRef;
```

Directory-mode conversation references contain `conversationId` without `gatewayId`.

### Model and provider summaries

```typescript
interface ModelSummary {
  provider: string;
  modelId: string;
  name: string;
  reasoning: boolean;
  input: Array<"text" | "image">;
  contextWindow: number;
  maxTokens: number;
}

type ProviderAuthType = "api_key" | "oauth";

interface ProviderSummary {
  providerId: string;
  name: string;
  authentication: ProviderAuthType[];
  status: "authenticated" | "unauthenticated" | "expired";
}
```

Provider summaries contain no key, token, header, environment value, or credential path.

Provider login uses these pinned Pi authentication values:

```typescript
type ProviderLoginRequest =
  | { type: "start"; authType: ProviderAuthType }
  | { type: "poll"; operationId: string; afterSequence: number }
  | { type: "value"; operationId: string; promptId: string; value: string }
  | { type: "cancel"; operationId: string };

type ProviderAuthPrompt =
  | {
      promptId: string;
      type: "text" | "secret" | "manual_code";
      message: string;
      placeholder?: string;
    }
  | {
      promptId: string;
      type: "select";
      message: string;
      options: Array<{ id: string; label: string; description?: string }>;
    };

type ProviderAuthNotification =
  | { sequence: number; type: "info"; message: string; links?: Array<{ url: string; label?: string }> }
  | { sequence: number; type: "auth_url"; url: string; instructions?: string }
  | {
      sequence: number;
      type: "device_code";
      userCode: string;
      verificationUri: string;
      intervalSeconds?: number;
      expiresInSeconds?: number;
    }
  | { sequence: number; type: "progress"; message: string };

interface ProviderLoginResult {
  operationId: string;
  providerId: string;
  authType: ProviderAuthType;
  state: "running" | "needsInput" | "completed" | "failed" | "cancelled";
  sequence: number;
  notifications: ProviderAuthNotification[];
  prompt?: ProviderAuthPrompt;
  provider?: ProviderSummary;
  problem?: ProblemDetails;
}
```

`start` requires an authentication type advertised by the provider. `poll` returns notifications after `afterSequence` and the current prompt or terminal state.

`value` resolves only the matching current prompt. Secret values never appear in a result, event, or log. `cancel` aborts the login operation.

A completed result includes the updated `provider`. A failed result includes `problem`. Logout has an empty request body and returns the updated `ProviderSummary`.

One data store can have one active login operation for each provider. Directory mode enforces this rule with a cross-process lock.

Another `start` request returns HTTP 409 `provider_login_active`. A server restart cancels incomplete login operations without changing stored credentials.

### Conversation projection

```typescript
interface Conversation {
  conversationId: string;
  gatewayId?: string;
  workspaceId?: string;
  title: string | null;
  cwd: string;
  createdAt: string;
  activityAt: string;
  viewedAt: string | null;
  completedAt: string | null;
  status: "idle" | "working" | "needsInput" | "failed" | "stopped";
  completedSinceViewed: boolean;
  trashedAt: string | null;
  trashReason: "individual" | "workspace" | "workspaceMissing" | null;
  readOnly: boolean;
}

type ConversationSummary = Omit<Conversation, "cwd">;
```

`cwd` is a container path. Conversation lists use `ConversationSummary`. Clients must not interpret `cwd` as a client-host path.

Opening a session locked by another Agent Server returns HTTP 409 `conversation_locked`.

### Create conversation

```typescript
interface CreateConversationRequest {
  commandId: string;
  message: string;
  images?: ImageInput[];
  workspaceId?: string;
  model?: { provider: string; modelId: string };
  thinkingLevel?: "off" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";
}

interface CreateConversationResponse {
  conversation: Conversation;
  receipt: CommandReceipt;
}
```

Directory mode rejects `workspaceId`. Gateway mode uses the default workspace when it is absent.

### Images

```typescript
interface ImageInput {
  type: "image";
  data: string;
  mimeType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
  fileName?: string;
}
```

The base64 field contains only image bytes. The server rejects invalid base64, invalid image bytes, or a MIME-signature mismatch with `attachment_type_unsupported`.

General file content is invalid.

### Conversation state

```typescript
type ThinkingLevel =
  | "off"
  | "minimal"
  | "low"
  | "medium"
  | "high"
  | "xhigh"
  | "max";

interface ConversationState {
  conversation: Conversation;
  model: ModelSummary | null;
  thinkingLevel: "off" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";
  steeringMode: "all" | "one-at-a-time";
  followUpMode: "all" | "one-at-a-time";
  autoCompactionEnabled: boolean;
  autoRetryEnabled: boolean;
  messageCount: number;
  pendingMessageCount: number;
  activeCommandIds: string[];
}
```

Protocol model summaries exclude provider credentials and implementation functions.

### Command envelope

```typescript
interface ConversationCommand<TType extends string, TPayload> {
  commandId: string;
  type: TType;
  payload: TPayload;
}
```

Version 1 accepts these command variants:

| `type` | Payload fields | Completed `result` |
|---|---|---|
| `prompt` | `message`, optional `images`, optional `streamingBehavior` | omitted |
| `steer` | `message`, optional `images` | omitted |
| `follow_up` | `message`, optional `images` | omitted |
| `abort` | empty object | omitted |
| `new_session` | optional `parentConversationId` | `SessionChangeResult` |
| `set_model` | `provider`, `modelId` | `ModelSummary` |
| `cycle_model` | empty object | `ModelCycleResult` or `null` |
| `set_thinking_level` | `level` | omitted |
| `cycle_thinking_level` | empty object | `ThinkingCycleResult` or `null` |
| `set_steering_mode` | `mode` | omitted |
| `set_follow_up_mode` | `mode` | omitted |
| `compact` | optional `customInstructions` | `CompactionResultDto` |
| `set_auto_compaction` | `enabled` | omitted |
| `set_auto_retry` | `enabled` | omitted |
| `abort_retry` | empty object | omitted |
| `bash` | `command`, optional `excludeFromContext` | `BashResultDto` |
| `abort_bash` | empty object | omitted |
| `export_html` | empty object | `ArtifactDescriptor` |
| `switch_session` | `targetConversationId` | `SessionChangeResult` |
| `fork` | `entryId` | `ForkResult` |
| `clone` | empty object | `SessionChangeResult` |
| `set_session_name` | `name` | omitted |
| `reload` | empty object | omitted |

Names and enum values preserve pinned Pi RPC spelling. `streamingBehavior` is `steer` or `followUp`. Queue `mode` is `all` or `one-at-a-time`. `level` uses `ThinkingLevel`.

`reload` is a BITCH transport operation for pinned `AgentSession.reload()`. It reloads only the selected conversation runtime and retains its conversation ID.

Reload requires an idle conversation without a pending dialog. Otherwise, it returns HTTP 409 `conversation_busy`. A successful reload clears prior extension UI state.

Query-only Pi RPC commands use the GET resources in this document.

### Command receipt

```typescript
interface ModelCycleResult {
  model: ModelSummary;
  thinkingLevel: ThinkingLevel;
  isScoped: boolean;
}

interface ThinkingCycleResult {
  level: ThinkingLevel;
}

type SessionChangeResult =
  | { cancelled: true }
  | { cancelled: false; target: ConversationRef };

type ForkResult = SessionChangeResult & {
  text?: string;
};

type CommandResult =
  | ModelSummary
  | ModelCycleResult
  | ThinkingCycleResult
  | CompactionResultDto
  | BashResultDto
  | ArtifactDescriptor
  | SessionChangeResult
  | ForkResult
  | null;

interface CommandReceipt {
  commandId: string;
  conversationId: string;
  gatewayId?: string;
  type: string;
  payloadHash: string;
  state: "accepted" | "running" | "completed" | "failed" | "interrupted";
  acceptedAt: string;
  updatedAt: string;
  settledAt?: string;
  result?: CommandResult;
  problem?: ProblemDetails;
}
```

Gateway mode requires `gatewayId`. Directory mode omits it. `payloadHash` is the lowercase SHA-256 digest of the RFC 8785 canonical validated payload.

A new asynchronous acceptance returns HTTP 202. A retry must match the stored conversation, command type, and payload hash. It returns HTTP 200 and the existing receipt.

A command ID is unique among retained receipts in one Agent Server data store. Any other reuse returns HTTP 409 `command_id_conflict`.

An accepted or running receipt omits `settledAt`, `result`, and `problem`. A completed receipt requires `settledAt` and omits `problem`.

A failed or interrupted receipt requires `settledAt` and `problem`. It omits `result`. The problem contains a stable code.

The command type selects the `result` schema. Commands without Pi result data omit `result`. A canceled session change omits `target`. Pi result DTOs use the exclusions in **Pi transport values**.

A completed session replacement includes its conversation reference. A canceled replacement omits it. A fork includes `text` when Pi supplies selected text.

Export results contain an artifact descriptor instead of a server path.

Example abort acceptance:

```http
POST /v1/conversations/0195f6f4-7c5b-7000-8000-000000000001/commands HTTP/1.1
Content-Type: application/json

{
  "commandId": "550e8400-e29b-41d4-a716-446655440001",
  "type": "abort",
  "payload": {}
}
```

```http
HTTP/1.1 202 Accepted
Content-Type: application/json

{
  "commandId": "550e8400-e29b-41d4-a716-446655440001",
  "conversationId": "0195f6f4-7c5b-7000-8000-000000000001",
  "gatewayId": "550e8400-e29b-41d4-a716-446655440000",
  "type": "abort",
  "payloadHash": "44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a",
  "state": "accepted",
  "acceptedAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

The server writes the accepted receipt before it invokes Pi. A receipt settles when the mapped Pi operation settles.

`steer` and `follow_up` settle after Pi accepts the queued message. Their receipts do not claim that a later generated turn has settled.

### Dialog response

```typescript
type DialogResponse =
  | { type: "value"; value: string }
  | { type: "confirmation"; confirmed: boolean }
  | { type: "cancelled" };
```

The first response that validates for the dialog method wins. Later responses return `dialog_already_resolved`.

### Workspace projection and creation

```typescript
interface Workspace {
  workspaceId: string;
  gatewayId: string;
  directoryName: string;
  displayName: string;
  isDefault: boolean;
  gitState: "none" | "initialized" | "cloned";
  createdAt: string;
  activityAt: string;
  trashedAt: string | null;
  state: "active" | "trashed" | "missing";
  activeConversationCount: number;
  totalConversationCount: number;
}

type CreateWorkspaceRequest =
  | { type: "empty"; directoryName: string; displayName?: string }
  | { type: "git"; directoryName: string; displayName?: string }
  | { type: "clone"; directoryName: string; repositoryUrl: string; displayName?: string };
```

Directory names are one path segment and use the containment rules in [`storage.md`](storage.md).

Repository URLs accept `https://`, `ssh://`, and SSH SCP-like syntax. HTTPS user information, URL passwords, query strings, fragments, `file://`, local paths, and other schemes fail with `repository_url_invalid`. SSH usernames such as `git@host` are allowed, but requests cannot include secret material.

After validation, the repository URL passes to `git clone`. BITCH does not add GitHub credentials or accept credential fields.

Workspace mutations return the updated `Workspace`. A missing cataloged path returns `state: "missing"`. Mutation and new-conversation use fail with `workspace_missing`.

Workspace creation and restoration require their target active path to be absent. A file, directory, or symbolic link at that path returns HTTP 409 `workspace_directory_conflict`.

An absent implicit default workspace fails with `default_workspace_missing`. Permanent workspace deletion returns HTTP 204 after catalog commit and deletion staging.

Conversation Trash and viewed mutations return the updated `Conversation`. Gateway-mode permanent deletion uses one recoverable transaction for these items:

- the Pi JSONL file.
- the receipt directory and successful creation receipt.
- the catalog record.
- the server-owned artifact directory.

Directory-mode deletion omits the gateway catalog and persistent artifact directory. The endpoint returns HTTP 204 after its transaction commits.

### Pending dialog

```typescript
interface PendingDialog {
  dialogId: string;
  method: "select" | "confirm" | "input" | "editor";
  title: string;
  message?: string;
  options?: string[];
  placeholder?: string;
  prefill?: string;
  timeoutAt?: string;
}
```

### Pi transport values

`PiMessage`, `PiContentBlock`, `PiEntry`, `PiTreeNode`, `SessionStats`, `CompactionResultDto`, and `BashResultDto` copy pinned Pi 0.83.0 public data types. Command discovery and model results follow the same rule.

The protocol package commits each expanded JSON Schema. DTOs contain data fields only. They exclude functions, class instances, signals, absolute session paths, provider credentials, and extension closures.

`BashResultDto` omits Pi's temporary `fullOutputPath` and preserves the remaining result fields. The `BashExecutionMessage` projection applies the same omission. An assistant diagnostic preserves `type`, `timestamp`, and the nested error `name`, `message`, and `code`. It omits the error stack and provider-specific `details` because these values can expose internal paths, credentials, or unspecified provider payloads.

A Pi type change is a generated-schema and behavioral-compatibility change. It cannot enter the lockfile without updating the committed fixture and capability matrix.

### Artifact descriptor

```typescript
interface ArtifactDescriptor {
  artifactId: string;
  conversationId: string;
  gatewayId?: string;
  fileName: string;
  mediaType: string;
  byteCount: number;
  createdAt: string;
  downloadUrl: string;
}
```

Gateway mode requires `gatewayId`. Directory mode omits it. `fileName` is one safe filename without a path separator. `downloadUrl` is the same-origin path `/v1/artifacts/ARTIFACT_ID`. It contains no endpoint or credential.

## Pagination

Collection endpoints use keyset pagination.

Query parameters are:

- `limit`: default 50, minimum 1, maximum 200.
- `cursor`: opaque base64url cursor returned by the prior page.
- endpoint-specific filters such as `workspaceId`.

Responses use:

```typescript
interface Page<T> {
  items: T[];
  nextCursor: string | null;
  revision: string;
}
```

A cursor encodes the endpoint, normalized filters, revision, final sort values, and final resource ID. Clients treat it as opaque. A malformed cursor returns `cursor_invalid`. A changed catalog or Directory-mode list revision returns `cursor_stale`. The client then restarts from the first page.

Sort orders are:

- active conversations: `activityAt` descending, then conversation ID ascending.
- active workspaces: most recent bound-conversation activity descending, then display name and workspace ID ascending.
- Session Trash and Workspace Trash: `trashedAt` descending, then resource ID ascending.
- model and command collections: pinned Pi order, without cursor pagination.
- messages and entries: Pi append order ascending. `entries` can also use a durable Pi entry ID as `since`.

## SSE connection

`GET /v1/conversations/{conversationId}/events` uses `text/event-stream`. A setup failure returns `application/problem+json` before HTTP 200.

After HTTP 200, a transport failure closes the stream without an untyped error event. The server ignores `Last-Event-ID` because BITCH does not replay transient events.

The optional `view` query is `background` by default or `foreground`. A TUI uses `foreground` only while that conversation is visibly open. Registration of a foreground sink marks the conversation viewed and keeps an active-viewer count until that sink disconnects. Attached CLI commands and monitoring clients use `background`.

In Gateway mode, when a successful run settles with at least one foreground sink, the catalog commits `completedAt` and `viewedAt` to that settlement time together. A background stream, any GET request, and artifact download never change viewed state. `POST /viewed` performs the explicit non-interactive mutation.

Directory mode has no gateway-global viewed catalog. It ignores the `view` hint, reports `completedSinceViewed: false`, and returns `capability_not_supported` for `POST /viewed`.

Every data record has this shape:

```typescript
interface ConversationEvent<TType extends string, TData> {
  streamId: string;
  sequence: number;
  conversationId: string;
  gatewayId?: string;
  emittedAt: string;
  type: TType;
  data: TData;
}
```

Gateway-mode envelopes require `gatewayId`. Directory-mode envelopes omit it. SSE `id` is `STREAM_ID:SEQUENCE`. SSE `event` equals `type`. SSE `data` is the JSON envelope. Heartbeats are SSE comments and do not consume sequence numbers.

A compatible client ignores an unknown additive event type after it advances the validated sequence. A required new behavior uses a capability identifier.

## SSE event types

### BITCH lifecycle events

| Type | Data |
|---|---|
| `conversation.snapshot` | `ConversationSnapshot` |
| `conversation.status.changed` | current status and prior status |
| `conversation.viewed.changed` | `viewedAt`, `completedAt`, `completedSinceViewed` |
| `conversation.replaced` | replacement reason and target conversation reference |
| `command.receipt.updated` | complete `CommandReceipt` |
| `extension.ui.request` | supported pending dialog request |
| `extension.ui.event` | supported fire-and-forget UI request |
| `extension.error` | safe extension source reference, event name, and message |

### Pinned Pi event mappings

| Pi event | BITCH event type |
|---|---|
| `agent_start` | `agent.start` |
| `agent_end` | `agent.end` |
| `agent_settled` | `agent.settled` |
| `turn_start` | `turn.start` |
| `turn_end` | `turn.end` |
| `message_start` | `message.start` |
| `message_update` | `message.update` |
| `message_end` | `message.end` |
| `bash_execution_update` | `bash.execution.update` |
| `tool_execution_start` | `tool.execution.start` |
| `tool_execution_update` | `tool.execution.update` |
| `tool_execution_end` | `tool.execution.end` |
| `queue_update` | `queue.update` |
| `entry_appended` | `entry.appended` |
| `session_info_changed` | `session.info.changed` |
| `thinking_level_changed` | `thinking.level.changed` |
| `compaction_start` | `compaction.start` |
| `compaction_end` | `compaction.end` |
| `auto_retry_start` | `retry.start` |
| `auto_retry_end` | `retry.end` |
| `summarization_retry_scheduled` | `summarization.retry.scheduled` |
| `summarization_retry_attempt_start` | `summarization.retry.attempt-start` |
| `summarization_retry_finished` | `summarization.retry.finished` |

The Pi adapter converts Pi SDK objects to protocol DTOs. Message and tool DTOs preserve content and IDs. They omit functions, signals, file handles, stack traces, and credentials.

## Snapshot schema

```typescript
type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

interface ActiveToolExecution {
  toolCallId: string;
  toolName: string;
  status: "running" | "completed" | "failed";
  input?: JsonValue;
  content?: PiContentBlock[];
  details?: JsonValue;
}

interface ActiveResponse {
  message: PiMessage;
  tools: ActiveToolExecution[];
}

interface ConversationSnapshot {
  conversation: Conversation;
  state: ConversationState;
  messagesRevision: string;
  activeResponse: ActiveResponse | null;
  steeringQueue: Array<{ text: string; images: ImageInput[] }>;
  followUpQueue: Array<{ text: string; images: ImageInput[] }>;
  pendingDialogs: PendingDialog[];
  extensionUiState: {
    statuses: Record<string, string>;
    widgets: Array<{
      key: string;
      lines: string[];
      placement: "aboveEditor" | "belowEditor";
    }>;
    title: string | null;
  };
  activeReceipts: CommandReceipt[];
}
```

`activeResponse.message` projects Pi's public `streamingMessage`. The handle retains only transferable tool progress that Pi does not expose in public state.

This transport state is transient. `activeResponse` can be `null` after restart.

## Event ordering

One live conversation owns one stream ID and one sequence counter. A runtime replacement or server restart creates a new stream ID.

For a new subscriber:

1. Register the subscriber.
2. Capture the current sequence watermark.
3. Build the snapshot while queuing newer live events.
4. Send `conversation.snapshot` with the watermark.
5. Send queued events starting at watermark plus one.
6. Continue with live events.

A client-specific snapshot does not increment the shared sequence counter. All connected clients receive each later live event with the same stream ID and sequence.

The per-conversation command gate assigns order before it invokes Pi. A receipt reaches `accepted` before any Pi event caused by that command. Pi event order remains unchanged.

Parallel tool ordering copies pinned Pi:

- tool starts use assistant source order.
- tool updates can interleave.
- tool ends use completion order.
- final tool-result message events use assistant source order.

A durable `message.end` follows the successful Pi JSONL append for that message. `agent.settled` follows Pi retry, compaction-retry, and queued-continuation settlement. The final command receipt update follows all Pi events attributed to that command.

Dialogs retain their request order. A valid response event precedes the Pi events that continue the blocked handler.

## Reconciliation

A changed stream ID, sequence gap, decode failure, or stale foreground connection makes the client:

1. Stop applying live events.
2. Reload the conversation over HTTP.
3. Reload durable messages over HTTP.
4. Open a new SSE connection.
5. Apply its snapshot.
6. Resume with events after the snapshot watermark.

The client deduplicates durable messages and tool results by Pi entry ID. It does not deduplicate token deltas across streams because it discards the old active projection before applying a new snapshot.

## Gateway activity SSE

`GET /v1/events` keeps one selected gateway's conversation and workspace navigation current without subscribing to every conversation stream. Directory mode returns `capability_not_supported`.

```typescript
interface GatewayEvent<TType extends string, TData> {
  streamId: string;
  sequence: number;
  gatewayId: string;
  emittedAt: string;
  type: TType;
  data: TData;
}

interface GatewaySnapshot {
  revision: string;
  conversations: ConversationSummary[];
  workspaces: Workspace[];
}
```

Event types are:

| Type | Data |
|---|---|
| `gateway.snapshot` | `GatewaySnapshot` |
| `conversation.summary.changed` | complete `ConversationSummary` projection |
| `conversation.removed` | `conversationId` |
| `workspace.summary.changed` | complete `Workspace` projection |
| `workspace.removed` | `workspaceId` |
| `conversation.notification` | `conversationId`, severity, and message |

The stream uses the same subscriber-before-snapshot, stream-ID, sequence, heartbeat, and no-replay rules as a conversation stream. A gap or changed stream reloads conversation and workspace collections before resubscription.

A conversation summary includes its display title, which can derive from first-message text. `conversation.notification` carries only its source ID, severity, and extension notification text.

Beyond those summary fields, the gateway stream carries no message bodies, tool data, image bytes, dialog options, or editor text. A pending background dialog appears only as **Needs input**. The client opens that conversation's stream to receive the dialog.

Stateful `setStatus`, string-widget, and `setTitle` values remain in the live conversation snapshot. Runtime disposal or server restart clears them.

`set_editor_text` is a foreground event. The server does not replay it or apply it to another conversation's editor.
