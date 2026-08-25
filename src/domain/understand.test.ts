import { describe, it, expect } from "vitest";
import {
  selectAnnotations,
  countSentences,
  countWords,
  targetHelpWords,
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

// ~40-word text worth of help budget (single-word expressions → 1 word each).
const WORDS = 40;

describe("adaptive UNDERSTAND density", () => {
  it("keeps density near ~20% for every level, never starving advanced learners", () => {
    const a2 = selectAnnotations(pool, "A2", WORDS).length;
    const b2 = selectAnnotations(pool, "B2", WORDS).length;
    const c1 = selectAnnotations(pool, "C1", WORDS).length;
    // Beginners get a little more, but advanced learners stay around the target.
    expect(a2).toBeGreaterThanOrEqual(b2);
    expect(b2).toBeGreaterThanOrEqual(c1);
    expect(c1 / WORDS).toBeGreaterThanOrEqual(0.18); // no collapse for C1
  });

  it("leads with the richest expressions for advanced learners", () => {
    // Advanced learners still see the hardest vocabulary first (then backfill).
    const c1 = selectAnnotations(pool, "C1", WORDS);
    const c1Items = c1.filter((a) => a.difficulty === "C1").length;
    expect(c1Items).toBe(3); // every C1 expression is surfaced
  });

  it("preserves reading order in the selection", () => {
    const sel = selectAnnotations(pool, "A2", WORDS);
    const idx = sel.map((a) => pool.indexOf(a));
    expect(idx).toEqual([...idx].sort((x, y) => x - y));
  });

  it("treats UNKNOWN like an early learner (lots of guidance)", () => {
    expect(selectAnnotations(pool, "UNKNOWN", WORDS).length).toBeGreaterThanOrEqual(
      selectAnnotations(pool, "B1", WORDS).length,
    );
  });

  it("returns all annotations for legacy units with no difficulty tags", () => {
    const legacy: Annotation[] = [
      { id: "alfa", expression: "alfa", meaning: "", translation: "alfa" },
      { id: "beta", expression: "beta", meaning: "", translation: "beta" },
    ];
    expect(selectAnnotations(legacy, "C1", WORDS)).toHaveLength(2);
  });

  it("counts words/sentences and scales the help target with length", () => {
    expect(countSentences("Uno. Due! Tre?")).toBe(3);
    expect(countWords("uno due tre")).toBe(3);
    expect(targetHelpWords("A1", 100)).toBeGreaterThan(targetHelpWords("A1", 50));
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
