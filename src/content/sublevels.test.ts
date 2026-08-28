import { describe, it, expect } from "vitest";
import { A1_1_UNITS, SUBLEVEL_A1_1, exampleUnit } from "./sublevels";
import { PROGRESSION_CONFIG } from "../domain/progression.config";

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
