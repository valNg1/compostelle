import { describe, it, expect, vi } from "vitest";
import {
  evaluateUse,
  evaluateUseAsync,
  applyLanguageToolMatches,
  deterministicCorrector,
  validFeedbackKey,
  normalizeForCompare,
  diffWords,
  type SentenceCorrector,
  type AsyncSentenceCorrector,
} from "./learning";
import type { UsePrompt } from "./learning";

const use: UsePrompt = {
  prompt: "Use it in a sentence.",
  sampleAnswer: "Prendo sempre l'ultima corsa del tram.",
  keyExpressions: ["l'ultima corsa", "ultima corsa"],
};

// Mocked "LLM/grammar" correctors (the real analysis would be an injected port).
const alwaysCorrect: SentenceCorrector = (s) => ({ correct: true, correction: s });
const alwaysWrong: SentenceCorrector = () => ({
  correct: false,
  correction: "Prendo sempre l'ultima corsa del tram per tornare a casa.",
});

describe("evaluateUse — 3 states (issue #5)", () => {
  it("(a) expression-missing: the key expression is not used", () => {
    const r = evaluateUse("Il gatto dorme sul divano.", use, alwaysWrong);
    expect(r.state).toBe("expression-missing");
  });

  it("(b) needs-correction: expression used but the sentence is incorrect, with a full proposed correction", () => {
    const r = evaluateUse("io prendo l'ultima corsa", use, alwaysWrong);
    expect(r.state).toBe("needs-correction");
    if (r.state === "needs-correction") {
      expect(r.correction).toBe(
        "Prendo sempre l'ultima corsa del tram per tornare a casa.",
      );
      // a correction is a full reformulated sentence, not just a flag
      expect(r.correction.length).toBeGreaterThan(0);
    }
  });

  it("(c) valid: expression used and the whole sentence is correct", () => {
    const r = evaluateUse("Prendo l'ultima corsa del tram.", use, alwaysCorrect);
    expect(r.state).toBe("valid");
  });

  it("still checks the expression BEFORE grammar (missing wins over wrong)", () => {
    const r = evaluateUse("Una frase qualunque senza espressione.", use, alwaysWrong);
    expect(r.state).toBe("expression-missing");
  });
});

describe("deterministicCorrector (fallback when no grammar service is configured)", () => {
  it("flags surface issues and returns a normalized sentence", () => {
    const r = deterministicCorrector("prendo l'ultima corsa");
    expect(r.correct).toBe(false);
    expect(r.correction).toBe("Prendo l'ultima corsa.");
  });

  it("accepts an already well-formed sentence", () => {
    const r = deterministicCorrector("Prendo l'ultima corsa.");
    expect(r.correct).toBe(true);
    expect(r.correction).toBe("Prendo l'ultima corsa.");
  });

  it("collapses stray spaces before punctuation", () => {
    const r = deterministicCorrector("Prendo l'ultima corsa  del   tram .");
    expect(r.correct).toBe(false);
    expect(r.correction).toBe("Prendo l'ultima corsa del tram.");
  });
});

describe("no correction without a real diff (issue #10)", () => {
  const cosmetic: SentenceCorrector = () => ({
    correct: false,
    correction: "Prendo l'ultima corsa.", // only case + trailing period differ
  });
  const realFix: SentenceCorrector = () => ({
    correct: false,
    correction: "Io mangio l'ultima corsa.",
  });

  it("does NOT propose a correction when the only difference is case/punctuation", () => {
    const r = evaluateUse("prendo l'ultima corsa", use, cosmetic);
    expect(r.state).toBe("valid");
  });

  it("does NOT flag a correct sentence via the deterministic fallback (the #10 bug)", () => {
    // Default corrector only tidies surface form → must validate, not 'correct'.
    expect(evaluateUse("prendo l'ultima corsa", use).state).toBe("valid");
    expect(evaluateUse("Prendo l'ultima corsa.", use).state).toBe("valid");
  });

  it("ignores accent-only differences", () => {
    const accents: SentenceCorrector = () => ({
      correct: false,
      correction: "Pérdo l'ultima corsa",
    });
    // "perdo" vs "pérdo" — accent only → treated as equivalent, no correction
    expect(evaluateUse("perdo l'ultima corsa", use, accents).state).toBe("valid");
  });

  it("DOES propose a correction (with a diff) when the sentence is really wrong", () => {
    const r = evaluateUse("io magno l'ultima corsa", use, realFix);
    expect(r.state).toBe("needs-correction");
    if (r.state === "needs-correction") {
      expect(r.correction).toBe("Io mangio l'ultima corsa.");
      const changed = r.diff.filter((d) => d.type !== "same");
      expect(changed.length).toBeGreaterThan(0);
    }
  });
});

describe("validFeedbackKey — correction transparency (issue #19)", () => {
  it("does NOT claim grammar correctness without a grammar service", () => {
    expect(validFeedbackKey(false)).toBe("use.valid_expr_only");
  });
  it("uses the full 'sentence correct' message when a grammar service is configured", () => {
    expect(validFeedbackKey(true)).toBe("use.valid");
  });
});

describe("normalizeForCompare + diffWords (issue #10)", () => {
  it("normalizes case, accents, whitespace and trailing punctuation", () => {
    expect(normalizeForCompare("  Perdó  l'ultima  corsa. ")).toBe(
      normalizeForCompare("perdo l'ultima corsa"),
    );
  });

  it("marks the changed word as removed/added and keeps the rest", () => {
    const diff = diffWords("io magno la pizza", "io mangio la pizza");
    const removed = diff.filter((d) => d.type === "remove").map((d) => d.text);
    const added = diff.filter((d) => d.type === "add").map((d) => d.text);
    const same = diff.filter((d) => d.type === "same").map((d) => d.text);
    expect(removed).toContain("magno");
    expect(added).toContain("mangio");
    expect(same).toEqual(expect.arrayContaining(["io", "la", "pizza"]));
  });
});

describe("applyLanguageToolMatches (build the corrected sentence)", () => {
  it("applies a single replacement", () => {
    const out = applyLanguageToolMatches("prendo l'ultima corsa", [
      { offset: 0, length: 6, replacements: [{ value: "Prendo" }] },
    ]);
    expect(out).toBe("Prendo l'ultima corsa");
  });

  it("applies several matches without shifting offsets (right-to-left)", () => {
    const out = applyLanguageToolMatches("io magno la pizza", [
      { offset: 0, length: 2, replacements: [{ value: "Io" }] },
      { offset: 3, length: 5, replacements: [{ value: "mangio" }] },
    ]);
    expect(out).toBe("Io mangio la pizza");
  });

  it("skips matches that carry no replacement", () => {
    const out = applyLanguageToolMatches("una frase", [
      { offset: 0, length: 3, replacements: [] },
    ]);
    expect(out).toBe("una frase");
  });
});

describe("evaluateUseAsync (network-backed corrector, e.g. LanguageTool)", () => {
  const wrong: AsyncSentenceCorrector = async () => ({
    correct: false,
    correction: "Prendo l'ultima corsa del tram.",
  });
  const right: AsyncSentenceCorrector = async (s) => ({ correct: true, correction: s });

  it("(a) expression-missing without even calling the corrector", async () => {
    const spy = vi.fn(wrong);
    const r = await evaluateUseAsync("Il gatto dorme.", use, "it", spy);
    expect(r.state).toBe("expression-missing");
    expect(spy).not.toHaveBeenCalled();
  });

  it("(b) needs-correction with the corrected sentence from the service", async () => {
    const r = await evaluateUseAsync("prendo l'ultima corsa", use, "it", wrong);
    expect(r.state).toBe("needs-correction");
    if (r.state === "needs-correction") {
      expect(r.correction).toBe("Prendo l'ultima corsa del tram.");
      expect(r.diff.some((d) => d.type !== "same")).toBe(true);
    }
  });

  it("(c) valid when the service reports no error", async () => {
    const r = await evaluateUseAsync("Prendo l'ultima corsa.", use, "it", right);
    expect(r.state).toBe("valid");
  });
});
