/**
 * COMPOSTELLE — Supabase adapter for PreferencesRepository (durable).
 *
 * One row per user in `user_preferences`. Only the client type is imported;
 * the pure row mappers are testable without the SDK. Schema + RLS:
 * `supabase/migrations/0003_create_user_preferences.sql`.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { isInterfaceLanguage, DEFAULT_INTERFACE_LANGUAGE } from "../domain/i18n";
import type {
  PreferencesRepository,
  UserPreferences,
} from "../application/preferencesService";

export const PREFERENCES_TABLE = "user_preferences";

export interface PreferencesRow {
  user_id: string;
  interface_language: string;
}

export function toPreferencesRow(
  userId: string,
  prefs: UserPreferences,
): PreferencesRow {
  return { user_id: userId, interface_language: prefs.interfaceLanguage };
}

export function fromPreferencesRow(row: PreferencesRow): UserPreferences {
  return {
    interfaceLanguage: isInterfaceLanguage(row.interface_language)
      ? row.interface_language
      : DEFAULT_INTERFACE_LANGUAGE,
  };
}

export class SupabasePreferencesRepository implements PreferencesRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly table: string = PREFERENCES_TABLE,
  ) {}

  async load(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await this.client
      .from(this.table)
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data ? fromPreferencesRow(data as PreferencesRow) : null;
  }

  async save(userId: string, prefs: UserPreferences): Promise<void> {
    const { error } = await this.client
      .from(this.table)
      .upsert(toPreferencesRow(userId, prefs), { onConflict: "user_id" });
    if (error) throw error;
  }
}
