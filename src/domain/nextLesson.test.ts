import { describe, it, expect } from "vitest";
import type { ContentItem } from "./content";
import {
  selectNextUnitForTheme,
  selectNextLesson,
  type LearningUnit,
} from "./learningUnit";
import {
  prioritizeRecallForReplay,
  type Annotation,
  type RecallItem,
} from "./learning";
import type { MemoryItem } from "./memory";

function unit(id: string, category: ContentItem["category"]): LearningUnit {
  return {
    id,
    language: "it",
    title: id,
    category,
    teaser: "",
    body: "corpo di prova",
    estimatedMinutes: 3,
    modality: "read",
    annotations: [{ id: "x", expression: "x", meaning: "", translation: "x" }],
    recall: [
      { id: "r", kind: "meaning", prompt: "", options: ["a"], answerIndex: 0 },
    ],
    use: { prompt: "", sampleAnswer: "", keyExpressions: [] },
  } as LearningUnit;
}

// Two playable units in "history", one in "travel".
const catalog: ContentItem[] = [
  unit("h1", "history"),
  unit("h2", "history"),
  unit("t1", "travel"),
];

describe("selectNextUnitForTheme (issue #7 — do not reserve a completed lesson)", () => {
  it("returns the first lesson of the theme when nothing is completed", () => {
    const next = selectNextUnitForTheme(catalog, "it", "history", new Set());
    expect(next?.id).toBe("h1");
  });

  it("skips a completed lesson and serves the next one of the same theme", () => {
    const next = selectNextUnitForTheme(catalog, "it", "history", new Set(["h1"]));
    expect(next?.id).toBe("h2");
  });

  it("returns null when every lesson of the theme is completed", () => {
    const next = selectNextUnitForTheme(
      catalog,
      "it",
      "history",
      new Set(["h1", "h2"]),
    );
    expect(next).toBeNull();
  });

  it("surprise_me skips completed across all playable units", () => {
    const next = selectNextUnitForTheme(
      catalog,
      "it",
      "surprise_me",
      new Set(["h1", "h2"]),
    );
    expect(next?.id).toBe("t1");
  });
});

describe("selectNextLesson (issue #8 — 'continue' must open a NEW lesson)", () => {
  it("opens the next uncompleted lesson of the chosen theme", () => {
    const next = selectNextLesson(catalog, "it", "history", new Set(["h1"]));
    expect(next?.id).toBe("h2");
  });

  it("falls back ACROSS themes when the chosen theme is exhausted (the #8 bug)", () => {
    // history fully done, but travel still has t1 → continue must open t1,
    // not silently return null / a blank screen.
    const next = selectNextLesson(catalog, "it", "history", new Set(["h1", "h2"]));
    expect(next?.id).toBe("t1");
  });

  it("returns null only when EVERY playable lesson is completed", () => {
    const next = selectNextLesson(
      catalog,
      "it",
      "history",
      new Set(["h1", "h2", "t1"]),
    );
    expect(next).toBeNull();
  });

  it("never reopens a lesson already in the completed set", () => {
    const next = selectNextLesson(catalog, "it", "surprise_me", new Set(["h1", "h2"]));
    expect(next?.id).toBe("t1");
    expect(["h1", "h2"]).not.toContain(next?.id);
  });
});

describe("issue #13 — a completed lesson is never re-proposed by 'continue'", () => {
  const themes: (Parameters<typeof selectNextLesson>[2])[] = [
    "history",
    "travel",
    "surprise_me",
  ];

  it("after completing a lesson, 'continue' never returns THAT lesson", () => {
    // Reproduces #13: the just-completed lesson must not come back.
    for (const done of ["h1", "h2", "t1"]) {
      for (const theme of themes) {
        const next = selectNextLesson(catalog, "it", theme, new Set([done]));
        expect(next?.id, `${theme} after ${done}`).not.toBe(done);
      }
    }
  });

  it("never returns ANY completed lesson, whatever the theme", () => {
    const completed = new Set(["h1", "t1"]);
    for (const theme of themes) {
      const next = selectNextLesson(catalog, "it", theme, completed);
      expect(next).not.toBeNull();
      expect(completed.has(next!.id), theme).toBe(false);
    }
  });

  it("when EVERYTHING is completed, returns null (UI shows 'no more lessons')", () => {
    for (const theme of themes) {
      expect(selectNextLesson(catalog, "it", theme, new Set(["h1", "h2", "t1"]))).toBeNull();
    }
  });
});

describe("prioritizeRecallForReplay (issue #7 — replay favours failed items)", () => {
  const annotations: Annotation[] = [
    { id: "a1", expression: "uno", meaning: "", translation: "" },
    { id: "a2", expression: "due", meaning: "", translation: "" },
    { id: "a3", expression: "tre", meaning: "", translation: "" },
  ];
  const recall: RecallItem[] = [
    { id: "r1", kind: "meaning", prompt: "", options: [], answerIndex: 0, annotationId: "a1" },
    { id: "r2", kind: "meaning", prompt: "", options: [], answerIndex: 0, annotationId: "a2" },
    { id: "r3", kind: "meaning", prompt: "", options: [], answerIndex: 0, annotationId: "a3" },
  ];

  it("moves previously-failed (TO_REVIEW) items to the front", () => {
    const memory: MemoryItem[] = [
      { language: "it", expression: "due", meaning: "", state: "TO_REVIEW", lastInteraction: "" },
    ];
    const ordered = prioritizeRecallForReplay(recall, annotations, memory);
    expect(ordered.map((r) => r.id)).toEqual(["r2", "r1", "r3"]);
  });

  it("orders TO_REVIEW before LEARNING before mastered/new, stably", () => {
    const memory: MemoryItem[] = [
      { language: "it", expression: "tre", meaning: "", state: "TO_REVIEW", lastInteraction: "" },
      { language: "it", expression: "uno", meaning: "", state: "LEARNING", lastInteraction: "" },
    ];
    const ordered = prioritizeRecallForReplay(recall, annotations, memory);
    expect(ordered.map((r) => r.id)).toEqual(["r3", "r1", "r2"]);
  });

  it("keeps every item (reinjects, never drops)", () => {
    const ordered = prioritizeRecallForReplay(recall, annotations, []);
    expect(ordered.map((r) => r.id).sort()).toEqual(["r1", "r2", "r3"]);
  });
});
