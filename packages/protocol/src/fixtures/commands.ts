import { canonicalPayloadHash } from "../receipts/payload-hash.js";
import { fixture } from "./types.js";
import {
  ARTIFACT_ID,
  COMMAND_ID,
  CONVERSATION_ID,
  GATEWAY_ID,
  LATER,
  NOW,
  TARGET_CONVERSATION_ID,
  commandProblem,
  imageInput,
  model,
} from "./shared.js";
import { bashResult, compactionResult } from "./pi.js";

export const commandPayloads = {
  prompt: { message: "Validate fixtures", images: [imageInput], streamingBehavior: "steer" },
  steer: { message: "Steer", images: [] },
  follow_up: { message: "Follow up", images: [] },
  abort: {},
  new_session: { parentConversationId: CONVERSATION_ID },
  set_model: { provider: "scripted", modelId: "fixture-model" },
  cycle_model: {},
  set_thinking_level: { level: "high" },
  cycle_thinking_level: {},
  set_steering_mode: { mode: "all" },
  set_follow_up_mode: { mode: "one-at-a-time" },
  compact: { customInstructions: "Keep decisions" },
  set_auto_compaction: { enabled: true },
  set_auto_retry: { enabled: true },
  abort_retry: {},
  bash: { command: "printf fixture", excludeFromContext: false },
  abort_bash: {},
  export_html: {},
  switch_session: { targetConversationId: TARGET_CONVERSATION_ID },
  fork: { entryId: "entry0001" },
  clone: {},
  set_session_name: { name: "Fixture session" },
  reload: {},
} as const;
export type CommandType = keyof typeof commandPayloads;

export const commandFixtures = Object.fromEntries(
  Object.entries(commandPayloads).map(([type, payload]) => [
    type,
    fixture("ConversationCommand", { commandId: COMMAND_ID, type, payload }),
  ]),
);

export const gatewayConversationRef = {
  gatewayId: GATEWAY_ID,
  conversationId: TARGET_CONVERSATION_ID,
};
export const directoryConversationRef = { conversationId: TARGET_CONVERSATION_ID };
export const modelCycleResult = { model, thinkingLevel: "high", isScoped: true };
export const thinkingCycleResult = { level: "high" };
export const sessionChangeResults = {
  cancelled: { cancelled: true },
  gateway: { cancelled: false, target: gatewayConversationRef },
  directory: { cancelled: false, target: directoryConversationRef },
};
export const forkResults = {
  cancelled: { cancelled: true, text: "Selected text" },
  gateway: { cancelled: false, target: gatewayConversationRef, text: "Selected text" },
  directory: { cancelled: false, target: directoryConversationRef },
};
export const gatewayArtifact = {
  artifactId: ARTIFACT_ID,
  conversationId: CONVERSATION_ID,
  gatewayId: GATEWAY_ID,
  fileName: "conversation.html",
  mediaType: "text/html",
  byteCount: 21,
  createdAt: LATER,
  downloadUrl: `/v1/artifacts/${ARTIFACT_ID}`,
};
export const directoryArtifact = {
  artifactId: ARTIFACT_ID,
  conversationId: CONVERSATION_ID,
  fileName: "conversation.html",
  mediaType: "text/html",
  byteCount: 21,
  createdAt: LATER,
  downloadUrl: `/v1/artifacts/${ARTIFACT_ID}`,
};

const commandResults: Partial<Record<CommandType, unknown>> = {
  new_session: sessionChangeResults.gateway,
  set_model: model,
  cycle_model: modelCycleResult,
  cycle_thinking_level: thinkingCycleResult,
  compact: compactionResult,
  bash: bashResult,
  export_html: gatewayArtifact,
  switch_session: sessionChangeResults.gateway,
  fork: forkResults.gateway,
  clone: sessionChangeResults.gateway,
};

function receiptIdentity(type: CommandType, gateway = true) {
  return {
    commandId: COMMAND_ID,
    conversationId: CONVERSATION_ID,
    ...(gateway ? { gatewayId: GATEWAY_ID } : {}),
    type,
    payloadHash: canonicalPayloadHash(commandPayloads[type]),
    acceptedAt: NOW,
    updatedAt: NOW,
  };
}

export const acceptedReceipt = { ...receiptIdentity("prompt"), state: "accepted" };
export const directoryAcceptedReceipt = { ...receiptIdentity("prompt", false), state: "accepted" };
export const runningReceipt = { ...receiptIdentity("prompt"), state: "running", updatedAt: LATER };
export const failedReceipt = {
  ...receiptIdentity("prompt"),
  state: "failed",
  updatedAt: LATER,
  settledAt: LATER,
  problem: commandProblem,
};
export const interruptedReceipt = {
  ...receiptIdentity("prompt"),
  state: "interrupted",
  updatedAt: LATER,
  settledAt: LATER,
  problem: {
    ...commandProblem,
    code: "server_restarted",
    title: "Command interrupted",
    detail: "The Agent Server restarted. Send a new command to continue.",
    retryable: false,
  },
};

function completedReceipt(type: CommandType, result: unknown = commandResults[type], gateway = true) {
  return {
    ...receiptIdentity(type, gateway),
    state: "completed",
    updatedAt: LATER,
    settledAt: LATER,
    ...(result === undefined ? {} : { result }),
  };
}

export const commandReceiptFixtures = Object.fromEntries(
  (Object.keys(commandPayloads) as CommandType[]).map((type) => [
    type,
    fixture("CommandReceipt", completedReceipt(type)),
  ]),
);
export const alternateReceiptFixtures = {
  "accepted.directory": fixture("CommandReceipt", directoryAcceptedReceipt),
  "new_session.cancelled": fixture("CommandReceipt", completedReceipt("new_session", sessionChangeResults.cancelled)),
  "new_session.directory": fixture("CommandReceipt", completedReceipt("new_session", sessionChangeResults.directory, false)),
  "cycle_model.null": fixture("CommandReceipt", completedReceipt("cycle_model", null)),
  "cycle_thinking_level.null": fixture("CommandReceipt", completedReceipt("cycle_thinking_level", null)),
  "switch_session.cancelled": fixture("CommandReceipt", completedReceipt("switch_session", sessionChangeResults.cancelled)),
  "switch_session.directory": fixture("CommandReceipt", completedReceipt("switch_session", sessionChangeResults.directory, false)),
  "fork.cancelled": fixture("CommandReceipt", completedReceipt("fork", forkResults.cancelled)),
  "fork.directory": fixture("CommandReceipt", completedReceipt("fork", forkResults.directory, false)),
  "clone.cancelled": fixture("CommandReceipt", completedReceipt("clone", sessionChangeResults.cancelled)),
  "clone.directory": fixture("CommandReceipt", completedReceipt("clone", sessionChangeResults.directory, false)),
  "export_html.directory": fixture("CommandReceipt", completedReceipt("export_html", directoryArtifact, false)),
};

export const receiptFixtures = {
  accepted: fixture("CommandReceipt", acceptedReceipt),
  running: fixture("CommandReceipt", runningReceipt),
  failed: fixture("CommandReceipt", failedReceipt),
  interrupted: fixture("CommandReceipt", interruptedReceipt),
  ...commandReceiptFixtures,
  ...alternateReceiptFixtures,
};
