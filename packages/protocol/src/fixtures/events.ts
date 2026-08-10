import { fixture } from "./types.js";
import {
  COMMAND_ID,
  CONVERSATION_ID,
  DIALOG_ID,
  GATEWAY_ID,
  GATEWAY_STREAM_ID,
  LATER,
  NOW,
  STREAM_ID,
  directoryConversation,
  gatewayConversation,
  gatewayConversationSummary,
  imageInput,
  model,
  workspace,
} from "./shared.js";
import {
  assistantMessage,
  assistantMessageFor,
  commandSource,
  entries,
  partialAssistantMessage,
  textContent,
  toolCall,
  toolResultData,
  toolResultMessage,
} from "./pi.js";
import { acceptedReceipt, directoryAcceptedReceipt, runningReceipt } from "./commands.js";

export const pendingDialogs = {
  select: {
    dialogId: DIALOG_ID,
    method: "select",
    title: "Select a fixture",
    options: ["one", "two"],
    timeoutAt: LATER,
  },
  confirm: {
    dialogId: DIALOG_ID,
    method: "confirm",
    title: "Confirm fixture",
    message: "Continue?",
    timeoutAt: LATER,
  },
  input: {
    dialogId: DIALOG_ID,
    method: "input",
    title: "Enter fixture",
    placeholder: "value",
    timeoutAt: LATER,
  },
  editor: {
    dialogId: DIALOG_ID,
    method: "editor",
    title: "Edit fixture",
    prefill: "initial",
    timeoutAt: LATER,
  },
};

export const extensionUiEvents = {
  notify: { method: "notify", message: "Fixture notification", severity: "info" },
  setStatus: { method: "setStatus", key: "fixture", text: "running" },
  setWidget: { method: "setWidget", key: "fixture", lines: ["line one"], placement: "aboveEditor" },
  setTitle: { method: "setTitle", title: "Fixture title" },
  setEditorText: { method: "set_editor_text", text: "Fixture editor text" },
};

export const gatewayState = {
  conversation: gatewayConversation,
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
export const directoryState = {
  ...gatewayState,
  conversation: directoryConversation,
};
export const activeResponse = {
  message: assistantMessage,
  tools: [{
    toolCallId: "call-1",
    toolName: "read",
    status: "running",
    input: { path: "README.md" },
    content: [textContent],
    details: { progress: 0.5 },
  }],
};
const extensionUiState = {
  statuses: { fixture: "running" },
  widgets: [{ key: "fixture", lines: ["line one"], placement: "aboveEditor" }],
  title: "Fixture title",
};
export const gatewaySnapshot = {
  conversation: gatewayConversation,
  state: gatewayState,
  messagesRevision: "messages-r1",
  activeResponse,
  steeringQueue: [{ text: "Steer next", images: [] }],
  followUpQueue: [{ text: "Follow up", images: [imageInput] }],
  pendingDialogs: [pendingDialogs.select],
  extensionUiState,
  activeReceipts: [acceptedReceipt],
};
export const directorySnapshot = {
  conversation: directoryConversation,
  state: directoryState,
  messagesRevision: "messages-r1",
  activeResponse,
  steeringQueue: [{ text: "Steer next", images: [] }],
  followUpQueue: [{ text: "Follow up", images: [imageInput] }],
  pendingDialogs: [pendingDialogs.select],
  extensionUiState,
  activeReceipts: [directoryAcceptedReceipt],
};
export const idleGatewaySnapshot = {
  ...gatewaySnapshot,
  conversation: { ...gatewayConversation, status: "idle" },
  state: {
    ...gatewayState,
    conversation: { ...gatewayConversation, status: "idle" },
    activeCommandIds: [],
  },
  activeResponse: null,
  steeringQueue: [],
  followUpQueue: [],
  pendingDialogs: [],
  activeReceipts: [],
};

export const assistantUpdates = {
  start: { type: "start", partial: partialAssistantMessage },
  textStart: { type: "text_start", contentIndex: 0, partial: partialAssistantMessage },
  textDelta: { type: "text_delta", contentIndex: 0, delta: "Hello", partial: partialAssistantMessage },
  textEnd: { type: "text_end", contentIndex: 0, content: "Hello from Pi", partial: partialAssistantMessage },
  thinkingStart: { type: "thinking_start", contentIndex: 1, partial: partialAssistantMessage },
  thinkingDelta: { type: "thinking_delta", contentIndex: 1, delta: "Check", partial: partialAssistantMessage },
  thinkingEnd: { type: "thinking_end", contentIndex: 1, content: "Check the fixture", partial: partialAssistantMessage },
  toolcallStart: { type: "toolcall_start", contentIndex: 2, partial: partialAssistantMessage },
  toolcallDelta: { type: "toolcall_delta", contentIndex: 2, delta: "{\"path\":", partial: partialAssistantMessage },
  toolcallEnd: { type: "toolcall_end", contentIndex: 2, toolCall, partial: partialAssistantMessage },
  doneStop: { type: "done", reason: "stop", message: assistantMessageFor("stop") },
  doneLength: { type: "done", reason: "length", message: assistantMessageFor("length") },
  doneToolUse: { type: "done", reason: "toolUse", message: assistantMessageFor("toolUse") },
  errorAborted: { type: "error", reason: "aborted", error: assistantMessageFor("aborted") },
  error: { type: "error", reason: "error", error: assistantMessageFor("error") },
};
export const assistantEventFixtures = Object.fromEntries(
  Object.entries(assistantUpdates).map(([name, value]) => [name, fixture("AssistantMessageEvent", value)]),
);

const conversationEventData: Record<string, unknown> = {
  "conversation.snapshot": gatewaySnapshot,
  "conversation.status.changed": { status: "working", previousStatus: "idle" },
  "conversation.viewed.changed": { viewedAt: LATER, completedAt: LATER, completedSinceViewed: false },
  "conversation.replaced": {
    reason: "fork",
    target: { gatewayId: GATEWAY_ID, conversationId: "0195f6f4-7c5b-7000-8000-000000000002" },
  },
  "command.receipt.updated": runningReceipt,
  "extension.ui.request": pendingDialogs.select,
  "extension.ui.event": extensionUiEvents.notify,
  "extension.error": {
    source: commandSource,
    event: "tool_call",
    message: "Fixture extension failed safely.",
  },
  "agent.start": {},
  "agent.end": { messages: [assistantMessage, toolResultMessage], willRetry: false },
  "agent.settled": {},
  "turn.start": {},
  "turn.end": { message: assistantMessage, toolResults: [toolResultMessage] },
  "message.start": { message: assistantMessage },
  "message.update": { message: partialAssistantMessage, update: assistantUpdates.textDelta },
  "message.end": { message: assistantMessage },
  "bash.execution.update": { commandId: COMMAND_ID, delta: "fixture\n" },
  "tool.execution.start": { toolCallId: "call-1", toolName: "read", args: { path: "README.md" } },
  "tool.execution.update": {
    toolCallId: "call-1",
    toolName: "read",
    args: { path: "README.md" },
    partialResult: toolResultData,
  },
  "tool.execution.end": { toolCallId: "call-1", toolName: "read", result: toolResultData, isError: false },
  "queue.update": { steering: ["Steer"], followUp: ["Follow up"] },
  "entry.appended": { entry: entries.message },
  "session.info.changed": { name: "Fixture session" },
  "thinking.level.changed": { level: "high" },
  "compaction.start": { reason: "manual" },
  "compaction.end": {
    reason: "manual",
    result: {
      summary: "Compacted fixture conversation",
      firstKeptEntryId: "entry0002",
      tokensBefore: 1000,
      estimatedTokensAfter: 250,
      details: { stable: true },
    },
    aborted: false,
    willRetry: false,
  },
  "retry.start": {
    attempt: 1,
    maxAttempts: 3,
    delayMs: 100,
    errorMessage: "Transient scripted failure",
  },
  "retry.end": { success: true, attempt: 1 },
  "summarization.retry.scheduled": {
    attempt: 1,
    maxAttempts: 3,
    delayMs: 100,
    errorMessage: "Transient summary failure",
  },
  "summarization.retry.attempt-start": { source: "compaction", reason: "manual" },
  "summarization.retry.finished": {},
};
function conversationEvent(type: string, data: unknown, sequence: number, gateway = true) {
  return {
    streamId: STREAM_ID,
    sequence,
    conversationId: CONVERSATION_ID,
    ...(gateway ? { gatewayId: GATEWAY_ID } : {}),
    emittedAt: NOW,
    type,
    data,
  };
}
export const conversationEventFixtures = Object.fromEntries(
  Object.entries(conversationEventData).map(([type, data], index) => [
    type,
    fixture("ConversationEvent", conversationEvent(type, data, index)),
  ]),
);
Object.assign(conversationEventFixtures, {
  "conversation.snapshot.directory": fixture(
    "ConversationEvent",
    conversationEvent("conversation.snapshot", directorySnapshot, 0, false),
  ),
  "conversation.replaced.directory": fixture(
    "ConversationEvent",
    conversationEvent("conversation.replaced", {
      reason: "switch",
      target: { conversationId: "0195f6f4-7c5b-7000-8000-000000000002" },
    }, 3, false),
  ),
  "summarization.retry.attempt-start.branchSummary": fixture(
    "ConversationEvent",
    conversationEvent("summarization.retry.attempt-start", { source: "branchSummary" }, 30),
  ),
});

export const gatewaySnapshotValue = {
  revision: "gateway-r1",
  conversations: [gatewayConversationSummary],
  workspaces: [workspace],
};
const gatewayEventData: Record<string, unknown> = {
  "gateway.snapshot": gatewaySnapshotValue,
  "conversation.summary.changed": gatewayConversationSummary,
  "conversation.removed": { conversationId: CONVERSATION_ID },
  "workspace.summary.changed": workspace,
  "workspace.removed": { workspaceId: workspace.workspaceId },
  "conversation.notification": {
    conversationId: CONVERSATION_ID,
    severity: "info",
    message: "Fixture notification",
  },
};
export const gatewayEventFixtures = Object.fromEntries(
  Object.entries(gatewayEventData).map(([type, data], index) => [
    type,
    fixture("GatewayEvent", {
      streamId: GATEWAY_STREAM_ID,
      sequence: index,
      gatewayId: GATEWAY_ID,
      emittedAt: NOW,
      type,
      data,
    }),
  ]),
);
