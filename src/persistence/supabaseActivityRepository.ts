/**
 * COMPOSTELLE — Supabase adapter for ActivityRepository (durable).
 *
 * Append-only history in `learning_activity`. Pure row mappers are testable
 * without the SDK. Schema + RLS: `supabase/migrations/0004_create_learning_activity.sql`.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Language } from "../domain/language";
import { isLanguage } from "../domain/language";
import type { LearningActivity } from "../domain/activity";
import type { ActivityRepository } from "../application/activityService";

export const ACTIVITY_TABLE = "learning_activity";

export interface ActivityRow {
  user_id: string;
  language_code: string;
  learning_unit_id: string;
  unit_title: string;
  completed_at: string;
  recalled: number;
  used: number;
}

export function toActivityRow(
  userId: string,
  a: LearningActivity,
): ActivityRow {
  return {
    user_id: userId,
    language_code: a.language,
    learning_unit_id: a.learningUnitId,
    unit_title: a.unitTitle,
    completed_at: a.completedAt,
    recalled: a.recalled,
    used: a.used,
  };
}

export function fromActivityRow(row: ActivityRow): LearningActivity {
  return {
    language: (isLanguage(row.language_code) ? row.language_code : "it") as Language,
    learningUnitId: row.learning_unit_id,
    unitTitle: row.unit_title,
    completedAt: row.completed_at,
    recalled: row.recalled ?? 0,
    used: row.used ?? 0,
  };
}

export class SupabaseActivityRepository implements ActivityRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly table: string = ACTIVITY_TABLE,
  ) {}

  async listByUserLanguage(
    userId: string,
    language: Language,
    limit: number,
  ): Promise<LearningActivity[]> {
    const { data, error } = await this.client
      .from(this.table)
      .select("*")
      .eq("user_id", userId)
      .eq("language_code", language)
      .order("completed_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((r) => fromActivityRow(r as ActivityRow));
  }

  async add(userId: string, activity: LearningActivity): Promise<void> {
    const { error } = await this.client
      .from(this.table)
      .insert(toActivityRow(userId, activity));
    if (error) throw error;
  }
}
