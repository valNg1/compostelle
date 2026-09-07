import { describe, it, expect } from "vitest";
import { reuseFeedback, type UseEvaluation } from "./learning";

/*
 * Reuse feedback contract (troubleshooting/compostelle-reuse-feedback).
 * Tests the STRUCTURE and critical semantic behaviour of reuseFeedback — not
 * exact prose (assessment is an enum the UI maps to i18n), so the tests stay
 * robust to wording and to the underlying corrector.
 */

describe("reuseFeedback — structured Reuse result", () => {
  it("(1) fully correct sentence → 'correct', keeps the learner's sentence, no corrections, no retry", () => {
    const ev: UseEvaluation = { state: "valid" };
    const fb = reuseFeedback("Prendo l'ultima corsa del tram.", ev);
    expect(fb.assessment).toBe("correct");
    expect(fb.correctedSentence).toBe("Prendo l'ultima corsa del tram.");
    expect(fb.mainCorrections).toEqual([]);
    expect(fb.retrySuggested).toBe(false);
  });

  it("(2) understandable but incorrect → 'understandable', proposes the corrected sentence, explains corrections, offers retry", () => {
    const ev: UseEvaluation = {
      state: "needs-correction",
      correction: "Prendo l'ultima corsa del tram per tornare a casa.",
      diff: [],
      issueTypes: ["grammar"],
    };
    const fb = reuseFeedback("io prendo l'ultima corsa", ev);
    expect(fb.assessment).toBe("understandable");
    expect(fb.correctedSentence).toBe(
      "Prendo l'ultima corsa del tram per tornare a casa.",
    );
    expect(fb.mainCorrections).toEqual([{ nature: "grammar" }]);
    expect(fb.retrySuggested).toBe(true);
  });

  it("(3) grammatically fine but the target expression is missing → 'expression-missing', offers retry", () => {
    const ev: UseEvaluation = { state: "expression-missing" };
    const fb = reuseFeedback("Il gatto dorme sul divano.", ev);
    expect(fb.assessment).toBe("expression-missing");
    expect(fb.mainCorrections).toEqual([]);
    expect(fb.retrySuggested).toBe(true);
  });

  it("(4) several errors → one correction entry per distinct issue nature", () => {
    const ev: UseEvaluation = {
      state: "needs-correction",
      correction: "Ieri sono andato al mercato e ho comprato del pane.",
      diff: [],
      issueTypes: ["grammar", "typographical"],
    };
    const fb = reuseFeedback("ieri io andare al mercato e comprato pane", ev);
    expect(fb.mainCorrections).toEqual([
      { nature: "grammar" },
      { nature: "typographical" },
    ]);
    expect(fb.retrySuggested).toBe(true);
  });

  it("(edge) needs-correction with no issueType → corrected sentence but empty mainCorrections", () => {
    // Real LanguageTool path: a match can carry a replacement but no issueType,
    // so the corrected sentence changes while mainCorrections stays empty.
    const ev: UseEvaluation = {
      state: "needs-correction",
      correction: "Prendo l'ultima corsa del tram.",
      diff: [],
      issueTypes: [],
    };
    const fb = reuseFeedback("prendo ultima corsa tram", ev);
    expect(fb.assessment).toBe("understandable");
    expect(fb.correctedSentence).toBe("Prendo l'ultima corsa del tram.");
    expect(fb.mainCorrections).toEqual([]);
    expect(fb.retrySuggested).toBe(true);
  });

  it("(edge) trims the learner sentence and never throws on blank input", () => {
    // The UI disables submit on blank input; the pure mapping must still be
    // total and return a well-formed contract.
    const fb = reuseFeedback("   ", { state: "valid" });
    expect(fb.assessment).toBe("correct");
    expect(fb.correctedSentence).toBe("");
    expect(fb.mainCorrections).toEqual([]);
    expect(fb.retrySuggested).toBe(false);
  });

  it("does not invent an idiomatic alternative with the current grammar engine", () => {
    // Documents the known limitation: LanguageTool cannot produce a native-like
    // reformulation, so the field stays undefined until a generative corrector
    // is added. See 04-gap-analysis.md.
    const fb = reuseFeedback("Prendo l'ultima corsa del tram.", {
      state: "valid",
    });
    expect(fb.idiomaticAlternative).toBeUndefined();
  });
});
