/**
 * COMPOSTELLE — US-02: discovery selection.
 *
 * Pure, deterministic, explainable selection of "something worth discovering
 * today" from a local catalog, based on the learner's declared interests.
 *
 * Design (D-07): selection is interest-based only. There is no CEFR adaptation
 * in this slice and no `estimatedLevel` is invented — the function never mutates
 * the journey and never touches persistence.
 *
 * Language isolation: the feed only ever contains content in the journey's
 * target language. `Surprise me` explores other categories, never other
 * languages.
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
 *  - the catalog is first restricted to the journey's target language;
 *  - `matched`   = in-language items whose category is a declared interest
 *                  (stable catalog order);
 *  - `unmatched` = the rest of the in-language items (stable catalog order);
 *  - if nothing matches -> fall back to the whole in-language catalog
 *    ("something worth discovering today"); else if `surprise_me` is on ->
 *    matched then unmatched (exploration); else -> matched only;
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

  // Language isolation first: never mix target languages, Surprise me included.
  const inLanguage = catalog.filter((c) => c.language === journey.language);
  const matched = inLanguage.filter((c) => explicit.has(c.category));
  const unmatched = inLanguage.filter((c) => !explicit.has(c.category));

  let ranked: ContentItem[];
  if (matched.length === 0) {
    ranked = [...inLanguage]; // clean fallback, still language-isolated
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
