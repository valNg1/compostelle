import { describe, it, expect } from "vitest";
import { annotationDefinition, type Annotation } from "./learning";
import { CATALOG } from "../content/catalog";
import { isPlayable, selectAnnotations, countWords } from "./learning";
import type { DeclaredLevel } from "./journey";

describe("annotationDefinition — every highlighted word is accessible (issue #12)", () => {
  it("returns the meaning when present", () => {
    const a: Annotation = {
      id: "a",
      expression: "cenere e lapilli",
      meaning: "materiali espulsi dal vulcano",
      translation: "ash and stones",
    };
    expect(annotationDefinition(a, "en")).toBe("materiali espulsi dal vulcano");
  });

  it("falls back to the interface translation when the meaning is empty", () => {
    const a: Annotation = {
      id: "a",
      expression: "x",
      meaning: "   ",
      translation: "the fallback",
      translations: { fr: "le repli" },
    };
    expect(annotationDefinition(a, "fr")).toBe("le repli");
    expect(annotationDefinition(a, "en")).toBe("the fallback");
  });

  it("returns an empty string only when nothing is available (UI then shows a fallback)", () => {
    const a: Annotation = { id: "a", expression: "x", meaning: "", translation: "" };
    expect(annotationDefinition(a, "en")).toBe("");
  });
});

describe("no dead highlighted words in the catalog, incl. the 'history' theme (issue #12)", () => {
  const playable = CATALOG.filter((c) => isPlayable(c));

  it("every SELECTED annotation of every playable unit has an accessible definition", () => {
    for (const c of playable) {
      for (const level of ["A2", "C1"] as DeclaredLevel[]) {
        const sel = selectAnnotations(c.annotations, level, countWords(c.body));
        for (const a of sel) {
          const def = annotationDefinition(a, "en");
          expect(def.length, `${c.id}/${a.expression} (${level})`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("covers the history unit specifically (pompei)", () => {
    const pompei = playable.find((c) => c.id === "pompei");
    expect(pompei).toBeTruthy();
    const sel = selectAnnotations(pompei!.annotations, "A2", countWords(pompei!.body));
    expect(sel.length).toBeGreaterThan(0);
    expect(sel.every((a) => annotationDefinition(a, "en").length > 0)).toBe(true);
  });
});
