/**
 * COMPOSTELLE — composition root for journey persistence.
 *
 * Wires the durable Supabase repository (authoritative) when configured, plus
 * the localStorage cache. When Supabase is not configured the app degrades to
 * cache-only (localStorage), so it always runs.
 */

import { JourneyService } from "../application/journeyService";
import { LocalJourneyCache } from "./localJourneyCache";
import { getSupabaseClient } from "./supabaseClient";
import { SupabaseJourneyRepository } from "./supabaseJourneyRepository";

export function createJourneyService(): JourneyService {
  const cache = new LocalJourneyCache();
  const client = getSupabaseClient();
  const durable = client ? new SupabaseJourneyRepository(client) : null;
  return new JourneyService(durable, cache);
}
