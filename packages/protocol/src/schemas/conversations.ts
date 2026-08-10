import { Type } from "typebox";
import {
  ConversationStatus,
  PiId,
  QueueMode,
  SafePathSegment,
  Timestamp,
  ThinkingLevel,
  Uuid,
  enumeration,
  nullable,
  responseObject,
  responseVariant,
  strictObject,
} from "./common.js";
import { ModelSummary } from "./providers.js";
import {
  CommandSummary,
  PiEntry,
  PiMessage,
  PiTreeNode,
} from "./pi.js";

const ConversationProjection = {
  conversationId: PiId,
  title: nullable(Type.String()),
  createdAt: Timestamp,
  activityAt: Timestamp,
  viewedAt: nullable(Timestamp),
  completedAt: nullable(Timestamp),
  status: ConversationStatus,
  completedSinceViewed: Type.Boolean(),
  trashedAt: nullable(Timestamp),
  trashReason: nullable(enumeration(["individual", "workspace", "workspaceMissing"] as const)),
  readOnly: Type.Boolean(),
};
const ConversationWithCwd = { ...ConversationProjection, cwd: Type.String({ pattern: "^/" }) };
export const Conversation = Type.Union([
  responseObject({ ...ConversationWithCwd, gatewayId: Uuid, workspaceId: Uuid }),
  responseVariant(ConversationWithCwd, ["gatewayId", "workspaceId"]),
]);
export const ConversationSummary = Type.Union([
  responseObject({ ...ConversationProjection, gatewayId: Uuid, workspaceId: Uuid }),
  responseVariant(ConversationProjection, ["gatewayId", "workspaceId"]),
]);

export const ImageInput = strictObject({
  type: Type.Literal("image"),
  data: Type.String({
    minLength: 4,
    pattern: "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$",
  }),
  mimeType: enumeration(["image/png", "image/jpeg", "image/webp", "image/gif"] as const),
  fileName: Type.Optional(SafePathSegment),
});
export const ModelSelection = strictObject({
  provider: Type.String({ minLength: 1 }),
  modelId: Type.String({ minLength: 1 }),
});
export const CreateConversationRequest = strictObject({
  commandId: Uuid,
  message: Type.String(),
  images: Type.Optional(Type.Array(ImageInput)),
  workspaceId: Type.Optional(Uuid),
  model: Type.Optional(ModelSelection),
  thinkingLevel: Type.Optional(ThinkingLevel),
});

export const ConversationState = responseObject({
  conversation: Conversation,
  model: nullable(ModelSummary),
  thinkingLevel: ThinkingLevel,
  steeringMode: QueueMode,
  followUpMode: QueueMode,
  autoCompactionEnabled: Type.Boolean(),
  autoRetryEnabled: Type.Boolean(),
  messageCount: Type.Integer({ minimum: 0 }),
  pendingMessageCount: Type.Integer({ minimum: 0 }),
  activeCommandIds: Type.Array(Uuid),
});
export const MessagesResult = responseObject({
  messages: Type.Array(PiMessage),
  revision: Type.String({ minLength: 1 }),
});
export const EntriesResult = responseObject({ entries: Type.Array(PiEntry), leafId: nullable(PiId) });
export const TreeResult = responseObject({ tree: Type.Array(PiTreeNode), leafId: nullable(PiId) });
export const ForkMessagesResult = responseObject({
  messages: Type.Array(responseObject({ entryId: PiId, text: Type.String() })),
});
export const LastAssistantResult = responseObject({ text: nullable(Type.String()) });
export const CommandsResult = responseObject({ commands: Type.Array(CommandSummary) });
export const ThinkingLevelsResult = responseObject({ levels: Type.Array(ThinkingLevel) });

const Cursor = Type.String({ minLength: 1, pattern: "^[A-Za-z0-9_-]+$" });
export const ConversationPage = responseObject({
  items: Type.Array(ConversationSummary),
  nextCursor: nullable(Cursor),
  revision: Type.String({ minLength: 1 }),
});
