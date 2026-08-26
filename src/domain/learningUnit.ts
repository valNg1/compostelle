/**
 * COMPOSTELLE — canonical Learning Unit.
 *
 * A Learning Unit is the atomic pedagogical experience of COMPOSTELLE: a piece
 * of content packaged with everything needed to play CONTENT → UNDERSTAND →
 * RECALL → USE → MEMORY. It is exactly a `ContentItem` that also carries a
 * `LearningContent` payload (annotations / recall / use). We do NOT duplicate
 * those types — a Learning Unit is their intersection.
 *
 * This is also the target shape of the future AI pipeline: the generator is
 * asked for a Learning Unit, never a plain article. See `LearningUnitRequest`.
 */

import type { ContentItem, Category, Modality } from "./content";
import type { Language } from "./language";
import type { DeclaredLevel } from "./journey";
import { isPlayable, type LearningContent } from "./learning";

/** A content item guaranteed to carry the full pedagogical payload. */
export type LearningUnit = ContentItem & LearningContent;

/** Narrow a content item to a Learning Unit, or `null` if not playable. */
export function toLearningUnit(content: ContentItem): LearningUnit | null {
  return isPlayable(content) ? (content as LearningUnit) : null;
}

/** All playable Learning Units for a language, in catalog order. */
export function playableUnits(
  catalog: readonly ContentItem[],
  language: Language,
): LearningUnit[] {
  return catalog
    .filter((c) => c.language === language)
    .map(toLearningUnit)
    .filter((u): u is LearningUnit => u !== null);
}

/** Topics (categories) that have at least one playable unit for a language. */
export function unitTopics(
  catalog: readonly ContentItem[],
  language: Language,
): Category[] {
  const seen = new Set<Category>();
  const topics: Category[] = [];
  for (const u of playableUnits(catalog, language)) {
    if (!seen.has(u.category)) {
      seen.add(u.category);
      topics.push(u.category);
    }
  }
  return topics;
}

/** A theme selected on START — a real category or the "surprise me" preference. */
export type Theme = Category | "surprise_me";

/**
 * Pick the Learning Unit to play for a theme (deterministic, catalog order):
 * the first playable unit of that category; `surprise_me` (or an empty theme)
 * falls back to the first playable unit of the language. `null` if none exist.
 */
export function selectUnitForTheme(
  catalog: readonly ContentItem[],
  language: Language,
  theme: Theme,
): LearningUnit | null {
  const units = playableUnits(catalog, language);
  if (theme !== "surprise_me") {
    const match = units.find((u) => u.category === theme);
    if (match) return match;
  }
  return units[0] ?? null;
}

/**
 * Pick the NEXT Learning Unit to play for a theme, skipping lessons the learner
 * has already completed (issue #7). Candidates are the theme's playable units
 * (or, for `surprise_me` or an empty theme, all playable units); returns the
 * first one not in `completedIds`, or `null` when every candidate is done.
 */
export function selectNextUnitForTheme(
  catalog: readonly ContentItem[],
  language: Language,
  theme: Theme,
  completedIds: ReadonlySet<string>,
): LearningUnit | null {
  const all = playableUnits(catalog, language);
  const inTheme =
    theme !== "surprise_me" ? all.filter((u) => u.category === theme) : all;
  const candidates = inTheme.length > 0 ? inTheme : all;
  return candidates.find((u) => !completedIds.has(u.id)) ?? null;
}

/**
 * Pick the next lesson to actually OPEN when the learner asks to continue
 * (issue #8). Prefers a not-yet-completed lesson of the chosen theme, but when
 * that theme is exhausted it falls back to ANY not-yet-completed playable
 * lesson (across themes) so "continue learning" always opens something new.
 * Returns `null` only when every playable lesson of the language is completed —
 * the caller then shows a clear "no more lessons" message, never a blank screen.
 */
export function selectNextLesson(
  catalog: readonly ContentItem[],
  language: Language,
  theme: Theme,
  completedIds: ReadonlySet<string>,
): LearningUnit | null {
  const inTheme = selectNextUnitForTheme(catalog, language, theme, completedIds);
  if (inTheme) return inTheme;
  return (
    playableUnits(catalog, language).find((u) => !completedIds.has(u.id)) ?? null
  );
}

// --- AI pipeline contract (documented, not implemented) ------------------

/** What the future AI generator receives. */
export interface LearningUnitRequest {
  language: Language;
  level: DeclaredLevel;
  modality: Modality;
  topic: Category;
  /** Optional signals so generation can build on prior learning. */
  learnerContext?: {
    knownExpressions?: string[];
    toReview?: string[];
  };
}

/**
 * The future AI pipeline: given a request, return a complete Learning Unit
 * (CONTENT + UNDERSTAND + RECALL + USE + MEMORY TARGETS) — never a plain article.
 * Not implemented in this MVP; this type fixes the contract in Git.
 */
export type LearningUnitGenerator = (
  request: LearningUnitRequest,
) => Promise<LearningUnit>;

/** Expressions a unit asks MEMORY to track (its annotation expressions). */
export function memoryTargets(unit: LearningUnit): string[] {
  return unit.annotations.map((a) => a.expression);
}
