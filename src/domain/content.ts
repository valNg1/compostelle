/**
 * COMPOSTELLE — US-02: content model.
 *
 * A content item is something worth discovering in the target language. This
 * module is UI-agnostic and side-effect free. The actual catalog (data) lives in
 * `../content/catalog.ts`; the selection logic lives in `./discovery.ts`.
 */

/**
 * Discovery categories. These mirror the learner's reading/discovery interests
 * (see {@link Interest} in `./journey`) minus `surprise_me`, which is a
 * preference, not a category.
 */
import type { Language } from "./language";
import type { Annotation, RecallItem, UsePrompt } from "./learning";

export type Category =
  | "thriller"
  | "history"
  | "travel"
  | "culture"
  | "news"
  | "sport"
  | "everyday_life";

/** Ordered list of the known categories. */
export const CATEGORIES: readonly Category[] = [
  "thriller",
  "history",
  "travel",
  "culture",
  "news",
  "sport",
  "everyday_life",
];

/** Human-readable category labels for the UI. */
export const CATEGORY_LABELS: Record<Category, string> = {
  thriller: "Thriller",
  history: "History",
  travel: "Travel",
  culture: "Culture",
  news: "News",
  sport: "Sport",
  everyday_life: "Everyday life",
};

/**
 * How a piece of content is discovered. The MVP ships `read`; the others are
 * part of the multimodal roadmap (D-06) and are not implemented yet.
 */
export type Modality = "read" | "listen" | "explore";

/** A single discoverable piece of content. */
export interface ContentItem {
  id: string;
  /** Target language this content belongs to. */
  language: Language;
  /** In the target language. */
  title: string;
  category: Category;
  /** Short, enticing teaser (kept in the UI language for the feed chrome). */
  teaser: string;
  /** The content itself, in the target language. */
  body: string;
  estimatedMinutes: number;
  modality: Modality;
  /**
   * Optional pedagogical payload enabling the full learning loop (UNDERSTAND →
   * RECALL → USE). Content without it is still readable (DISCOVER → READ).
   * Same shape for every language.
   */
  annotations?: Annotation[];
  recall?: RecallItem[];
  use?: UsePrompt;
  /**
   * Progression mapping (model B): the sub-level this LEARN lesson counts toward.
   * Completing it records a `unit_progress` row (scored on reuse + corrections,
   * no quiz → caps at 0.60). Absent = the lesson does not feed progression.
   */
  sublevelId?: string;
}

/** Find a content item by id, or `null` if it does not exist. */
export function getContentById(
  catalog: readonly ContentItem[],
  id: string,
): ContentItem | null {
  return catalog.find((c) => c.id === id) ?? null;
}
