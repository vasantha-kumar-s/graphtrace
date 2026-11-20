import { describe, it, expect } from "vitest";
import { answerOverlap, isUsed, tokens, USED_THRESHOLD } from "./overlap";

describe("overlap scoring", () => {
  it("scores shared vocabulary against the smaller set", () => {
    expect(
      answerOverlap(
        "checkout fails because stripe webhook timeout",
        "stripe webhook timeout config",
      ),
    ).toBe(0.75);
  });

  it("returns null without an answer or content", () => {
    expect(answerOverlap("", "x content")).toBeNull();
    expect(answerOverlap("some answer", "")).toBeNull();
    expect(answerOverlap(null, "content")).toBeNull();
    expect(answerOverlap("answer", undefined)).toBeNull();
  });

  it("marks used at threshold (0.2) and above", () => {
    expect(isUsed(USED_THRESHOLD)).toBe(true);
    expect(isUsed(0.5)).toBe(true);
    expect(isUsed(0.19)).toBe(false);
    expect(isUsed(0)).toBe(false);
    expect(isUsed(null)).toBe(false);
  });

  it("filters out stop words and short characters correctly", () => {
    const extracted = tokens("The quick brown fox jumps into that river");
    expect(extracted.has("the")).toBe(false);
    expect(extracted.has("into")).toBe(false);
    expect(extracted.has("that")).toBe(false);
    expect(extracted.has("quick")).toBe(true);
    expect(extracted.has("brown")).toBe(true);
  });
});
