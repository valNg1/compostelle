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

// --- Adaptive UNDERSTAND density (by declared level + content length) -----

const LEVEL_RANK: Record<DeclaredLevel, number> = {
  A1: 1,
  A2: 2,
  UNKNOWN: 2, // treat "I don't know" like an early learner: more guidance
  B1: 3,
  B2: 4,
  C1: 5,
};

/** Target annotation count for a ~5-sentence text, by declared level. */
const BASE_TARGET: Record<DeclaredLevel, number> = {
  A1: 9,
  A2: 8,
  UNKNOWN: 8,
  B1: 7,
  B2: 6,
  C1: 4,
};

/** Rough sentence count of a body (deterministic). */
export function countSentences(body: string): number {
  const parts = body.split(/[.!?…]+/).map((s) => s.trim()).filter(Boolean);
  return Math.max(1, parts.length);
}

/** Target number of annotations for a level and content length (~5 sentences = base). */
export function targetAnnotationCount(
  level: DeclaredLevel,
  sentenceCount: number,
): number {
  const scaled = Math.round((BASE_TARGET[level] * sentenceCount) / 5);
  return Math.max(1, scaled);
}

/**
 * Choose which annotations to surface for a learner. Advanced learners get
 * fewer, richer expressions (easy ones dropped); beginners get more guidance.
 * Rule: an annotation is a candidate when its difficulty rank ≥ the learner's
 * rank (things at/above your level are what you may not know). The candidate
 * set is then capped to the level+length target, keeping the richest and
 * preserving reading order. Units without any `difficulty` tag are returned in
 * full (legacy behaviour).
 */
export function selectAnnotations(
  annotations: readonly Annotation[],
  level: DeclaredLevel,
  sentenceCount: number,
): Annotation[] {
  const tagged = annotations.some((a) => a.difficulty !== undefined);
  if (!tagged) return [...annotations];

  const learnerRank = LEVEL_RANK[level];
  const candidates = annotations.filter(
    (a) => LEVEL_RANK[a.difficulty ?? "B1"] >= learnerRank,
  );
  const cap = Math.min(
    candidates.length,
    targetAnnotationCount(level, sentenceCount),
  );
  const richestFirst = [...candidates].sort(
    (a, b) => LEVEL_RANK[b.difficulty ?? "B1"] - LEVEL_RANK[a.difficulty ?? "B1"],
  );
  const chosen = richestFirst.slice(0, cap);
  // Restore reading order for display.
  return chosen.sort(
    (a, b) => annotations.indexOf(a) - annotations.indexOf(b),
  );
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
