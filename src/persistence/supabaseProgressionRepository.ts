/*
 * COMPOSTEL — Supabase adapter for ProgressionRepository (durable).
 *
 * One row per (user, language, unit) in `unit_progress`, upserted on the unique
 * key. Pure row mappers are testable without the SDK. Schema + RLS:
 * `supabase/migrations/0005_create_unit_progress.sql`.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Language } from "../domain/language";
import { isLanguage } from "../domain/language";
import type { UnitProgressRecord } from "../domain/progression";
import type { ProgressionRepository } from "../application/progressionService";

export const UNIT_PROGRESS_TABLE = "unit_progress";

export interface UnitProgressRow {
  user_id: string;
  language_code: string;
  sublevel_id: string;
  unit_id: string;
  quiz: number;
  reuse: number;
  corrections: number;
  score: number;
  completed: boolean;
  updated_at: string;
}

export function toUnitProgressRow(
  userId: string,
  r: UnitProgressRecord,
): UnitProgressRow {
  return {
    user_id: userId,
    language_code: r.language,
    sublevel_id: r.sublevelId,
    unit_id: r.unitId,
    quiz: r.quiz,
    reuse: r.reuse,
    corrections: r.corrections,
    score: r.score,
    completed: r.completed,
    updated_at: r.updatedAt,
  };
}

export function fromUnitProgressRow(row: UnitProgressRow): UnitProgressRecord {
  return {
    language: (isLanguage(row.language_code) ? row.language_code : "it") as Language,
    sublevelId: row.sublevel_id,
    unitId: row.unit_id,
    quiz: row.quiz ?? 0,
    reuse: row.reuse ?? 0,
    corrections: row.corrections ?? 0,
    score: row.score ?? 0,
    completed: row.completed ?? false,
    updatedAt: row.updated_at,
  };
}

export class SupabaseProgressionRepository implements ProgressionRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly table: string = UNIT_PROGRESS_TABLE,
  ) {}

  async listByUserLanguage(
    userId: string,
    language: Language,
  ): Promise<UnitProgressRecord[]> {
    const { data, error } = await this.client
      .from(this.table)
      .select("*")
      .eq("user_id", userId)
      .eq("language_code", language);
    if (error) throw error;
    return (data ?? []).map((r) => fromUnitProgressRow(r as UnitProgressRow));
  }

  async upsert(userId: string, record: UnitProgressRecord): Promise<void> {
    const { error } = await this.client
      .from(this.table)
      .upsert(toUnitProgressRow(userId, record), {
        onConflict: "user_id,language_code,unit_id",
      });
    if (error) throw error;
  }
}
