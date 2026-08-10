import { Type } from "typebox";
import {
  ProblemDetails,
  Uuid,
  enumeration,
  responseObject,
  responseVariant,
  strictObject,
} from "./common.js";

export const ModelSummary = responseObject({
  provider: Type.String({ minLength: 1 }),
  modelId: Type.String({ minLength: 1 }),
  name: Type.String({ minLength: 1 }),
  reasoning: Type.Boolean(),
  input: Type.Array(enumeration(["text", "image"] as const), { uniqueItems: true }),
  contextWindow: Type.Integer({ minimum: 1 }),
  maxTokens: Type.Integer({ minimum: 1 }),
});
export const ProviderAuthType = enumeration(["api_key", "oauth"] as const);
export const ProviderSummary = responseObject({
  providerId: Type.String({ minLength: 1 }),
  name: Type.String({ minLength: 1 }),
  authentication: Type.Array(ProviderAuthType, { uniqueItems: true }),
  status: enumeration(["authenticated", "unauthenticated", "expired"] as const),
});
export const ModelsResult = responseObject({ models: Type.Array(ModelSummary) });
export const ProvidersResult = responseObject({ providers: Type.Array(ProviderSummary) });

const ProviderLoginStart = strictObject({ type: Type.Literal("start"), authType: ProviderAuthType });
const ProviderLoginPoll = strictObject({
  type: Type.Literal("poll"),
  operationId: Uuid,
  afterSequence: Type.Integer({ minimum: 0 }),
});
const ProviderLoginValue = strictObject({
  type: Type.Literal("value"),
  operationId: Uuid,
  promptId: Uuid,
  value: Type.String(),
});
const ProviderLoginCancel = strictObject({ type: Type.Literal("cancel"), operationId: Uuid });
export const ProviderLoginRequest = Type.Union([
  ProviderLoginStart,
  ProviderLoginPoll,
  ProviderLoginValue,
  ProviderLoginCancel,
]);

const ProviderPromptText = responseVariant({
  promptId: Uuid,
  type: enumeration(["text", "secret", "manual_code"] as const),
  message: Type.String(),
  placeholder: Type.Optional(Type.String()),
}, ["options"]);
const ProviderPromptSelect = responseVariant({
  promptId: Uuid,
  type: Type.Literal("select"),
  message: Type.String(),
  options: Type.Array(responseObject({
    id: Type.String({ minLength: 1 }),
    label: Type.String(),
    description: Type.Optional(Type.String()),
  })),
}, ["placeholder"]);
export const ProviderAuthPrompt = Type.Union([ProviderPromptText, ProviderPromptSelect]);

const ProviderNotificationInfo = responseVariant({
  sequence: Type.Integer({ minimum: 1 }),
  type: Type.Literal("info"),
  message: Type.String(),
  links: Type.Optional(Type.Array(responseObject({
    url: Type.String({ format: "uri" }),
    label: Type.Optional(Type.String()),
  }))),
}, ["url", "instructions", "userCode", "verificationUri", "intervalSeconds", "expiresInSeconds"]);
const ProviderNotificationAuthUrl = responseVariant({
  sequence: Type.Integer({ minimum: 1 }),
  type: Type.Literal("auth_url"),
  url: Type.String({ format: "uri" }),
  instructions: Type.Optional(Type.String()),
}, ["message", "links", "userCode", "verificationUri", "intervalSeconds", "expiresInSeconds"]);
const ProviderNotificationDeviceCode = responseVariant({
  sequence: Type.Integer({ minimum: 1 }),
  type: Type.Literal("device_code"),
  userCode: Type.String(),
  verificationUri: Type.String({ format: "uri" }),
  intervalSeconds: Type.Optional(Type.Integer({ minimum: 1 })),
  expiresInSeconds: Type.Optional(Type.Integer({ minimum: 1 })),
}, ["message", "links", "url", "instructions"]);
const ProviderNotificationProgress = responseVariant({
  sequence: Type.Integer({ minimum: 1 }),
  type: Type.Literal("progress"),
  message: Type.String(),
}, ["links", "url", "instructions", "userCode", "verificationUri", "intervalSeconds", "expiresInSeconds"]);
export const ProviderAuthNotification = Type.Union([
  ProviderNotificationInfo,
  ProviderNotificationAuthUrl,
  ProviderNotificationDeviceCode,
  ProviderNotificationProgress,
]);

const ProviderLoginResultBase = {
  operationId: Uuid,
  providerId: Type.String({ minLength: 1 }),
  authType: ProviderAuthType,
  sequence: Type.Integer({ minimum: 0 }),
  notifications: Type.Array(ProviderAuthNotification),
};
export const ProviderLoginResult = Type.Union([
  responseVariant({ ...ProviderLoginResultBase, state: Type.Literal("running") }, ["prompt", "provider", "problem"]),
  responseVariant({ ...ProviderLoginResultBase, state: Type.Literal("needsInput"), prompt: ProviderAuthPrompt }, ["provider", "problem"]),
  responseVariant({ ...ProviderLoginResultBase, state: Type.Literal("completed"), provider: ProviderSummary }, ["prompt", "problem"]),
  responseVariant({ ...ProviderLoginResultBase, state: Type.Literal("failed"), problem: ProblemDetails }, ["prompt", "provider"]),
  responseVariant({ ...ProviderLoginResultBase, state: Type.Literal("cancelled") }, ["prompt", "provider", "problem"]),
]);
