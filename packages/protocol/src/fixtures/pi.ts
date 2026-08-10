import { CONVERSATION_ID, NOW } from "./shared.js";

export const usage = {
  input: 10,
  output: 5,
  cacheRead: 2,
  cacheWrite: 1,
  cacheWrite1h: 1,
  reasoning: 2,
  totalTokens: 18,
  cost: {
    input: 0.001,
    output: 0.002,
    cacheRead: 0.0001,
    cacheWrite: 0.0002,
    total: 0.0033,
  },
};
export const textContent = { type: "text", text: "Hello from Pi", textSignature: "sig-text" };
export const thinkingContent = {
  type: "thinking",
  thinking: "Check the fixture",
  thinkingSignature: "sig-thinking",
  redacted: false,
};
export const imageContent = {
  type: "image",
  data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  mimeType: "image/png",
};
export const toolCall = {
  type: "toolCall",
  id: "call-1",
  name: "read",
  arguments: { path: "README.md" },
  thoughtSignature: "sig-tool",
};
export const userMessage = {
  role: "user",
  content: [textContent, imageContent],
  timestamp: 1767225600000,
};
export const userTextMessage = {
  role: "user",
  content: "Validate protocol fixtures",
  timestamp: 1767225600000,
};
export const diagnosticError = {
  name: "FixtureError",
  message: "Deterministic fixture failure",
  code: "fixture_error",
};
export const assistantDiagnostic = {
  type: "fixture",
  timestamp: 1767225600000,
  error: diagnosticError,
};
export function assistantMessageFor(stopReason: "pending" | "stop" | "length" | "toolUse" | "error" | "aborted") {
  return {
    role: "assistant",
    content: [textContent, thinkingContent, toolCall],
    api: "pi-messages",
    provider: "scripted",
    model: "fixture-model",
    responseModel: "fixture-model-2026",
    responseId: "response-1",
    diagnostics: [assistantDiagnostic],
    usage,
    stopReason,
    ...(stopReason === "error" || stopReason === "aborted"
      ? { errorMessage: stopReason === "error" ? "Scripted failure" : "Scripted request aborted" }
      : {}),
    rawStopReason: stopReason,
    timestamp: 1767225600001,
  };
}
export const assistantMessage = assistantMessageFor("toolUse");
export const partialAssistantMessage = assistantMessageFor("pending");
export const toolResultMessage = {
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
export const bashMessage = {
  role: "bashExecution",
  command: "printf fixture",
  output: "fixture",
  exitCode: 0,
  cancelled: false,
  truncated: false,
  timestamp: 1767225600003,
  excludeFromContext: false,
};
export const customMessage = {
  role: "custom",
  customType: "fixture.notice",
  content: "Fixture notice",
  display: true,
  details: { stable: true },
  timestamp: 1767225600004,
};
export const branchSummaryMessage = {
  role: "branchSummary",
  summary: "Branch summary",
  fromId: "entry0001",
  timestamp: 1767225600005,
};
export const compactionSummaryMessage = {
  role: "compactionSummary",
  summary: "Compaction summary",
  tokensBefore: 1000,
  timestamp: 1767225600006,
};

const entryBase = { id: "entry0001", parentId: null, timestamp: NOW };
export const entries = {
  message: { ...entryBase, type: "message", message: userMessage },
  thinkingLevelChange: {
    ...entryBase,
    id: "entry0002",
    parentId: "entry0001",
    type: "thinking_level_change",
    thinkingLevel: "high",
  },
  modelChange: {
    ...entryBase,
    id: "entry0003",
    parentId: "entry0002",
    type: "model_change",
    provider: "scripted",
    modelId: "fixture-model",
  },
  compaction: {
    ...entryBase,
    id: "entry0004",
    parentId: "entry0003",
    type: "compaction",
    summary: "Summary",
    firstKeptEntryId: "entry0002",
    tokensBefore: 1000,
    details: { readFiles: ["README.md"], modifiedFiles: [] },
    usage,
    fromHook: false,
  },
  branchSummary: {
    ...entryBase,
    id: "entry0005",
    parentId: "entry0004",
    type: "branch_summary",
    fromId: "entry0003",
    summary: "Branch",
    details: { stable: true },
    usage,
    fromHook: false,
  },
  custom: {
    ...entryBase,
    id: "entry0006",
    parentId: "entry0005",
    type: "custom",
    customType: "fixture.state",
    data: { count: 1 },
  },
  customMessage: {
    ...entryBase,
    id: "entry0007",
    parentId: "entry0006",
    type: "custom_message",
    customType: "fixture.message",
    content: [textContent, imageContent],
    details: { stable: true },
    display: true,
  },
  label: {
    ...entryBase,
    id: "entry0008",
    parentId: "entry0007",
    type: "label",
    targetId: "entry0001",
    label: "start",
  },
  sessionInfo: {
    ...entryBase,
    id: "entry0009",
    parentId: "entry0008",
    type: "session_info",
    name: "Fixture session",
  },
};

export const compactionResult = {
  summary: "Compacted fixture conversation",
  firstKeptEntryId: "entry0002",
  tokensBefore: 1000,
  estimatedTokensAfter: 250,
  usage,
  details: { readFiles: ["README.md"], modifiedFiles: [] },
};
export const bashResult = { output: "fixture\n", exitCode: 0, cancelled: false, truncated: false };
export const contextUsage = { tokens: 18, contextWindow: 128000, percent: 0.0140625 };
export const sessionStats = {
  sessionId: CONVERSATION_ID,
  userMessages: 1,
  assistantMessages: 1,
  toolCalls: 1,
  toolResults: 1,
  totalMessages: 3,
  tokens: { input: 10, output: 5, cacheRead: 2, cacheWrite: 1, total: 18 },
  cost: 0.0033,
  contextUsage,
};
export const commandSource = {
  source: "fixture-extension",
  scope: "project",
  origin: "top-level",
};
export const commandSummary = {
  name: "fixture",
  description: "Run fixture command",
  source: "extension",
  sourceInfo: commandSource,
};
export const toolResultData = {
  content: [textContent],
  details: { progress: 1 },
  usage,
  addedToolNames: ["write"],
  terminate: false,
};
