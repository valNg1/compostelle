import { describe, it, expect } from "vitest";
import {
  evaluateUse,
  deterministicCorrector,
  type SentenceCorrector,
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
