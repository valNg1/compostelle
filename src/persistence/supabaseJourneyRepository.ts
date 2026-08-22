/**
 * COMPOSTELLE — Supabase adapter for JourneyRepository (durable source of truth).
 *
 * Maps between the domain `LanguageJourney` and a PostgreSQL row. Only the type
 * of the Supabase client is imported (erased at build), so the pure row mappers
 * below are testable without the runtime SDK or a live database.
 *
 * Schema: see `supabase/migrations/0001_create_journeys.sql`.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { LanguageJourney } from "../domain/journey";
import type { JourneyRepository } from "../application/journeyRepository";
import { isLanguage } from "../domain/language";

export const JOURNEYS_TABLE = "journeys";

/** Shape of a row in the `journeys` table. */
export interface JourneyRow {
  learner_id: string;
  language: string;
  declared_level: string;
  estimated_level: string | null;
  interests: string[];
  created_at: string;
}

/** Domain journey -> DB row. Pure. */
export function toRow(
  learnerId: string,
  journey: LanguageJourney,
): JourneyRow {
  return {
    learner_id: learnerId,
    language: journey.language,
    declared_level: journey.declaredLevel,
    estimated_level: journey.estimatedLevel,
    interests: journey.interests,
    created_at: journey.createdAt,
  };
}

/** DB row -> domain journey. Pure. Defaults an unknown language to Italian. */
export function fromRow(row: JourneyRow): LanguageJourney {
  return {
    language: isLanguage(row.language) ? row.language : "it",
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

  async load(learnerId: string): Promise<LanguageJourney | null> {
    const { data, error } = await this.client
      .from(this.table)
      .select("*")
      .eq("learner_id", learnerId)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as JourneyRow) : null;
  }

  async save(learnerId: string, journey: LanguageJourney): Promise<void> {
    const { error } = await this.client
      .from(this.table)
      .upsert(toRow(learnerId, journey), { onConflict: "learner_id" });
    if (error) throw error;
  }

  async clear(learnerId: string): Promise<void> {
    const { error } = await this.client
      .from(this.table)
      .delete()
      .eq("learner_id", learnerId);
    if (error) throw error;
  }
}
