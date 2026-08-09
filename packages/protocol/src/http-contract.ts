import type { SchemaName } from "./schemas.js";

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";
export interface HttpOperation {
  operationId: string;
  method: HttpMethod;
  path: string;
  requestSchema?: SchemaName | "binary";
  requestFixture?: string;
  successStatus: number;
  responseSchema?: SchemaName | "binary";
  responseFixture?: string;
  responseMediaType?: "application/json" | "application/octet-stream" | "text/event-stream" | "dynamic";
}

export const httpOperations: readonly HttpOperation[] = [
  { operationId: "healthLive", method: "get", path: "/health/live", successStatus: 200, responseSchema: "HealthResult", responseFixture: "health.live" },
  { operationId: "healthReady", method: "get", path: "/health/ready", successStatus: 200, responseSchema: "HealthResult", responseFixture: "health.ready" },
  { operationId: "status", method: "get", path: "/v1/status", successStatus: 200, responseSchema: "StatusResult", responseFixture: "status.gateway" },
  { operationId: "createConversation", method: "post", path: "/v1/conversations", requestSchema: "CreateConversationRequest", requestFixture: "requests.createConversation", successStatus: 201, responseSchema: "CreateConversationResponse", responseFixture: "responses.createConversation" },
  { operationId: "listConversations", method: "get", path: "/v1/conversations", successStatus: 200, responseSchema: "ConversationPage", responseFixture: "responses.conversationPage" },
  { operationId: "getConversation", method: "get", path: "/v1/conversations/{conversationId}", successStatus: 200, responseSchema: "Conversation", responseFixture: "responses.conversation" },
  { operationId: "markConversationViewed", method: "post", path: "/v1/conversations/{conversationId}/viewed", requestSchema: "EmptyRequest", requestFixture: "requests.emptyMutation", successStatus: 200, responseSchema: "Conversation", responseFixture: "responses.conversation" },
  { operationId: "trashConversation", method: "post", path: "/v1/conversations/{conversationId}/trash", requestSchema: "EmptyRequest", requestFixture: "requests.emptyMutation", successStatus: 200, responseSchema: "Conversation", responseFixture: "responses.conversation" },
  { operationId: "restoreConversation", method: "post", path: "/v1/conversations/{conversationId}/restore", requestSchema: "EmptyRequest", requestFixture: "requests.emptyMutation", successStatus: 200, responseSchema: "Conversation", responseFixture: "responses.conversation" },
  { operationId: "deleteConversation", method: "delete", path: "/v1/conversations/{conversationId}", successStatus: 204 },
  { operationId: "getConversationState", method: "get", path: "/v1/conversations/{conversationId}/state", successStatus: 200, responseSchema: "ConversationState", responseFixture: "responses.state" },
  { operationId: "getConversationMessages", method: "get", path: "/v1/conversations/{conversationId}/messages", successStatus: 200, responseSchema: "MessagesResult", responseFixture: "responses.messages" },
  { operationId: "getConversationStats", method: "get", path: "/v1/conversations/{conversationId}/stats", successStatus: 200, responseSchema: "SessionStats", responseFixture: "pi.sessionStats" },
  { operationId: "getConversationEntries", method: "get", path: "/v1/conversations/{conversationId}/entries", successStatus: 200, responseSchema: "EntriesResult", responseFixture: "responses.entries" },
  { operationId: "getConversationTree", method: "get", path: "/v1/conversations/{conversationId}/tree", successStatus: 200, responseSchema: "TreeResult", responseFixture: "responses.tree" },
  { operationId: "getForkMessages", method: "get", path: "/v1/conversations/{conversationId}/fork-messages", successStatus: 200, responseSchema: "ForkMessagesResult", responseFixture: "responses.forkMessages" },
  { operationId: "getLastAssistant", method: "get", path: "/v1/conversations/{conversationId}/last-assistant", successStatus: 200, responseSchema: "LastAssistantResult", responseFixture: "responses.lastAssistant" },
  { operationId: "getConversationCommands", method: "get", path: "/v1/conversations/{conversationId}/commands", successStatus: 200, responseSchema: "CommandsResult", responseFixture: "responses.commands" },
  { operationId: "getThinkingLevels", method: "get", path: "/v1/conversations/{conversationId}/thinking-levels", successStatus: 200, responseSchema: "ThinkingLevelsResult", responseFixture: "responses.thinkingLevels" },
  { operationId: "submitConversationCommand", method: "post", path: "/v1/conversations/{conversationId}/commands", requestSchema: "ConversationCommand", requestFixture: "commands.prompt", successStatus: 202, responseSchema: "CommandReceipt", responseFixture: "receipts.accepted" },
  { operationId: "getCommandReceipt", method: "get", path: "/v1/conversations/{conversationId}/commands/{commandId}", successStatus: 200, responseSchema: "CommandReceipt", responseFixture: "receipts.prompt" },
  { operationId: "conversationEvents", method: "get", path: "/v1/conversations/{conversationId}/events", successStatus: 200, responseSchema: "ConversationEvent", responseFixture: "conversationEvents.conversation.snapshot", responseMediaType: "text/event-stream" },
  { operationId: "respondToDialog", method: "post", path: "/v1/conversations/{conversationId}/dialogs/{dialogId}/response", requestSchema: "DialogResponse", requestFixture: "dialogs.value", successStatus: 200, responseSchema: "CommandReceipt", responseFixture: "receipts.running" },
  { operationId: "listModels", method: "get", path: "/v1/models", successStatus: 200, responseSchema: "ModelsResult", responseFixture: "responses.models" },
  { operationId: "listProviders", method: "get", path: "/v1/providers", successStatus: 200, responseSchema: "ProvidersResult", responseFixture: "responses.providers" },
  { operationId: "providerLogin", method: "post", path: "/v1/providers/{providerId}/login", requestSchema: "ProviderLoginRequest", requestFixture: "requests.providerLoginStart", successStatus: 202, responseSchema: "ProviderLoginResult", responseFixture: "providerLoginResults.running" },
  { operationId: "providerLogout", method: "post", path: "/v1/providers/{providerId}/logout", requestSchema: "EmptyRequest", requestFixture: "requests.emptyMutation", successStatus: 200, responseSchema: "ProviderSummary", responseFixture: "responses.providerSummary" },
  { operationId: "gatewayEvents", method: "get", path: "/v1/events", successStatus: 200, responseSchema: "GatewayEvent", responseFixture: "gatewayEvents.gateway.snapshot", responseMediaType: "text/event-stream" },
  { operationId: "createWorkspace", method: "post", path: "/v1/workspaces", requestSchema: "CreateWorkspaceRequest", requestFixture: "requests.workspaceEmpty", successStatus: 201, responseSchema: "Workspace", responseFixture: "responses.workspace" },
  { operationId: "listWorkspaces", method: "get", path: "/v1/workspaces", successStatus: 200, responseSchema: "WorkspacePage", responseFixture: "responses.workspacePage" },
  { operationId: "getWorkspace", method: "get", path: "/v1/workspaces/{workspaceId}", successStatus: 200, responseSchema: "Workspace", responseFixture: "responses.workspace" },
  { operationId: "updateWorkspace", method: "patch", path: "/v1/workspaces/{workspaceId}", requestSchema: "UpdateWorkspaceRequest", requestFixture: "requests.workspaceUpdate", successStatus: 200, responseSchema: "Workspace", responseFixture: "responses.workspace" },
  { operationId: "trashWorkspace", method: "post", path: "/v1/workspaces/{workspaceId}/trash", requestSchema: "EmptyRequest", requestFixture: "requests.emptyMutation", successStatus: 200, responseSchema: "Workspace", responseFixture: "responses.workspace" },
  { operationId: "restoreWorkspace", method: "post", path: "/v1/workspaces/{workspaceId}/restore", requestSchema: "EmptyRequest", requestFixture: "requests.emptyMutation", successStatus: 200, responseSchema: "Workspace", responseFixture: "responses.workspace" },
  { operationId: "deleteWorkspace", method: "delete", path: "/v1/workspaces/{workspaceId}", successStatus: 204 },
  { operationId: "listTrashedConversations", method: "get", path: "/v1/trash/conversations", successStatus: 200, responseSchema: "ConversationPage", responseFixture: "responses.conversationPage" },
  { operationId: "listTrashedWorkspaces", method: "get", path: "/v1/trash/workspaces", successStatus: 200, responseSchema: "WorkspacePage", responseFixture: "responses.workspacePage" },
  { operationId: "getSoul", method: "get", path: "/v1/config/soul", successStatus: 200, responseSchema: "binary", responseFixture: "binary.soul", responseMediaType: "application/octet-stream" },
  { operationId: "createSoul", method: "put", path: "/v1/config/soul", requestSchema: "binary", requestFixture: "binary.soul", successStatus: 201, responseSchema: "SoulDescriptor", responseFixture: "responses.soul" },
  { operationId: "downloadArtifact", method: "get", path: "/v1/artifacts/{artifactId}", successStatus: 200, responseSchema: "binary", responseFixture: "binary.artifact", responseMediaType: "dynamic" },
  { operationId: "deleteArtifact", method: "delete", path: "/v1/artifacts/{artifactId}", successStatus: 204 },
] as const;
