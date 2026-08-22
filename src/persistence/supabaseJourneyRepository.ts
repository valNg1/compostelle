/**
 * COMPOSTELLE — Supabase adapter for JourneyRepository (durable source of truth).
 *
 * User-scoped, multi-language: one row per (user_id, language_code). Maps between
 * the domain `LanguageJourney` and a PostgreSQL row. Only the type of the
 * Supabase client is imported (erased at build), so the pure row mappers below
 * are testable without the runtime SDK or a live database.
 *
 * Schema + RLS: see `supabase/migrations/0001_create_journeys.sql`.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { LanguageJourney } from "../domain/journey";
import { isLanguage, type Language } from "../domain/language";
import type { JourneyRepository } from "../application/journeyRepository";

export const JOURNEYS_TABLE = "journeys";

/** Shape of a row in the `journeys` table (columns we read/write). */
export interface JourneyRow {
  user_id: string;
  language_code: string;
  declared_level: string;
  estimated_level: string | null;
  interests: string[];
  created_at: string;
}

/** Domain journey -> DB row (owned by `userId`). Pure. */
export function toRow(userId: string, journey: LanguageJourney): JourneyRow {
  return {
    user_id: userId,
    language_code: journey.language,
    declared_level: journey.declaredLevel,
    estimated_level: journey.estimatedLevel,
    interests: journey.interests,
    created_at: journey.createdAt,
  };
}

/** DB row -> domain journey. Pure. Defaults an unknown language to Italian. */
export function fromRow(row: JourneyRow): LanguageJourney {
  return {
    language: isLanguage(row.language_code) ? row.language_code : "it",
    declaredLevel: row.declared_level as LanguageJourney["declaredLevel"],
    estimatedLevel: row.estimated_level as LanguageJourney["estimatedLevel"],
    interests: (row.interests ?? []) as LanguageJourney["interests"],
    createdAt: row.created_at,
  };
}

export class SupabaseJourneyRepository implements JourneyRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly table: string = JOURNEYS_TABLE,
  ) {}

  async listByUser(userId: string): Promise<LanguageJourney[]> {
    const { data, error } = await this.client
      .from(this.table)
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return (data ?? []).map((row) => fromRow(row as JourneyRow));
  }

  async loadByLanguage(
    userId: string,
    language: Language,
  ): Promise<LanguageJourney | null> {
    const { data, error } = await this.client
      .from(this.table)
      .select("*")
      .eq("user_id", userId)
      .eq("language_code", language)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as JourneyRow) : null;
  }

  async save(userId: string, journey: LanguageJourney): Promise<void> {
    const { error } = await this.client
      .from(this.table)
      .upsert(toRow(userId, journey), { onConflict: "user_id,language_code" });
    if (error) throw error;
  }

  async clear(userId: string, language: Language): Promise<void> {
    const { error } = await this.client
      .from(this.table)
      .delete()
      .eq("user_id", userId)
      .eq("language_code", language);
    if (error) throw error;
  }
}
