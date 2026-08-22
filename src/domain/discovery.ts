/**
 * COMPOSTELLE — US-02: discovery selection.
 *
 * Pure, deterministic, explainable selection of "something worth discovering
 * today" from a local catalog, based on the learner's declared interests.
 *
 * Design (D-07): selection is interest-based only. There is no CEFR adaptation
 * in this slice and no `estimatedLevel` is invented — the function never mutates
 * the journey and never touches persistence.
 */

import type { Interest, LanguageJourney } from "./journey";
import type { Category, ContentItem } from "./content";
import { CATEGORIES } from "./content";

/** A personalised discovery feed: one highlight plus a few alternatives. */
export interface DiscoveryFeed {
  featured: ContentItem | null;
  alternatives: ContentItem[];
}

export interface SelectOptions {
  /** Maximum number of alternatives shown alongside the featured item. */
  maxAlternatives?: number;
}

const DEFAULT_MAX_ALTERNATIVES = 3;

const CATEGORY_SET: ReadonlySet<string> = new Set(CATEGORIES);

function isCategory(interest: Interest): interest is Interest & Category {
  return CATEGORY_SET.has(interest);
}

/**
 * The learner's explicit interest categories, i.e. declared interests minus
 * `surprise_me` (a preference, not a category).
 */
export function explicitCategories(journey: LanguageJourney): Category[] {
  return journey.interests.filter(isCategory) as Category[];
}

/**
 * Build the discovery feed for a journey against a catalog.
 *
 * Rules (see US-02):
 *  - `matched`   = catalog items whose category is a declared interest (stable
 *                  catalog order);
 *  - `unmatched` = the rest (stable catalog order);
 *  - if nothing matches -> fall back to the whole catalog ("something worth
 *    discovering today"); else if `surprise_me` is on -> matched then unmatched
 *    (exploration); else -> matched only;
 *  - featured = first of the ranked list; alternatives = the next ones, capped.
 */
export function selectDiscoveryFeed(
  journey: LanguageJourney,
  catalog: readonly ContentItem[],
  options: SelectOptions = {},
): DiscoveryFeed {
  const maxAlternatives = options.maxAlternatives ?? DEFAULT_MAX_ALTERNATIVES;
  const explicit = new Set(explicitCategories(journey));
  const allowSurprise = journey.interests.includes("surprise_me");

  const matched = catalog.filter((c) => explicit.has(c.category));
  const unmatched = catalog.filter((c) => !explicit.has(c.category));

  let ranked: ContentItem[];
  if (matched.length === 0) {
    ranked = [...catalog]; // clean fallback
  } else if (allowSurprise) {
    ranked = [...matched, ...unmatched]; // exploration
  } else {
    ranked = [...matched];
  }

  return {
    featured: ranked[0] ?? null,
    alternatives: ranked.slice(1, 1 + maxAlternatives),
  };
}
