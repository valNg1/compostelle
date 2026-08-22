/**
 * COMPOSTELLE — Journey repository port.
 *
 * The application depends on this interface, never on a concrete storage
 * technology. Adapters (Supabase, in-memory, …) implement it. This keeps the
 * domain and application layers free of any Supabase / SQL dependency:
 *
 *   UI → application (service) → JourneyRepository (port) → adapter → storage
 *
 * A journey is keyed by an opaque, anonymous `learnerId` (a per-device id), so
 * durable storage works without authentication.
 */

import type { LanguageJourney } from "../domain/journey";

export interface JourneyRepository {
  /** Load the durable journey for a learner, or `null` if none. */
  load(learnerId: string): Promise<LanguageJourney | null>;
  /** Create or replace the durable journey for a learner. */
  save(learnerId: string, journey: LanguageJourney): Promise<void>;
  /** Remove the durable journey for a learner. */
  clear(learnerId: string): Promise<void>;
}
