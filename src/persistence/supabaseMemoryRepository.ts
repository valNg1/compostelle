/**
 * COMPOSTELLE — Supabase adapter for MemoryRepository (durable source of truth).
 *
 * One row per (user_id, language_code, expression). Only the client type is
 * imported (erased at build), so the pure row mappers are testable without the
 * SDK or a live database. Schema + RLS: `supabase/migrations/0002_create_memory_items.sql`.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Language } from "../domain/language";
import { isLanguage } from "../domain/language";
import type { MemoryItem, MemoryState } from "../domain/memory";
import type { MemoryRepository } from "../application/memoryRepository";

export const MEMORY_TABLE = "memory_items";

export interface MemoryRow {
  user_id: string;
  language_code: string;
  expression: string;
  meaning: string;
  state: string;
  last_interaction: string;
}

export function toMemoryRow(userId: string, item: MemoryItem): MemoryRow {
  return {
    user_id: userId,
    language_code: item.language,
    expression: item.expression,
    meaning: item.meaning,
    state: item.state,
    last_interaction: item.lastInteraction,
  };
}

const STATES: ReadonlySet<string> = new Set([
  "NEW",
  "LEARNING",
  "ACQUIRED",
  "TO_REVIEW",
]);

export function fromMemoryRow(row: MemoryRow): MemoryItem {
  return {
    language: (isLanguage(row.language_code) ? row.language_code : "it") as Language,
    expression: row.expression,
    meaning: row.meaning ?? "",
    state: (STATES.has(row.state) ? row.state : "NEW") as MemoryState,
    lastInteraction: row.last_interaction,
  };
}

export class SupabaseMemoryRepository implements MemoryRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly table: string = MEMORY_TABLE,
  ) {}

  async listByUserLanguage(
    userId: string,
    language: Language,
  ): Promise<MemoryItem[]> {
    const { data, error } = await this.client
      .from(this.table)
      .select("*")
      .eq("user_id", userId)
      .eq("language_code", language);
    if (error) throw error;
    return (data ?? []).map((r) => fromMemoryRow(r as MemoryRow));
  }

  async upsertMany(userId: string, items: MemoryItem[]): Promise<void> {
    if (items.length === 0) return;
    const rows = items.map((i) => toMemoryRow(userId, i));
    const { error } = await this.client
      .from(this.table)
      .upsert(rows, { onConflict: "user_id,language_code,expression" });
    if (error) throw error;
  }
}
