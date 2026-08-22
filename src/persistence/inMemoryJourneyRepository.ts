/**
 * COMPOSTELLE — in-memory JourneyRepository.
 *
 * A durable-contract implementation backed by a Map. Used in tests and as a
 * safe stand-in; it honours the same async contract as the Supabase adapter.
 */

import type { LanguageJourney } from "../domain/journey";
import type { JourneyRepository } from "../application/journeyRepository";

export class InMemoryJourneyRepository implements JourneyRepository {
  private readonly store = new Map<string, LanguageJourney>();

  async load(learnerId: string): Promise<LanguageJourney | null> {
    const found = this.store.get(learnerId);
    return found ? structuredClone(found) : null;
  }

  async save(learnerId: string, journey: LanguageJourney): Promise<void> {
    this.store.set(learnerId, structuredClone(journey));
  }

  async clear(learnerId: string): Promise<void> {
    this.store.delete(learnerId);
  }
}
