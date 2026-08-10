import { describe, expect, it } from "vitest";
import {
  canonicalPayloadHash,
  fixtureCorpus,
  validateFixtureCorpus,
} from "../../src/index.js";

function mutableValue(
  corpus: typeof fixtureCorpus,
  group: string,
  name: string,
): Record<string, unknown> {
  const value = corpus.fixtures[group]?.[name]?.value;
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Fixture ${group}.${name} is not an object.`);
  }
  return value as Record<string, unknown>;
}

const rejectionCases = [
  ["malformed field", (corpus: typeof fixtureCorpus) => {
    mutableValue(corpus, "health", "live").status = 42;
  }],
  ["unknown request field", (corpus: typeof fixtureCorpus) => {
    mutableValue(corpus, "requests", "createConversation").unexpected = true;
  }],
  ["wrong discriminator", (corpus: typeof fixtureCorpus) => {
    mutableValue(corpus, "commands", "prompt").type = "unknown";
  }],
  ["command result for the wrong command type", (corpus: typeof fixtureCorpus) => {
    mutableValue(corpus, "receipts", "set_model").result = mutableValue(corpus, "pi", "bashResult");
  }],
  ["missing command result", (corpus: typeof fixtureCorpus) => {
    delete mutableValue(corpus, "receipts", "set_model").result;
  }],
  ["result on an accepted receipt", (corpus: typeof fixtureCorpus) => {
    mutableValue(corpus, "receipts", "accepted").result = null;
  }],
  ["problem on a running receipt", (corpus: typeof fixtureCorpus) => {
    mutableValue(corpus, "receipts", "running").problem = mutableValue(corpus, "responses", "problem");
  }],
  ["result on a failed receipt", (corpus: typeof fixtureCorpus) => {
    mutableValue(corpus, "receipts", "failed").result = null;
  }],
  ["provider result field in the wrong state", (corpus: typeof fixtureCorpus) => {
    mutableValue(corpus, "providerLoginResults", "running").provider = mutableValue(corpus, "responses", "providerSummary");
  }],
  ["mismatched completed assistant reason", (corpus: typeof fixtureCorpus) => {
    const message = mutableValue(corpus, "assistantEvents", "doneToolUse").message as Record<string, unknown>;
    message.stopReason = "pending";
  }],
  ["mismatched failed assistant reason", (corpus: typeof fixtureCorpus) => {
    const message = mutableValue(corpus, "assistantEvents", "error").error as Record<string, unknown>;
    message.stopReason = "stop";
  }],
  ["gateway status without gateway ID", (corpus: typeof fixtureCorpus) => {
    delete mutableValue(corpus, "status", "gateway").gatewayId;
  }],
  ["directory status with gateway ID", (corpus: typeof fixtureCorpus) => {
    mutableValue(corpus, "status", "directory").gatewayId = "550e8400-e29b-41d4-a716-446655440000";
  }],
  ["invalid calendar timestamp", (corpus: typeof fixtureCorpus) => {
    mutableValue(corpus, "responses", "conversation").createdAt = "2026-99-01T00:00:00.000Z";
  }],
  ["non-object tool-call arguments", (corpus: typeof fixtureCorpus) => {
    mutableValue(corpus, "piDtos", "toolCall").arguments = null;
  }],
  ["leaked gateway session path", (corpus: typeof fixtureCorpus) => {
    mutableValue(corpus, "pi", "bashResult").output = "/data/sessions/private.jsonl";
  }],
  ["leaked Directory-mode session path", (corpus: typeof fixtureCorpus) => {
    mutableValue(corpus, "pi", "bashResult").output = "/bitch/directory/sessions/private.jsonl";
  }],
  ["embedded internal session URI", (corpus: typeof fixtureCorpus) => {
    mutableValue(corpus, "responses", "problem").detail = "See file:///data/sessions/private.jsonl";
  }],
  ["credential-shaped field", (corpus: typeof fixtureCorpus) => {
    mutableValue(corpus, "responses", "providerSummary").apiToken = "credential-value";
  }],
  ["credential-bearing clone URL", (corpus: typeof fixtureCorpus) => {
    mutableValue(corpus, "requests", "workspaceCloneHttps").repositoryUrl = "https://user:password@example.invalid/repository.git";
  }],
  ["workspace directory traversal", (corpus: typeof fixtureCorpus) => {
    mutableValue(corpus, "requests", "workspaceEmpty").directoryName = "..";
  }],
  ["incorrect receipt payload hash", (corpus: typeof fixtureCorpus) => {
    mutableValue(corpus, "receipts", "set_model").payloadHash = canonicalPayloadHash({});
  }],
  ["incomplete status capabilities", (corpus: typeof fixtureCorpus) => {
    const status = mutableValue(corpus, "status", "gateway");
    status.capabilities = (status.capabilities as unknown[]).slice(1);
  }],
  ["incorrect binary byte count", (corpus: typeof fixtureCorpus) => {
    mutableValue(corpus, "binary", "artifact").byteCount = 1;
  }],
  ["missing direct schema fixture", (corpus: typeof fixtureCorpus) => {
    delete corpus.fixtures.liveState?.activeTool;
  }],
  ["missing nested union variant", (corpus: typeof fixtureCorpus) => {
    delete corpus.fixtures.extensionUiEvents?.setTitle;
  }],
] as const;

describe("versioned protocol fixture corpus", () => {
  it("validates every exact fixture through the public corpus validator", () => {
    expect(validateFixtureCorpus(fixtureCorpus)).toEqual([]);
  });

  it.each(rejectionCases)("rejects %s deterministically", (_name, mutate) => {
    const firstCorpus = structuredClone(fixtureCorpus);
    mutate(firstCorpus);
    const secondCorpus = structuredClone(fixtureCorpus);
    mutate(secondCorpus);
    const first = validateFixtureCorpus(firstCorpus);
    const second = validateFixtureCorpus(secondCorpus);
    expect(first.length).toBeGreaterThan(0);
    expect(second).toEqual(first);
  });

  it("accepts unknown additive response fields", () => {
    const corpus = structuredClone(fixtureCorpus);
    mutableValue(corpus, "responses", "conversation").futureProjection = { revision: 2 };
    expect(validateFixtureCorpus(corpus)).toEqual([]);
  });

  it("projects pinned Pi undefined fields as omitted JSON fields", () => {
    const corpus = structuredClone(fixtureCorpus);
    delete mutableValue(corpus, "piMessages", "bashExecution").exitCode;
    delete mutableValue(corpus, "pi", "bashResult").exitCode;
    delete mutableValue(corpus, "piEntries", "label").label;
    expect(validateFixtureCorpus(corpus)).toEqual([]);
  });

  it("rejects null in pinned Pi fields that are optional but not nullable", () => {
    const corpus = structuredClone(fixtureCorpus);
    mutableValue(corpus, "piMessages", "bashExecution").exitCode = null;
    mutableValue(corpus, "pi", "bashResult").exitCode = null;
    mutableValue(corpus, "piEntries", "label").label = null;
    expect(validateFixtureCorpus(corpus).length).toBeGreaterThan(0);
  });

  it("uses RFC 8785 canonical payload hashes", () => {
    expect(canonicalPayloadHash({})).toBe("44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a");
    expect(canonicalPayloadHash({ provider: "scripted", modelId: "fixture-model" }))
      .toBe("c62e555fc02fd1dfbedb6bfff3a51d42552defef6ce28473e04d9d7057395124");
  });

  it("rejects a value that is not valid JSON before hashing", () => {
    expect(() => canonicalPayloadHash(undefined)).toThrow(TypeError);
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(() => canonicalPayloadHash(cyclic)).toThrow(TypeError);
  });
});
