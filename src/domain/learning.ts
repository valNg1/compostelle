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
