import { Type, type TProperties, type TSchema } from "typebox";
import { CommandReceipt } from "./commands.js";
import {
  ConversationRef,
  ConversationStatus,
  JsonValue,
  PiId,
  ThinkingLevel,
  Timestamp,
  Uuid,
  enumeration,
  nullable,
  responseObject,
  responseVariant,
} from "./common.js";
import { Conversation, ConversationState, ConversationSummary, ImageInput } from "./conversations.js";
import {
  CompactionResultDto,
  ImageContent,
  PiContentBlock,
  PiEntry,
  PiMessage,
  TextContent,
  ToolCall,
  ToolResultMessage,
  Usage,
  assistantMessageWithStopReason,
} from "./pi.js";
import { Workspace } from "./workspaces.js";

const PendingDialogBase = { dialogId: Uuid, title: Type.String() };
export const PendingDialog = Type.Union([
  responseVariant({
    ...PendingDialogBase,
    method: Type.Literal("select"),
    options: Type.Array(Type.String()),
    timeoutAt: Type.Optional(Timestamp),
  }, ["message", "placeholder", "prefill"]),
  responseVariant({
    ...PendingDialogBase,
    method: Type.Literal("confirm"),
    message: Type.String(),
    timeoutAt: Type.Optional(Timestamp),
  }, ["options", "placeholder", "prefill"]),
  responseVariant({
    ...PendingDialogBase,
    method: Type.Literal("input"),
    placeholder: Type.Optional(Type.String()),
    timeoutAt: Type.Optional(Timestamp),
  }, ["options", "message", "prefill"]),
  responseVariant({
    ...PendingDialogBase,
    method: Type.Literal("editor"),
    prefill: Type.Optional(Type.String()),
    timeoutAt: Type.Optional(Timestamp),
  }, ["options", "message", "placeholder"]),
]);
export const ActiveToolExecution = responseObject({
  toolCallId: Type.String(),
  toolName: Type.String(),
  status: enumeration(["running", "completed", "failed"] as const),
  input: Type.Optional(JsonValue),
  content: Type.Optional(Type.Array(PiContentBlock)),
  details: Type.Optional(JsonValue),
});
export const ActiveResponse = responseObject({ message: PiMessage, tools: Type.Array(ActiveToolExecution) });
export const ConversationSnapshot = responseObject({
  conversation: Conversation,
  state: ConversationState,
  messagesRevision: Type.String({ minLength: 1 }),
  activeResponse: nullable(ActiveResponse),
  steeringQueue: Type.Array(responseObject({ text: Type.String(), images: Type.Array(ImageInput) })),
  followUpQueue: Type.Array(responseObject({ text: Type.String(), images: Type.Array(ImageInput) })),
  pendingDialogs: Type.Array(PendingDialog),
  extensionUiState: responseObject({
    statuses: Type.Record(Type.String(), Type.String()),
    widgets: Type.Array(responseObject({
      key: Type.String(),
      lines: Type.Array(Type.String()),
      placement: enumeration(["aboveEditor", "belowEditor"] as const),
    })),
    title: nullable(Type.String()),
  }),
  activeReceipts: Type.Array(CommandReceipt),
});

const assistantEventProperties = [
  "partial",
  "contentIndex",
  "delta",
  "content",
  "toolCall",
  "reason",
  "message",
  "error",
] as const;
const assistantEvent = <P extends TProperties>(properties: P) => responseVariant(
  properties,
  assistantEventProperties.filter((property) => !(property in properties)),
);
const PendingAssistantMessage = assistantMessageWithStopReason("pending");
export const AssistantMessageEvent = Type.Union([
  assistantEvent({ type: Type.Literal("start"), partial: PendingAssistantMessage }),
  assistantEvent({ type: Type.Literal("text_start"), contentIndex: Type.Integer({ minimum: 0 }), partial: PendingAssistantMessage }),
  assistantEvent({ type: Type.Literal("text_delta"), contentIndex: Type.Integer({ minimum: 0 }), delta: Type.String(), partial: PendingAssistantMessage }),
  assistantEvent({ type: Type.Literal("text_end"), contentIndex: Type.Integer({ minimum: 0 }), content: Type.String(), partial: PendingAssistantMessage }),
  assistantEvent({ type: Type.Literal("thinking_start"), contentIndex: Type.Integer({ minimum: 0 }), partial: PendingAssistantMessage }),
  assistantEvent({ type: Type.Literal("thinking_delta"), contentIndex: Type.Integer({ minimum: 0 }), delta: Type.String(), partial: PendingAssistantMessage }),
  assistantEvent({ type: Type.Literal("thinking_end"), contentIndex: Type.Integer({ minimum: 0 }), content: Type.String(), partial: PendingAssistantMessage }),
  assistantEvent({ type: Type.Literal("toolcall_start"), contentIndex: Type.Integer({ minimum: 0 }), partial: PendingAssistantMessage }),
  assistantEvent({ type: Type.Literal("toolcall_delta"), contentIndex: Type.Integer({ minimum: 0 }), delta: Type.String(), partial: PendingAssistantMessage }),
  assistantEvent({ type: Type.Literal("toolcall_end"), contentIndex: Type.Integer({ minimum: 0 }), toolCall: ToolCall, partial: PendingAssistantMessage }),
  assistantEvent({ type: Type.Literal("done"), reason: Type.Literal("stop"), message: assistantMessageWithStopReason("stop") }),
  assistantEvent({ type: Type.Literal("done"), reason: Type.Literal("length"), message: assistantMessageWithStopReason("length") }),
  assistantEvent({ type: Type.Literal("done"), reason: Type.Literal("toolUse"), message: assistantMessageWithStopReason("toolUse") }),
  assistantEvent({ type: Type.Literal("error"), reason: Type.Literal("aborted"), error: assistantMessageWithStopReason("aborted") }),
  assistantEvent({ type: Type.Literal("error"), reason: Type.Literal("error"), error: assistantMessageWithStopReason("error") }),
]);

export const ToolResultData = responseObject({
  content: Type.Array(Type.Union([TextContent, ImageContent])),
  details: JsonValue,
  usage: Type.Optional(Usage),
  addedToolNames: Type.Optional(Type.Array(Type.String())),
  terminate: Type.Optional(Type.Boolean()),
});
const extensionEventProperties = ["message", "severity", "key", "text", "lines", "placement", "title"] as const;
const extensionEvent = <P extends TProperties>(properties: P) => responseVariant(
  properties,
  extensionEventProperties.filter((property) => !(property in properties)),
);
export const ExtensionUiEvent = Type.Union([
  extensionEvent({
    method: Type.Literal("notify"),
    message: Type.String(),
    severity: enumeration(["info", "warning", "error"] as const),
  }),
  extensionEvent({ method: Type.Literal("setStatus"), key: Type.String(), text: nullable(Type.String()) }),
  extensionEvent({
    method: Type.Literal("setWidget"),
    key: Type.String(),
    lines: nullable(Type.Array(Type.String())),
    placement: enumeration(["aboveEditor", "belowEditor"] as const),
  }),
  extensionEvent({ method: Type.Literal("setTitle"), title: Type.String() }),
  extensionEvent({ method: Type.Literal("set_editor_text"), text: Type.String() }),
]);
export const SafeExtensionSource = responseObject({
  source: Type.String(),
  scope: enumeration(["user", "project", "temporary"] as const),
  origin: enumeration(["package", "top-level"] as const),
});

const conversationEvent = <const EventType extends string, Data extends TSchema>(type: EventType, data: Data) => responseObject({
  streamId: Uuid,
  sequence: Type.Integer({ minimum: 0 }),
  conversationId: PiId,
  gatewayId: Type.Optional(Uuid),
  emittedAt: Timestamp,
  type: Type.Literal(type),
  data,
});
const conversationEventSchemas = [
  conversationEvent("conversation.snapshot", ConversationSnapshot),
  conversationEvent("conversation.status.changed", responseObject({ status: ConversationStatus, previousStatus: ConversationStatus })),
  conversationEvent("conversation.viewed.changed", responseObject({
    viewedAt: nullable(Timestamp),
    completedAt: nullable(Timestamp),
    completedSinceViewed: Type.Boolean(),
  })),
  conversationEvent("conversation.replaced", responseObject({
    reason: enumeration(["newSession", "switch", "fork", "clone"] as const),
    target: ConversationRef,
  })),
  conversationEvent("command.receipt.updated", CommandReceipt),
  conversationEvent("extension.ui.request", PendingDialog),
  conversationEvent("extension.ui.event", ExtensionUiEvent),
  conversationEvent("extension.error", responseObject({ source: SafeExtensionSource, event: Type.String(), message: Type.String() })),
  conversationEvent("agent.start", responseObject({})),
  conversationEvent("agent.end", responseObject({ messages: Type.Array(PiMessage), willRetry: Type.Boolean() })),
  conversationEvent("agent.settled", responseObject({})),
  conversationEvent("turn.start", responseObject({})),
  conversationEvent("turn.end", responseObject({ message: PiMessage, toolResults: Type.Array(ToolResultMessage) })),
  conversationEvent("message.start", responseObject({ message: PiMessage })),
  conversationEvent("message.update", responseObject({ message: PiMessage, update: AssistantMessageEvent })),
  conversationEvent("message.end", responseObject({ message: PiMessage })),
  conversationEvent("bash.execution.update", responseObject({ commandId: Type.Optional(Uuid), delta: Type.String() })),
  conversationEvent("tool.execution.start", responseObject({ toolCallId: Type.String(), toolName: Type.String(), args: JsonValue })),
  conversationEvent("tool.execution.update", responseObject({
    toolCallId: Type.String(),
    toolName: Type.String(),
    args: JsonValue,
    partialResult: ToolResultData,
  })),
  conversationEvent("tool.execution.end", responseObject({
    toolCallId: Type.String(),
    toolName: Type.String(),
    result: ToolResultData,
    isError: Type.Boolean(),
  })),
  conversationEvent("queue.update", responseObject({ steering: Type.Array(Type.String()), followUp: Type.Array(Type.String()) })),
  conversationEvent("entry.appended", responseObject({ entry: PiEntry })),
  conversationEvent("session.info.changed", responseObject({ name: nullable(Type.String()) })),
  conversationEvent("thinking.level.changed", responseObject({ level: ThinkingLevel })),
  conversationEvent("compaction.start", responseObject({ reason: enumeration(["manual", "threshold", "overflow"] as const) })),
  conversationEvent("compaction.end", responseObject({
    reason: enumeration(["manual", "threshold", "overflow"] as const),
    result: nullable(CompactionResultDto),
    aborted: Type.Boolean(),
    willRetry: Type.Boolean(),
    errorMessage: Type.Optional(Type.String()),
  })),
  conversationEvent("retry.start", responseObject({
    attempt: Type.Integer({ minimum: 1 }),
    maxAttempts: Type.Integer({ minimum: 1 }),
    delayMs: Type.Integer({ minimum: 0 }),
    errorMessage: Type.String(),
  })),
  conversationEvent("retry.end", responseObject({
    success: Type.Boolean(),
    attempt: Type.Integer({ minimum: 1 }),
    finalError: Type.Optional(Type.String()),
  })),
  conversationEvent("summarization.retry.scheduled", responseObject({
    attempt: Type.Integer({ minimum: 1 }),
    maxAttempts: Type.Integer({ minimum: 1 }),
    delayMs: Type.Integer({ minimum: 0 }),
    errorMessage: Type.String(),
  })),
  conversationEvent("summarization.retry.attempt-start", Type.Union([
    responseVariant({ source: Type.Literal("branchSummary") }, ["reason"]),
    responseObject({ source: Type.Literal("compaction"), reason: enumeration(["manual", "threshold", "overflow"] as const) }),
  ])),
  conversationEvent("summarization.retry.finished", responseObject({})),
] as const;
export const ConversationEvent = Type.Union([...conversationEventSchemas]);
export const conversationEventTypes = Object.freeze(
  conversationEventSchemas.map((schema) => schema.properties.type.const),
);

export const GatewaySnapshot = responseObject({
  revision: Type.String({ minLength: 1 }),
  conversations: Type.Array(ConversationSummary),
  workspaces: Type.Array(Workspace),
});
const gatewayEvent = <const EventType extends string, Data extends TSchema>(type: EventType, data: Data) => responseObject({
  streamId: Uuid,
  sequence: Type.Integer({ minimum: 0 }),
  gatewayId: Uuid,
  emittedAt: Timestamp,
  type: Type.Literal(type),
  data,
});
const gatewayEventSchemas = [
  gatewayEvent("gateway.snapshot", GatewaySnapshot),
  gatewayEvent("conversation.summary.changed", ConversationSummary),
  gatewayEvent("conversation.removed", responseObject({ conversationId: PiId })),
  gatewayEvent("workspace.summary.changed", Workspace),
  gatewayEvent("workspace.removed", responseObject({ workspaceId: Uuid })),
  gatewayEvent("conversation.notification", responseObject({
    conversationId: PiId,
    severity: enumeration(["info", "warning", "error"] as const),
    message: Type.String(),
  })),
] as const;
export const GatewayEvent = Type.Union([...gatewayEventSchemas]);
export const gatewayEventTypes = Object.freeze(
  gatewayEventSchemas.map((schema) => schema.properties.type.const),
);
