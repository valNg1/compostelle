import { describe, it, expect } from "vitest";
import {
  selectAnnotations,
  countWords,
  isPlayable,
  type Annotation,
} from "./learning";
import { isFunctionWordOnly } from "./stopwords";
import type { DeclaredLevel } from "./journey";
import { CATALOG } from "../content/catalog";

function ann(expression: string, difficulty?: DeclaredLevel): Annotation {
  return { id: expression, expression, meaning: "", translation: "", difficulty };
}

// Content-word expressions spanning difficulties, embedded in a 40-word body.
const pool: Annotation[] = [
  ann("vocabolo1", "A2"),
  ann("vocabolo2", "A2"),
  ann("vocabolo3", "B1"),
  ann("vocabolo4", "B1"),
  ann("vocabolo5", "B2"),
  ann("vocabolo6", "B2"),
  ann("vocabolo7", "B2"),
  ann("vocabolo8", "C1"),
  ann("vocabolo9", "C1"),
  ann("vocabolo10", "C1"),
];
const filler = Array.from({ length: 30 }, (_, i) => `w${i}`).join(" ");
const body = `${pool.map((a) => a.expression).join(" ")} ${filler}`; // 40 words

function coverage(sel: Annotation[], words = 40): number {
  return sel.reduce((n, a) => n + countWords(a.expression), 0) / words;
}

const ALL_LEVELS: DeclaredLevel[] = ["A1", "A2", "UNKNOWN", "B1", "B2", "C1"];

describe("UNDERSTAND density targets ~20% of words (issue #6)", () => {
  it("counts words", () => {
    expect(countWords(body)).toBe(40);
    expect(countWords("  uno   due  tre ")).toBe(3);
  });

  it("reaches ~20% for EVERY level, including advanced (no collapse)", () => {
    for (const level of ALL_LEVELS) {
      const cov = coverage(selectAnnotations(pool, level, 40));
      expect(cov).toBeGreaterThanOrEqual(0.18);
      expect(cov).toBeLessThanOrEqual(0.26);
    }
  });

  it("still leads with the richest expressions for advanced learners", () => {
    // C1 selection is dominated by higher-difficulty items.
    const c1 = selectAnnotations(pool, "C1", 40);
    const c1Count = c1.filter((a) => a.difficulty === "C1").length;
    expect(c1Count).toBeGreaterThanOrEqual(3);
  });

  it("preserves reading order", () => {
    const sel = selectAnnotations(pool, "A2", 40);
    const idx = sel.map((a) => pool.indexOf(a));
    expect(idx).toEqual([...idx].sort((x, y) => x - y));
  });

  it("is capped by the authored pool (cannot exceed what exists)", () => {
    const thin: Annotation[] = [ann("scarso1", "B1"), ann("scarso2", "B1")];
    expect(selectAnnotations(thin, "B1", 40)).toHaveLength(2);
  });

  it("returns content-word annotations for legacy (untagged) units", () => {
    const legacy: Annotation[] = [ann("alfa"), ann("beta"), ann("gamma")];
    expect(selectAnnotations(legacy, "C1", 40)).toHaveLength(3);
  });
});

describe("content words are prioritised over function words (issue #6)", () => {
  it("never underlines a lone function word (article/preposition/conjunction)", () => {
    expect(isFunctionWordOnly("il")).toBe(true);
    expect(isFunctionWordOnly("della")).toBe(true);
    expect(isFunctionWordOnly("los")).toBe(true);
    expect(isFunctionWordOnly("pero")).toBe(true);
    expect(isFunctionWordOnly("and")).toBe(true);
    // real vocabulary / multi-word idioms are kept
    expect(isFunctionWordOnly("fortalezas")).toBe(false);
    expect(isFunctionWordOnly("l'ultima corsa")).toBe(false);
    expect(isFunctionWordOnly("senza fretta")).toBe(false);
  });

  it("drops function-word-only annotations from the selection", () => {
    const withNoise: Annotation[] = [
      ann("di"), // lone preposition — must never be selected
      ann("il"), // lone article
      ann("montagna", "B1"),
      ann("sentiero", "B1"),
    ];
    const sel = selectAnnotations(withNoise, "B1", 40);
    expect(sel.map((a) => a.expression)).not.toContain("di");
    expect(sel.map((a) => a.expression)).not.toContain("il");
    expect(sel.map((a) => a.expression)).toContain("montagna");
  });
});

describe("robust to varying text lengths (issue #6)", () => {
  it("averages ~20% on short and long synthetic texts", () => {
    for (const n of [8, 20, 50, 120]) {
      // A pool covering ~35% of words, all content words.
      const size = Math.max(1, Math.round(n * 0.35));
      const richPool = Array.from({ length: size }, (_, i) =>
        ann(`term${i}`, "B1"),
      );
      const cov = coverage(selectAnnotations(richPool, "B1", n), n);
      expect(cov).toBeGreaterThanOrEqual(0.15);
      expect(cov).toBeLessThanOrEqual(0.26);
    }
  });
});

describe("real catalog reaches ~20% underlined words at every level", () => {
  const playable = CATALOG.filter((c) => isPlayable(c));

  for (const level of ["A2", "C1"] as DeclaredLevel[]) {
    it(`averages close to 20% across playable units (${level})`, () => {
      const coverages = playable.map((c) => {
        const sel = selectAnnotations(c.annotations ?? [], level, countWords(c.body));
        const selWords = sel.reduce((n, a) => n + countWords(a.expression), 0);
        return selWords / countWords(c.body);
      });
      const mean = coverages.reduce((s, x) => s + x, 0) / coverages.length;
      expect(mean).toBeGreaterThanOrEqual(0.18);
      expect(mean).toBeLessThanOrEqual(0.24);
      // no text collapses far below the target, even for advanced learners
      expect(Math.min(...coverages)).toBeGreaterThanOrEqual(0.16);
    });
  }
});
