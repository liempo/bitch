import type { SchemaName } from "./schemas.js";

export interface Fixture {
  schema: SchemaName;
  value: Record<string, unknown> | unknown[] | string | number | boolean | null;
}
export interface FixtureCorpus {
  version: 1;
  piVersion: "0.83.0";
  fixtures: Record<string, Record<string, Fixture>>;
}

const GATEWAY_ID = "550e8400-e29b-41d4-a716-446655440000";
const WORKSPACE_ID = "550e8400-e29b-41d4-a716-446655440010";
const CONVERSATION_ID = "0195f6f4-7c5b-7000-8000-000000000001";
const TARGET_CONVERSATION_ID = "0195f6f4-7c5b-7000-8000-000000000002";
const COMMAND_ID = "550e8400-e29b-41d4-a716-446655440001";
const DIALOG_ID = "550e8400-e29b-41d4-a716-446655440002";
const OPERATION_ID = "550e8400-e29b-41d4-a716-446655440003";
const ARTIFACT_ID = "550e8400-e29b-41d4-a716-446655440004";
const STREAM_ID = "550e8400-e29b-41d4-a716-446655440005";
const REQUEST_ID = "550e8400-e29b-41d4-a716-446655440006";
const NOW = "2026-01-01T00:00:00.000Z";
const LATER = "2026-01-01T00:01:00.000Z";
const HASH = "44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a";
const SOUL_HASH = "ce69c359092219c8d560804e8600676b1d34ca72b1e735f35981b1f9b1ea5fda";

const fixture = (schema: SchemaName, value: Fixture["value"]): Fixture => ({ schema, value });
const empty = fixture("EmptyRequest", {});

const model = {
  provider: "scripted",
  modelId: "fixture-model",
  name: "Fixture Model",
  reasoning: true,
  input: ["text", "image"],
  contextWindow: 128000,
  maxTokens: 4096,
};
const provider = {
  providerId: "scripted",
  name: "Scripted Provider",
  authentication: ["api_key", "oauth"],
  status: "authenticated",
};
const conversation = {
  conversationId: CONVERSATION_ID,
  gatewayId: GATEWAY_ID,
  workspaceId: WORKSPACE_ID,
  title: "Validate protocol fixtures",
  cwd: "/data/workspaces/default",
  createdAt: NOW,
  activityAt: LATER,
  viewedAt: null,
  completedAt: null,
  status: "working",
  completedSinceViewed: false,
  trashedAt: null,
  trashReason: null,
  readOnly: false,
};
const directoryConversation = {
  ...conversation,
  cwd: "/work/project",
  status: "idle",
};
delete (directoryConversation as { gatewayId?: string }).gatewayId;
delete (directoryConversation as { workspaceId?: string }).workspaceId;
const conversationSummary = { ...conversation };
delete (conversationSummary as { cwd?: string }).cwd;
const workspace = {
  workspaceId: WORKSPACE_ID,
  gatewayId: GATEWAY_ID,
  directoryName: "default",
  displayName: "Default",
  isDefault: true,
  gitState: "none",
  createdAt: NOW,
  activityAt: LATER,
  trashedAt: null,
  state: "active",
  activeConversationCount: 1,
  totalConversationCount: 1,
};
const usage = {
  input: 10,
  output: 5,
  cacheRead: 2,
  cacheWrite: 1,
  cacheWrite1h: 1,
  reasoning: 2,
  totalTokens: 18,
  cost: { input: 0.001, output: 0.002, cacheRead: 0.0001, cacheWrite: 0.0002, total: 0.0033 },
};
const textContent = { type: "text", text: "Hello from Pi", textSignature: "sig-text" };
const thinkingContent = { type: "thinking", thinking: "Check the fixture", thinkingSignature: "sig-thinking", redacted: false };
const imageContent = { type: "image", data: "iVBORw0KGgo=", mimeType: "image/png" };
const toolCall = { type: "toolCall", id: "call-1", name: "read", arguments: { path: "README.md" }, thoughtSignature: "sig-tool" };
const userMessage = { role: "user", content: [textContent, imageContent], timestamp: 1767225600000 };
const assistantMessage = {
  role: "assistant",
  content: [textContent, thinkingContent, toolCall],
  api: "pi-messages",
  provider: "scripted",
  model: "fixture-model",
  responseModel: "fixture-model-2026",
  responseId: "response-1",
  diagnostics: [{
    type: "fixture",
    timestamp: 1767225600000,
    error: { name: "FixtureError", message: "deterministic", code: "fixture_error" },
  }],
  usage,
  stopReason: "toolUse",
  rawStopReason: "tool_use",
  timestamp: 1767225600001,
};
const toolResultMessage = {
  role: "toolResult",
  toolCallId: "call-1",
  toolName: "read",
  content: [textContent],
  details: { lineCount: 1 },
  usage,
  addedToolNames: ["write"],
  isError: false,
  timestamp: 1767225600002,
};
const bashMessage = {
  role: "bashExecution",
  command: "printf fixture",
  output: "fixture",
  exitCode: 0,
  cancelled: false,
  truncated: false,
  timestamp: 1767225600003,
  excludeFromContext: false,
};
const customMessage = {
  role: "custom",
  customType: "fixture.notice",
  content: "Fixture notice",
  display: true,
  details: { stable: true },
  timestamp: 1767225600004,
};
const branchSummaryMessage = { role: "branchSummary", summary: "Branch summary", fromId: "entry0001", timestamp: 1767225600005 };
const compactionSummaryMessage = { role: "compactionSummary", summary: "Compaction summary", tokensBefore: 1000, timestamp: 1767225600006 };
const entryBase = { id: "entry0001", parentId: null, timestamp: NOW };
const entries = {
  message: { ...entryBase, type: "message", message: userMessage },
  thinkingLevelChange: { ...entryBase, id: "entry0002", parentId: "entry0001", type: "thinking_level_change", thinkingLevel: "high" },
  modelChange: { ...entryBase, id: "entry0003", parentId: "entry0002", type: "model_change", provider: "scripted", modelId: "fixture-model" },
  compaction: { ...entryBase, id: "entry0004", parentId: "entry0003", type: "compaction", summary: "Summary", firstKeptEntryId: "entry0002", tokensBefore: 1000, details: { readFiles: ["README.md"], modifiedFiles: [] }, usage, fromHook: false },
  branchSummary: { ...entryBase, id: "entry0005", parentId: "entry0004", type: "branch_summary", fromId: "entry0003", summary: "Branch", details: { stable: true }, usage, fromHook: false },
  custom: { ...entryBase, id: "entry0006", parentId: "entry0005", type: "custom", customType: "fixture.state", data: { count: 1 } },
  customMessage: { ...entryBase, id: "entry0007", parentId: "entry0006", type: "custom_message", customType: "fixture.message", content: [textContent, imageContent], details: { stable: true }, display: true },
  label: { ...entryBase, id: "entry0008", parentId: "entry0007", type: "label", targetId: "entry0001", label: "start" },
  sessionInfo: { ...entryBase, id: "entry0009", parentId: "entry0008", type: "session_info", name: "Fixture session" },
};
const problem = {
  type: "https://bitch.invalid/problems/validation_failed",
  title: "Request validation failed",
  status: 400,
  detail: "Correct the listed fields and retry.",
  instance: "/v1/conversations",
  code: "validation_failed",
  requestId: REQUEST_ID,
  retryable: false,
  gatewayId: GATEWAY_ID,
  conversationId: CONVERSATION_ID,
  workspaceId: WORKSPACE_ID,
  artifactId: ARTIFACT_ID,
  commandId: COMMAND_ID,
  dialogId: DIALOG_ID,
  issues: [{ path: "/message", code: "minLength", message: "Expected a nonempty string." }],
};
const baseReceipt = {
  commandId: COMMAND_ID,
  conversationId: CONVERSATION_ID,
  gatewayId: GATEWAY_ID,
  type: "prompt",
  payloadHash: HASH,
  state: "accepted",
  acceptedAt: NOW,
  updatedAt: NOW,
};
const state = {
  conversation,
  model,
  thinkingLevel: "high",
  steeringMode: "all",
  followUpMode: "one-at-a-time",
  autoCompactionEnabled: true,
  autoRetryEnabled: true,
  messageCount: 3,
  pendingMessageCount: 0,
  activeCommandIds: [COMMAND_ID],
};
const compactionResult = {
  summary: "Compacted fixture conversation",
  firstKeptEntryId: "entry0002",
  tokensBefore: 1000,
  estimatedTokensAfter: 250,
  usage,
  details: { readFiles: ["README.md"], modifiedFiles: [] },
};
const bashResult = { output: "fixture\n", exitCode: 0, cancelled: false, truncated: false };
const artifact = {
  artifactId: ARTIFACT_ID,
  conversationId: CONVERSATION_ID,
  gatewayId: GATEWAY_ID,
  fileName: "conversation.html",
  mediaType: "text/html",
  byteCount: 128,
  createdAt: LATER,
  downloadUrl: `/v1/artifacts/${ARTIFACT_ID}`,
};
const commandSource = { source: "fixture-extension", scope: "project", origin: "top-level" };
const commandSummary = { name: "fixture", description: "Run fixture command", source: "extension", sourceInfo: commandSource };
const pendingDialog = {
  dialogId: DIALOG_ID,
  method: "select",
  title: "Select a fixture",
  options: ["one", "two"],
  timeoutAt: LATER,
};
const activeResponse = {
  message: assistantMessage,
  tools: [{ toolCallId: "call-1", toolName: "read", status: "running", input: { path: "README.md" }, content: [textContent], details: { progress: 0.5 } }],
};
const snapshot = {
  conversation,
  state,
  messagesRevision: "messages-r1",
  activeResponse,
  steeringQueue: [{ text: "Steer next", images: [] }],
  followUpQueue: [{ text: "Follow up", images: [{ type: "image", data: "iVBORw0KGgo=", mimeType: "image/png", fileName: "fixture.png" }] }],
  pendingDialogs: [pendingDialog],
  extensionUiState: {
    statuses: { fixture: "running" },
    widgets: [{ key: "fixture", lines: ["line one"], placement: "aboveEditor" }],
    title: "Fixture title",
  },
  activeReceipts: [baseReceipt],
};

const commandPayloads: Record<string, Record<string, unknown>> = {
  prompt: { message: "Validate fixtures", images: [{ type: "image", data: "iVBORw0KGgo=", mimeType: "image/png", fileName: "fixture.png" }], streamingBehavior: "steer" },
  steer: { message: "Steer", images: [] },
  follow_up: { message: "Follow up", images: [] },
  abort: {},
  new_session: { parentConversationId: CONVERSATION_ID },
  set_model: { provider: "scripted", modelId: "fixture-model" },
  cycle_model: {},
  set_thinking_level: { level: "high" },
  cycle_thinking_level: {},
  set_steering_mode: { mode: "all" },
  set_follow_up_mode: { mode: "one-at-a-time" },
  compact: { customInstructions: "Keep decisions" },
  set_auto_compaction: { enabled: true },
  set_auto_retry: { enabled: true },
  abort_retry: {},
  bash: { command: "printf fixture", excludeFromContext: false },
  abort_bash: {},
  export_html: {},
  switch_session: { targetConversationId: TARGET_CONVERSATION_ID },
  fork: { entryId: "entry0001" },
  clone: {},
  set_session_name: { name: "Fixture session" },
  reload: {},
};
const commandFixtures = Object.fromEntries(Object.entries(commandPayloads).map(([type, payload]) => [
  type,
  fixture("ConversationCommand", { commandId: COMMAND_ID, type, payload }),
]));
const resultByCommand: Record<string, unknown> = {
  new_session: { cancelled: false, target: { gatewayId: GATEWAY_ID, conversationId: TARGET_CONVERSATION_ID } },
  set_model: model,
  cycle_model: { model, thinkingLevel: "high", isScoped: true },
  cycle_thinking_level: { level: "high" },
  compact: compactionResult,
  bash: bashResult,
  export_html: artifact,
  switch_session: { cancelled: false, target: { gatewayId: GATEWAY_ID, conversationId: TARGET_CONVERSATION_ID } },
  fork: { cancelled: false, target: { gatewayId: GATEWAY_ID, conversationId: TARGET_CONVERSATION_ID }, text: "Selected text" },
  clone: { cancelled: true },
};
const commandReceiptFixtures = Object.fromEntries(Object.keys(commandPayloads).map((type) => {
  const receipt: Record<string, unknown> = {
    ...baseReceipt,
    type,
    state: "completed",
    updatedAt: LATER,
    settledAt: LATER,
  };
  if (type in resultByCommand) receipt.result = resultByCommand[type];
  return [type, fixture("CommandReceipt", receipt)];
}));

const partialAssistant = { ...assistantMessage, stopReason: "pending" };
const assistantUpdates: Record<string, unknown> = {
  start: { type: "start", partial: partialAssistant },
  textStart: { type: "text_start", contentIndex: 0, partial: partialAssistant },
  textDelta: { type: "text_delta", contentIndex: 0, delta: "Hello", partial: partialAssistant },
  textEnd: { type: "text_end", contentIndex: 0, content: "Hello from Pi", partial: partialAssistant },
  thinkingStart: { type: "thinking_start", contentIndex: 1, partial: partialAssistant },
  thinkingDelta: { type: "thinking_delta", contentIndex: 1, delta: "Check", partial: partialAssistant },
  thinkingEnd: { type: "thinking_end", contentIndex: 1, content: "Check the fixture", partial: partialAssistant },
  toolcallStart: { type: "toolcall_start", contentIndex: 2, partial: partialAssistant },
  toolcallDelta: { type: "toolcall_delta", contentIndex: 2, delta: '{"path":', partial: partialAssistant },
  toolcallEnd: { type: "toolcall_end", contentIndex: 2, toolCall, partial: partialAssistant },
  done: { type: "done", reason: "toolUse", message: assistantMessage },
  error: { type: "error", reason: "error", error: { ...assistantMessage, stopReason: "error", errorMessage: "Scripted failure" } },
};
const assistantEventFixtures = Object.fromEntries(Object.entries(assistantUpdates).map(([name, value]) => [name, fixture("AssistantMessageEvent", value as Fixture["value"])]));
const toolData = { content: [textContent], details: { progress: 1 }, usage, addedToolNames: ["write"], terminate: false };
const conversationEventData: Record<string, unknown> = {
  "conversation.snapshot": snapshot,
  "conversation.status.changed": { status: "working", previousStatus: "idle" },
  "conversation.viewed.changed": { viewedAt: LATER, completedAt: LATER, completedSinceViewed: false },
  "conversation.replaced": { reason: "fork", target: { gatewayId: GATEWAY_ID, conversationId: TARGET_CONVERSATION_ID } },
  "command.receipt.updated": { ...baseReceipt, state: "running", updatedAt: LATER },
  "extension.ui.request": pendingDialog,
  "extension.ui.event": { method: "notify", message: "Fixture notification", severity: "info" },
  "extension.error": { source: commandSource, event: "tool_call", message: "Fixture extension failed safely." },
  "agent.start": {},
  "agent.end": { messages: [assistantMessage, toolResultMessage], willRetry: false },
  "agent.settled": {},
  "turn.start": {},
  "turn.end": { message: assistantMessage, toolResults: [toolResultMessage] },
  "message.start": { message: assistantMessage },
  "message.update": { message: partialAssistant, update: assistantUpdates.textDelta },
  "message.end": { message: assistantMessage },
  "bash.execution.update": { commandId: COMMAND_ID, delta: "fixture\n" },
  "tool.execution.start": { toolCallId: "call-1", toolName: "read", args: { path: "README.md" } },
  "tool.execution.update": { toolCallId: "call-1", toolName: "read", args: { path: "README.md" }, partialResult: toolData },
  "tool.execution.end": { toolCallId: "call-1", toolName: "read", result: toolData, isError: false },
  "queue.update": { steering: ["Steer"], followUp: ["Follow up"] },
  "entry.appended": { entry: entries.message },
  "session.info.changed": { name: "Fixture session" },
  "thinking.level.changed": { level: "high" },
  "compaction.start": { reason: "manual" },
  "compaction.end": { reason: "manual", result: compactionResult, aborted: false, willRetry: false },
  "retry.start": { attempt: 1, maxAttempts: 3, delayMs: 100, errorMessage: "Transient scripted failure" },
  "retry.end": { success: true, attempt: 1 },
  "summarization.retry.scheduled": { attempt: 1, maxAttempts: 3, delayMs: 100, errorMessage: "Transient summary failure" },
  "summarization.retry.attempt-start": { source: "compaction", reason: "manual" },
  "summarization.retry.finished": {},
};
const conversationEventFixtures = Object.fromEntries(Object.entries(conversationEventData).map(([type, data], index) => [
  type,
  fixture("ConversationEvent", { streamId: STREAM_ID, sequence: index, conversationId: CONVERSATION_ID, gatewayId: GATEWAY_ID, emittedAt: NOW, type, data } as Record<string, unknown>),
]));
const gatewayEventData: Record<string, unknown> = {
  "gateway.snapshot": { revision: "gateway-r1", conversations: [conversationSummary], workspaces: [workspace] },
  "conversation.summary.changed": conversationSummary,
  "conversation.removed": { conversationId: CONVERSATION_ID },
  "workspace.summary.changed": workspace,
  "workspace.removed": { workspaceId: WORKSPACE_ID },
  "conversation.notification": { conversationId: CONVERSATION_ID, severity: "info", message: "Fixture notification" },
};
const gatewayEventFixtures = Object.fromEntries(Object.entries(gatewayEventData).map(([type, data], index) => [
  type,
  fixture("GatewayEvent", { streamId: STREAM_ID, sequence: index, gatewayId: GATEWAY_ID, emittedAt: NOW, type, data } as Record<string, unknown>),
]));

export const fixtureCorpus: FixtureCorpus = {
  version: 1,
  piVersion: "0.83.0",
  fixtures: {
    health: {
      live: fixture("HealthResult", { status: "live" }),
      ready: fixture("HealthResult", { status: "ready" }),
      notReady: fixture("HealthResult", { status: "notReady", code: "catalog_recovery_required" }),
    },
    status: {
      gateway: fixture("StatusResult", { serverVersion: "0.1.0", protocolVersion: { major: 1, minor: 0 }, piVersion: "0.83.0", mode: "gateway", gatewayId: GATEWAY_ID, capabilities: ["attachment.image.v1", "conversation.commands.v1", "conversation.events.v1", "gateway.identity.v1", "pi.rpc.v1"] }),
      directory: fixture("StatusResult", { serverVersion: "0.1.0", protocolVersion: { major: 1, minor: 0 }, piVersion: "0.83.0", mode: "directory", capabilities: ["attachment.image.v1", "conversation.commands.v1", "conversation.events.v1", "directory.fixed-cwd.v1", "pi.rpc.v1"] }),
    },
    requests: {
      createConversation: fixture("CreateConversationRequest", { commandId: COMMAND_ID, message: "Validate fixtures", images: [{ type: "image", data: "iVBORw0KGgo=", mimeType: "image/png", fileName: "fixture.png" }], workspaceId: WORKSPACE_ID, model: { provider: "scripted", modelId: "fixture-model" }, thinkingLevel: "high" }),
      emptyMutation: empty,
      providerLoginStart: fixture("ProviderLoginRequest", { type: "start", authType: "oauth" }),
      providerLoginPoll: fixture("ProviderLoginRequest", { type: "poll", operationId: OPERATION_ID, afterSequence: 0 }),
      providerLoginValue: fixture("ProviderLoginRequest", { type: "value", operationId: OPERATION_ID, promptId: DIALOG_ID, value: "submitted-once" }),
      providerLoginCancel: fixture("ProviderLoginRequest", { type: "cancel", operationId: OPERATION_ID }),
      workspaceEmpty: fixture("CreateWorkspaceRequest", { type: "empty", directoryName: "empty", displayName: "Empty" }),
      workspaceGit: fixture("CreateWorkspaceRequest", { type: "git", directoryName: "git-work", displayName: "Git work" }),
      workspaceClone: fixture("CreateWorkspaceRequest", { type: "clone", directoryName: "clone", repositoryUrl: "ssh://git@example.invalid/repository.git", displayName: "Clone" }),
      workspaceUpdate: fixture("UpdateWorkspaceRequest", { displayName: "Renamed workspace" }),
    },
    commands: commandFixtures,
    dialogs: {
      value: fixture("DialogResponse", { type: "value", value: "one" }),
      confirmation: fixture("DialogResponse", { type: "confirmation", confirmed: true }),
      cancelled: fixture("DialogResponse", { type: "cancelled" }),
    },
    responses: {
      createConversation: fixture("CreateConversationResponse", { conversation, receipt: baseReceipt }),
      conversation: fixture("Conversation", conversation),
      directoryConversation: fixture("Conversation", directoryConversation),
      conversationPage: fixture("ConversationPage", { items: [conversationSummary], nextCursor: null, revision: "conversations-r1" }),
      state: fixture("ConversationState", state),
      messages: fixture("MessagesResult", { messages: [userMessage, assistantMessage, toolResultMessage], revision: "messages-r1" }),
      entries: fixture("EntriesResult", { entries: Object.values(entries), leafId: "entry0009" }),
      tree: fixture("TreeResult", { tree: [{ entry: entries.message, children: [{ entry: entries.thinkingLevelChange, children: [], label: "level", labelTimestamp: NOW }] }], leafId: "entry0002" }),
      forkMessages: fixture("ForkMessagesResult", { messages: [{ entryId: "entry0001", text: "Validate fixtures" }] }),
      lastAssistant: fixture("LastAssistantResult", { text: "Hello from Pi" }),
      commands: fixture("CommandsResult", { commands: [commandSummary] }),
      thinkingLevels: fixture("ThinkingLevelsResult", { levels: ["off", "low", "high"] }),
      models: fixture("ModelsResult", { models: [model] }),
      providers: fixture("ProvidersResult", { providers: [provider] }),
      providerSummary: fixture("ProviderSummary", provider),
      workspace: fixture("Workspace", workspace),
      workspacePage: fixture("WorkspacePage", { items: [workspace], nextCursor: null, revision: "workspaces-r1" }),
      soul: fixture("SoulDescriptor", { byteCount: 13, sha256: SOUL_HASH, etag: `"sha256:${SOUL_HASH}"` }),
      artifact: fixture("ArtifactDescriptor", artifact),
      problem: fixture("ProblemDetails", problem),
    },
    providerPrompts: {
      text: fixture("ProviderAuthPrompt", { promptId: DIALOG_ID, type: "text", message: "Enter account name", placeholder: "name" }),
      secret: fixture("ProviderAuthPrompt", { promptId: DIALOG_ID, type: "secret", message: "Enter value" }),
      manualCode: fixture("ProviderAuthPrompt", { promptId: DIALOG_ID, type: "manual_code", message: "Paste the returned code" }),
      select: fixture("ProviderAuthPrompt", { promptId: DIALOG_ID, type: "select", message: "Select account", options: [{ id: "one", label: "Account one", description: "Fixture account" }] }),
    },
    providerNotifications: {
      info: fixture("ProviderAuthNotification", { sequence: 1, type: "info", message: "Open the sign-in page", links: [{ url: "https://example.invalid/sign-in", label: "Sign in" }] }),
      authUrl: fixture("ProviderAuthNotification", { sequence: 2, type: "auth_url", url: "https://example.invalid/authorize", instructions: "Continue in the browser." }),
      deviceCode: fixture("ProviderAuthNotification", { sequence: 3, type: "device_code", userCode: "ABCD-EFGH", verificationUri: "https://example.invalid/device", intervalSeconds: 5, expiresInSeconds: 600 }),
      progress: fixture("ProviderAuthNotification", { sequence: 4, type: "progress", message: "Waiting for authorization" }),
    },
    providerLoginResults: {
      running: fixture("ProviderLoginResult", { operationId: OPERATION_ID, providerId: "scripted", authType: "oauth", state: "running", sequence: 1, notifications: [] }),
      needsInput: fixture("ProviderLoginResult", { operationId: OPERATION_ID, providerId: "scripted", authType: "oauth", state: "needsInput", sequence: 2, notifications: [], prompt: { promptId: DIALOG_ID, type: "manual_code", message: "Paste the returned code" } }),
      completed: fixture("ProviderLoginResult", { operationId: OPERATION_ID, providerId: "scripted", authType: "oauth", state: "completed", sequence: 3, notifications: [], provider }),
      failed: fixture("ProviderLoginResult", { operationId: OPERATION_ID, providerId: "scripted", authType: "oauth", state: "failed", sequence: 3, notifications: [], problem }),
      cancelled: fixture("ProviderLoginResult", { operationId: OPERATION_ID, providerId: "scripted", authType: "oauth", state: "cancelled", sequence: 3, notifications: [] }),
    },
    receipts: {
      accepted: fixture("CommandReceipt", baseReceipt),
      running: fixture("CommandReceipt", { ...baseReceipt, state: "running", updatedAt: LATER }),
      failed: fixture("CommandReceipt", { ...baseReceipt, state: "failed", updatedAt: LATER, settledAt: LATER, problem }),
      interrupted: fixture("CommandReceipt", { ...baseReceipt, state: "interrupted", updatedAt: LATER, settledAt: LATER, problem: { ...problem, code: "server_restarted", title: "Command interrupted", detail: "The Agent Server restarted. Send a new command to continue." } }),
      ...commandReceiptFixtures,
    },
    piContent: {
      text: fixture("PiContentBlock", textContent),
      thinking: fixture("PiContentBlock", thinkingContent),
      image: fixture("PiContentBlock", imageContent),
      toolCall: fixture("PiContentBlock", toolCall),
    },
    piMessages: {
      user: fixture("PiMessage", userMessage),
      assistant: fixture("PiMessage", assistantMessage),
      toolResult: fixture("PiMessage", toolResultMessage),
      bashExecution: fixture("PiMessage", bashMessage),
      custom: fixture("PiMessage", customMessage),
      branchSummary: fixture("PiMessage", branchSummaryMessage),
      compactionSummary: fixture("PiMessage", compactionSummaryMessage),
    },
    piEntries: Object.fromEntries(Object.entries(entries).map(([name, value]) => [name, fixture("PiEntry", value)])),
    pi: {
      sessionStats: fixture("SessionStats", { sessionId: CONVERSATION_ID, userMessages: 1, assistantMessages: 1, toolCalls: 1, toolResults: 1, totalMessages: 3, tokens: { input: 10, output: 5, cacheRead: 2, cacheWrite: 1, total: 18 }, cost: 0.0033, contextUsage: { tokens: 18, contextWindow: 128000, percent: 0.014 } }),
      treeNode: fixture("PiTreeNode", { entry: entries.message, children: [] }),
      compactionResult: fixture("CompactionResultDto", compactionResult),
      bashResult: fixture("BashResultDto", bashResult),
      command: fixture("CommandSummary", commandSummary),
    },
    pendingDialogs: {
      select: fixture("PendingDialog", pendingDialog),
      confirm: fixture("PendingDialog", { dialogId: DIALOG_ID, method: "confirm", title: "Confirm fixture", message: "Continue?", timeoutAt: LATER }),
      input: fixture("PendingDialog", { dialogId: DIALOG_ID, method: "input", title: "Enter fixture", placeholder: "value", timeoutAt: LATER }),
      editor: fixture("PendingDialog", { dialogId: DIALOG_ID, method: "editor", title: "Edit fixture", prefill: "initial" }),
    },
    binary: {
      soul: fixture("BinaryHttpBodyFixture", { mediaType: "application/octet-stream", bodyBase64: "Rml4dHVyZSBzb3VsCg==", byteCount: 13, sha256: SOUL_HASH }),
      artifact: fixture("BinaryHttpBodyFixture", { mediaType: "text/html", bodyBase64: "PGh0bWw+Zml4dHVyZTwvaHRtbD4K", byteCount: 21, sha256: "ea211a9ffa78def04a4860c64a0bb2e78da42aee5327a3a11c9c8978b18007b4" }),
      heartbeat: fixture("SseHeartbeatFixture", { wire: ": heartbeat\n\n", consumesSequence: false }),
    },
    snapshots: {
      active: fixture("ConversationSnapshot", snapshot),
      idle: fixture("ConversationSnapshot", { ...snapshot, conversation: { ...conversation, status: "idle" }, state: { ...state, conversation: { ...conversation, status: "idle" }, activeCommandIds: [] }, activeResponse: null, steeringQueue: [], followUpQueue: [], pendingDialogs: [], activeReceipts: [] }),
    },
    assistantEvents: assistantEventFixtures,
    conversationEvents: conversationEventFixtures,
    gatewayEvents: gatewayEventFixtures,
  },
};
