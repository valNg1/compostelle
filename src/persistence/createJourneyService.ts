/**
 * COMPOSTELLE — composition root for auth + journey persistence.
 *
 * Wires the durable Supabase repository (authoritative) and Supabase auth when
 * configured. When Supabase is not configured, the app degrades to cache-only
 * (localStorage) with an anonymous local user id, so it always runs.
 */

import type { AuthService } from "../application/authService";
import { JourneyService } from "../application/journeyService";
import { LocalJourneyCache } from "./localJourneyCache";
import { getSupabaseClient } from "./supabaseClient";
import { SupabaseAuthService } from "./supabaseAuth";
import { SupabaseJourneyRepository } from "./supabaseJourneyRepository";

/** The Supabase auth service, or `null` when Supabase is unconfigured. */
export function getAuthService(): AuthService | null {
  const client = getSupabaseClient();
  return client ? new SupabaseAuthService(client) : null;
}

/** Build a journey service scoped to `userId` (auth.uid() or local anon id). */
export function createJourneyService(userId: string): JourneyService {
  const cache = new LocalJourneyCache();
  const client = getSupabaseClient();
  const durable = client ? new SupabaseJourneyRepository(client) : null;
  return new JourneyService(durable, cache, userId);
}
