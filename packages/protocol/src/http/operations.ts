import { commandTypes } from "../schemas/registry.js";
import { conversationEventTypes, gatewayEventTypes } from "../schemas/events.js";
import type {
  HttpBodyContract,
  HttpOperation,
  HttpParameter,
  HttpResponseContract,
  HttpSchemaReference,
} from "./types.js";

const body = (
  schema: HttpSchemaReference,
  fixtures: readonly string[],
  mediaType: HttpBodyContract["mediaType"] = schema === "binary" ? "application/octet-stream" : "application/json",
): HttpBodyContract => ({ schema, fixtures, mediaType });
const response = (
  status: number,
  description: string,
  responseBody?: HttpBodyContract,
  headers?: HttpResponseContract["headers"],
): HttpResponseContract => ({
  status,
  description,
  ...(responseBody ? { body: responseBody } : {}),
  ...(headers ? { headers } : {}),
});
const jsonResponse = (
  status: number,
  schema: Exclude<HttpSchemaReference, "binary">,
  fixtures: readonly string[],
  description = "Success",
) => response(status, description, body(schema, fixtures));
const v1 = (operation: Omit<HttpOperation, "problemFixture">): HttpOperation => ({
  ...operation,
  problemFixture: "responses.problem",
});

const paginationParameters: readonly HttpParameter[] = [
  {
    name: "limit",
    in: "query",
    required: false,
    schema: { type: "integer", minimum: 1, maximum: 200, default: 50 },
    example: 50,
  },
  {
    name: "cursor",
    in: "query",
    required: false,
    schema: { type: "string", minLength: 1, pattern: "^[A-Za-z0-9_-]+$" },
    example: "eyJyZXZpc2lvbiI6MX0",
  },
];
const conversationListParameters: readonly HttpParameter[] = [
  ...paginationParameters,
  {
    name: "workspaceId",
    in: "query",
    required: false,
    schema: { type: "string", format: "uuid" },
    example: "550e8400-e29b-41d4-a716-446655440010",
  },
];
const conversationEventParameters: readonly HttpParameter[] = [
  {
    name: "view",
    in: "query",
    required: false,
    schema: { type: "string", enum: ["background", "foreground"], default: "background" },
    example: "foreground",
  },
  {
    name: "Last-Event-ID",
    in: "header",
    required: false,
    schema: { type: "string" },
    example: "550e8400-e29b-41d4-a716-446655440005:0",
    description: "Accepted and ignored because version 1 does not replay transient events.",
  },
];
const soulCreateParameters: readonly HttpParameter[] = [{
  name: "If-None-Match",
  in: "header",
  required: true,
  schema: { type: "string", const: "*" },
  example: "*",
}];

const allCommandFixtures = commandTypes.map((type) => `commands.${type}`);
const allReceiptFixtures = [
  "receipts.accepted",
  "receipts.running",
  "receipts.failed",
  "receipts.interrupted",
  ...commandTypes.map((type) => `receipts.${type}`),
  "receipts.accepted.directory",
  "receipts.new_session.cancelled",
  "receipts.new_session.directory",
  "receipts.cycle_model.null",
  "receipts.cycle_thinking_level.null",
  "receipts.switch_session.cancelled",
  "receipts.switch_session.directory",
  "receipts.fork.cancelled",
  "receipts.fork.directory",
  "receipts.clone.cancelled",
  "receipts.clone.directory",
  "receipts.export_html.directory",
];
const conversationEventFixtures = [
  ...conversationEventTypes.map((type) => `conversationEvents.${type}`),
  "conversationEvents.conversation.snapshot.directory",
  "conversationEvents.conversation.replaced.directory",
  "conversationEvents.summarization.retry.attempt-start.branchSummary",
];
const gatewayEventFixtures = gatewayEventTypes.map((type) => `gatewayEvents.${type}`);

export const httpOperations: readonly HttpOperation[] = [
  {
    operationId: "healthLive",
    method: "get",
    path: "/health/live",
    responses: [jsonResponse(200, "HealthResult", ["health.live"], "Process is live")],
  },
  {
    operationId: "healthReady",
    method: "get",
    path: "/health/ready",
    responses: [
      jsonResponse(200, "HealthResult", ["health.ready"], "Process is ready"),
      jsonResponse(503, "HealthResult", ["health.notReady"], "Process is not ready"),
    ],
  },
  v1({
    operationId: "status",
    method: "get",
    path: "/v1/status",
    responses: [jsonResponse(200, "StatusResult", ["status.gateway", "status.directory"])],
  }),
  v1({
    operationId: "createConversation",
    method: "post",
    path: "/v1/conversations",
    request: body("CreateConversationRequest", ["requests.createConversation", "requests.createDirectoryConversation"]),
    responses: [
      jsonResponse(201, "CreateConversationResponse", ["responses.createConversation"], "Conversation created and first prompt accepted"),
      jsonResponse(202, "CreateConversationResponse", ["responses.createConversationInFlightRetry"], "Matching in-flight creation returned"),
      jsonResponse(200, "CreateConversationResponse", ["responses.createConversationCompletedRetry"], "Matching completed creation returned"),
    ],
  }),
  v1({
    operationId: "listConversations",
    method: "get",
    path: "/v1/conversations",
    parameters: conversationListParameters,
    responses: [jsonResponse(200, "ConversationPage", ["responses.conversationPage", "responses.conversationPageWithCursor"])],
  }),
  v1({
    operationId: "getConversation",
    method: "get",
    path: "/v1/conversations/{conversationId}",
    responses: [jsonResponse(200, "Conversation", ["responses.conversation", "responses.directoryConversation"])],
  }),
  v1({
    operationId: "markConversationViewed",
    method: "post",
    path: "/v1/conversations/{conversationId}/viewed",
    request: body("EmptyRequest", ["requests.emptyMutation"]),
    responses: [jsonResponse(200, "Conversation", ["responses.viewedConversation"])],
  }),
  v1({
    operationId: "trashConversation",
    method: "post",
    path: "/v1/conversations/{conversationId}/trash",
    request: body("EmptyRequest", ["requests.emptyMutation"]),
    responses: [jsonResponse(200, "Conversation", ["responses.trashedConversation"])],
  }),
  v1({
    operationId: "restoreConversation",
    method: "post",
    path: "/v1/conversations/{conversationId}/restore",
    request: body("EmptyRequest", ["requests.emptyMutation"]),
    responses: [jsonResponse(200, "Conversation", ["responses.restoredConversation"])],
  }),
  v1({
    operationId: "deleteConversation",
    method: "delete",
    path: "/v1/conversations/{conversationId}",
    responses: [response(204, "Conversation deleted")],
  }),
  v1({
    operationId: "getConversationState",
    method: "get",
    path: "/v1/conversations/{conversationId}/state",
    responses: [jsonResponse(200, "ConversationState", ["responses.state", "responses.directoryState", "responses.stateWithoutModel"])],
  }),
  v1({
    operationId: "getConversationMessages",
    method: "get",
    path: "/v1/conversations/{conversationId}/messages",
    responses: [jsonResponse(200, "MessagesResult", ["responses.messages"])],
  }),
  v1({
    operationId: "getConversationStats",
    method: "get",
    path: "/v1/conversations/{conversationId}/stats",
    responses: [jsonResponse(200, "SessionStats", ["pi.sessionStats"])],
  }),
  v1({
    operationId: "getConversationEntries",
    method: "get",
    path: "/v1/conversations/{conversationId}/entries",
    parameters: [{
      name: "since",
      in: "query",
      required: false,
      schema: { type: "string", minLength: 1 },
      example: "entry0001",
    }],
    responses: [jsonResponse(200, "EntriesResult", ["responses.entries", "responses.entriesWithoutLeaf"])],
  }),
  v1({
    operationId: "getConversationTree",
    method: "get",
    path: "/v1/conversations/{conversationId}/tree",
    responses: [jsonResponse(200, "TreeResult", ["responses.tree", "responses.treeWithoutLeaf"])],
  }),
  v1({
    operationId: "getForkMessages",
    method: "get",
    path: "/v1/conversations/{conversationId}/fork-messages",
    responses: [jsonResponse(200, "ForkMessagesResult", ["responses.forkMessages"])],
  }),
  v1({
    operationId: "getLastAssistant",
    method: "get",
    path: "/v1/conversations/{conversationId}/last-assistant",
    responses: [jsonResponse(200, "LastAssistantResult", ["responses.lastAssistant", "responses.lastAssistantEmpty"])],
  }),
  v1({
    operationId: "getConversationCommands",
    method: "get",
    path: "/v1/conversations/{conversationId}/commands",
    responses: [jsonResponse(200, "CommandsResult", ["responses.commands"])],
  }),
  v1({
    operationId: "getThinkingLevels",
    method: "get",
    path: "/v1/conversations/{conversationId}/thinking-levels",
    responses: [jsonResponse(200, "ThinkingLevelsResult", ["responses.thinkingLevels"])],
  }),
  v1({
    operationId: "submitConversationCommand",
    method: "post",
    path: "/v1/conversations/{conversationId}/commands",
    request: body("ConversationCommand", allCommandFixtures),
    responses: [
      jsonResponse(202, "CommandReceipt", ["receipts.accepted"], "Command accepted"),
      jsonResponse(200, "CommandReceipt", allReceiptFixtures, "Matching command receipt returned"),
    ],
  }),
  v1({
    operationId: "getCommandReceipt",
    method: "get",
    path: "/v1/conversations/{conversationId}/commands/{commandId}",
    responses: [jsonResponse(200, "CommandReceipt", allReceiptFixtures)],
  }),
  v1({
    operationId: "conversationEvents",
    method: "get",
    path: "/v1/conversations/{conversationId}/events",
    parameters: conversationEventParameters,
    responses: [response(200, "Conversation event stream", body("ConversationEvent", conversationEventFixtures, "text/event-stream"))],
  }),
  v1({
    operationId: "respondToDialog",
    method: "post",
    path: "/v1/conversations/{conversationId}/dialogs/{dialogId}/response",
    request: body("DialogResponse", ["dialogs.value", "dialogs.confirmation", "dialogs.cancelled"]),
    responses: [jsonResponse(200, "CommandReceipt", ["receipts.running"])],
  }),
  v1({
    operationId: "listModels",
    method: "get",
    path: "/v1/models",
    responses: [jsonResponse(200, "ModelsResult", ["responses.models"])],
  }),
  v1({
    operationId: "listProviders",
    method: "get",
    path: "/v1/providers",
    responses: [jsonResponse(200, "ProvidersResult", ["responses.providers"])],
  }),
  v1({
    operationId: "providerLogin",
    method: "post",
    path: "/v1/providers/{providerId}/login",
    request: body("ProviderLoginRequest", [
      "requests.providerLoginStart",
      "requests.providerLoginPoll",
      "requests.providerLoginValue",
      "requests.providerLoginCancel",
    ]),
    responses: [
      jsonResponse(202, "ProviderLoginResult", ["providerLoginResults.running"], "Provider login started"),
      jsonResponse(200, "ProviderLoginResult", [
        "providerLoginResults.running",
        "providerLoginResults.needsInput",
        "providerLoginResults.completed",
        "providerLoginResults.failed",
        "providerLoginResults.cancelled",
      ], "Provider login continued"),
    ],
  }),
  v1({
    operationId: "providerLogout",
    method: "post",
    path: "/v1/providers/{providerId}/logout",
    request: body("EmptyRequest", ["requests.emptyMutation"]),
    responses: [jsonResponse(200, "ProviderSummary", ["responses.providerLoggedOut"])],
  }),
  v1({
    operationId: "gatewayEvents",
    method: "get",
    path: "/v1/events",
    responses: [response(200, "Gateway event stream", body("GatewayEvent", gatewayEventFixtures, "text/event-stream"))],
  }),
  v1({
    operationId: "createWorkspace",
    method: "post",
    path: "/v1/workspaces",
    request: body("CreateWorkspaceRequest", [
      "requests.workspaceEmpty",
      "requests.workspaceGit",
      "requests.workspaceCloneHttps",
      "requests.workspaceCloneSsh",
      "requests.workspaceCloneScp",
    ]),
    responses: [jsonResponse(201, "Workspace", ["responses.createdWorkspace"])],
  }),
  v1({
    operationId: "listWorkspaces",
    method: "get",
    path: "/v1/workspaces",
    parameters: paginationParameters,
    responses: [jsonResponse(200, "WorkspacePage", ["responses.workspacePage", "responses.workspacePageWithCursor"])],
  }),
  v1({
    operationId: "getWorkspace",
    method: "get",
    path: "/v1/workspaces/{workspaceId}",
    responses: [jsonResponse(200, "Workspace", ["responses.workspace"])],
  }),
  v1({
    operationId: "updateWorkspace",
    method: "patch",
    path: "/v1/workspaces/{workspaceId}",
    request: body("UpdateWorkspaceRequest", ["requests.workspaceUpdate"]),
    responses: [jsonResponse(200, "Workspace", ["responses.updatedWorkspace"])],
  }),
  v1({
    operationId: "trashWorkspace",
    method: "post",
    path: "/v1/workspaces/{workspaceId}/trash",
    request: body("EmptyRequest", ["requests.emptyMutation"]),
    responses: [jsonResponse(200, "Workspace", ["responses.trashedWorkspace"])],
  }),
  v1({
    operationId: "restoreWorkspace",
    method: "post",
    path: "/v1/workspaces/{workspaceId}/restore",
    request: body("EmptyRequest", ["requests.emptyMutation"]),
    responses: [jsonResponse(200, "Workspace", ["responses.restoredWorkspace"])],
  }),
  v1({
    operationId: "deleteWorkspace",
    method: "delete",
    path: "/v1/workspaces/{workspaceId}",
    responses: [response(204, "Workspace deleted")],
  }),
  v1({
    operationId: "listTrashedConversations",
    method: "get",
    path: "/v1/trash/conversations",
    parameters: paginationParameters,
    responses: [jsonResponse(200, "ConversationPage", ["responses.trashedConversationPage"])],
  }),
  v1({
    operationId: "listTrashedWorkspaces",
    method: "get",
    path: "/v1/trash/workspaces",
    parameters: paginationParameters,
    responses: [jsonResponse(200, "WorkspacePage", ["responses.trashedWorkspacePage"])],
  }),
  v1({
    operationId: "getSoul",
    method: "get",
    path: "/v1/config/soul",
    responses: [response(200, "SOUL.md bytes", body("binary", ["binary.soul"]), {
      ETag: { required: true, schema: { type: "string", pattern: '^"sha256:[0-9a-f]{64}"$' } },
      "Content-Length": { required: true, schema: { type: "integer", minimum: 0 } },
    })],
  }),
  v1({
    operationId: "createSoul",
    method: "put",
    path: "/v1/config/soul",
    parameters: soulCreateParameters,
    request: body("binary", ["binary.soul"]),
    responses: [jsonResponse(201, "SoulDescriptor", ["responses.soul"])],
  }),
  v1({
    operationId: "downloadArtifact",
    method: "get",
    path: "/v1/artifacts/{artifactId}",
    responses: [response(200, "Artifact bytes", body("binary", ["binary.artifact"], "*/*"), {
      "Content-Length": { required: true, schema: { type: "integer", minimum: 0 } },
    })],
  }),
  v1({
    operationId: "deleteArtifact",
    method: "delete",
    path: "/v1/artifacts/{artifactId}",
    responses: [response(204, "Artifact deleted")],
  }),
];
