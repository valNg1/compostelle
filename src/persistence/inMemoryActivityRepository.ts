/**
 * COMPOSTELLE — in-memory ActivityRepository (tests / stand-in).
 */

import type { Language } from "../domain/language";
import type { LearningActivity } from "../domain/activity";
import type { ActivityRepository } from "../application/activityService";

export class InMemoryActivityRepository implements ActivityRepository {
  private readonly store = new Map<string, LearningActivity[]>();

  private key(userId: string, language: Language): string {
    return `${userId}::${language}`;
  }

  async listByUserLanguage(
    userId: string,
    language: Language,
    limit: number,
  ): Promise<LearningActivity[]> {
    const all = this.store.get(this.key(userId, language)) ?? [];
    return [...all]
      .sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1))
      .slice(0, limit)
      .map((a) => ({ ...a }));
  }

  async add(userId: string, activity: LearningActivity): Promise<void> {
    const k = this.key(userId, activity.language);
    const list = this.store.get(k) ?? [];
    this.store.set(k, [...list, { ...activity }]);
  }
}
