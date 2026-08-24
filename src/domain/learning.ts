/**
 * COMPOSTELLE — pedagogical model for the learning loop.
 *
 * Deterministic, data-driven (no external LLM required). The same structures
 * back every language: content carries annotations (UNDERSTAND), recall items
 * (RECALL) and a use prompt (USE). Memory state lives in `./memory.ts`.
 */

import type { DeclaredLevel } from "./journey";
import type { InterfaceLanguage } from "./i18n";

/** A word/expression worth understanding, glossed for the reader. */
export interface Annotation {
  /** Stable id, unique within its content. */
  id: string;
  /** The expression as it appears in the target-language body. */
  expression: string;
  /** Short meaning, in simple target-language terms. */
  meaning: string;
  /** Legacy translation (UI language / English). Prefer `translations`. */
  translation: string;
  /** Interface-language translations, e.g. `{ en, fr }` — preferred. */
  translations?: Partial<Record<InterfaceLanguage, string>>;
  /**
   * CEFR tier at which this expression becomes worth annotating. Used to adapt
   * UNDERSTAND density/selection to the learner (advanced learners skip easy
   * expressions). Optional: units without it are shown in full (legacy).
   */
  difficulty?: DeclaredLevel;
  /** Optional very short extra example (target language). */
  example?: string;
}

/** Translation of an annotation in the interface language, with fallback. */
export function annotationTranslation(
  annotation: Annotation,
  interfaceLanguage: InterfaceLanguage,
): string {
  return (
    annotation.translations?.[interfaceLanguage] ??
    annotation.translations?.en ??
    annotation.translation
  );
}

/** Kinds of short recall interaction. */
export type RecallKind = "meaning" | "gap" | "comprehension";

/** A single, immediately-corrected recall interaction. */
export interface RecallItem {
  id: string;
  kind: RecallKind;
  /** Base instruction/question (interface base = English). See `promptI18n`. */
  prompt: string;
  /** Interface-language instruction/question override, e.g. `{ en, fr }`. */
  promptI18n?: Partial<Record<InterfaceLanguage, string>>;
  /** Base options (English for meaning/comprehension; target for gap). */
  options: string[];
  /** Interface-language options override (meaning/comprehension). */
  optionsI18n?: Partial<Record<InterfaceLanguage, string[]>>;
  /** Index of the correct option. */
  answerIndex: number;
  /** Annotation reinforced by this item (drives MEMORY), if any. */
  annotationId?: string;
}

/** A low-friction production micro-activity (USE). */
export interface UsePrompt {
  /** Base instruction (interface base = English). See `promptI18n`. */
  prompt: string;
  /** Interface-language instruction override, e.g. `{ en, fr }`. */
  promptI18n?: Partial<Record<InterfaceLanguage, string>>;
  /** Optional sentence to complete, with a "____" gap (target language). */
  gapSentence?: string;
  /** Optional starter phrase (target language) — scaffold for lower levels. */
  starter?: string;
  /** A valid sample answer (revealed for self-check). */
  sampleAnswer: string;
  /** Expressions we hope to see used (self-check + memory). */
  keyExpressions: string[];
}

/** Resolve a recall item's instruction in the interface language. */
export function recallPrompt(
  item: RecallItem,
  interfaceLanguage: InterfaceLanguage,
): string {
  return (
    item.promptI18n?.[interfaceLanguage] ?? item.promptI18n?.en ?? item.prompt
  );
}

/** Resolve a recall item's options in the interface language. */
export function recallOptions(
  item: RecallItem,
  interfaceLanguage: InterfaceLanguage,
): string[] {
  return (
    item.optionsI18n?.[interfaceLanguage] ??
    item.optionsI18n?.en ??
    item.options
  );
}

/** Resolve a use prompt's instruction in the interface language. */
export function usePromptText(
  use: UsePrompt,
  interfaceLanguage: InterfaceLanguage,
): string {
  return use.promptI18n?.[interfaceLanguage] ?? use.promptI18n?.en ?? use.prompt;
}

/** The full pedagogical payload attached to a content item. */
export interface LearningContent {
  annotations: Annotation[];
  recall: RecallItem[];
  use: UsePrompt;
}

/** True when a content item can be played through the full learning loop. */
export function isPlayable(
  content: Partial<LearningContent> | undefined | null,
): content is LearningContent {
  return Boolean(
    content &&
      content.annotations &&
      content.annotations.length > 0 &&
      content.recall &&
      content.recall.length > 0 &&
      content.use,
  );
}

/** Whether a free-text answer plausibly used any of the key expressions. */
export function answerUsesKeyExpression(
  answer: string,
  keyExpressions: string[],
): boolean {
  const normalized = answer.trim().toLowerCase();
  if (normalized.length === 0) return false;
  return keyExpressions.some((k) =>
    normalized.includes(k.trim().toLowerCase()),
  );
}

// --- USE evaluation: expression + whole-sentence correctness (issue #5) ----

/** Result of judging a whole sentence: correct?, plus a full corrected form. */
export interface SentenceCorrection {
  correct: boolean;
  /** A complete, reformulated sentence (equal to the input when already correct). */
  correction: string;
}

/**
 * Port for grammar checking. A real implementation would call an LLM / grammar
 * API (the project ships none — see `deterministicCorrector`). Kept synchronous
 * to match the deterministic pedagogy; an async adapter can wrap it later.
 */
export type SentenceCorrector = (sentence: string) => SentenceCorrection;

/**
 * The three states surfaced to the UI:
 *  - `expression-missing`: the target expression was not used;
 *  - `needs-correction`: expression used but the sentence is not correct — a
 *    full reformulated `correction` is proposed;
 *  - `valid`: expression used and the whole sentence is correct.
 */
export type UseEvaluation =
  | { state: "expression-missing" }
  | { state: "needs-correction"; correction: string }
  | { state: "valid" };

/**
 * Deterministic fallback corrector used when no grammar service is configured.
 *
 * IMPORTANT: this does NOT judge deep grammar — that genuinely requires an LLM
 * or grammar API, which this project deliberately does not have. It only
 * normalizes surface form (whitespace, capitalization, terminal punctuation)
 * and proposes the tidied sentence. Inject a real `SentenceCorrector` into
 * `evaluateUse` to get true grammatical evaluation + reformulation.
 */
export function deterministicCorrector(sentence: string): SentenceCorrection {
  let s = sentence.trim().replace(/\s+/g, " ");
  s = s.replace(/\s+([.,;:!?…])/g, "$1");
  if (s.length > 0) s = s.charAt(0).toUpperCase() + s.slice(1);
  if (s.length > 0 && !/[.!?…]$/.test(s)) s += ".";
  return { correct: s === sentence.trim(), correction: s };
}

/**
 * Evaluate a learner's USE answer in two stages: first that the target
 * expression is present, then that the whole sentence is correct (delegated to
 * the injected `corrector`). Returns one of three states for the UI.
 */
export function evaluateUse(
  answer: string,
  use: UsePrompt,
  corrector: SentenceCorrector = deterministicCorrector,
): UseEvaluation {
  if (!answerUsesKeyExpression(answer, use.keyExpressions)) {
    return { state: "expression-missing" };
  }
  const { correct, correction } = corrector(answer);
  return correct ? { state: "valid" } : { state: "needs-correction", correction };
}

/**
 * Async corrector (network-backed), e.g. a self-hosted LanguageTool instance.
 * Language-aware: the target language of the learner's sentence is passed
 * through so the grammar service checks against the right rules.
 */
export type AsyncSentenceCorrector = (
  sentence: string,
  language: string,
) => Promise<SentenceCorrection>;

/** Async twin of {@link evaluateUse}; keeps the exact same 3-state contract. */
export async function evaluateUseAsync(
  answer: string,
  use: UsePrompt,
  language: string,
  corrector: AsyncSentenceCorrector,
): Promise<UseEvaluation> {
  if (!answerUsesKeyExpression(answer, use.keyExpressions)) {
    return { state: "expression-missing" };
  }
  const { correct, correction } = await corrector(answer, language);
  return correct ? { state: "valid" } : { state: "needs-correction", correction };
}

/** A LanguageTool `/v2/check` match (only the fields we consume). */
export interface LanguageToolMatch {
  offset: number;
  length: number;
  replacements: { value: string }[];
}

/**
 * Build a corrected sentence by applying each match's first replacement.
 * Applied right-to-left so earlier offsets stay valid. Matches without a
 * replacement are left untouched. Pure and deterministic.
 */
export function applyLanguageToolMatches(
  sentence: string,
  matches: readonly LanguageToolMatch[],
): string {
  const ordered = [...matches].sort((a, b) => b.offset - a.offset);
  let out = sentence;
  for (const m of ordered) {
    const replacement = m.replacements[0]?.value;
    if (replacement === undefined) continue;
    out = out.slice(0, m.offset) + replacement + out.slice(m.offset + m.length);
  }
  return out;
}

// --- Adaptive UNDERSTAND density (by declared level + content length) -----

const LEVEL_RANK: Record<DeclaredLevel, number> = {
  A1: 1,
  A2: 2,
  UNKNOWN: 2, // treat "I don't know" like an early learner: more guidance
  B1: 3,
  B2: 4,
  C1: 5,
};

/**
 * Share of a text's WORDS we aim to underline as contextual help (issue #6).
 * Centred on ~20%, modulated by level so beginners get a little more guidance
 * and advanced learners a little less. Density is measured in words covered by
 * the selected expressions (multi-word idioms count for their length), so it
 * matches "≈20% of the words of each text".
 */
export const HELP_RATIO: Record<DeclaredLevel, number> = {
  A1: 0.24,
  A2: 0.22,
  UNKNOWN: 0.22,
  B1: 0.2,
  B2: 0.18,
  C1: 0.16,
};

/** Rough sentence count of a body (deterministic). */
export function countSentences(body: string): number {
  const parts = body.split(/[.!?…]+/).map((s) => s.trim()).filter(Boolean);
  return Math.max(1, parts.length);
}

/** Word count of a body/expression (deterministic, whitespace-based). */
export function countWords(text: string): number {
  return Math.max(1, text.trim().split(/\s+/).filter(Boolean).length);
}

/** Target number of help-words (~HELP_RATIO of the text) for a learner. */
export function targetHelpWords(level: DeclaredLevel, wordCount: number): number {
  return Math.max(1, Math.round(HELP_RATIO[level] * wordCount));
}

/**
 * Choose which annotations to surface for a learner, aiming for ~20% of the
 * text's words underlined (issue #6). Advanced learners get fewer, richer
 * expressions (easy ones dropped); beginners get more guidance.
 *
 * Rule: an annotation is a candidate when its difficulty rank ≥ the learner's
 * rank (things at/above your level are what you may not know). Candidates are
 * added richest-first until the covered words reach the level's help target
 * (≈HELP_RATIO × wordCount), then reading order is restored. The selection is
 * naturally capped by the authored pool — it can never underline more than what
 * was written (thin pools stay below 20%). Units without any `difficulty` tag
 * are returned in full (legacy behaviour).
 */
export function selectAnnotations(
  annotations: readonly Annotation[],
  level: DeclaredLevel,
  wordCount: number,
): Annotation[] {
  const tagged = annotations.some((a) => a.difficulty !== undefined);
  if (!tagged) return [...annotations];

  const learnerRank = LEVEL_RANK[level];
  const candidates = annotations.filter(
    (a) => LEVEL_RANK[a.difficulty ?? "B1"] >= learnerRank,
  );
  const richestFirst = [...candidates].sort(
    (a, b) => LEVEL_RANK[b.difficulty ?? "B1"] - LEVEL_RANK[a.difficulty ?? "B1"],
  );

  const target = targetHelpWords(level, wordCount);
  const chosen: Annotation[] = [];
  let covered = 0;
  for (const a of richestFirst) {
    if (covered >= target) break;
    chosen.push(a);
    covered += countWords(a.expression);
  }
  const firstCandidate = richestFirst[0];
  if (chosen.length === 0 && firstCandidate) chosen.push(firstCandidate);

  // Restore reading order for display.
  return chosen.sort((a, b) => annotations.indexOf(a) - annotations.indexOf(b));
}

/** A run of body text, optionally carrying the annotation it renders. */
export interface TextSegment {
  text: string;
  annotation?: Annotation;
}

/**
 * Split a body into plain runs and annotated runs (first, non-overlapping
 * occurrence of each annotation's expression, case-insensitive). Pure and
 * deterministic — the UNDERSTAND renderer just maps these to spans/buttons.
 */
export function buildAnnotatedSegments(
  body: string,
  annotations: readonly Annotation[],
): TextSegment[] {
  const lower = body.toLowerCase();
  const matches = annotations
    .map((annotation) => {
      const start = lower.indexOf(annotation.expression.toLowerCase());
      return start < 0
        ? null
        : { start, end: start + annotation.expression.length, annotation };
    })
    .filter((m): m is { start: number; end: number; annotation: Annotation } =>
      m !== null,
    )
    .sort((a, b) => a.start - b.start);

  const segments: TextSegment[] = [];
  let cursor = 0;
  let lastEnd = -1;
  for (const m of matches) {
    if (m.start < lastEnd) continue; // skip overlaps
    if (m.start > cursor) segments.push({ text: body.slice(cursor, m.start) });
    segments.push({ text: body.slice(m.start, m.end), annotation: m.annotation });
    cursor = m.end;
    lastEnd = m.end;
  }
  if (cursor < body.length) segments.push({ text: body.slice(cursor) });
  return segments;
}
