/**
 * COMPOSTELLE — pedagogical model for the learning loop.
 *
 * Deterministic, data-driven (no external LLM required). The same structures
 * back every language: content carries annotations (UNDERSTAND), recall items
 * (RECALL) and a use prompt (USE). Memory state lives in `./memory.ts`.
 */

/** A word/expression worth understanding, glossed for the reader. */
export interface Annotation {
  /** Stable id, unique within its content. */
  id: string;
  /** The expression as it appears in the target-language body. */
  expression: string;
  /** Short meaning, in simple target-language terms. */
  meaning: string;
  /** Translation in the UI language (English). */
  translation: string;
  /** Optional very short extra example (target language). */
  example?: string;
}

/** Kinds of short recall interaction. */
export type RecallKind = "meaning" | "gap" | "comprehension";

/** A single, immediately-corrected recall interaction. */
export interface RecallItem {
  id: string;
  kind: RecallKind;
  /** Question, or a sentence with a "____" gap. */
  prompt: string;
  /** 2–4 options. */
  options: string[];
  /** Index of the correct option in `options`. */
  answerIndex: number;
  /** Annotation reinforced by this item (drives MEMORY), if any. */
  annotationId?: string;
}

/** A low-friction production micro-activity (USE). */
export interface UsePrompt {
  /** Instruction shown to the learner. */
  prompt: string;
  /** Optional sentence to complete, with a "____" gap. */
  gapSentence?: string;
  /** A valid sample answer (revealed for self-check). */
  sampleAnswer: string;
  /** Expressions we hope to see used (self-check + memory). */
  keyExpressions: string[];
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
