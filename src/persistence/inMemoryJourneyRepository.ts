/**
 * COMPOSTELLE — in-memory JourneyRepository (user-scoped, multi-language).
 *
 * Durable-contract implementation backed by a Map keyed by `${userId}::${lang}`.
 * Used in tests and as a safe stand-in; honours the same async contract as the
 * Supabase adapter, including per-user isolation and multiple journeys per user.
 */

import type { LanguageJourney } from "../domain/journey";
import type { Language } from "../domain/language";
import type { JourneyRepository } from "../application/journeyRepository";

function key(userId: string, language: Language): string {
  return `${userId}::${language}`;
}

export class InMemoryJourneyRepository implements JourneyRepository {
  private readonly store = new Map<string, LanguageJourney>();

  async listByUser(userId: string): Promise<LanguageJourney[]> {
    const prefix = `${userId}::`;
    const result: LanguageJourney[] = [];
    for (const [k, journey] of this.store) {
      if (k.startsWith(prefix)) result.push(structuredClone(journey));
    }
    return result;
  }

  async loadByLanguage(
    userId: string,
    language: Language,
  ): Promise<LanguageJourney | null> {
    const found = this.store.get(key(userId, language));
    return found ? structuredClone(found) : null;
  }

  async save(userId: string, journey: LanguageJourney): Promise<void> {
    this.store.set(key(userId, journey.language), structuredClone(journey));
  }

  async clear(userId: string, language: Language): Promise<void> {
    this.store.delete(key(userId, language));
  }
}
