import { describe, it, expect } from "vitest";
import {
  createJourney,
  emptyDraft,
  toggleInterest,
  validateDraft,
  type JourneyDraft,
} from "./journey";
import { DEFAULT_LANGUAGE, LANGUAGES } from "./language";

/** Draft factory — language defaults to the product default. */
function draft(partial: Partial<JourneyDraft>): JourneyDraft {
  return {
    language: DEFAULT_LANGUAGE,
    declaredLevel: null,
    interests: [],
    ...partial,
  };
}

describe("validateDraft — a journey cannot be validated without a declared level", () => {
  it("is invalid when no level is declared", () => {
    const result = validateDraft(draft({ interests: ["thriller"] }));
    expect(result.valid).toBe(false);
    expect(result.errors.declaredLevel).toBe("required");
  });

  it("creating a journey from a draft without a declared level throws", () => {
    expect(() => createJourney(draft({ interests: ["thriller"] }))).toThrow();
  });

  it("becomes valid once a level and an interest are chosen", () => {
    expect(
      validateDraft(draft({ declaredLevel: "B1", interests: ["history"] })).valid,
    ).toBe(true);
  });
});

describe('"I don\'t know my level" (UNKNOWN)', () => {
  it("is accepted as a valid declared level", () => {
    expect(
      validateDraft(draft({ declaredLevel: "UNKNOWN", interests: ["travel"] }))
        .valid,
    ).toBe(true);
  });

  it("still yields a null estimatedLevel — the two stay separate", () => {
    const journey = createJourney(
      draft({ declaredLevel: "UNKNOWN", interests: ["travel"] }),
    );
    expect(journey.declaredLevel).toBe("UNKNOWN");
    expect(journey.estimatedLevel).toBeNull();
  });
});

describe("language is carried by the journey (it + es)", () => {
  it("supports every configured language", () => {
    for (const { code } of LANGUAGES) {
      const journey = createJourney(
        draft({ language: code, declaredLevel: "A1", interests: ["culture"] }),
      );
      expect(journey.language).toBe(code);
      expect(journey.estimatedLevel).toBeNull();
    }
  });

  it("defaults an empty draft to the default language", () => {
    expect(emptyDraft().language).toBe(DEFAULT_LANGUAGE);
    expect(emptyDraft("es").language).toBe("es");
  });
});

describe("interest selection", () => {
  it("requires at least one interest to validate", () => {
    const result = validateDraft(draft({ declaredLevel: "A2", interests: [] }));
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
    let d = emptyDraft();
    d = toggleInterest(d, "thriller");
    d = toggleInterest(d, "culture");
    d = toggleInterest(d, "sport");
    expect(d.interests).toEqual(["thriller", "culture", "sport"]);
  });
});

describe("createJourney — declaredLevel and estimatedLevel are never merged", () => {
  it("carries the chosen language and initialises estimatedLevel to null", () => {
    const journey = createJourney(
      draft({ declaredLevel: "C1", interests: ["news", "history"] }),
    );
    expect(journey.language).toBe(DEFAULT_LANGUAGE);
    expect(journey.declaredLevel).toBe("C1");
    expect(journey.estimatedLevel).toBeNull();
    expect(journey.interests).toEqual(["news", "history"]);
    expect(Number.isNaN(Date.parse(journey.createdAt))).toBe(false);
  });

  it("keeps the two fields independent regardless of the declared value", () => {
    for (const declaredLevel of ["A1", "A2", "B1", "B2", "C1", "UNKNOWN"] as const) {
      const journey = createJourney(
        draft({ declaredLevel, interests: ["surprise_me"] }),
      );
      expect(journey.declaredLevel).toBe(declaredLevel);
      expect(journey.estimatedLevel).toBeNull();
    }
  });
});
