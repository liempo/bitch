import type { SchemaName, SchemaType } from "../../src/index.js";

type IsNever<Value> = [Value] extends [never] ? true : false;
type AssertFalse<Value extends false> = Value;
type AssertNever<Value extends never> = Value;
type NeverSchemaNames = {
  [Name in SchemaName]: IsNever<SchemaType<Name>> extends true ? Name : never;
}[SchemaName];
type _NoSchemaIsNever = AssertNever<NeverSchemaNames>;

type ThinkingLevelDto = SchemaType<"ThinkingLevel">;
type ConversationEventDto = SchemaType<"ConversationEvent">;
type GatewayEventDto = SchemaType<"GatewayEvent">;
type _ThinkingLevelIsUsable = AssertFalse<IsNever<ThinkingLevelDto>>;
type _ConversationEventIsUsable = AssertFalse<IsNever<ConversationEventDto>>;
type _GatewayEventIsUsable = AssertFalse<IsNever<GatewayEventDto>>;

const level: ThinkingLevelDto = "high";
const conversationEvent: ConversationEventDto = {
  streamId: "550e8400-e29b-41d4-a716-446655440005",
  sequence: 0,
  conversationId: "conversation",
  emittedAt: "2026-01-01T00:00:00.000Z",
  type: "agent.start",
  data: {},
};
const gatewayEvent: GatewayEventDto = {
  streamId: "550e8400-e29b-41d4-a716-446655440007",
  sequence: 0,
  gatewayId: "550e8400-e29b-41d4-a716-446655440000",
  emittedAt: "2026-01-01T00:00:00.000Z",
  type: "conversation.removed",
  data: { conversationId: "conversation" },
};

// @ts-expect-error The enum must reject unknown values.
const invalidLevel: ThinkingLevelDto = "unknown";
type ConversationEventType = ConversationEventDto["type"];
// @ts-expect-error The event union must reject unknown discriminators.
const invalidConversationEventType: ConversationEventType = "not.a.real.event";

void level;
void conversationEvent;
void gatewayEvent;
void invalidLevel;
void invalidConversationEventType;
export type {
  _ConversationEventIsUsable,
  _GatewayEventIsUsable,
  _NoSchemaIsNever,
  _ThinkingLevelIsUsable,
};
