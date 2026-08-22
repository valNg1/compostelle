/**
 * COMPOSTELLE — Journey application service (user-scoped, multi-language).
 *
 * Coordinates the durable repository (authoritative source of truth) with a
 * local cache, for a single owning user (`userId`):
 *  - a user can hold SEPARATE journeys per language; switching never destroys one;
 *  - durable storage is authoritative; the cache is a fast/offline resilience
 *    layer and the legacy-migration source, never the source of truth;
 *  - the domain never sees any of this — it only knows `LanguageJourney`.
 */

import type { LanguageJourney } from "../domain/journey";
import type { Language } from "../domain/language";
import type { JourneyRepository } from "./journeyRepository";

/**
 * Local cache port. The localStorage implementation lives in
 * `../persistence/localJourneyCache.ts`; tests provide a fake.
 */
export interface JourneyCache {
  /** All cached journeys (performs legacy-key migration on first read). */
  loadAll(): LanguageJourney[];
  /** Upsert a cached journey by its language. */
  save(journey: LanguageJourney): void;
  /** Remove the cached journey for a language. */
  remove(language: Language): void;
  /** Clear all cached journeys. */
  clearAll(): void;
  /** UI preference: last active language. */
  getCurrentLanguage(): Language | null;
  setCurrentLanguage(language: Language | null): void;
}

export class JourneyService {
  constructor(
    private readonly durable: JourneyRepository | null,
    private readonly cache: JourneyCache,
    private readonly userId: string,
  ) {}

  get isDurable(): boolean {
    return this.durable !== null;
  }

  /** All journeys for the current user (durable authoritative, cache fallback). */
  async listAll(): Promise<LanguageJourney[]> {
    if (this.durable) {
      try {
        const remote = await this.durable.listByUser(this.userId);
        if (remote.length > 0) {
          for (const j of remote) this.cache.save(j);
          return remote;
        }
      } catch {
        // Durable unreachable: fall through to the resilience cache.
      }
    }

    const local = this.cache.loadAll();
    if (local.length > 0 && this.durable) {
      // Seed durable from cache-only / legacy-migrated journeys (best effort).
      for (const j of local) {
        try {
          await this.durable.save(this.userId, j);
        } catch {
          /* best effort */
        }
      }
    }
    return local;
  }

  /** The user's journey for one language, or `null`. */
  async load(language: Language): Promise<LanguageJourney | null> {
    return (await this.listAll()).find((j) => j.language === language) ?? null;
  }

  /** Persist a journey durably (when available) and update the cache. */
  async save(journey: LanguageJourney): Promise<void> {
    this.cache.save(journey);
    this.cache.setCurrentLanguage(journey.language);
    if (this.durable) {
      await this.durable.save(this.userId, journey);
    }
  }

  /** Remove one language's journey durably (when available) and from the cache. */
  async clear(language: Language): Promise<void> {
    this.cache.remove(language);
    if (this.durable) {
      try {
        await this.durable.clear(this.userId, language);
      } catch {
        /* best effort */
      }
    }
  }

  getCurrentLanguage(): Language | null {
    return this.cache.getCurrentLanguage();
  }

  setCurrentLanguage(language: Language | null): void {
    this.cache.setCurrentLanguage(language);
  }
}
