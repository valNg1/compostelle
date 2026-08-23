/**
 * COMPOSTELLE — localStorage-backed ActivityCache (per user, per language).
 * Resilience/offline cache; durable Postgres is the source of truth.
 */

import type { Language } from "../domain/language";
import type { LearningActivity } from "../domain/activity";
import type { ActivityCache } from "../application/activityService";

export const ACTIVITY_KEY = "compostelle.activity.v1";

function readStore(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export class LocalActivityCache implements ActivityCache {
  constructor(private readonly userId: string) {}

  private key(language: Language): string {
    return `${ACTIVITY_KEY}::${this.userId}::${language}`;
  }

  load(language: Language): LearningActivity[] {
    const store = readStore();
    if (!store) return [];
    try {
      const raw = store.getItem(this.key(language));
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as LearningActivity[]) : [];
    } catch {
      return [];
    }
  }

  saveAll(language: Language, activities: LearningActivity[]): void {
    const store = readStore();
    if (!store) return;
    try {
      store.setItem(this.key(language), JSON.stringify(activities));
    } catch {
      /* best effort */
    }
  }
}
