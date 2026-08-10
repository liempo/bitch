import { Type, type TProperties, type TSchema } from "typebox";
import { ArtifactDescriptor } from "./artifacts.js";
import {
  ConversationRef,
  PiId,
  ProblemDetails,
  Sha256,
  ThinkingLevel,
  Timestamp,
  Uuid,
  enumeration,
  nullable,
  responseObject,
  responseVariant,
  strictObject,
} from "./common.js";
import { ImageInput, Conversation } from "./conversations.js";
import { BashResultDto, CompactionResultDto } from "./pi.js";
import { ModelSummary } from "./providers.js";

const command = <const CommandType extends string, Payload extends TProperties>(
  type: CommandType,
  payload: Payload,
) => strictObject({
  commandId: Uuid,
  type: Type.Literal(type),
  payload: strictObject(payload),
});

export const commandTypeValues = [
  "prompt",
  "steer",
  "follow_up",
  "abort",
  "new_session",
  "set_model",
  "cycle_model",
  "set_thinking_level",
  "cycle_thinking_level",
  "set_steering_mode",
  "set_follow_up_mode",
  "compact",
  "set_auto_compaction",
  "set_auto_retry",
  "abort_retry",
  "bash",
  "abort_bash",
  "export_html",
  "switch_session",
  "fork",
  "clone",
  "set_session_name",
  "reload",
] as const;

export const ConversationCommand = Type.Union([
  command("prompt", {
    message: Type.String(),
    images: Type.Optional(Type.Array(ImageInput)),
    streamingBehavior: Type.Optional(enumeration(["steer", "followUp"] as const)),
  }),
  command("steer", { message: Type.String(), images: Type.Optional(Type.Array(ImageInput)) }),
  command("follow_up", { message: Type.String(), images: Type.Optional(Type.Array(ImageInput)) }),
  command("abort", {}),
  command("new_session", { parentConversationId: Type.Optional(PiId) }),
  command("set_model", { provider: Type.String(), modelId: Type.String() }),
  command("cycle_model", {}),
  command("set_thinking_level", { level: ThinkingLevel }),
  command("cycle_thinking_level", {}),
  command("set_steering_mode", { mode: enumeration(["all", "one-at-a-time"] as const) }),
  command("set_follow_up_mode", { mode: enumeration(["all", "one-at-a-time"] as const) }),
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

export const ModelCycleResult = responseObject({
  model: ModelSummary,
  thinkingLevel: ThinkingLevel,
  isScoped: Type.Boolean(),
});
export const ThinkingCycleResult = responseObject({ level: ThinkingLevel });
export const SessionChangeResult = Type.Union([
  responseVariant({ cancelled: Type.Literal(true) }, ["target"]),
  responseObject({ cancelled: Type.Literal(false), target: ConversationRef }),
]);
export const ForkResult = Type.Union([
  responseVariant({ cancelled: Type.Literal(true), text: Type.Optional(Type.String()) }, ["target"]),
  responseObject({ cancelled: Type.Literal(false), target: ConversationRef, text: Type.Optional(Type.String()) }),
]);
export const CommandResult = Type.Union([
  ModelSummary,
  ModelCycleResult,
  ThinkingCycleResult,
  CompactionResultDto,
  BashResultDto,
  ArtifactDescriptor,
  SessionChangeResult,
  ForkResult,
  Type.Null(),
]);

const ReceiptIdentity = {
  commandId: Uuid,
  conversationId: PiId,
  gatewayId: Type.Optional(Uuid),
  payloadHash: Sha256,
  acceptedAt: Timestamp,
  updatedAt: Timestamp,
};
const completedReceipt = <const CommandType extends string>(type: CommandType, result: TSchema) => responseVariant({
  ...ReceiptIdentity,
  type: Type.Literal(type),
  state: Type.Literal("completed"),
  settledAt: Timestamp,
  result,
}, ["problem"]);
const completedWithoutResult = [
  "prompt",
  "steer",
  "follow_up",
  "abort",
  "set_thinking_level",
  "set_steering_mode",
  "set_follow_up_mode",
  "set_auto_compaction",
  "set_auto_retry",
  "abort_retry",
  "abort_bash",
  "set_session_name",
  "reload",
] as const;
export const CommandReceipt = Type.Union([
  responseVariant({
    ...ReceiptIdentity,
    type: enumeration(commandTypeValues),
    state: enumeration(["accepted", "running"] as const),
  }, ["settledAt", "result", "problem"]),
  responseVariant({
    ...ReceiptIdentity,
    type: enumeration(commandTypeValues),
    state: enumeration(["failed", "interrupted"] as const),
    settledAt: Timestamp,
    problem: ProblemDetails,
  }, ["result"]),
  responseVariant({
    ...ReceiptIdentity,
    type: enumeration(completedWithoutResult),
    state: Type.Literal("completed"),
    settledAt: Timestamp,
  }, ["result", "problem"]),
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

export const CreateConversationResponse = responseObject({
  conversation: Conversation,
  receipt: CommandReceipt,
});
export const DialogResponse = Type.Union([
  strictObject({ type: Type.Literal("value"), value: Type.String() }),
  strictObject({ type: Type.Literal("confirmation"), confirmed: Type.Boolean() }),
  strictObject({ type: Type.Literal("cancelled") }),
]);
