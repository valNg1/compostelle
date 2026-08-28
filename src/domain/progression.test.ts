import { describe, it, expect } from "vitest";
import { PROGRESSION_CONFIG } from "./progression.config";
import {
  unitScore,
  scoreQuiz,
  sublevelScore,
  isSublevelAcquired,
  failingUnits,
  sublevelStatus,
  sublevelIdsForLevel,
  isSublevelUnlocked,
  type UnitProgress,
  type QuizQuestion,
} from "./progression";

const W = PROGRESSION_CONFIG.WEIGHTS;
const N = PROGRESSION_CONFIG.UNITS_PER_SUBLEVEL; // 5
const PASS = PROGRESSION_CONFIG.PASS_THRESHOLD; // 0.8

describe("unitScore — weighted composite (issue: composite acquisition)", () => {
  it("combines the three signals with the configured weights", () => {
    // 0.40*1 + 0.40*0.5 + 0.20*0 = 0.6
    expect(unitScore({ quiz: 1, reuse: 0.5, corrections: 0 })).toBeCloseTo(0.6, 5);
  });

  it("treats a missing signal as 0", () => {
    // only quiz present → 0.40
    expect(unitScore({ quiz: 1 })).toBeCloseTo(W.quiz, 5);
    expect(unitScore({})).toBe(0);
  });

  it("clamps signals to [0,1]", () => {
    expect(unitScore({ quiz: 2, reuse: -1, corrections: 5 })).toBeCloseTo(
      W.quiz + W.corrections,
      5,
    );
  });

  it("is 1 when every signal is perfect", () => {
    expect(unitScore({ quiz: 1, reuse: 1, corrections: 1 })).toBeCloseTo(1, 5);
  });
});

describe("scoreQuiz — quiz signal from 5 questions", () => {
  const qs: QuizQuestion[] = Array.from({ length: 5 }, (_, i) => ({
    id: `q${i}`,
    prompt: "",
    options: ["a", "b"],
    answerIndex: 0,
  }));
  it("is the proportion of correct answers", () => {
    expect(scoreQuiz(qs, [0, 0, 0, 1, 1])).toBeCloseTo(0.6, 5); // 3/5
  });
  it("counts skipped answers as wrong", () => {
    expect(scoreQuiz(qs, [0, null, undefined, 0, 0])).toBeCloseTo(0.6, 5);
  });
  it("is 1 for all correct and 0 for none", () => {
    expect(scoreQuiz(qs, [0, 0, 0, 0, 0])).toBe(1);
    expect(scoreQuiz(qs, [1, 1, 1, 1, 1])).toBe(0);
  });
});

describe("sublevelScore — mean of unit scores", () => {
  it("averages the unit scores", () => {
    expect(sublevelScore([1, 0.5, 0])).toBeCloseTo(0.5, 5);
  });
  it("is 0 for an empty sub-level", () => {
    expect(sublevelScore([])).toBe(0);
  });
});

function units(scores: number[], completed = true): UnitProgress[] {
  return scores.map((s, i) => ({ unitId: `u${i}`, completed, score: s }));
}

describe("isSublevelAcquired — all units done AND mean >= 0.80", () => {
  it("acquired when all 5 units completed and mean reaches the threshold", () => {
    expect(isSublevelAcquired(units([0.9, 0.85, 0.8, 0.8, 0.9]))).toBe(true);
  });

  it("NOT acquired when the mean is below the threshold", () => {
    expect(isSublevelAcquired(units([0.9, 0.6, 0.8, 0.7, 0.9]))).toBe(false);
  });

  it("NOT acquired when not every unit is completed, even if the mean is high", () => {
    const u = units([0.95, 0.95, 0.95, 0.95]); // only 4 of 5 completed
    expect(isSublevelAcquired(u)).toBe(false);
  });
});

describe("failingUnits — targeted retry redoes ONLY units below the threshold", () => {
  it("returns exactly the completed units under the threshold", () => {
    const u: UnitProgress[] = [
      { unitId: "a", completed: true, score: 0.9 },
      { unitId: "b", completed: true, score: 0.5 },
      { unitId: "c", completed: true, score: 0.79 },
      { unitId: "d", completed: true, score: 0.8 },
    ];
    expect(failingUnits(u)).toEqual(["b", "c"]);
  });

  it("does not include not-yet-completed units", () => {
    const u: UnitProgress[] = [
      { unitId: "a", completed: false, score: 0 },
      { unitId: "b", completed: true, score: 0.4 },
    ];
    expect(failingUnits(u)).toEqual(["b"]);
  });
});

describe("sublevelStatus + unlocking", () => {
  it("locked until unlocked", () => {
    expect(sublevelStatus(units([]), false)).toBe("locked");
  });
  it("in-progress while units remain to complete", () => {
    expect(sublevelStatus(units([0.9, 0.9], true), true)).toBe("in-progress");
  });
  it("retry when all units done but the composite is below the threshold", () => {
    expect(sublevelStatus(units([0.9, 0.5, 0.8, 0.7, 0.9]), true)).toBe("retry");
  });
  it("acquired when all units done and threshold reached", () => {
    expect(sublevelStatus(units([0.9, 0.85, 0.8, 0.8, 0.9]), true)).toBe("acquired");
  });

  it("next sub-level unlocks only once the previous is acquired", () => {
    const acquired = [true, false, false];
    expect(isSublevelUnlocked(0, acquired)).toBe(true); // first always open
    expect(isSublevelUnlocked(1, acquired)).toBe(true); // prev acquired
    expect(isSublevelUnlocked(2, acquired)).toBe(false); // prev not acquired
  });

  it("names sub-levels A1.1 … A1.3", () => {
    expect(sublevelIdsForLevel("A1")).toEqual(["A1.1", "A1.2", "A1.3"]);
    expect(sublevelIdsForLevel("A1")).toHaveLength(PROGRESSION_CONFIG.SUBLEVELS_PER_LEVEL);
  });
});

describe("config sanity", () => {
  it("weights sum to 1 and threshold/counts are as specified", () => {
    expect(W.quiz + W.reuse + W.corrections).toBeCloseTo(1, 5);
    expect(PASS).toBe(0.8);
    expect(N).toBe(5);
    expect(PROGRESSION_CONFIG.QUIZ_QUESTIONS_PER_UNIT).toBe(5);
  });
});
