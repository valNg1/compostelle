/**
 * Local persistence for the language journey (US-01).
 *
 * MVP requirement: local persistence is enough — no backend for US-01. The
 * store is dependency-injected (a `Storage`-like object) so the business logic
 * stays testable without a DOM, and defaults to `window.localStorage` in the
 * browser.
 */

import type { LanguageJourney } from "../domain/journey";

/** Minimal subset of the Web Storage API we rely on. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Versioned key so a future schema change can migrate cleanly. */
export const STORAGE_KEY = "lontano.journey.v1";

function defaultStore(): KeyValueStore | null {
  if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
    return (globalThis as { localStorage: KeyValueStore }).localStorage;
  }
  return null;
}

/** Persist a journey. No-op if no store is available. */
export function saveJourney(
  journey: LanguageJourney,
  store: KeyValueStore | null = defaultStore(),
): void {
  if (!store) return;
  store.setItem(STORAGE_KEY, JSON.stringify(journey));
}

/**
 * Load the persisted journey, or `null` if none / corrupted. Never throws:
 * unreadable data is treated as "no journey yet".
 */
export function loadJourney(
  store: KeyValueStore | null = defaultStore(),
): LanguageJourney | null {
  if (!store) return null;
  const raw = store.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LanguageJourney;
  } catch {
    return null;
  }
}

/** Remove any persisted journey. */
export function clearJourney(
  store: KeyValueStore | null = defaultStore(),
): void {
  if (!store) return;
  store.removeItem(STORAGE_KEY);
}
