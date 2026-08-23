/**
 * COMPOSTELLE — in-memory PreferencesRepository (tests / stand-in).
 */

import type {
  PreferencesRepository,
  UserPreferences,
} from "../application/preferencesService";

export class InMemoryPreferencesRepository implements PreferencesRepository {
  private readonly store = new Map<string, UserPreferences>();

  async load(userId: string): Promise<UserPreferences | null> {
    const found = this.store.get(userId);
    return found ? { ...found } : null;
  }

  async save(userId: string, prefs: UserPreferences): Promise<void> {
    this.store.set(userId, { ...prefs });
  }
}
