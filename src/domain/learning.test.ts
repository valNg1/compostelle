import { describe, it, expect } from "vitest";
import {
  isPlayable,
  answerUsesKeyExpression,
  buildAnnotatedSegments,
  type Annotation,
  type LearningContent,
} from "./learning";

const playable: LearningContent = {
  annotations: [
    { id: "a1", expression: "mettersi in gioco", meaning: "impegnarsi", translation: "to put oneself on the line" },
  ],
  recall: [
    { id: "r1", kind: "meaning", prompt: "mettersi in gioco?", options: ["impegnarsi", "riposarsi"], answerIndex: 0, annotationId: "a1" },
  ],
  use: {
    prompt: "Complete:",
    gapSentence: "Per imparare bisogna ______.",
    sampleAnswer: "mettersi in gioco",
    keyExpressions: ["mettersi in gioco"],
  },
};

describe("isPlayable", () => {
  it("is true for content with annotations, recall and a use prompt", () => {
    expect(isPlayable(playable)).toBe(true);
  });

  it("is false for missing or empty pedagogical payload", () => {
    expect(isPlayable(undefined)).toBe(false);
    expect(isPlayable({})).toBe(false);
    expect(isPlayable({ ...playable, annotations: [] })).toBe(false);
    expect(isPlayable({ ...playable, recall: [] })).toBe(false);
  });
});

describe("buildAnnotatedSegments (UNDERSTAND inline)", () => {
  const anns: Annotation[] = [
    { id: "a1", expression: "l'ultima corsa", meaning: "", translation: "" },
    { id: "a2", expression: "restava immobile", meaning: "", translation: "" },
  ];

  it("wraps the first occurrence of each expression and preserves the text", () => {
    const body = "Il tram faceva l'ultima corsa; l'uomo restava immobile.";
    const segs = buildAnnotatedSegments(body, anns);
    expect(segs.map((s) => s.text).join("")).toBe(body);
    const annotated = segs.filter((s) => s.annotation).map((s) => s.text);
    expect(annotated).toEqual(["l'ultima corsa", "restava immobile"]);
  });

  it("returns a single plain segment when nothing matches", () => {
    const segs = buildAnnotatedSegments("niente da annotare", anns);
    expect(segs).toEqual([{ text: "niente da annotare" }]);
  });
});

describe("answerUsesKeyExpression (USE self-check)", () => {
  it("detects a key expression regardless of case/spacing", () => {
    expect(
      answerUsesKeyExpression("  Bisogna Mettersi In Gioco ", ["mettersi in gioco"]),
    ).toBe(true);
  });

  it("is false for an empty answer or no match", () => {
    expect(answerUsesKeyExpression("", ["mettersi in gioco"])).toBe(false);
    expect(answerUsesKeyExpression("altro testo", ["mettersi in gioco"])).toBe(false);
  });
});
