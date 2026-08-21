/**
 * LONTANO — US-01: Create my language journey
 *
 * Business model for the learner's language journey. This module is UI-agnostic
 * and side-effect free: it only describes the journey and the rules that govern
 * its creation. Persistence lives in `../persistence/journeyStorage.ts`.
 */

/** Languages available in the product. MVP ships Italian only. */
export type Language = "it";

/** The only language offered for the MVP. */
export const MVP_LANGUAGE: Language = "it";

/**
 * Level the learner *declares*. This is only an initial hypothesis about their
 * ability — never a measured truth. `"UNKNOWN"` is the explicit
 * "I don't know my level" choice and is a valid declared value.
 */
export type DeclaredLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "UNKNOWN";

/**
 * Level LONTANO *estimates* from real usage. Deliberately a distinct concept
 * from {@link DeclaredLevel}: it never carries `"UNKNOWN"`, and it is `null`
 * until the product has gathered enough signal to estimate anything.
 *
 * declaredLevel and estimatedLevel must never be merged.
 */
export type EstimatedLevel = "A1" | "A2" | "B1" | "B2" | "C1" | null;

/** Reading interests offered at journey creation. */
export type Interest =
  | "thriller"
  | "history"
  | "travel"
  | "culture"
  | "news"
  | "sport"
  | "everyday_life"
  | "surprise_me";

/** A created, valid language journey. */
export interface LanguageJourney {
  language: Language;
  declaredLevel: DeclaredLevel;
  /** Always `null` at creation; populated later by the product, never here. */
  estimatedLevel: EstimatedLevel;
  interests: Interest[];
  /** ISO-8601 creation timestamp. */
  createdAt: string;
}

/** In-progress selection before the journey is validated. */
export interface JourneyDraft {
  declaredLevel: DeclaredLevel | null;
  interests: Interest[];
}

/** Ordered list of declared-level options, with human labels for the UI. */
export const DECLARED_LEVEL_OPTIONS: ReadonlyArray<{
  value: DeclaredLevel;
  label: string;
}> = [
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
  { value: "C1", label: "C1" },
  { value: "UNKNOWN", label: "I don't know my level" },
];

/** Ordered list of interest options, with human labels for the UI. */
export const INTEREST_OPTIONS: ReadonlyArray<{
  value: Interest;
  label: string;
}> = [
  { value: "thriller", label: "Thriller" },
  { value: "history", label: "History" },
  { value: "travel", label: "Travel" },
  { value: "culture", label: "Culture" },
  { value: "news", label: "News" },
  { value: "sport", label: "Sport" },
  { value: "everyday_life", label: "Everyday life" },
  { value: "surprise_me", label: "Surprise me" },
];

/** An empty draft — the starting point of the onboarding flow. */
export function emptyDraft(): JourneyDraft {
  return { declaredLevel: null, interests: [] };
}

/** Toggle an interest in a draft, returning a new draft (immutable). */
export function toggleInterest(
  draft: JourneyDraft,
  interest: Interest,
): JourneyDraft {
  const selected = draft.interests.includes(interest);
  return {
    ...draft,
    interests: selected
      ? draft.interests.filter((i) => i !== interest)
      : [...draft.interests, interest],
  };
}

/** Which fields of a draft are missing / invalid. */
export interface ValidationErrors {
  declaredLevel?: "required";
  interests?: "required";
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationErrors;
}

/**
 * A journey cannot be validated without a declared level. At least one reading
 * interest is also required ("Surprise me" satisfies this in a single tap).
 */
export function validateDraft(draft: JourneyDraft): ValidationResult {
  const errors: ValidationErrors = {};
  if (draft.declaredLevel === null) {
    errors.declaredLevel = "required";
  }
  if (draft.interests.length === 0) {
    errors.interests = "required";
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Build a {@link LanguageJourney} from a valid draft.
 *
 * `estimatedLevel` is always initialised to `null` — the declared level is only
 * a hypothesis and is kept strictly separate from any future estimate.
 *
 * @throws if the draft is not valid (call {@link validateDraft} first).
 */
export function createJourney(
  draft: JourneyDraft,
  now: Date = new Date(),
): LanguageJourney {
  const { valid } = validateDraft(draft);
  if (!valid || draft.declaredLevel === null) {
    throw new Error("Cannot create a journey from an invalid draft.");
  }
  return {
    language: MVP_LANGUAGE,
    declaredLevel: draft.declaredLevel,
    estimatedLevel: null,
    interests: draft.interests,
    createdAt: now.toISOString(),
  };
}
