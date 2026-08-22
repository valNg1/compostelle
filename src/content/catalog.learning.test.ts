import { describe, it, expect } from "vitest";
import { CATALOG } from "./catalog";
import { isPlayable } from "../domain/learning";

/** Integration guards for the learning loop over the real catalog. */

const playable = CATALOG.filter((c) => isPlayable(c));

describe("playable catalog (learning loop)", () => {
  it("ships several playable contents in BOTH languages", () => {
    const it = playable.filter((c) => c.language === "it");
    const es = playable.filter((c) => c.language === "es");
    expect(it.length).toBeGreaterThanOrEqual(2);
    expect(es.length).toBeGreaterThanOrEqual(2);
  });

  it("has well-formed recall items (answer in range, referenced annotations exist)", () => {
    for (const c of playable) {
      const annIds = new Set((c.annotations ?? []).map((a) => a.id));
      for (const r of c.recall ?? []) {
        expect(r.options.length).toBeGreaterThanOrEqual(2);
        expect(r.answerIndex).toBeGreaterThanOrEqual(0);
        expect(r.answerIndex).toBeLessThan(r.options.length);
        expect(r.prompt.trim().length).toBeGreaterThan(0);
        if (r.annotationId) expect(annIds.has(r.annotationId)).toBe(true);
      }
    }
  });

  it("has non-empty annotations and a use prompt with a sample answer", () => {
    for (const c of playable) {
      for (const a of c.annotations ?? []) {
        expect(a.expression.trim().length).toBeGreaterThan(0);
        expect(a.meaning.trim().length).toBeGreaterThan(0);
        expect(a.translation.trim().length).toBeGreaterThan(0);
      }
      expect(c.use?.sampleAnswer.trim().length).toBeGreaterThan(0);
      expect((c.use?.keyExpressions ?? []).length).toBeGreaterThan(0);
    }
  });
});
