import { describe, it, expect } from "vitest";
import {
  selectAnnotations,
  countSentences,
  targetAnnotationCount,
  annotationTranslation,
  recallPrompt,
  recallOptions,
  usePromptText,
  type Annotation,
  type RecallItem,
  type UsePrompt,
} from "./learning";
import type { DeclaredLevel } from "./journey";

function ann(id: string, difficulty: DeclaredLevel): Annotation {
  return {
    id,
    expression: id,
    meaning: "",
    translation: `t-${id}`,
    difficulty,
  };
}

// A ~6-sentence-worth pool spanning difficulties (like the Pompei unit).
const pool: Annotation[] = [
  ann("a2a", "A2"),
  ann("a2b", "A2"),
  ann("b1a", "B1"),
  ann("b1b", "B1"),
  ann("b2a", "B2"),
  ann("b2b", "B2"),
  ann("b2c", "B2"),
  ann("c1a", "C1"),
  ann("c1b", "C1"),
  ann("c1c", "C1"),
];

describe("adaptive UNDERSTAND density", () => {
  it("gives beginners more annotations than advanced learners (same content)", () => {
    const a2 = selectAnnotations(pool, "A2", 6).length;
    const b2 = selectAnnotations(pool, "B2", 6).length;
    const c1 = selectAnnotations(pool, "C1", 6).length;
    expect(a2).toBeGreaterThan(b2);
    expect(b2).toBeGreaterThan(c1);
  });

  it("never surfaces trivial (below-level) expressions to advanced learners", () => {
    const c1 = selectAnnotations(pool, "C1", 6);
    expect(c1.every((a) => a.difficulty === "C1")).toBe(true);
    const b2 = selectAnnotations(pool, "B2", 6);
    expect(b2.every((a) => a.difficulty === "B2" || a.difficulty === "C1")).toBe(true);
  });

  it("keeps counts within reasonable, level-appropriate ranges", () => {
    expect(selectAnnotations(pool, "B2", 6).length).toBeGreaterThanOrEqual(5);
    expect(selectAnnotations(pool, "B2", 6).length).toBeLessThanOrEqual(7);
    expect(selectAnnotations(pool, "C1", 6).length).toBeGreaterThanOrEqual(3);
    expect(selectAnnotations(pool, "C1", 6).length).toBeLessThanOrEqual(5);
  });

  it("preserves reading order in the selection", () => {
    const sel = selectAnnotations(pool, "A2", 6);
    const idx = sel.map((a) => pool.indexOf(a));
    expect(idx).toEqual([...idx].sort((x, y) => x - y));
  });

  it("treats UNKNOWN like an early learner (lots of guidance)", () => {
    expect(selectAnnotations(pool, "UNKNOWN", 6).length).toBeGreaterThanOrEqual(
      selectAnnotations(pool, "B1", 6).length,
    );
  });

  it("returns all annotations for legacy units with no difficulty tags", () => {
    const legacy: Annotation[] = [
      { id: "x", expression: "x", meaning: "", translation: "x" },
      { id: "y", expression: "y", meaning: "", translation: "y" },
    ];
    expect(selectAnnotations(legacy, "C1", 6)).toHaveLength(2);
  });

  it("counts sentences and scales the target with content length", () => {
    expect(countSentences("Uno. Due! Tre?")).toBe(3);
    expect(targetAnnotationCount("A1", 10)).toBeGreaterThan(
      targetAnnotationCount("A1", 5),
    );
  });
});

describe("interface-language resolvers (target ≠ interface)", () => {
  it("prefers the interface-language annotation translation, falling back to en then legacy", () => {
    const a: Annotation = {
      id: "a",
      expression: "fermata nel tempo",
      meaning: "bloccata nel tempo",
      translation: "frozen in time",
      translations: { en: "frozen in time", fr: "figée dans le temps" },
    };
    expect(annotationTranslation(a, "fr")).toBe("figée dans le temps");
    expect(annotationTranslation(a, "en")).toBe("frozen in time");
    expect(annotationTranslation(a, "ru")).toBe("frozen in time"); // fallback en
    expect(annotationTranslation({ ...a, translations: undefined }, "fr")).toBe(
      "frozen in time",
    );
  });

  it("resolves recall prompt/options per interface language", () => {
    const item: RecallItem = {
      id: "r",
      kind: "meaning",
      prompt: "What does it mean?",
      promptI18n: { en: "What does it mean?", fr: "Que signifie-t-il ?" },
      options: ["frozen in time", "brand new"],
      optionsI18n: { fr: ["figée dans le temps", "toute neuve"] },
      answerIndex: 0,
    };
    expect(recallPrompt(item, "fr")).toBe("Que signifie-t-il ?");
    expect(recallOptions(item, "fr")).toEqual(["figée dans le temps", "toute neuve"]);
    expect(recallOptions(item, "en")).toEqual(["frozen in time", "brand new"]);
  });

  it("resolves the use prompt per interface language", () => {
    const use: UsePrompt = {
      prompt: "Use it in a sentence.",
      promptI18n: { fr: "Utilisez-la dans une phrase." },
      sampleAnswer: "…",
      keyExpressions: ["fermata nel tempo"],
    };
    expect(usePromptText(use, "fr")).toBe("Utilisez-la dans une phrase.");
    expect(usePromptText(use, "en")).toBe("Use it in a sentence.");
  });
});
