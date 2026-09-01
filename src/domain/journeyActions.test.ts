import { describe, it, expect } from "vitest";
import { journeyActions } from "./journeyActions";

describe("journeyActions — never a dead-end (issue #20 / #18)", () => {
  it("ALWAYS offers at least one action, in every state", () => {
    for (const canContinue of [true, false]) {
      for (const canRedo of [true, false]) {
        const actions = journeyActions({ canContinue, canRedo });
        expect(actions.length, `${canContinue}/${canRedo}`).toBeGreaterThanOrEqual(1);
        // "start" (choose language+level+theme) is the guaranteed escape hatch
        expect(actions).toContain("start");
      }
    }
  });

  it("empty state (no content for the level → no continue/redo) still offers 'start'", () => {
    expect(journeyActions({ canContinue: false, canRedo: false })).toEqual(["start"]);
  });

  it("offers 'continue' only when a lesson can be resumed", () => {
    expect(journeyActions({ canContinue: true, canRedo: false })).toContain("continue");
    expect(journeyActions({ canContinue: false, canRedo: false })).not.toContain(
      "continue",
    );
  });

  it("offers 'redo' only when a completed lesson exists", () => {
    expect(journeyActions({ canContinue: false, canRedo: true })).toContain("redo");
    expect(journeyActions({ canContinue: false, canRedo: false })).not.toContain("redo");
  });

  it("offers all three when everything is possible", () => {
    expect(journeyActions({ canContinue: true, canRedo: true }).sort()).toEqual([
      "continue",
      "redo",
      "start",
    ]);
  });
});
