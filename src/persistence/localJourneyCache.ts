/**
 * COMPOSTELLE — localStorage-backed JourneyCache (multi-language).
 *
 * Resilience / cache / legacy-migration layer, NOT the source of truth (durable
 * Postgres is). Stores one journey per language plus the last active language,
 * and migrates the previous single-journey key on first read.
 */

import type { LanguageJourney } from "../domain/journey";
import { isLanguage, type Language } from "../domain/language";
import type { JourneyCache } from "../application/journeyService";
import { loadJourney as loadLegacyJourney, clearJourney } from "./journeyStorage";

/** v2 multi-language cache. */
export const JOURNEYS_KEY = "compostelle.journeys.v2";
/** Anonymous per-device id, used only as a fallback owner in cache-only mode. */
export const LOCAL_USER_KEY = "compostelle.user.v1";

interface CacheShape {
  current: Language | null;
  byLanguage: Partial<Record<Language, LanguageJourney>>;
}

function randomId(): string {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readStore(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/** Fallback anonymous owner id for cache-only mode (no auth). */
export function getLocalUserId(): string {
  const store = readStore();
  try {
    const existing = store?.getItem(LOCAL_USER_KEY);
    if (existing) return existing;
    const created = randomId();
    store?.setItem(LOCAL_USER_KEY, created);
    return created;
  } catch {
    return randomId();
  }
}

export class LocalJourneyCache implements JourneyCache {
  private read(): CacheShape {
    const store = readStore();
    const raw = store ? safeGet(store, JOURNEYS_KEY) : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CacheShape;
        if (parsed && typeof parsed === "object" && parsed.byLanguage) {
          return parsed;
        }
      } catch {
        /* fall through to migration/empty */
      }
    }
    return this.migrateLegacy();
  }

  /** Seed the v2 cache from the previous single-journey key (once). */
  private migrateLegacy(): CacheShape {
    const legacy = loadLegacyJourney();
    if (legacy && isLanguage(legacy.language)) {
      const shape: CacheShape = {
        current: legacy.language,
        byLanguage: { [legacy.language]: legacy },
      };
      this.write(shape);
      clearJourney(); // drop the old single-journey (and lontano) keys
      return shape;
    }
    return { current: null, byLanguage: {} };
  }

  private write(shape: CacheShape): void {
    const store = readStore();
    if (store) safeSet(store, JOURNEYS_KEY, JSON.stringify(shape));
  }

  loadAll(): LanguageJourney[] {
    return Object.values(this.read().byLanguage).filter(
      (j): j is LanguageJourney => Boolean(j),
    );
  }

  save(journey: LanguageJourney): void {
    const shape = this.read();
    shape.byLanguage[journey.language] = journey;
    this.write(shape);
  }

  remove(language: Language): void {
    const shape = this.read();
    delete shape.byLanguage[language];
    if (shape.current === language) shape.current = null;
    this.write(shape);
  }

  clearAll(): void {
    this.write({ current: null, byLanguage: {} });
  }

  getCurrentLanguage(): Language | null {
    return this.read().current;
  }

  setCurrentLanguage(language: Language | null): void {
    const shape = this.read();
    shape.current = language;
    this.write(shape);
  }
}

function safeGet(store: Storage, key: string): string | null {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(store: Storage, key: string, value: string): void {
  try {
    store.setItem(key, value);
  } catch {
    /* best effort */
  }
}
