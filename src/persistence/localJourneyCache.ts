/**
 * COMPOSTELLE — localStorage-backed JourneyCache.
 *
 * This is the resilience / cache / legacy-migration layer, NOT the source of
 * truth (durable Postgres is). It reuses the existing localStorage journey
 * functions and adds a stable anonymous learner id.
 */

import type { LanguageJourney } from "../domain/journey";
import type { JourneyCache } from "../application/journeyService";
import { loadJourney, saveJourney, clearJourney } from "./journeyStorage";

/** Key holding the anonymous per-device learner id. */
export const LEARNER_ID_KEY = "compostelle.learner.v1";

function randomId(): string {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `learner-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export class LocalJourneyCache implements JourneyCache {
  getLearnerId(): string {
    try {
      const existing = globalThis.localStorage?.getItem(LEARNER_ID_KEY);
      if (existing) return existing;
      const created = randomId();
      globalThis.localStorage?.setItem(LEARNER_ID_KEY, created);
      return created;
    } catch {
      // No/blocked storage: return a volatile id (durable still keyed per call).
      return randomId();
    }
  }

  loadLocal(): LanguageJourney | null {
    return loadJourney();
  }

  saveLocal(journey: LanguageJourney): void {
    saveJourney(journey);
  }

  clearLocal(): void {
    clearJourney();
  }
}
