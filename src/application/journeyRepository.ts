/**
 * COMPOSTELLE — Journey repository port (user-scoped, multi-language).
 *
 * The application depends on this interface, never on a concrete storage
 * technology. A user owns SEPARATE journeys per target language, so switching
 * language never destroys another language's journey.
 *
 *   UI → application (service) → JourneyRepository (port) → adapter → storage
 *
 * Ownership is an opaque `userId` (the authenticated Supabase `auth.uid()` when
 * durable; a local anonymous id in cache-only mode).
 */

import type { LanguageJourney } from "../domain/journey";
import type { Language } from "../domain/language";

export interface JourneyRepository {
  /** All journeys owned by a user, one per language at most. */
  listByUser(userId: string): Promise<LanguageJourney[]>;
  /** The user's journey for one language, or `null`. */
  loadByLanguage(
    userId: string,
    language: Language,
  ): Promise<LanguageJourney | null>;
  /** Create or replace the user's journey for `journey.language`. */
  save(userId: string, journey: LanguageJourney): Promise<void>;
  /** Remove the user's journey for one language. */
  clear(userId: string, language: Language): Promise<void>;
}
