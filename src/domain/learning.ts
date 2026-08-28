/**
 * COMPOSTELLE — pedagogical model for the learning loop.
 *
 * Deterministic, data-driven (no external LLM required). The same structures
 * back every language: content carries annotations (UNDERSTAND), recall items
 * (RECALL) and a use prompt (USE). Memory state lives in `./memory.ts`.
 */

import type { DeclaredLevel } from "./journey";
import type { InterfaceLanguage } from "./i18n";
import type { MemoryItem, MemoryState } from "./memory";
import { isFunctionWordOnly } from "./stopwords";

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

/**
 * The best available definition for a highlighted expression (issue #12):
 * the target-language meaning if present, else the interface-language
 * translation. Returns "" only when neither exists — the UI then shows an
 * explicit fallback so a highlighted word is never a dead end.
 */
export function annotationDefinition(
  annotation: Annotation,
  interfaceLanguage: InterfaceLanguage,
): string {
  const meaning = annotation.meaning?.trim();
  if (meaning) return meaning;
  return annotationTranslation(annotation, interfaceLanguage)?.trim() ?? "";
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

// --- Replay: prioritise previously-failed recall items (issue #7) ----------

/** Replay priority by memory state: failed first, then still-learning, then rest. */
const REPLAY_RANK: Record<MemoryState, number> = {
  TO_REVIEW: 0,
  LEARNING: 1,
  NEW: 2,
  ACQUIRED: 2,
};

/**
 * Reorder a unit's recall items so the expressions the learner previously
 * failed (TO_REVIEW) come first, then those still being learned (LEARNING),
 * then the rest — stably. Every item is kept (reinjected, never dropped), so a
 * replay revisits the whole lesson but leads with the weak spots.
 */
export function prioritizeRecallForReplay(
  recall: readonly RecallItem[],
  annotations: readonly Annotation[],
  memoryItems: readonly MemoryItem[],
): RecallItem[] {
  const stateByExpression = new Map(memoryItems.map((m) => [m.expression, m.state]));
  const expressionById = new Map(annotations.map((a) => [a.id, a.expression]));
  const rankOf = (item: RecallItem): number => {
    const expression = item.annotationId
      ? expressionById.get(item.annotationId)
      : undefined;
    const state = expression ? stateByExpression.get(expression) : undefined;
    return state ? REPLAY_RANK[state] : 2;
  };
  return recall
    .map((item, index) => ({ item, index, rank: rankOf(item) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((entry) => entry.item);
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

/** A word-level diff segment between the learner's sentence and the correction. */
export interface DiffSegment {
  text: string;
  type: "same" | "add" | "remove";
}

/**
 * Normalize a sentence for MEANINGFUL comparison (issue #10): case-, accent-,
 * whitespace- and punctuation-insensitive. Used to avoid proposing a correction
 * when the "fix" only differs cosmetically from what the learner wrote.
 */
export function normalizeForCompare(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[.,;:!?…]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Word-level diff (LCS) so the UI can show WHAT changed, not an opaque swap. */
export function diffWords(a: string, b: string): DiffSegment[] {
  const aw = a.trim().split(/\s+/).filter(Boolean);
  const bw = b.trim().split(/\s+/).filter(Boolean);
  const eq = (x: string, y: string) => normalizeForCompare(x) === normalizeForCompare(y);
  const n = aw.length;
  const m = bw.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );
  for (let i = n - 1; i >= 0; i--) {
    const row = dp[i]!;
    const next = dp[i + 1]!;
    for (let j = m - 1; j >= 0; j--) {
      row[j] = eq(aw[i]!, bw[j]!)
        ? next[j + 1]! + 1
        : Math.max(next[j]!, row[j + 1]!);
    }
  }
  const out: DiffSegment[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (eq(aw[i]!, bw[j]!)) {
      out.push({ text: bw[j]!, type: "same" });
      i++;
      j++;
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      out.push({ text: aw[i]!, type: "remove" });
      i++;
    } else {
      out.push({ text: bw[j]!, type: "add" });
      j++;
    }
  }
  while (i < n) out.push({ text: aw[i++]!, type: "remove" });
  while (j < m) out.push({ text: bw[j++]!, type: "add" });
  return out;
}

/**
 * The three states surfaced to the UI:
 *  - `expression-missing`: the target expression was not used;
 *  - `needs-correction`: expression used but the sentence is genuinely wrong —
 *    a corrected `correction` is proposed, with a word-level `diff`;
 *  - `valid`: expression used and the sentence is correct (or differs only
 *    cosmetically from the correction).
 */
export type UseEvaluation =
  | { state: "expression-missing" }
  | { state: "needs-correction"; correction: string; diff: DiffSegment[] }
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
  return decideCorrection(answer, corrector(answer));
}

/**
 * Shared decision (issue #10): only surface a correction when it differs
 * MEANINGFULLY from what the learner wrote (case/accent/space/punctuation
 * differences are not errors). Otherwise the answer is valid.
 */
function decideCorrection(
  answer: string,
  { correct, correction }: SentenceCorrection,
): UseEvaluation {
  if (correct) return { state: "valid" };
  if (normalizeForCompare(answer) === normalizeForCompare(correction)) {
    return { state: "valid" };
  }
  return {
    state: "needs-correction",
    correction,
    diff: diffWords(answer.trim(), correction),
  };
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
  return decideCorrection(answer, await corrector(answer, language));
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
 * Share of a text's WORDS we aim to underline as contextual help — parameter A,
 * "highlighting rate" (issue #9). Targets ~30-40% at every level: beginners get
 * a little more, advanced learners a little less, but never starved. Level
 * changes WHICH expressions lead, not how many. (Reuse rate — parameter B — is
 * a separate knob, see `reuseTargets`.)
 * Density is measured in words covered by the selected expressions (multi-word
 * idioms count for their length), matching "≈20% of the words of each text".
 */
export const HELP_RATIO: Record<DeclaredLevel, number> = {
  A1: 0.4,
  A2: 0.38,
  UNKNOWN: 0.38,
  B1: 0.35,
  B2: 0.32,
  C1: 0.3,
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
 * text's words underlined (issue #6).
 *
 * - **Content words only**: pure function words (a lone article/preposition/
 *   conjunction) are never underlined — the help budget goes to vocabulary and
 *   idioms. Multi-word idioms are always eligible.
 * - **Level sets order, not quantity**: expressions at/above the learner's
 *   level lead (richest first), so advanced learners meet the hardest vocabulary
 *   first; below-level expressions then BACKFILL up to the ~20% target so the
 *   text is never under-annotated for advanced learners.
 * - **Capped by the authored pool**: the selection can never underline more than
 *   what was written, so thin pools stay below 20% (reaching 20% there needs
 *   more authored glosses — see the issue #6 note).
 *
 * Units without any `difficulty` tag return all their content-word annotations
 * (legacy behaviour).
 */
export function selectAnnotations(
  annotations: readonly Annotation[],
  level: DeclaredLevel,
  wordCount: number,
): Annotation[] {
  const contentful = annotations.filter((a) => !isFunctionWordOnly(a.expression));
  const tagged = contentful.some((a) => a.difficulty !== undefined);
  if (!tagged) return contentful;

  const learnerRank = LEVEL_RANK[level];
  const richestFirst = (list: Annotation[]) =>
    [...list].sort(
      (a, b) => LEVEL_RANK[b.difficulty ?? "B1"] - LEVEL_RANK[a.difficulty ?? "B1"],
    );
  // At/above level first (what the learner most needs), then below-level as
  // backfill — both ordered richest-first.
  const atOrAbove = contentful.filter(
    (a) => LEVEL_RANK[a.difficulty ?? "B1"] >= learnerRank,
  );
  const below = contentful.filter(
    (a) => LEVEL_RANK[a.difficulty ?? "B1"] < learnerRank,
  );
  const ordered = [...richestFirst(atOrAbove), ...richestFirst(below)];

  const target = targetHelpWords(level, wordCount);
  const chosen: Annotation[] = [];
  let covered = 0;
  for (const a of ordered) {
    if (covered >= target) break;
    chosen.push(a);
    covered += countWords(a.expression);
  }
  const firstCandidate = ordered[0];
  if (chosen.length === 0 && firstCandidate) chosen.push(firstCandidate);

  // Restore reading order for display.
  return chosen.sort((a, b) => annotations.indexOf(a) - annotations.indexOf(b));
}

/**
 * Reuse suggestions (issue #11, parameter B): at least half of the highlighted
 * expressions, offered to the learner as words they CAN reuse in production —
 * never mandatory (validation stays possible without reusing them all). This is
 * a knob independent from the highlighting rate (parameter A). Reading order is
 * preserved.
 */
export function reuseTargets(highlighted: readonly Annotation[]): Annotation[] {
  if (highlighted.length === 0) return [];
  const atLeastHalf = Math.ceil(highlighted.length / 2);
  return highlighted.slice(0, atLeastHalf);
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
