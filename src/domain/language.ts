/**
 * COMPOSTELLE — language model.
 *
 * The product is language-agnostic: the target language is data carried by the
 * journey and the content, never hardcoded in the components or the selection
 * logic. Adding a language is a data/config change, not a structural one.
 */

/** Target languages supported by the MVP. */
export type Language = "it" | "es";

/** Ordered list of supported languages, with UI + native labels. */
export const LANGUAGES: ReadonlyArray<{
  code: Language;
  /** Name in the UI language (English). */
  label: string;
  /** Endonym — the language's own name. */
  endonym: string;
}> = [
  { code: "it", label: "Italian", endonym: "Italiano" },
  { code: "es", label: "Spanish", endonym: "Español" },
];

/** Language proposed first at onboarding. */
export const DEFAULT_LANGUAGE: Language = "it";

const LANGUAGE_CODES: ReadonlySet<string> = new Set(LANGUAGES.map((l) => l.code));

/** Type guard for an unknown value being a supported language code. */
export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && LANGUAGE_CODES.has(value);
}

/** UI label for a language code. */
export function languageLabel(code: Language): string {
  return LANGUAGES.find((l) => l.code === code)?.label ?? code;
}
