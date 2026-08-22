/**
 * COMPOSTELLE — combined content catalog.
 *
 * Language-specific catalogs are kept in their own files but share the exact
 * same `ContentItem` schema. Discovery filters by the journey's target language,
 * so all languages can live in one flat catalog without any per-language code.
 */

import type { ContentItem } from "../domain/content";
import { IT_CATALOG } from "./catalog.it";
import { ES_CATALOG } from "./catalog.es";

export const CATALOG: ContentItem[] = [...IT_CATALOG, ...ES_CATALOG];
