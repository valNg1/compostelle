import { describe, it, expect } from "vitest";
import {
  createJourney,
  emptyDraft,
  toggleInterest,
  validateDraft,
  MVP_LANGUAGE,
  type JourneyDraft,
} from "./journey";

describe("validateDraft — a journey cannot be validated without a declared level", () => {
  it("is invalid when no level is declared", () => {
    const draft: JourneyDraft = { declaredLevel: null, interests: ["thriller"] };
    const result = validateDraft(draft);
    expect(result.valid).toBe(false);
    expect(result.errors.declaredLevel).toBe("required");
  });

  it("creating a journey from a draft without a declared level throws", () => {
    const draft: JourneyDraft = { declaredLevel: null, interests: ["thriller"] };
    expect(() => createJourney(draft)).toThrow();
  });

  it("becomes valid once a level and an interest are chosen", () => {
    const draft: JourneyDraft = { declaredLevel: "B1", interests: ["history"] };
    expect(validateDraft(draft).valid).toBe(true);
  });
});

describe('"I don\'t know my level" (UNKNOWN)', () => {
  it("is accepted as a valid declared level", () => {
    const draft: JourneyDraft = {
      declaredLevel: "UNKNOWN",
      interests: ["travel"],
    };
    expect(validateDraft(draft).valid).toBe(true);
  });

  it("still yields a null estimatedLevel — the two stay separate", () => {
    const journey = createJourney({
      declaredLevel: "UNKNOWN",
      interests: ["travel"],
    });
    expect(journey.declaredLevel).toBe("UNKNOWN");
    expect(journey.estimatedLevel).toBeNull();
  });
});

describe("interest selection", () => {
  it("requires at least one interest to validate", () => {
    const draft: JourneyDraft = { declaredLevel: "A2", interests: [] };
    const result = validateDraft(draft);
    expect(result.valid).toBe(false);
    expect(result.errors.interests).toBe("required");
  });

  it("toggles an interest on and off immutably", () => {
    const start = emptyDraft();
    const withThriller = toggleInterest(start, "thriller");
    expect(withThriller.interests).toEqual(["thriller"]);
    expect(start.interests).toEqual([]); // original untouched

    const both = toggleInterest(withThriller, "news");
    expect(both.interests).toEqual(["thriller", "news"]);

    const removed = toggleInterest(both, "thriller");
    expect(removed.interests).toEqual(["news"]);
  });

  it("supports selecting multiple interests", () => {
    let draft = emptyDraft();
    draft = toggleInterest(draft, "thriller");
    draft = toggleInterest(draft, "culture");
    draft = toggleInterest(draft, "sport");
    expect(draft.interests).toEqual(["thriller", "culture", "sport"]);
  });
});

describe("createJourney — declaredLevel and estimatedLevel are never merged", () => {
  it("sets the MVP language and initialises estimatedLevel to null", () => {
    const journey = createJourney({
      declaredLevel: "C1",
      interests: ["news", "history"],
    });
    expect(journey.language).toBe(MVP_LANGUAGE);
    expect(journey.language).toBe("it");
    expect(journey.declaredLevel).toBe("C1");
    expect(journey.estimatedLevel).toBeNull();
    expect(journey.interests).toEqual(["news", "history"]);
    expect(typeof journey.createdAt).toBe("string");
    expect(Number.isNaN(Date.parse(journey.createdAt))).toBe(false);
  });

  it("keeps the two fields independent regardless of the declared value", () => {
    for (const declaredLevel of ["A1", "A2", "B1", "B2", "C1", "UNKNOWN"] as const) {
      const journey = createJourney({
        declaredLevel,
        interests: ["surprise_me"],
      });
      expect(journey.declaredLevel).toBe(declaredLevel);
      expect(journey.estimatedLevel).toBeNull();
    }
  });
});
