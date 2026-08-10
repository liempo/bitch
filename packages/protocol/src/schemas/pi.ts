import { Type } from "typebox";
import {
  JsonObject,
  JsonValue,
  PiId,
  Timestamp,
  enumeration,
  nullable,
  responseObject,
} from "./common.js";

export const TextContent = responseObject({
  type: Type.Literal("text"),
  text: Type.String(),
  textSignature: Type.Optional(Type.String()),
});
export const ThinkingContent = responseObject({
  type: Type.Literal("thinking"),
  thinking: Type.String(),
  thinkingSignature: Type.Optional(Type.String()),
  redacted: Type.Optional(Type.Boolean()),
});
export const ImageContent = responseObject({
  type: Type.Literal("image"),
  data: Type.String(),
  mimeType: Type.String({ pattern: "^image/" }),
});
export const ToolCall = responseObject({
  type: Type.Literal("toolCall"),
  id: Type.String({ minLength: 1 }),
  name: Type.String({ minLength: 1 }),
  arguments: JsonObject,
  thoughtSignature: Type.Optional(Type.String()),
});
export const PiContentBlock = Type.Union([TextContent, ThinkingContent, ImageContent, ToolCall]);

export const Usage = responseObject({
  input: Type.Number({ minimum: 0 }),
  output: Type.Number({ minimum: 0 }),
  cacheRead: Type.Number({ minimum: 0 }),
  cacheWrite: Type.Number({ minimum: 0 }),
  cacheWrite1h: Type.Optional(Type.Number({ minimum: 0 })),
  reasoning: Type.Optional(Type.Number({ minimum: 0 })),
  totalTokens: Type.Number({ minimum: 0 }),
  cost: responseObject({
    input: Type.Number(),
    output: Type.Number(),
    cacheRead: Type.Number(),
    cacheWrite: Type.Number(),
    total: Type.Number(),
  }),
});
export const UserMessage = responseObject({
  role: Type.Literal("user"),
  content: Type.Union([Type.String(), Type.Array(Type.Union([TextContent, ImageContent]))]),
  timestamp: Type.Number({ minimum: 0 }),
});
export const DiagnosticErrorInfo = responseObject({
  name: Type.Optional(Type.String()),
  message: Type.String(),
  code: Type.Optional(Type.Union([Type.String(), Type.Number()])),
});
export const AssistantMessageDiagnostic = responseObject({
  type: Type.String(),
  timestamp: Type.Number({ minimum: 0 }),
  error: Type.Optional(DiagnosticErrorInfo),
});
export const AssistantMessage = responseObject({
  role: Type.Literal("assistant"),
  content: Type.Array(Type.Union([TextContent, ThinkingContent, ToolCall])),
  api: Type.String({ minLength: 1 }),
  provider: Type.String({ minLength: 1 }),
  model: Type.String({ minLength: 1 }),
  responseModel: Type.Optional(Type.String()),
  responseId: Type.Optional(Type.String()),
  diagnostics: Type.Optional(Type.Array(AssistantMessageDiagnostic)),
  usage: Usage,
  stopReason: enumeration(["pending", "stop", "length", "toolUse", "error", "aborted"] as const),
  errorMessage: Type.Optional(Type.String()),
  rawStopReason: Type.Optional(Type.String()),
  timestamp: Type.Number({ minimum: 0 }),
});
export const assistantMessageWithStopReason = <const Reason extends "pending" | "stop" | "length" | "toolUse" | "error" | "aborted">(
  reason: Reason,
) => Type.Intersect([AssistantMessage, responseObject({ stopReason: Type.Literal(reason) })]);

export const ToolResultMessage = responseObject({
  role: Type.Literal("toolResult"),
  toolCallId: Type.String(),
  toolName: Type.String(),
  content: Type.Array(Type.Union([TextContent, ImageContent])),
  details: Type.Optional(JsonValue),
  usage: Type.Optional(Usage),
  addedToolNames: Type.Optional(Type.Array(Type.String())),
  isError: Type.Boolean(),
  timestamp: Type.Number({ minimum: 0 }),
});
export const BashExecutionMessage = responseObject({
  role: Type.Literal("bashExecution"),
  command: Type.String(),
  output: Type.String(),
  exitCode: Type.Optional(Type.Integer()),
  cancelled: Type.Boolean(),
  truncated: Type.Boolean(),
  timestamp: Type.Number({ minimum: 0 }),
  excludeFromContext: Type.Optional(Type.Boolean()),
});
export const CustomMessage = responseObject({
  role: Type.Literal("custom"),
  customType: Type.String(),
  content: Type.Union([Type.String(), Type.Array(Type.Union([TextContent, ImageContent]))]),
  display: Type.Boolean(),
  details: Type.Optional(JsonValue),
  timestamp: Type.Number({ minimum: 0 }),
});
export const BranchSummaryMessage = responseObject({
  role: Type.Literal("branchSummary"),
  summary: Type.String(),
  fromId: PiId,
  timestamp: Type.Number({ minimum: 0 }),
});
export const CompactionSummaryMessage = responseObject({
  role: Type.Literal("compactionSummary"),
  summary: Type.String(),
  tokensBefore: Type.Number({ minimum: 0 }),
  timestamp: Type.Number({ minimum: 0 }),
});
export const PiMessage = Type.Union([
  UserMessage,
  AssistantMessage,
  ToolResultMessage,
  BashExecutionMessage,
  CustomMessage,
  BranchSummaryMessage,
  CompactionSummaryMessage,
]);

const EntryBase = { id: PiId, parentId: nullable(PiId), timestamp: Timestamp };
export const SessionMessageEntry = responseObject({ ...EntryBase, type: Type.Literal("message"), message: PiMessage });
export const ThinkingLevelChangeEntry = responseObject({
  ...EntryBase,
  type: Type.Literal("thinking_level_change"),
  thinkingLevel: Type.String(),
});
export const ModelChangeEntry = responseObject({
  ...EntryBase,
  type: Type.Literal("model_change"),
  provider: Type.String(),
  modelId: Type.String(),
});
export const CompactionEntry = responseObject({
  ...EntryBase,
  type: Type.Literal("compaction"),
  summary: Type.String(),
  firstKeptEntryId: PiId,
  tokensBefore: Type.Number({ minimum: 0 }),
  details: Type.Optional(JsonValue),
  usage: Type.Optional(Usage),
  fromHook: Type.Optional(Type.Boolean()),
});
export const BranchSummaryEntry = responseObject({
  ...EntryBase,
  type: Type.Literal("branch_summary"),
  fromId: PiId,
  summary: Type.String(),
  details: Type.Optional(JsonValue),
  usage: Type.Optional(Usage),
  fromHook: Type.Optional(Type.Boolean()),
});
export const CustomEntry = responseObject({
  ...EntryBase,
  type: Type.Literal("custom"),
  customType: Type.String(),
  data: Type.Optional(JsonValue),
});
export const CustomMessageEntry = responseObject({
  ...EntryBase,
  type: Type.Literal("custom_message"),
  customType: Type.String(),
  content: Type.Union([Type.String(), Type.Array(Type.Union([TextContent, ImageContent]))]),
  details: Type.Optional(JsonValue),
  display: Type.Boolean(),
});
export const LabelEntry = responseObject({
  ...EntryBase,
  type: Type.Literal("label"),
  targetId: PiId,
  label: Type.Optional(Type.String()),
});
export const SessionInfoEntry = responseObject({
  ...EntryBase,
  type: Type.Literal("session_info"),
  name: Type.Optional(Type.String()),
});
export const PiEntry = Type.Union([
  SessionMessageEntry,
  ThinkingLevelChangeEntry,
  ModelChangeEntry,
  CompactionEntry,
  BranchSummaryEntry,
  CustomEntry,
  CustomMessageEntry,
  LabelEntry,
  SessionInfoEntry,
]);
export const PiTreeNode = Type.Cyclic({
  PiTreeNode: responseObject({
    entry: PiEntry,
    children: Type.Array(Type.Ref("PiTreeNode")),
    label: Type.Optional(Type.String()),
    labelTimestamp: Type.Optional(Timestamp),
  }),
}, "PiTreeNode");

export const ContextUsage = responseObject({
  tokens: nullable(Type.Number({ minimum: 0 })),
  contextWindow: Type.Number({ minimum: 1 }),
  percent: nullable(Type.Number({ minimum: 0 })),
});
export const SessionStats = responseObject({
  sessionId: PiId,
  userMessages: Type.Integer({ minimum: 0 }),
  assistantMessages: Type.Integer({ minimum: 0 }),
  toolCalls: Type.Integer({ minimum: 0 }),
  toolResults: Type.Integer({ minimum: 0 }),
  totalMessages: Type.Integer({ minimum: 0 }),
  tokens: responseObject({
    input: Type.Number({ minimum: 0 }),
    output: Type.Number({ minimum: 0 }),
    cacheRead: Type.Number({ minimum: 0 }),
    cacheWrite: Type.Number({ minimum: 0 }),
    total: Type.Number({ minimum: 0 }),
  }),
  cost: Type.Number({ minimum: 0 }),
  contextUsage: Type.Optional(ContextUsage),
});
export const CompactionResultDto = responseObject({
  summary: Type.String(),
  firstKeptEntryId: PiId,
  tokensBefore: Type.Number({ minimum: 0 }),
  estimatedTokensAfter: Type.Optional(Type.Number({ minimum: 0 })),
  usage: Type.Optional(Usage),
  details: Type.Optional(JsonValue),
});
export const BashResultDto = responseObject({
  output: Type.String(),
  exitCode: Type.Optional(Type.Integer()),
  cancelled: Type.Boolean(),
  truncated: Type.Boolean(),
});
export const CommandSourceRef = responseObject({
  source: Type.String({ minLength: 1 }),
  scope: enumeration(["user", "project", "temporary"] as const),
  origin: enumeration(["package", "top-level"] as const),
});
export const CommandSummary = responseObject({
  name: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.String()),
  source: enumeration(["extension", "prompt", "skill"] as const),
  sourceInfo: CommandSourceRef,
});
