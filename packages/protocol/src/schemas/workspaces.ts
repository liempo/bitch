import { Type } from "typebox";
import {
  SafePathSegment,
  Timestamp,
  Uuid,
  enumeration,
  nullable,
  responseObject,
  strictObject,
} from "./common.js";

const RepositoryUrl = Type.String({
  minLength: 1,
  pattern: "^(?:https://(?:\\[[0-9A-Fa-f:]+\\]|[^/@:?#\\s]+)(?::[0-9]+)?(?:/[^\\s?#]*)?|ssh://(?:[A-Za-z0-9._-]+@)?(?:\\[[0-9A-Fa-f:]+\\]|[^/@:?#\\s]+)(?::[0-9]+)?/[^\\s?#]+|(?!(?:https?|ssh)://)(?:[A-Za-z0-9._-]+@)?[^/:@?#\\s]+:[^/\\s?#][^\\s?#]*)$",
});

export const Workspace = responseObject({
  workspaceId: Uuid,
  gatewayId: Uuid,
  directoryName: SafePathSegment,
  displayName: Type.String(),
  isDefault: Type.Boolean(),
  gitState: enumeration(["none", "initialized", "cloned"] as const),
  createdAt: Timestamp,
  activityAt: Timestamp,
  trashedAt: nullable(Timestamp),
  state: enumeration(["active", "trashed", "missing"] as const),
  activeConversationCount: Type.Integer({ minimum: 0 }),
  totalConversationCount: Type.Integer({ minimum: 0 }),
});
export const CreateWorkspaceRequest = Type.Union([
  strictObject({
    type: Type.Literal("empty"),
    directoryName: SafePathSegment,
    displayName: Type.Optional(Type.String()),
  }),
  strictObject({
    type: Type.Literal("git"),
    directoryName: SafePathSegment,
    displayName: Type.Optional(Type.String()),
  }),
  strictObject({
    type: Type.Literal("clone"),
    directoryName: SafePathSegment,
    repositoryUrl: RepositoryUrl,
    displayName: Type.Optional(Type.String()),
  }),
]);
export const UpdateWorkspaceRequest = strictObject({ displayName: Type.String({ minLength: 1 }) });

const Cursor = Type.String({ minLength: 1, pattern: "^[A-Za-z0-9_-]+$" });
export const WorkspacePage = responseObject({
  items: Type.Array(Workspace),
  nextCursor: nullable(Cursor),
  revision: Type.String({ minLength: 1 }),
});
