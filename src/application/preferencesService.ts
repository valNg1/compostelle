/**
 * COMPOSTELLE — user preferences (interface language).
 *
 * The interface language is a per-USER preference (independent of journeys):
 * how COMPOSTELLE explains, translates and gives feedback. Durable in Supabase,
 * with a local cache; falls back to cache-only when Supabase is not configured.
 */

import type { InterfaceLanguage } from "../domain/i18n";

export interface UserPreferences {
  interfaceLanguage: InterfaceLanguage;
}

/** Durable preferences repository port (no Supabase dependency here). */
export interface PreferencesRepository {
  load(userId: string): Promise<UserPreferences | null>;
  save(userId: string, prefs: UserPreferences): Promise<void>;
}

/** Local cache port (localStorage impl in persistence; fake in tests). */
export interface PreferencesCache {
  load(): UserPreferences | null;
  save(prefs: UserPreferences): void;
}

export class PreferencesService {
  constructor(
    private readonly durable: PreferencesRepository | null,
    private readonly cache: PreferencesCache,
    private readonly userId: string,
  ) {}

  /** Load the interface-language preference (durable authoritative, cache fallback). */
  async load(): Promise<UserPreferences | null> {
    if (this.durable) {
      try {
        const remote = await this.durable.load(this.userId);
        if (remote) {
          this.cache.save(remote);
          return remote;
        }
      } catch {
        /* fall back to cache */
      }
    }
    return this.cache.load();
  }

  /** Persist the interface-language preference (durable + cache). */
  async save(prefs: UserPreferences): Promise<void> {
    this.cache.save(prefs);
    if (this.durable) await this.durable.save(this.userId, prefs);
  }
}
