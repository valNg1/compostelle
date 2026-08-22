/**
 * Local persistence for the language journey (US-01).
 *
 * MVP requirement: local persistence is enough — no backend for US-01. The
 * store is dependency-injected (a `Storage`-like object) so the business logic
 * stays testable without a DOM, and defaults to `window.localStorage` in the
 * browser.
 *
 * Rebrand (D-08): the storage key moved from `lontano.journey.v1` to
 * `compostelle.journey.v1`. Existing journeys are migrated transparently on
 * load so no learner loses their progress.
 */

import type { LanguageJourney } from "../domain/journey";

/** Minimal subset of the Web Storage API we rely on. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Current key. Versioned so a future schema change can migrate cleanly. */
export const STORAGE_KEY = "compostelle.journey.v1";

/** Legacy key from before the COMPOSTELLE rebrand — read once, then migrated. */
export const LEGACY_STORAGE_KEY = "lontano.journey.v1";

function defaultStore(): KeyValueStore | null {
  if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
    return (globalThis as { localStorage: KeyValueStore }).localStorage;
  }
  return null;
}

/** Web Storage access can throw (private mode, quota). Fail soft. */
function safeGet(store: KeyValueStore, key: string): string | null {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(store: KeyValueStore, key: string, value: string): void {
  try {
    store.setItem(key, value);
  } catch {
    /* ignore: persistence is best-effort */
  }
}

function safeRemove(store: KeyValueStore, key: string): void {
  try {
    store.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Minimal structural guard: only migrate/return something shaped like a journey. */
function isLanguageJourney(value: unknown): value is LanguageJourney {
  if (typeof value !== "object" || value === null) return false;
  const j = value as Record<string, unknown>;
  return (
    typeof j.language === "string" &&
    typeof j.declaredLevel === "string" &&
    (j.estimatedLevel === null || typeof j.estimatedLevel === "string") &&
    Array.isArray(j.interests) &&
    typeof j.createdAt === "string"
  );
}

function parseJourney(raw: string | null): LanguageJourney | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isLanguageJourney(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Persist a journey under the current key. No-op if no store is available. */
export function saveJourney(
  journey: LanguageJourney,
  store: KeyValueStore | null = defaultStore(),
): void {
  if (!store) return;
  safeSet(store, STORAGE_KEY, JSON.stringify(journey));
}

/**
 * Load the persisted journey, or `null` if none / corrupted. Never throws.
 *
 * Migration: if nothing is stored under the current key but a valid journey
 * exists under the legacy key, it is recovered, re-saved under the current key,
 * and the legacy key is removed.
 */
export function loadJourney(
  store: KeyValueStore | null = defaultStore(),
): LanguageJourney | null {
  if (!store) return null;

  const currentRaw = safeGet(store, STORAGE_KEY);
  const current = parseJourney(currentRaw);
  if (current) return current;

  // Only migrate when the current key holds no data at all.
  if (currentRaw === null) {
    const legacy = parseJourney(safeGet(store, LEGACY_STORAGE_KEY));
    if (legacy) {
      saveJourney(legacy, store);
      safeRemove(store, LEGACY_STORAGE_KEY);
      return legacy;
    }
  }

  return null;
}

/** Remove any persisted journey, including the legacy key during transition. */
export function clearJourney(
  store: KeyValueStore | null = defaultStore(),
): void {
  if (!store) return;
  safeRemove(store, STORAGE_KEY);
  safeRemove(store, LEGACY_STORAGE_KEY);
}
