/**
 * COMPOSTELLE — localStorage-backed PreferencesCache (per user).
 */

import { isInterfaceLanguage } from "../domain/i18n";
import type {
  PreferencesCache,
  UserPreferences,
} from "../application/preferencesService";

export const PREFERENCES_KEY = "compostelle.prefs.v1";

function readStore(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export class LocalPreferencesCache implements PreferencesCache {
  constructor(private readonly userId: string) {}

  private key(): string {
    return `${PREFERENCES_KEY}::${this.userId}`;
  }

  load(): UserPreferences | null {
    const store = readStore();
    if (!store) return null;
    try {
      const raw = store.getItem(this.key());
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { interfaceLanguage?: unknown };
      return isInterfaceLanguage(parsed.interfaceLanguage)
        ? { interfaceLanguage: parsed.interfaceLanguage }
        : null;
    } catch {
      return null;
    }
  }

  save(prefs: UserPreferences): void {
    const store = readStore();
    if (!store) return;
    try {
      store.setItem(this.key(), JSON.stringify(prefs));
    } catch {
      /* best effort */
    }
  }
}
