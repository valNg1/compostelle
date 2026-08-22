/**
 * COMPOSTELLE — Journey application service.
 *
 * Coordinates the durable repository (authoritative source of truth) with a
 * local cache. Responsibilities:
 *  - durable storage is authoritative; the local cache is a fast/offline
 *    resilience layer and the legacy-migration source — never the source of
 *    truth;
 *  - on load, prefer durable; fall back to the cache if durable is unreachable;
 *  - opportunistically push a cache-only or legacy journey up to durable;
 *  - the domain never sees any of this — it only knows `LanguageJourney`.
 */

import type { LanguageJourney } from "../domain/journey";
import type { JourneyRepository } from "./journeyRepository";

/**
 * Local cache port. The localStorage implementation lives in
 * `../persistence/localJourneyCache.ts`; tests provide a fake.
 */
export interface JourneyCache {
  /** Stable anonymous id for this device/learner. */
  getLearnerId(): string;
  /** Read the cached journey (performs legacy-key migration if needed). */
  loadLocal(): LanguageJourney | null;
  /** Write the cached journey. */
  saveLocal(journey: LanguageJourney): void;
  /** Clear the cached journey. */
  clearLocal(): void;
}

export class JourneyService {
  constructor(
    private readonly durable: JourneyRepository | null,
    private readonly cache: JourneyCache,
  ) {}

  /** True when a durable source of truth is wired. */
  get isDurable(): boolean {
    return this.durable !== null;
  }

  /**
   * Restore the learner's journey. Durable wins; the cache is a fallback and a
   * way to seed durable from a cache-only or legacy-migrated journey.
   */
  async load(): Promise<LanguageJourney | null> {
    const learnerId = this.cache.getLearnerId();

    if (this.durable) {
      try {
        const remote = await this.durable.load(learnerId);
        if (remote) {
          this.cache.saveLocal(remote);
          return remote;
        }
      } catch {
        // Durable unreachable: fall through to the resilience cache.
      }
    }

    const local = this.cache.loadLocal();
    if (local && this.durable) {
      // Seed durable from the cache-only / legacy-migrated journey (best effort).
      try {
        await this.durable.save(learnerId, local);
      } catch {
        /* best effort */
      }
    }
    return local;
  }

  /** Persist a journey durably (when available) and update the cache. */
  async save(journey: LanguageJourney): Promise<void> {
    const learnerId = this.cache.getLearnerId();
    this.cache.saveLocal(journey);
    if (this.durable) {
      await this.durable.save(learnerId, journey);
    }
  }

  /** Clear the journey durably (when available) and from the cache. */
  async clear(): Promise<void> {
    const learnerId = this.cache.getLearnerId();
    this.cache.clearLocal();
    if (this.durable) {
      try {
        await this.durable.clear(learnerId);
      } catch {
        /* best effort */
      }
    }
  }
}
