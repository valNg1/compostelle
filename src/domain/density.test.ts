import { describe, it, expect } from "vitest";
import {
  selectAnnotations,
  reuseTargets,
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

// 18 content-word expressions (≈45% of a 40-word body) spanning difficulties,
// so the 30-40% target actually bites (is not just "select everything").
const pool: Annotation[] = Array.from({ length: 18 }, (_, i) =>
  ann(
    `vocabolo${i}`,
    (["A2", "B1", "B2", "C1"] as DeclaredLevel[])[i % 4],
  ),
);
const filler = Array.from({ length: 22 }, (_, i) => `w${i}`).join(" ");
const body = `${pool.map((a) => a.expression).join(" ")} ${filler}`; // 40 words

const cover = (sel: Annotation[], words = 40) =>
  sel.reduce((n, a) => n + countWords(a.expression), 0) / words;

const ALL_LEVELS: DeclaredLevel[] = ["A1", "A2", "UNKNOWN", "B1", "B2", "C1"];

describe("A — highlighting rate targets ~30-40% of words (issue #9)", () => {
  it("counts words", () => {
    expect(countWords(body)).toBe(40);
  });

  it("highlights 30-40% of the words at every level", () => {
    for (const level of ALL_LEVELS) {
      const c = cover(selectAnnotations(pool, level, 40));
      expect(c, level).toBeGreaterThanOrEqual(0.28);
      expect(c, level).toBeLessThanOrEqual(0.42);
    }
  });

  it("preserves reading order and prefers content words", () => {
    const sel = selectAnnotations(pool, "A2", 40);
    const idx = sel.map((a) => pool.indexOf(a));
    expect(idx).toEqual([...idx].sort((x, y) => x - y));
    expect(sel.every((a) => !isFunctionWordOnly(a.expression))).toBe(true);
  });
});

describe("B — reuse rate: ≥50% of highlighted proposed, not mandatory (issue #11)", () => {
  it("proposes at least half of the highlighted expressions for reuse", () => {
    const highlighted = selectAnnotations(pool, "B1", 40);
    const reuse = reuseTargets(highlighted);
    expect(reuse.length).toBeGreaterThanOrEqual(
      Math.ceil(highlighted.length / 2),
    );
    expect(reuse.length).toBeLessThanOrEqual(highlighted.length);
    // reuse suggestions are a subset of the highlighted words
    const ids = new Set(highlighted.map((a) => a.id));
    expect(reuse.every((a) => ids.has(a.id))).toBe(true);
  });

  it("returns [] for no highlighted words", () => {
    expect(reuseTargets([])).toEqual([]);
  });

  it("A and B are independent knobs (reuse is a fraction of highlighted)", () => {
    const many = Array.from({ length: 10 }, (_, i) => ann(`t${i}`, "B1"));
    expect(reuseTargets(many).length).toBeGreaterThanOrEqual(5);
    const few = [ann("solo", "B1")];
    expect(reuseTargets(few).length).toBe(1);
  });
});

describe("real catalog reaches ~30-40% highlighted on average (issue #9)", () => {
  const playable = CATALOG.filter((c) => isPlayable(c));

  for (const level of ["A2", "C1"] as DeclaredLevel[]) {
    it(`averages ~30-40% across playable units (${level})`, () => {
      const coverages = playable.map((c) => {
        const sel = selectAnnotations(c.annotations ?? [], level, countWords(c.body));
        const w = sel.reduce((n, a) => n + countWords(a.expression), 0);
        return w / countWords(c.body);
      });
      const mean = coverages.reduce((s, x) => s + x, 0) / coverages.length;
      expect(mean).toBeGreaterThanOrEqual(0.3);
      expect(mean).toBeLessThanOrEqual(0.42);
      expect(Math.min(...coverages)).toBeGreaterThanOrEqual(0.28);
    });
  }
});
