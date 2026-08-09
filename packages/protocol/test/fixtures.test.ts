import { describe, expect, it } from "vitest";
import { fixtureCorpus, validateFixtureCorpus } from "../src/index.js";

function mutableValue(corpus: typeof fixtureCorpus, group: string, name: string): Record<string, unknown> {
  const value = corpus.fixtures[group]?.[name]?.value;
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`Fixture ${group}.${name} is not an object.`);
  return value;
}

const rejectionCases = [
  ["malformed field", (value: unknown) => {
    const corpus = structuredClone(value) as typeof fixtureCorpus;
    mutableValue(corpus, "health", "live").status = 42;
    return corpus;
  }],
  ["unknown request field", (value: unknown) => {
    const corpus = structuredClone(value) as typeof fixtureCorpus;
    Object.assign(mutableValue(corpus, "requests", "createConversation"), { unexpected: true });
    return corpus;
  }],
  ["wrong discriminator", (value: unknown) => {
    const corpus = structuredClone(value) as typeof fixtureCorpus;
    mutableValue(corpus, "commands", "prompt").type = "unknown";
    return corpus;
  }],
  ["command result for the wrong command type", (value: unknown) => {
    const corpus = structuredClone(value) as typeof fixtureCorpus;
    mutableValue(corpus, "receipts", "set_model").result = mutableValue(corpus, "pi", "bashResult");
    return corpus;
  }],
  ["missing command result", (value: unknown) => {
    const corpus = structuredClone(value) as typeof fixtureCorpus;
    delete mutableValue(corpus, "receipts", "set_model").result;
    return corpus;
  }],
  ["leaked internal path", (value: unknown) => {
    const corpus = structuredClone(value) as typeof fixtureCorpus;
    mutableValue(corpus, "pi", "bashResult").output = "/data/sessions/private.jsonl";
    return corpus;
  }],
  ["embedded internal session URI", (value: unknown) => {
    const corpus = structuredClone(value) as typeof fixtureCorpus;
    mutableValue(corpus, "responses", "problem").detail = "See file:///data/sessions/private.jsonl";
    return corpus;
  }],
  ["trashed internal session path", (value: unknown) => {
    const corpus = structuredClone(value) as typeof fixtureCorpus;
    mutableValue(corpus, "pi", "bashResult").output = "/data/trash/sessions/private.jsonl";
    return corpus;
  }],
  ["credential-shaped value", (value: unknown) => {
    const corpus = structuredClone(value) as typeof fixtureCorpus;
    mutableValue(corpus, "responses", "providerSummary").apiToken = "secret-value";
    return corpus;
  }],
] as const;

describe("versioned protocol fixture corpus", () => {
  it("validates every fixture through the public corpus validator", () => {
    expect(validateFixtureCorpus(fixtureCorpus)).toEqual([]);
  });

  it.each(rejectionCases)("rejects %s deterministically", (_name, mutate) => {
    const first = validateFixtureCorpus(mutate(fixtureCorpus));
    const second = validateFixtureCorpus(mutate(fixtureCorpus));
    expect(first.length).toBeGreaterThan(0);
    expect(second).toEqual(first);
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
});
