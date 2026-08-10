import { Type, type TProperties, type TSchema, type TSchemaOptions } from "typebox";

export const strictObject = <P extends TProperties>(properties: P, options: TSchemaOptions = {}) =>
  Type.Object(properties, { additionalProperties: false, ...options });

export const responseObject = <P extends TProperties>(properties: P, options: TSchemaOptions = {}) =>
  Type.Object(properties, { additionalProperties: true, ...options });

export const responseVariant = <P extends TProperties>(properties: P, forbiddenProperties: readonly string[]) =>
  responseObject(properties, forbiddenProperties.length === 0 ? {} : {
    not: {
      anyOf: forbiddenProperties.map((property) => ({ required: [property] })),
    },
  });

export const nullable = <T extends TSchema>(schema: T) => Type.Union([schema, Type.Null()]);

export const enumeration = <const Values extends [string, ...string[]]>(values: readonly [...Values]) =>
  Type.Enum(values);

export const Timestamp = Type.String({
  format: "date-time",
  pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\\.[0-9]{3}Z$",
});
export const Uuid = Type.String({
  format: "uuid",
  pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
});
export const PiId = Type.String({ minLength: 1 });
export const Sha256 = Type.String({ pattern: "^[0-9a-f]{64}$" });
export const SafePathSegment = Type.String({
  minLength: 1,
  pattern: "^(?!\\.\\.?$)[^/\\\\\\u0000]+$",
});
export const ThinkingLevel = enumeration(["off", "minimal", "low", "medium", "high", "xhigh", "max"] as const);
export const ConversationStatus = enumeration(["idle", "working", "needsInput", "failed", "stopped"] as const);
export const QueueMode = enumeration(["all", "one-at-a-time"] as const);

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
export const JsonObject = Type.Record(Type.String(), JsonValue);

export const EmptyRequest = strictObject({});
export const HealthResult = responseObject({
  status: enumeration(["live", "ready", "notReady"] as const),
  code: Type.Optional(Type.String()),
});
export const ProtocolVersion = responseObject({
  major: Type.Integer({ minimum: 1 }),
  minor: Type.Integer({ minimum: 0 }),
});

export const commonCapabilities = Object.freeze([
  "attachment.image.v1",
  "conversation.commands.v1",
  "conversation.events.v1",
  "conversation.multi-client.v1",
  "conversation.reconciliation.v1",
  "conversation.reload.v1",
  "extension.rpc-ui.v1",
  "pi.rpc.v1",
  "provider.auth.v1",
  "session.branching.v1",
  "session.export-html.v1",
  "settings.v1",
  "shell.rpc.v1",
] as const);
export const directoryCapabilities = Object.freeze([
  ...commonCapabilities,
  "directory.fixed-cwd.v1",
  "directory.project-trust.v1",
].sort());
export const gatewayCapabilities = Object.freeze([
  ...commonCapabilities,
  "config.soul.v1",
  "gateway.events.v1",
  "gateway.global-view-state.v1",
  "gateway.identity.v1",
  "gateway.trash.v1",
  "gateway.workspaces.v1",
].sort());

const statusIdentity = {
  serverVersion: Type.String({ minLength: 1 }),
  protocolVersion: ProtocolVersion,
  piVersion: Type.Literal("0.83.0"),
  capabilities: Type.Array(Type.String({ minLength: 1 }), { uniqueItems: true }),
};
export const StatusResult = Type.Union([
  responseVariant({ ...statusIdentity, mode: Type.Literal("directory") }, ["gatewayId"]),
  responseObject({ ...statusIdentity, mode: Type.Literal("gateway"), gatewayId: Uuid }),
]);

export const ValidationIssue = responseObject({
  path: Type.String(),
  code: Type.String(),
  message: Type.String(),
});
export const ProblemDetails = responseObject({
  type: Type.String({ format: "uri", minLength: 1 }),
  title: Type.String({ minLength: 1 }),
  status: Type.Integer({ minimum: 400, maximum: 599 }),
  detail: Type.String({ minLength: 1 }),
  instance: Type.Optional(Type.String({ format: "uri-reference" })),
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
export const DirectoryConversationRef = responseVariant({ conversationId: PiId }, ["gatewayId"]);
export const ConversationRef = Type.Union([GatewayConversationRef, DirectoryConversationRef]);
export const GatewayWorkspaceRef = responseObject({ gatewayId: Uuid, workspaceId: Uuid });
