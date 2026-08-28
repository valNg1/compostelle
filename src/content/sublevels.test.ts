import { describe, it, expect } from "vitest";
import {
  A1_1_UNITS,
  SUBLEVEL_A1_1,
  exampleUnit,
  progressionSublevels,
} from "./sublevels";
import { PROGRESSION_CONFIG } from "../domain/progression.config";
import { unitScore, isSublevelAcquired } from "../domain/progression";

describe("example sub-level A1.1 is complete and well-formed", () => {
  it("has exactly UNITS_PER_SUBLEVEL units", () => {
    expect(A1_1_UNITS).toHaveLength(PROGRESSION_CONFIG.UNITS_PER_SUBLEVEL);
    expect(SUBLEVEL_A1_1.unitIds).toHaveLength(
      PROGRESSION_CONFIG.UNITS_PER_SUBLEVEL,
    );
  });

  it("every unit has exactly QUIZ_QUESTIONS_PER_UNIT valid questions", () => {
    for (const u of A1_1_UNITS) {
      expect(u.quiz, u.id).toHaveLength(PROGRESSION_CONFIG.QUIZ_QUESTIONS_PER_UNIT);
      for (const question of u.quiz) {
        expect(question.answerIndex).toBeGreaterThanOrEqual(0);
        expect(question.answerIndex).toBeLessThan(question.options.length);
        expect(question.options.length).toBeGreaterThanOrEqual(2);
      }
      expect(u.targetExpressions.length).toBeGreaterThan(0);
    }
  });

  it("resolves units by id", () => {
    expect(exampleUnit("a1-1-saluti")?.title).toBe("I saluti");
    expect(exampleUnit("nope")).toBeUndefined();
  });
});

describe("fusion LEARN → progression registry (model B)", () => {
  const it_ = progressionSublevels("it");

  it("exposes A1.1 (quiz units) and A1.2 (LEARN article units) for Italian", () => {
    expect(it_.map((s) => s.id)).toEqual(["A1.1", "A1.2"]);
    const a11 = it_.find((s) => s.id === "A1.1")!;
    expect(a11.units.every((u) => u.hasQuiz)).toBe(true);
    const a12 = it_.find((s) => s.id === "A1.2")!;
    expect(a12.units.length).toBeGreaterThan(0);
    expect(a12.units.every((u) => !u.hasQuiz)).toBe(true);
  });

  it("A1.2 units are the tagged, playable LEARN articles", () => {
    const a12 = it_.find((s) => s.id === "A1.2")!;
    const ids = a12.units.map((u) => u.unitId);
    expect(ids).toContain("pompei");
    expect(ids).toContain("tram-14");
  });

  it("returns nothing for a language without example content", () => {
    expect(progressionSublevels("es")).toEqual([]);
  });

  it("a bare article unit (no quiz) can acquire its sub-level at 0.60", () => {
    const a12 = it_.find((s) => s.id === "A1.2")!;
    // every article scored perfectly on reuse+corrections → 0.60 each
    const units = a12.units.map((u) => ({
      unitId: u.unitId,
      completed: true,
      score: unitScore({ reuse: 1, corrections: 1 }),
    }));
    expect(units[0]!.score).toBeCloseTo(0.6, 5);
    expect(isSublevelAcquired(units, a12.units.length)).toBe(true);
  });
});
