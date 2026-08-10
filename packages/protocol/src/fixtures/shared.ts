import { directoryCapabilities, gatewayCapabilities } from "../schemas/common.js";

export const GATEWAY_ID = "550e8400-e29b-41d4-a716-446655440000";
export const WORKSPACE_ID = "550e8400-e29b-41d4-a716-446655440010";
export const CONVERSATION_ID = "0195f6f4-7c5b-7000-8000-000000000001";
export const TARGET_CONVERSATION_ID = "0195f6f4-7c5b-7000-8000-000000000002";
export const COMMAND_ID = "550e8400-e29b-41d4-a716-446655440001";
export const DIALOG_ID = "550e8400-e29b-41d4-a716-446655440002";
export const OPERATION_ID = "550e8400-e29b-41d4-a716-446655440003";
export const ARTIFACT_ID = "550e8400-e29b-41d4-a716-446655440004";
export const STREAM_ID = "550e8400-e29b-41d4-a716-446655440005";
export const GATEWAY_STREAM_ID = "550e8400-e29b-41d4-a716-446655440007";
export const REQUEST_ID = "550e8400-e29b-41d4-a716-446655440006";
export const NOW = "2026-01-01T00:00:00.000Z";
export const LATER = "2026-01-01T00:01:00.000Z";
export const SOUL_HASH = "ce69c359092219c8d560804e8600676b1d34ca72b1e735f35981b1f9b1ea5fda";

export const imageInput = {
  type: "image",
  data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  mimeType: "image/png",
  fileName: "fixture.png",
};
export const model = {
  provider: "scripted",
  modelId: "fixture-model",
  name: "Fixture Model",
  reasoning: true,
  input: ["text", "image"],
  contextWindow: 128000,
  maxTokens: 4096,
};
export const provider = {
  providerId: "scripted",
  name: "Scripted Provider",
  authentication: ["api_key", "oauth"],
  status: "authenticated",
};

export const gatewayConversation = {
  conversationId: CONVERSATION_ID,
  gatewayId: GATEWAY_ID,
  workspaceId: WORKSPACE_ID,
  title: "Validate protocol fixtures",
  cwd: "/data/workspaces/default",
  createdAt: NOW,
  activityAt: LATER,
  viewedAt: null,
  completedAt: null,
  status: "working",
  completedSinceViewed: false,
  trashedAt: null,
  trashReason: null,
  readOnly: false,
};
export const directoryConversation = {
  conversationId: CONVERSATION_ID,
  title: "Validate protocol fixtures",
  cwd: "/work/project",
  createdAt: NOW,
  activityAt: LATER,
  viewedAt: null,
  completedAt: null,
  status: "idle",
  completedSinceViewed: false,
  trashedAt: null,
  trashReason: null,
  readOnly: false,
};
export const gatewayConversationSummary = {
  conversationId: CONVERSATION_ID,
  gatewayId: GATEWAY_ID,
  workspaceId: WORKSPACE_ID,
  title: "Validate protocol fixtures",
  createdAt: NOW,
  activityAt: LATER,
  viewedAt: null,
  completedAt: null,
  status: "working",
  completedSinceViewed: false,
  trashedAt: null,
  trashReason: null,
  readOnly: false,
};
export const directoryConversationSummary = {
  conversationId: CONVERSATION_ID,
  title: "Validate protocol fixtures",
  createdAt: NOW,
  activityAt: LATER,
  viewedAt: null,
  completedAt: null,
  status: "idle",
  completedSinceViewed: false,
  trashedAt: null,
  trashReason: null,
  readOnly: false,
};
export const workspace = {
  workspaceId: WORKSPACE_ID,
  gatewayId: GATEWAY_ID,
  directoryName: "default",
  displayName: "Default",
  isDefault: true,
  gitState: "none",
  createdAt: NOW,
  activityAt: LATER,
  trashedAt: null,
  state: "active",
  activeConversationCount: 1,
  totalConversationCount: 1,
};

export const gatewayStatus = {
  serverVersion: "0.0.0",
  protocolVersion: { major: 1, minor: 0 },
  piVersion: "0.83.0",
  mode: "gateway",
  gatewayId: GATEWAY_ID,
  capabilities: gatewayCapabilities,
};
export const directoryStatus = {
  serverVersion: "0.0.0",
  protocolVersion: { major: 1, minor: 0 },
  piVersion: "0.83.0",
  mode: "directory",
  capabilities: directoryCapabilities,
};

export const validationProblem = {
  type: "https://bitch.invalid/problems/validation_failed",
  title: "Request validation failed",
  status: 400,
  detail: "Correct the listed fields and retry.",
  instance: "/v1/conversations",
  code: "validation_failed",
  requestId: REQUEST_ID,
  retryable: false,
  issues: [{ path: "/message", code: "minLength", message: "Expected a nonempty string." }],
};
export const commandProblem = {
  type: "https://bitch.invalid/problems/model_request_failed",
  title: "Model request failed",
  status: 502,
  detail: "The model request failed. Send a new command to retry.",
  instance: `/v1/conversations/${CONVERSATION_ID}/commands/${COMMAND_ID}`,
  code: "model_request_failed",
  requestId: REQUEST_ID,
  retryable: true,
  gatewayId: GATEWAY_ID,
  conversationId: CONVERSATION_ID,
  commandId: COMMAND_ID,
};
const resourceProblemBase = { requestId: REQUEST_ID, retryable: false };
export const resourceProblems = {
  workspace: {
    ...resourceProblemBase,
    type: "https://bitch.invalid/problems/resource_not_found",
    title: "Workspace not found",
    status: 404,
    detail: "Select an available workspace and retry.",
    instance: `/v1/workspaces/${WORKSPACE_ID}`,
    code: "resource_not_found",
    gatewayId: GATEWAY_ID,
    workspaceId: WORKSPACE_ID,
  },
  artifact: {
    ...resourceProblemBase,
    type: "https://bitch.invalid/problems/resource_not_found",
    title: "Artifact not found",
    status: 404,
    detail: "Create a new export and retry the download.",
    instance: `/v1/artifacts/${ARTIFACT_ID}`,
    code: "resource_not_found",
    gatewayId: GATEWAY_ID,
    artifactId: ARTIFACT_ID,
  },
  dialog: {
    ...resourceProblemBase,
    type: "https://bitch.invalid/problems/dialog_already_resolved",
    title: "Dialog already resolved",
    status: 409,
    detail: "Reload the conversation state before responding again.",
    instance: `/v1/conversations/${CONVERSATION_ID}/dialogs/${DIALOG_ID}/response`,
    code: "dialog_already_resolved",
    gatewayId: GATEWAY_ID,
    conversationId: CONVERSATION_ID,
    dialogId: DIALOG_ID,
  },
};
