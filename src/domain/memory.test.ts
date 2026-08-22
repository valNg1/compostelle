import { describe, it, expect } from "vitest";
import { nextState, summarize, type MemoryItem } from "./memory";

describe("memory state transitions (deterministic)", () => {
  it("starts at NEW and stays NEW when only encountered", () => {
    expect(nextState(null, "encountered")).toBe("NEW");
    expect(nextState("NEW", "encountered")).toBe("NEW");
  });

  it("moves to LEARNING when understood or recalled correctly", () => {
    expect(nextState(null, "understood")).toBe("LEARNING");
    expect(nextState("NEW", "recalled_correct")).toBe("LEARNING");
    expect(nextState("TO_REVIEW", "recalled_correct")).toBe("LEARNING");
  });

  it("moves to TO_REVIEW on a wrong recall (even from ACQUIRED)", () => {
    expect(nextState("LEARNING", "recalled_wrong")).toBe("TO_REVIEW");
    expect(nextState("ACQUIRED", "recalled_wrong")).toBe("TO_REVIEW");
  });

  it("reaches ACQUIRED when used, and keeps ACQUIRED otherwise", () => {
    expect(nextState("LEARNING", "used")).toBe("ACQUIRED");
    expect(nextState("ACQUIRED", "understood")).toBe("ACQUIRED");
    expect(nextState("ACQUIRED", "recalled_correct")).toBe("ACQUIRED");
  });
});

describe("summarize", () => {
  it("counts states for the journey view", () => {
    const items: MemoryItem[] = [
      { language: "it", expression: "a", meaning: "", state: "LEARNING", lastInteraction: "" },
      { language: "it", expression: "b", meaning: "", state: "LEARNING", lastInteraction: "" },
      { language: "it", expression: "c", meaning: "", state: "ACQUIRED", lastInteraction: "" },
      { language: "it", expression: "d", meaning: "", state: "TO_REVIEW", lastInteraction: "" },
      { language: "it", expression: "e", meaning: "", state: "NEW", lastInteraction: "" },
    ];
    expect(summarize(items)).toEqual({
      learning: 2,
      acquired: 1,
      toReview: 1,
      total: 5,
    });
  });
});
