import { Type } from "typebox";
import {
  PiId,
  SafePathSegment,
  Sha256,
  Timestamp,
  Uuid,
  responseObject,
  responseVariant,
  strictObject,
} from "./common.js";

const ArtifactPath = Type.String({
  pattern: "^/v1/artifacts/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
});
const ArtifactProjection = {
  artifactId: Uuid,
  conversationId: PiId,
  fileName: SafePathSegment,
  mediaType: Type.String({ minLength: 1 }),
  byteCount: Type.Integer({ minimum: 0 }),
  createdAt: Timestamp,
  downloadUrl: ArtifactPath,
};
export const ArtifactDescriptor = Type.Union([
  responseObject({ ...ArtifactProjection, gatewayId: Uuid }),
  responseVariant(ArtifactProjection, ["gatewayId"]),
]);

export const SoulDescriptor = responseObject({
  byteCount: Type.Integer({ minimum: 0 }),
  sha256: Sha256,
  etag: Type.String({ pattern: '^"sha256:[0-9a-f]{64}"$' }),
});
export const BinaryHttpBodyFixture = strictObject({
  mediaType: Type.String({ minLength: 1 }),
  bodyBase64: Type.String({
    pattern: "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$",
  }),
  byteCount: Type.Integer({ minimum: 0 }),
  sha256: Type.Optional(Sha256),
});
export const SseHeartbeatFixture = strictObject({
  wire: Type.String({ pattern: "^: [^\\r\\n]+\\n\\n$" }),
  consumesSequence: Type.Literal(false),
});
