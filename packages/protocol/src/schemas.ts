import { Type, type TProperties, type TSchema } from "typebox";

const strictObject = <P extends TProperties>(properties: P, options: Record<string, unknown> = {}) =>
  Type.Object(properties, { additionalProperties: false, ...options });
const responseObject = <P extends TProperties>(properties: P, options: Record<string, unknown> = {}) =>
  Type.Object(properties, { additionalProperties: true, ...options });
const nullable = <T extends TSchema>(schema: T) => Type.Union([schema, Type.Null()]);
const literals = <T extends readonly string[]>(values: T) =>
  Type.Union(values.map((value) => Type.Literal(value)));

export const Timestamp = Type.String({
  pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\\.[0-9]{3}Z$",
});
export const Uuid = Type.String({
  pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
});
export const PiId = Type.String({ minLength: 1 });
export const Sha256 = Type.String({ pattern: "^[0-9a-f]{64}$" });
export const ThinkingLevel = literals(["off", "minimal", "low", "medium", "high", "xhigh", "max"] as const);
export const ConversationStatus = literals(["idle", "working", "needsInput", "failed", "stopped"] as const);
export const QueueMode = literals(["all", "one-at-a-time"] as const);

export const JsonValue = Type.Cyclic(
  {
    JsonValue: Type.Union([
      Type.Null(),
      Type.Boolean(),
      Type.Number(),
      Type.String(),
      Type.Array(Type.Ref("JsonValue")),
      Type.Record(Type.String(), Type.Ref("JsonValue")),
    ]),
  },
  "JsonValue",
);

export const EmptyRequest = strictObject({});
export const HealthResult = responseObject({
  status: literals(["live", "ready", "notReady"] as const),
  code: Type.Optional(Type.String()),
});
export const ProtocolVersion = responseObject({ major: Type.Integer({ minimum: 1 }), minor: Type.Integer({ minimum: 0 }) });
export const StatusResult = responseObject({
  serverVersion: Type.String({ minLength: 1 }),
  protocolVersion: ProtocolVersion,
  piVersion: Type.Literal("0.83.0"),
  mode: literals(["directory", "gateway"] as const),
  gatewayId: Type.Optional(Uuid),
  capabilities: Type.Array(Type.String({ minLength: 1 }), { uniqueItems: true }),
});

export const ValidationIssue = responseObject({ path: Type.String(), code: Type.String(), message: Type.String() });
export const ProblemDetails = responseObject({
  type: Type.String({ minLength: 1 }),
  title: Type.String({ minLength: 1 }),
  status: Type.Integer({ minimum: 400, maximum: 599 }),
  detail: Type.String({ minLength: 1 }),
  instance: Type.Optional(Type.String()),
  code: Type.String({ minLength: 1 }),
  requestId: Uuid,
  retryable: Type.Boolean(),
  gatewayId: Type.Optional(Uuid),
  conversationId: Type.Optional(PiId),
  workspaceId: Type.Optional(Uuid),
  artifactId: Type.Optional(Uuid),
  commandId: Type.Optional(Uuid),
  dialogId: Type.Optional(Uuid),
  issues: Type.Optional(Type.Array(ValidationIssue)),
});

export const GatewayConversationRef = responseObject({ gatewayId: Uuid, conversationId: PiId });
export const DirectoryConversationRef = responseObject({ conversationId: PiId });
export const ConversationRef = Type.Union([GatewayConversationRef, DirectoryConversationRef]);
export const GatewayWorkspaceRef = responseObject({ gatewayId: Uuid, workspaceId: Uuid });

export const ModelSummary = responseObject({
  provider: Type.String({ minLength: 1 }),
  modelId: Type.String({ minLength: 1 }),
  name: Type.String({ minLength: 1 }),
  reasoning: Type.Boolean(),
  input: Type.Array(literals(["text", "image"] as const), { uniqueItems: true }),
  contextWindow: Type.Integer({ minimum: 1 }),
  maxTokens: Type.Integer({ minimum: 1 }),
});
export const ProviderAuthType = literals(["api_key", "oauth"] as const);
export const ProviderSummary = responseObject({
  providerId: Type.String({ minLength: 1 }),
  name: Type.String({ minLength: 1 }),
  authentication: Type.Array(ProviderAuthType, { uniqueItems: true }),
  status: literals(["authenticated", "unauthenticated", "expired"] as const),
});
export const ModelsResult = responseObject({ models: Type.Array(ModelSummary) });
export const ProvidersResult = responseObject({ providers: Type.Array(ProviderSummary) });

const ProviderLoginStart = strictObject({ type: Type.Literal("start"), authType: ProviderAuthType });
const ProviderLoginPoll = strictObject({
  type: Type.Literal("poll"), operationId: Uuid, afterSequence: Type.Integer({ minimum: 0 }),
});
const ProviderLoginValue = strictObject({
  type: Type.Literal("value"), operationId: Uuid, promptId: Uuid, value: Type.String(),
});
const ProviderLoginCancel = strictObject({ type: Type.Literal("cancel"), operationId: Uuid });
export const ProviderLoginRequest = Type.Union([
  ProviderLoginStart, ProviderLoginPoll, ProviderLoginValue, ProviderLoginCancel,
]);
const ProviderPromptText = responseObject({
  promptId: Uuid,
  type: literals(["text", "secret", "manual_code"] as const),
  message: Type.String(),
  placeholder: Type.Optional(Type.String()),
});
const ProviderPromptSelect = responseObject({
  promptId: Uuid,
  type: Type.Literal("select"),
  message: Type.String(),
  options: Type.Array(responseObject({
    id: Type.String({ minLength: 1 }), label: Type.String(), description: Type.Optional(Type.String()),
  })),
});
export const ProviderAuthPrompt = Type.Union([ProviderPromptText, ProviderPromptSelect]);
const ProviderNotificationInfo = responseObject({
  sequence: Type.Integer({ minimum: 1 }), type: Type.Literal("info"), message: Type.String(),
  links: Type.Optional(Type.Array(responseObject({ url: Type.String({ format: "uri" }), label: Type.Optional(Type.String()) }))),
});
const ProviderNotificationAuthUrl = responseObject({
  sequence: Type.Integer({ minimum: 1 }), type: Type.Literal("auth_url"), url: Type.String({ format: "uri" }),
  instructions: Type.Optional(Type.String()),
});
const ProviderNotificationDeviceCode = responseObject({
  sequence: Type.Integer({ minimum: 1 }), type: Type.Literal("device_code"), userCode: Type.String(),
  verificationUri: Type.String({ format: "uri" }), intervalSeconds: Type.Optional(Type.Integer({ minimum: 1 })),
  expiresInSeconds: Type.Optional(Type.Integer({ minimum: 1 })),
});
const ProviderNotificationProgress = responseObject({
  sequence: Type.Integer({ minimum: 1 }), type: Type.Literal("progress"), message: Type.String(),
});
export const ProviderAuthNotification = Type.Union([
  ProviderNotificationInfo, ProviderNotificationAuthUrl, ProviderNotificationDeviceCode, ProviderNotificationProgress,
]);
const ProviderLoginResultBase = {
  operationId: Uuid,
  providerId: Type.String({ minLength: 1 }),
  authType: ProviderAuthType,
  sequence: Type.Integer({ minimum: 0 }),
  notifications: Type.Array(ProviderAuthNotification),
};
export const ProviderLoginResult = Type.Union([
  responseObject({ ...ProviderLoginResultBase, state: Type.Literal("running") }),
  responseObject({ ...ProviderLoginResultBase, state: Type.Literal("needsInput"), prompt: ProviderAuthPrompt }),
  responseObject({ ...ProviderLoginResultBase, state: Type.Literal("completed"), provider: ProviderSummary }),
  responseObject({ ...ProviderLoginResultBase, state: Type.Literal("failed"), problem: ProblemDetails }),
  responseObject({ ...ProviderLoginResultBase, state: Type.Literal("cancelled") }),
]);

export const Conversation = responseObject({
  conversationId: PiId,
  gatewayId: Type.Optional(Uuid),
  workspaceId: Type.Optional(Uuid),
  title: nullable(Type.String()),
  cwd: Type.String({ pattern: "^/" }),
  createdAt: Timestamp,
  activityAt: Timestamp,
  viewedAt: nullable(Timestamp),
  completedAt: nullable(Timestamp),
  status: ConversationStatus,
  completedSinceViewed: Type.Boolean(),
  trashedAt: nullable(Timestamp),
  trashReason: nullable(literals(["individual", "workspace", "workspaceMissing"] as const)),
  readOnly: Type.Boolean(),
});
export const ConversationSummary = responseObject({
  conversationId: PiId,
  gatewayId: Type.Optional(Uuid),
  workspaceId: Type.Optional(Uuid),
  title: nullable(Type.String()),
  createdAt: Timestamp,
  activityAt: Timestamp,
  viewedAt: nullable(Timestamp),
  completedAt: nullable(Timestamp),
  status: ConversationStatus,
  completedSinceViewed: Type.Boolean(),
  trashedAt: nullable(Timestamp),
  trashReason: nullable(literals(["individual", "workspace", "workspaceMissing"] as const)),
  readOnly: Type.Boolean(),
});
export const ImageInput = strictObject({
  type: Type.Literal("image"),
  data: Type.String({ pattern: "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$" }),
  mimeType: literals(["image/png", "image/jpeg", "image/webp", "image/gif"] as const),
  fileName: Type.Optional(Type.String({ pattern: "^[^/\\\\]+$" })),
});
export const ModelSelection = strictObject({ provider: Type.String({ minLength: 1 }), modelId: Type.String({ minLength: 1 }) });
export const CreateConversationRequest = strictObject({
  commandId: Uuid,
  message: Type.String(),
  images: Type.Optional(Type.Array(ImageInput)),
  workspaceId: Type.Optional(Uuid),
  model: Type.Optional(ModelSelection),
  thinkingLevel: Type.Optional(ThinkingLevel),
});

export const TextContent = responseObject({
  type: Type.Literal("text"), text: Type.String(), textSignature: Type.Optional(Type.String()),
});
export const ThinkingContent = responseObject({
  type: Type.Literal("thinking"), thinking: Type.String(), thinkingSignature: Type.Optional(Type.String()),
  redacted: Type.Optional(Type.Boolean()),
});
export const ImageContent = responseObject({
  type: Type.Literal("image"), data: Type.String(), mimeType: Type.String({ pattern: "^image/" }),
});
export const ToolCall = responseObject({
  type: Type.Literal("toolCall"), id: Type.String({ minLength: 1 }), name: Type.String({ minLength: 1 }),
  arguments: JsonValue, thoughtSignature: Type.Optional(Type.String()),
});
export const PiContentBlock = Type.Union([TextContent, ThinkingContent, ImageContent, ToolCall]);
export const Usage = responseObject({
  input: Type.Number({ minimum: 0 }), output: Type.Number({ minimum: 0 }), cacheRead: Type.Number({ minimum: 0 }),
  cacheWrite: Type.Number({ minimum: 0 }), cacheWrite1h: Type.Optional(Type.Number({ minimum: 0 })),
  reasoning: Type.Optional(Type.Number({ minimum: 0 })), totalTokens: Type.Number({ minimum: 0 }),
  cost: responseObject({ input: Type.Number(), output: Type.Number(), cacheRead: Type.Number(), cacheWrite: Type.Number(), total: Type.Number() }),
});
export const UserMessage = responseObject({
  role: Type.Literal("user"), content: Type.Union([Type.String(), Type.Array(Type.Union([TextContent, ImageContent]))]),
  timestamp: Type.Number({ minimum: 0 }),
});
export const DiagnosticErrorInfo = responseObject({
  name: Type.Optional(Type.String()), message: Type.String(), code: Type.Optional(Type.Union([Type.String(), Type.Number()])),
});
export const AssistantMessageDiagnostic = responseObject({
  type: Type.String(), timestamp: Type.Number({ minimum: 0 }), error: Type.Optional(DiagnosticErrorInfo),
});
export const AssistantMessage = responseObject({
  role: Type.Literal("assistant"), content: Type.Array(Type.Union([TextContent, ThinkingContent, ToolCall])),
  api: Type.String({ minLength: 1 }), provider: Type.String({ minLength: 1 }), model: Type.String({ minLength: 1 }),
  responseModel: Type.Optional(Type.String()), responseId: Type.Optional(Type.String()),
  diagnostics: Type.Optional(Type.Array(AssistantMessageDiagnostic)),
  usage: Usage,
  stopReason: literals(["pending", "stop", "length", "toolUse", "error", "aborted"] as const),
  errorMessage: Type.Optional(Type.String()), rawStopReason: Type.Optional(Type.String()), timestamp: Type.Number({ minimum: 0 }),
});
export const ToolResultMessage = responseObject({
  role: Type.Literal("toolResult"), toolCallId: Type.String(), toolName: Type.String(),
  content: Type.Array(Type.Union([TextContent, ImageContent])), details: Type.Optional(JsonValue),
  usage: Type.Optional(Usage), addedToolNames: Type.Optional(Type.Array(Type.String())), isError: Type.Boolean(),
  timestamp: Type.Number({ minimum: 0 }),
});
export const BashExecutionMessage = responseObject({
  role: Type.Literal("bashExecution"), command: Type.String(), output: Type.String(), exitCode: Type.Optional(Type.Integer()),
  cancelled: Type.Boolean(), truncated: Type.Boolean(), timestamp: Type.Number({ minimum: 0 }),
  excludeFromContext: Type.Optional(Type.Boolean()),
});
export const CustomMessage = responseObject({
  role: Type.Literal("custom"), customType: Type.String(), content: Type.Union([Type.String(), Type.Array(Type.Union([TextContent, ImageContent]))]),
  display: Type.Boolean(), details: Type.Optional(JsonValue), timestamp: Type.Number({ minimum: 0 }),
});
export const BranchSummaryMessage = responseObject({
  role: Type.Literal("branchSummary"), summary: Type.String(), fromId: PiId, timestamp: Type.Number({ minimum: 0 }),
});
export const CompactionSummaryMessage = responseObject({
  role: Type.Literal("compactionSummary"), summary: Type.String(), tokensBefore: Type.Number({ minimum: 0 }), timestamp: Type.Number({ minimum: 0 }),
});
export const PiMessage = Type.Union([
  UserMessage, AssistantMessage, ToolResultMessage, BashExecutionMessage, CustomMessage, BranchSummaryMessage, CompactionSummaryMessage,
]);

const EntryBase = { id: PiId, parentId: nullable(PiId), timestamp: Timestamp };
export const SessionMessageEntry = responseObject({ ...EntryBase, type: Type.Literal("message"), message: PiMessage });
export const ThinkingLevelChangeEntry = responseObject({ ...EntryBase, type: Type.Literal("thinking_level_change"), thinkingLevel: Type.String() });
export const ModelChangeEntry = responseObject({ ...EntryBase, type: Type.Literal("model_change"), provider: Type.String(), modelId: Type.String() });
export const CompactionEntry = responseObject({
  ...EntryBase, type: Type.Literal("compaction"), summary: Type.String(), firstKeptEntryId: PiId,
  tokensBefore: Type.Number({ minimum: 0 }), details: Type.Optional(JsonValue), usage: Type.Optional(Usage), fromHook: Type.Optional(Type.Boolean()),
});
export const BranchSummaryEntry = responseObject({
  ...EntryBase, type: Type.Literal("branch_summary"), fromId: PiId, summary: Type.String(), details: Type.Optional(JsonValue),
  usage: Type.Optional(Usage), fromHook: Type.Optional(Type.Boolean()),
});
export const CustomEntry = responseObject({ ...EntryBase, type: Type.Literal("custom"), customType: Type.String(), data: Type.Optional(JsonValue) });
export const CustomMessageEntry = responseObject({
  ...EntryBase, type: Type.Literal("custom_message"), customType: Type.String(),
  content: Type.Union([Type.String(), Type.Array(Type.Union([TextContent, ImageContent]))]),
  details: Type.Optional(JsonValue), display: Type.Boolean(),
});
export const LabelEntry = responseObject({ ...EntryBase, type: Type.Literal("label"), targetId: PiId, label: Type.Optional(Type.String()) });
export const SessionInfoEntry = responseObject({ ...EntryBase, type: Type.Literal("session_info"), name: Type.Optional(Type.String()) });
export const PiEntry = Type.Union([
  SessionMessageEntry, ThinkingLevelChangeEntry, ModelChangeEntry, CompactionEntry, BranchSummaryEntry,
  CustomEntry, CustomMessageEntry, LabelEntry, SessionInfoEntry,
]);
export const PiTreeNode = Type.Cyclic({
  PiTreeNode: responseObject({
    entry: PiEntry, children: Type.Array(Type.Ref("PiTreeNode")), label: Type.Optional(Type.String()), labelTimestamp: Type.Optional(Timestamp),
  }),
}, "PiTreeNode");

export const ContextUsage = responseObject({
  tokens: nullable(Type.Number({ minimum: 0 })), contextWindow: Type.Number({ minimum: 1 }), percent: nullable(Type.Number({ minimum: 0 })),
});
export const SessionStats = responseObject({
  sessionId: PiId, userMessages: Type.Integer({ minimum: 0 }), assistantMessages: Type.Integer({ minimum: 0 }),
  toolCalls: Type.Integer({ minimum: 0 }), toolResults: Type.Integer({ minimum: 0 }), totalMessages: Type.Integer({ minimum: 0 }),
  tokens: responseObject({ input: Type.Number({ minimum: 0 }), output: Type.Number({ minimum: 0 }), cacheRead: Type.Number({ minimum: 0 }), cacheWrite: Type.Number({ minimum: 0 }), total: Type.Number({ minimum: 0 }) }),
  cost: Type.Number({ minimum: 0 }), contextUsage: Type.Optional(ContextUsage),
});
export const CompactionResultDto = responseObject({
  summary: Type.String(), firstKeptEntryId: PiId, tokensBefore: Type.Number({ minimum: 0 }),
  estimatedTokensAfter: Type.Optional(Type.Number({ minimum: 0 })), usage: Type.Optional(Usage), details: Type.Optional(JsonValue),
});
export const BashResultDto = responseObject({
  output: Type.String(), exitCode: Type.Optional(Type.Integer()), cancelled: Type.Boolean(), truncated: Type.Boolean(),
});
export const CommandSourceRef = responseObject({
  source: Type.String({ minLength: 1 }), scope: literals(["user", "project", "temporary"] as const),
  origin: literals(["package", "top-level"] as const),
});
export const CommandSummary = responseObject({
  name: Type.String({ minLength: 1 }), description: Type.Optional(Type.String()),
  source: literals(["extension", "prompt", "skill"] as const), sourceInfo: CommandSourceRef,
});

export const ConversationState = responseObject({
  conversation: Conversation, model: nullable(ModelSummary), thinkingLevel: ThinkingLevel,
  steeringMode: QueueMode, followUpMode: QueueMode, autoCompactionEnabled: Type.Boolean(), autoRetryEnabled: Type.Boolean(),
  messageCount: Type.Integer({ minimum: 0 }), pendingMessageCount: Type.Integer({ minimum: 0 }),
  activeCommandIds: Type.Array(Uuid),
});
export const MessagesResult = responseObject({ messages: Type.Array(PiMessage), revision: Type.String({ minLength: 1 }) });
export const EntriesResult = responseObject({ entries: Type.Array(PiEntry), leafId: nullable(PiId) });
export const TreeResult = responseObject({ tree: Type.Array(PiTreeNode), leafId: nullable(PiId) });
export const ForkMessagesResult = responseObject({ messages: Type.Array(responseObject({ entryId: PiId, text: Type.String() })) });
export const LastAssistantResult = responseObject({ text: nullable(Type.String()) });
export const CommandsResult = responseObject({ commands: Type.Array(CommandSummary) });
export const ThinkingLevelsResult = responseObject({ levels: Type.Array(ThinkingLevel) });

const command = <T extends string, P extends TProperties>(type: T, payload: P) => strictObject({
  commandId: Uuid, type: Type.Literal(type), payload: strictObject(payload),
});
const commandTypeValues = [
  "prompt", "steer", "follow_up", "abort", "new_session", "set_model", "cycle_model", "set_thinking_level",
  "cycle_thinking_level", "set_steering_mode", "set_follow_up_mode", "compact", "set_auto_compaction",
  "set_auto_retry", "abort_retry", "bash", "abort_bash", "export_html", "switch_session", "fork", "clone",
  "set_session_name", "reload",
] as const;
export const ConversationCommand = Type.Union([
  command("prompt", { message: Type.String(), images: Type.Optional(Type.Array(ImageInput)), streamingBehavior: Type.Optional(literals(["steer", "followUp"] as const)) }),
  command("steer", { message: Type.String(), images: Type.Optional(Type.Array(ImageInput)) }),
  command("follow_up", { message: Type.String(), images: Type.Optional(Type.Array(ImageInput)) }),
  command("abort", {}),
  command("new_session", { parentConversationId: Type.Optional(PiId) }),
  command("set_model", { provider: Type.String(), modelId: Type.String() }),
  command("cycle_model", {}),
  command("set_thinking_level", { level: ThinkingLevel }),
  command("cycle_thinking_level", {}),
  command("set_steering_mode", { mode: QueueMode }),
  command("set_follow_up_mode", { mode: QueueMode }),
  command("compact", { customInstructions: Type.Optional(Type.String()) }),
  command("set_auto_compaction", { enabled: Type.Boolean() }),
  command("set_auto_retry", { enabled: Type.Boolean() }),
  command("abort_retry", {}),
  command("bash", { command: Type.String(), excludeFromContext: Type.Optional(Type.Boolean()) }),
  command("abort_bash", {}),
  command("export_html", {}),
  command("switch_session", { targetConversationId: PiId }),
  command("fork", { entryId: PiId }),
  command("clone", {}),
  command("set_session_name", { name: Type.String() }),
  command("reload", {}),
]);

export const ModelCycleResult = responseObject({ model: ModelSummary, thinkingLevel: ThinkingLevel, isScoped: Type.Boolean() });
export const ThinkingCycleResult = responseObject({ level: ThinkingLevel });
export const SessionChangeResult = Type.Union([
  responseObject({ cancelled: Type.Literal(true) }),
  responseObject({ cancelled: Type.Literal(false), target: ConversationRef }),
]);
export const ForkResult = Type.Union([
  responseObject({ cancelled: Type.Literal(true), text: Type.Optional(Type.String()) }),
  responseObject({ cancelled: Type.Literal(false), target: ConversationRef, text: Type.Optional(Type.String()) }),
]);
export const ArtifactDescriptor = responseObject({
  artifactId: Uuid, conversationId: PiId, gatewayId: Type.Optional(Uuid), fileName: Type.String({ pattern: "^[^/\\\\]+$" }),
  mediaType: Type.String({ minLength: 1 }), byteCount: Type.Integer({ minimum: 0 }), createdAt: Timestamp,
  downloadUrl: Type.String({ pattern: "^/v1/artifacts/[0-9a-f-]+$" }),
});
export const CommandResult = Type.Union([
  ModelSummary, ModelCycleResult, ThinkingCycleResult, CompactionResultDto, BashResultDto, ArtifactDescriptor,
  SessionChangeResult, ForkResult, Type.Null(),
]);
const ReceiptIdentity = {
  commandId: Uuid, conversationId: PiId, gatewayId: Type.Optional(Uuid), payloadHash: Sha256,
  acceptedAt: Timestamp, updatedAt: Timestamp,
};
const completedReceipt = <T extends string>(type: T, result: TSchema) => responseObject({
  ...ReceiptIdentity, type: Type.Literal(type), state: Type.Literal("completed"), settledAt: Timestamp, result,
});
const completedWithoutResult = [
  "prompt", "steer", "follow_up", "abort", "set_thinking_level", "set_steering_mode", "set_follow_up_mode",
  "set_auto_compaction", "set_auto_retry", "abort_retry", "abort_bash", "set_session_name", "reload",
] as const;
export const CommandReceipt = Type.Union([
  responseObject({ ...ReceiptIdentity, type: literals(commandTypeValues), state: literals(["accepted", "running"] as const) }),
  responseObject({ ...ReceiptIdentity, type: literals(commandTypeValues), state: literals(["failed", "interrupted"] as const), settledAt: Timestamp, problem: ProblemDetails }),
  responseObject({ ...ReceiptIdentity, type: literals(completedWithoutResult), state: Type.Literal("completed"), settledAt: Timestamp }),
  completedReceipt("new_session", SessionChangeResult),
  completedReceipt("set_model", ModelSummary),
  completedReceipt("cycle_model", nullable(ModelCycleResult)),
  completedReceipt("cycle_thinking_level", nullable(ThinkingCycleResult)),
  completedReceipt("compact", CompactionResultDto),
  completedReceipt("bash", BashResultDto),
  completedReceipt("export_html", ArtifactDescriptor),
  completedReceipt("switch_session", SessionChangeResult),
  completedReceipt("fork", ForkResult),
  completedReceipt("clone", SessionChangeResult),
]);
export const CreateConversationResponse = responseObject({ conversation: Conversation, receipt: CommandReceipt });
export const DialogResponse = Type.Union([
  strictObject({ type: Type.Literal("value"), value: Type.String() }),
  strictObject({ type: Type.Literal("confirmation"), confirmed: Type.Boolean() }),
  strictObject({ type: Type.Literal("cancelled") }),
]);

export const Workspace = responseObject({
  workspaceId: Uuid, gatewayId: Uuid, directoryName: Type.String({ pattern: "^[^/\\\\]+$" }), displayName: Type.String(),
  isDefault: Type.Boolean(), gitState: literals(["none", "initialized", "cloned"] as const), createdAt: Timestamp,
  activityAt: Timestamp, trashedAt: nullable(Timestamp), state: literals(["active", "trashed", "missing"] as const),
  activeConversationCount: Type.Integer({ minimum: 0 }), totalConversationCount: Type.Integer({ minimum: 0 }),
});
export const CreateWorkspaceRequest = Type.Union([
  strictObject({ type: Type.Literal("empty"), directoryName: Type.String({ pattern: "^[^/\\\\]+$" }), displayName: Type.Optional(Type.String()) }),
  strictObject({ type: Type.Literal("git"), directoryName: Type.String({ pattern: "^[^/\\\\]+$" }), displayName: Type.Optional(Type.String()) }),
  strictObject({ type: Type.Literal("clone"), directoryName: Type.String({ pattern: "^[^/\\\\]+$" }), repositoryUrl: Type.String({ minLength: 1 }), displayName: Type.Optional(Type.String()) }),
]);
export const UpdateWorkspaceRequest = strictObject({ displayName: Type.String({ minLength: 1 }) });
export const SoulDescriptor = responseObject({ byteCount: Type.Integer({ minimum: 0 }), sha256: Sha256, etag: Type.String({ pattern: '^"sha256:[0-9a-f]{64}"$' }) });
export const BinaryHttpBodyFixture = strictObject({
  mediaType: Type.String({ minLength: 1 }), bodyBase64: Type.String({ pattern: "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$" }),
  byteCount: Type.Integer({ minimum: 0 }), sha256: Type.Optional(Sha256),
});
export const SseHeartbeatFixture = strictObject({ wire: Type.String({ pattern: "^: [^\\r\\n]+\\n\\n$" }), consumesSequence: Type.Literal(false) });

export const ConversationPage = responseObject({ items: Type.Array(ConversationSummary), nextCursor: nullable(Type.String()), revision: Type.String({ minLength: 1 }) });
export const WorkspacePage = responseObject({ items: Type.Array(Workspace), nextCursor: nullable(Type.String()), revision: Type.String({ minLength: 1 }) });

const PendingDialogBase = { dialogId: Uuid, title: Type.String() };
export const PendingDialog = Type.Union([
  responseObject({ ...PendingDialogBase, method: Type.Literal("select"), options: Type.Array(Type.String()), timeoutAt: Type.Optional(Timestamp) }),
  responseObject({ ...PendingDialogBase, method: Type.Literal("confirm"), message: Type.String(), timeoutAt: Type.Optional(Timestamp) }),
  responseObject({ ...PendingDialogBase, method: Type.Literal("input"), placeholder: Type.Optional(Type.String()), timeoutAt: Type.Optional(Timestamp) }),
  responseObject({ ...PendingDialogBase, method: Type.Literal("editor"), prefill: Type.Optional(Type.String()) }),
]);
export const ActiveToolExecution = responseObject({
  toolCallId: Type.String(), toolName: Type.String(), status: literals(["running", "completed", "failed"] as const),
  input: Type.Optional(JsonValue), content: Type.Optional(Type.Array(PiContentBlock)), details: Type.Optional(JsonValue),
});
export const ActiveResponse = responseObject({ message: PiMessage, tools: Type.Array(ActiveToolExecution) });
export const ConversationSnapshot = responseObject({
  conversation: Conversation, state: ConversationState, messagesRevision: Type.String({ minLength: 1 }),
  activeResponse: nullable(ActiveResponse),
  steeringQueue: Type.Array(responseObject({ text: Type.String(), images: Type.Array(ImageInput) })),
  followUpQueue: Type.Array(responseObject({ text: Type.String(), images: Type.Array(ImageInput) })),
  pendingDialogs: Type.Array(PendingDialog),
  extensionUiState: responseObject({
    statuses: Type.Record(Type.String(), Type.String()),
    widgets: Type.Array(responseObject({ key: Type.String(), lines: Type.Array(Type.String()), placement: literals(["aboveEditor", "belowEditor"] as const) })),
    title: nullable(Type.String()),
  }),
  activeReceipts: Type.Array(CommandReceipt),
});

export const AssistantMessageEvent = Type.Union([
  responseObject({ type: Type.Literal("start"), partial: AssistantMessage }),
  responseObject({ type: Type.Literal("text_start"), contentIndex: Type.Integer({ minimum: 0 }), partial: AssistantMessage }),
  responseObject({ type: Type.Literal("text_delta"), contentIndex: Type.Integer({ minimum: 0 }), delta: Type.String(), partial: AssistantMessage }),
  responseObject({ type: Type.Literal("text_end"), contentIndex: Type.Integer({ minimum: 0 }), content: Type.String(), partial: AssistantMessage }),
  responseObject({ type: Type.Literal("thinking_start"), contentIndex: Type.Integer({ minimum: 0 }), partial: AssistantMessage }),
  responseObject({ type: Type.Literal("thinking_delta"), contentIndex: Type.Integer({ minimum: 0 }), delta: Type.String(), partial: AssistantMessage }),
  responseObject({ type: Type.Literal("thinking_end"), contentIndex: Type.Integer({ minimum: 0 }), content: Type.String(), partial: AssistantMessage }),
  responseObject({ type: Type.Literal("toolcall_start"), contentIndex: Type.Integer({ minimum: 0 }), partial: AssistantMessage }),
  responseObject({ type: Type.Literal("toolcall_delta"), contentIndex: Type.Integer({ minimum: 0 }), delta: Type.String(), partial: AssistantMessage }),
  responseObject({ type: Type.Literal("toolcall_end"), contentIndex: Type.Integer({ minimum: 0 }), toolCall: ToolCall, partial: AssistantMessage }),
  responseObject({ type: Type.Literal("done"), reason: literals(["stop", "length", "toolUse"] as const), message: AssistantMessage }),
  responseObject({ type: Type.Literal("error"), reason: literals(["aborted", "error"] as const), error: AssistantMessage }),
]);
export const ToolResultData = responseObject({
  content: Type.Array(Type.Union([TextContent, ImageContent])), details: JsonValue, usage: Type.Optional(Usage),
  addedToolNames: Type.Optional(Type.Array(Type.String())), terminate: Type.Optional(Type.Boolean()),
});
export const ExtensionUiEvent = Type.Union([
  responseObject({ method: Type.Literal("notify"), message: Type.String(), severity: literals(["info", "warning", "error"] as const) }),
  responseObject({ method: Type.Literal("setStatus"), key: Type.String(), text: nullable(Type.String()) }),
  responseObject({ method: Type.Literal("setWidget"), key: Type.String(), lines: nullable(Type.Array(Type.String())), placement: literals(["aboveEditor", "belowEditor"] as const) }),
  responseObject({ method: Type.Literal("setTitle"), title: Type.String() }),
  responseObject({ method: Type.Literal("set_editor_text"), text: Type.String() }),
]);
export const SafeExtensionSource = responseObject({ source: Type.String(), scope: literals(["user", "project", "temporary"] as const), origin: literals(["package", "top-level"] as const) });

const conversationEventData: Record<string, TSchema> = {
  "conversation.snapshot": ConversationSnapshot,
  "conversation.status.changed": responseObject({ status: ConversationStatus, previousStatus: ConversationStatus }),
  "conversation.viewed.changed": responseObject({ viewedAt: nullable(Timestamp), completedAt: nullable(Timestamp), completedSinceViewed: Type.Boolean() }),
  "conversation.replaced": responseObject({ reason: literals(["newSession", "switch", "fork", "clone"] as const), target: ConversationRef }),
  "command.receipt.updated": CommandReceipt,
  "extension.ui.request": PendingDialog,
  "extension.ui.event": ExtensionUiEvent,
  "extension.error": responseObject({ source: SafeExtensionSource, event: Type.String(), message: Type.String() }),
  "agent.start": responseObject({}),
  "agent.end": responseObject({ messages: Type.Array(PiMessage), willRetry: Type.Boolean() }),
  "agent.settled": responseObject({}),
  "turn.start": responseObject({}),
  "turn.end": responseObject({ message: PiMessage, toolResults: Type.Array(ToolResultMessage) }),
  "message.start": responseObject({ message: PiMessage }),
  "message.update": responseObject({ message: PiMessage, update: AssistantMessageEvent }),
  "message.end": responseObject({ message: PiMessage }),
  "bash.execution.update": responseObject({ commandId: Type.Optional(Uuid), delta: Type.String() }),
  "tool.execution.start": responseObject({ toolCallId: Type.String(), toolName: Type.String(), args: JsonValue }),
  "tool.execution.update": responseObject({ toolCallId: Type.String(), toolName: Type.String(), args: JsonValue, partialResult: ToolResultData }),
  "tool.execution.end": responseObject({ toolCallId: Type.String(), toolName: Type.String(), result: ToolResultData, isError: Type.Boolean() }),
  "queue.update": responseObject({ steering: Type.Array(Type.String()), followUp: Type.Array(Type.String()) }),
  "entry.appended": responseObject({ entry: PiEntry }),
  "session.info.changed": responseObject({ name: nullable(Type.String()) }),
  "thinking.level.changed": responseObject({ level: ThinkingLevel }),
  "compaction.start": responseObject({ reason: literals(["manual", "threshold", "overflow"] as const) }),
  "compaction.end": responseObject({ reason: literals(["manual", "threshold", "overflow"] as const), result: nullable(CompactionResultDto), aborted: Type.Boolean(), willRetry: Type.Boolean(), errorMessage: Type.Optional(Type.String()) }),
  "retry.start": responseObject({ attempt: Type.Integer({ minimum: 1 }), maxAttempts: Type.Integer({ minimum: 1 }), delayMs: Type.Integer({ minimum: 0 }), errorMessage: Type.String() }),
  "retry.end": responseObject({ success: Type.Boolean(), attempt: Type.Integer({ minimum: 1 }), finalError: Type.Optional(Type.String()) }),
  "summarization.retry.scheduled": responseObject({ attempt: Type.Integer({ minimum: 1 }), maxAttempts: Type.Integer({ minimum: 1 }), delayMs: Type.Integer({ minimum: 0 }), errorMessage: Type.String() }),
  "summarization.retry.attempt-start": Type.Union([
    responseObject({ source: Type.Literal("branchSummary") }),
    responseObject({ source: Type.Literal("compaction"), reason: literals(["manual", "threshold", "overflow"] as const) }),
  ]),
  "summarization.retry.finished": responseObject({}),
};
const conversationEventSchemas = Object.entries(conversationEventData).map(([eventType, data]) => responseObject({
  streamId: Uuid, sequence: Type.Integer({ minimum: 0 }), conversationId: PiId, gatewayId: Type.Optional(Uuid),
  emittedAt: Timestamp, type: Type.Literal(eventType), data,
}));
export const ConversationEvent = Type.Union(conversationEventSchemas);

export const GatewaySnapshot = responseObject({ revision: Type.String(), conversations: Type.Array(ConversationSummary), workspaces: Type.Array(Workspace) });
const gatewayEventData: Record<string, TSchema> = {
  "gateway.snapshot": GatewaySnapshot,
  "conversation.summary.changed": ConversationSummary,
  "conversation.removed": responseObject({ conversationId: PiId }),
  "workspace.summary.changed": Workspace,
  "workspace.removed": responseObject({ workspaceId: Uuid }),
  "conversation.notification": responseObject({ conversationId: PiId, severity: literals(["info", "warning", "error"] as const), message: Type.String() }),
};
export const GatewayEvent = Type.Union(Object.entries(gatewayEventData).map(([eventType, data]) => responseObject({
  streamId: Uuid, sequence: Type.Integer({ minimum: 0 }), gatewayId: Uuid, emittedAt: Timestamp,
  type: Type.Literal(eventType), data,
})));

export const schemaRegistry = {
  EmptyRequest,
  HealthResult,
  StatusResult,
  ProblemDetails,
  GatewayConversationRef,
  DirectoryConversationRef,
  GatewayWorkspaceRef,
  ModelSummary,
  ProviderSummary,
  ModelsResult,
  ProvidersResult,
  ProviderLoginRequest,
  ProviderAuthPrompt,
  ProviderAuthNotification,
  ProviderLoginResult,
  Conversation,
  ConversationSummary,
  ImageInput,
  CreateConversationRequest,
  CreateConversationResponse,
  ConversationState,
  MessagesResult,
  SessionStats,
  EntriesResult,
  TreeResult,
  ForkMessagesResult,
  LastAssistantResult,
  CommandsResult,
  ThinkingLevelsResult,
  ConversationCommand,
  ModelCycleResult,
  ThinkingCycleResult,
  SessionChangeResult,
  ForkResult,
  CommandReceipt,
  DialogResponse,
  Workspace,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  SoulDescriptor,
  BinaryHttpBodyFixture,
  SseHeartbeatFixture,
  ArtifactDescriptor,
  ConversationPage,
  WorkspacePage,
  PendingDialog,
  ConversationSnapshot,
  PiContentBlock,
  PiMessage,
  PiEntry,
  PiTreeNode,
  CompactionResultDto,
  BashResultDto,
  CommandSummary,
  AssistantMessageEvent,
  ExtensionUiEvent,
  ConversationEvent,
  GatewaySnapshot,
  GatewayEvent,
} as const;

export type SchemaName = keyof typeof schemaRegistry;
export const conversationEventTypes = Object.freeze(Object.keys(conversationEventData));
export const gatewayEventTypes = Object.freeze(Object.keys(gatewayEventData));
export const commandTypes = Object.freeze(commandTypeValues);
