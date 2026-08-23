/**
 * COMPOSTELLE — learning activity service (recent completed sessions).
 *
 * Durable (Supabase) authoritative + local cache, per user and per language.
 * Records a completed Learning Unit and lists the most recent ones.
 */

import type { Language } from "../domain/language";
import type { LearningActivity } from "../domain/activity";

export interface ActivityRepository {
  listByUserLanguage(
    userId: string,
    language: Language,
    limit: number,
  ): Promise<LearningActivity[]>;
  add(userId: string, activity: LearningActivity): Promise<void>;
}

export interface ActivityCache {
  load(language: Language): LearningActivity[];
  saveAll(language: Language, activities: LearningActivity[]): void;
}

const MAX_KEEP = 20;

function mostRecentFirst(a: LearningActivity, b: LearningActivity): number {
  return a.completedAt < b.completedAt ? 1 : -1;
}

export class ActivityService {
  constructor(
    private readonly durable: ActivityRepository | null,
    private readonly cache: ActivityCache,
    private readonly userId: string,
  ) {}

  get isDurable(): boolean {
    return this.durable !== null;
  }

  /** Recent completed sessions for a language (durable authoritative). */
  async list(language: Language, limit = 5): Promise<LearningActivity[]> {
    if (this.durable) {
      try {
        const remote = await this.durable.listByUserLanguage(
          this.userId,
          language,
          limit,
        );
        this.cache.saveAll(language, remote);
        return remote.slice(0, limit);
      } catch {
        /* fall back to cache */
      }
    }
    return [...this.cache.load(language)].sort(mostRecentFirst).slice(0, limit);
  }

  /** Record a completed session; returns the refreshed recent list. */
  async record(
    activity: LearningActivity,
    limit = 5,
  ): Promise<LearningActivity[]> {
    const merged = [activity, ...this.cache.load(activity.language)]
      .sort(mostRecentFirst)
      .slice(0, MAX_KEEP);
    this.cache.saveAll(activity.language, merged);
    if (this.durable) {
      try {
        await this.durable.add(this.userId, activity);
      } catch {
        /* best effort */
      }
    }
    return merged.slice(0, limit);
  }
}
