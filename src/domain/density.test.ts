import { describe, it, expect } from "vitest";
import {
  selectAnnotations,
  countWords,
  type Annotation,
} from "./learning";
import type { DeclaredLevel } from "./journey";
import { CATALOG } from "../content/catalog";
import { isPlayable } from "./learning";

function ann(id: string, difficulty?: DeclaredLevel): Annotation {
  return { id, expression: id, meaning: "", translation: `t-${id}`, difficulty };
}

// Single-word expressions e1..e10 spanning difficulties, embedded in a
// 40-word body → coverage(selection) = selection.length / 40.
const pool: Annotation[] = [
  ann("e1", "A2"),
  ann("e2", "A2"),
  ann("e3", "B1"),
  ann("e4", "B1"),
  ann("e5", "B2"),
  ann("e6", "B2"),
  ann("e7", "B2"),
  ann("e8", "C1"),
  ann("e9", "C1"),
  ann("e10", "C1"),
];
const filler = Array.from({ length: 30 }, (_, i) => `w${i}`).join(" ");
const body = `e1 e2 e3 e4 e5 e6 e7 e8 e9 e10 ${filler}`; // 40 words

function coverage(sel: Annotation[]): number {
  const selWords = sel.reduce((n, a) => n + countWords(a.expression), 0);
  return selWords / countWords(body);
}

describe("UNDERSTAND density targets ~20% of words (issue #6)", () => {
  it("counts words", () => {
    expect(countWords(body)).toBe(40);
    expect(countWords("  uno   due  tre ")).toBe(3);
  });

  it("underlines about 20% of the words for a mid-level learner", () => {
    const cov = coverage(selectAnnotations(pool, "B1", countWords(body)));
    expect(cov).toBeGreaterThanOrEqual(0.15);
    expect(cov).toBeLessThanOrEqual(0.25);
  });

  it("stays adaptive: beginners get more coverage than advanced learners", () => {
    const a2 = coverage(selectAnnotations(pool, "A2", countWords(body)));
    const c1 = coverage(selectAnnotations(pool, "C1", countWords(body)));
    expect(a2).toBeGreaterThan(c1);
  });

  it("preserves reading order", () => {
    const sel = selectAnnotations(pool, "A2", countWords(body));
    const idx = sel.map((a) => pool.indexOf(a));
    expect(idx).toEqual([...idx].sort((x, y) => x - y));
  });

  it("is capped by the authored pool (cannot exceed what exists)", () => {
    const thin: Annotation[] = [ann("only1", "B1"), ann("only2", "B1")];
    const sel = selectAnnotations(thin, "B1", 40);
    expect(sel).toHaveLength(2); // all candidates, still below 20%
  });

  it("returns all annotations for legacy (untagged) units", () => {
    const legacy: Annotation[] = [ann("x"), ann("y"), ann("z")];
    expect(selectAnnotations(legacy, "C1", 40)).toHaveLength(3);
  });
});

describe("real catalog reaches ~20% underlined words on average", () => {
  it("averages close to 20% across playable units (A2 learner)", () => {
    const coverages = CATALOG.filter((c) => isPlayable(c)).map((c) => {
      const anns = c.annotations ?? [];
      const sel = selectAnnotations(anns, "A2", countWords(c.body));
      const selWords = sel.reduce((n, a) => n + countWords(a.expression), 0);
      return selWords / countWords(c.body);
    });
    const mean =
      coverages.reduce((s, x) => s + x, 0) / Math.max(1, coverages.length);
    expect(mean).toBeGreaterThanOrEqual(0.16);
    expect(mean).toBeLessThanOrEqual(0.24);
    // no playable text is left almost bare
    expect(Math.min(...coverages)).toBeGreaterThanOrEqual(0.15);
  });
});
