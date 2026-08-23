/**
 * COMPOSTELLE — composition root for auth + journey persistence.
 *
 * Wires the durable Supabase repository (authoritative) and Supabase auth when
 * configured. When Supabase is not configured, the app degrades to cache-only
 * (localStorage) with an anonymous local user id, so it always runs.
 */

import type { AuthService } from "../application/authService";
import { JourneyService } from "../application/journeyService";
import { MemoryService } from "../application/memoryService";
import { PreferencesService } from "../application/preferencesService";
import { LocalJourneyCache } from "./localJourneyCache";
import { LocalMemoryCache } from "./localMemoryCache";
import { LocalPreferencesCache } from "./localPreferencesCache";
import { getSupabaseClient } from "./supabaseClient";
import { SupabaseAuthService } from "./supabaseAuth";
import { SupabaseJourneyRepository } from "./supabaseJourneyRepository";
import { SupabaseMemoryRepository } from "./supabaseMemoryRepository";
import { SupabasePreferencesRepository } from "./supabasePreferencesRepository";

/** The Supabase auth service, or `null` when Supabase is unconfigured. */
export function getAuthService(): AuthService | null {
  const client = getSupabaseClient();
  return client ? new SupabaseAuthService(client) : null;
}

/** Build a journey service scoped to `userId` (auth.uid() or local anon id). */
export function createJourneyService(userId: string): JourneyService {
  const client = getSupabaseClient();
  // Legacy single-journey migration only applies to the anonymous cache-only
  // owner (the v1 key predates auth); never attach it to an authenticated user.
  const cache = new LocalJourneyCache(userId, { migrateLegacy: client === null });
  const durable = client ? new SupabaseJourneyRepository(client) : null;
  return new JourneyService(durable, cache, userId);
}

/** Build a memory service scoped to `userId`. */
export function createMemoryService(userId: string): MemoryService {
  const client = getSupabaseClient();
  const cache = new LocalMemoryCache(userId);
  const durable = client ? new SupabaseMemoryRepository(client) : null;
  return new MemoryService(durable, cache, userId);
}

/** Build a preferences service scoped to `userId` (interface language). */
export function createPreferencesService(userId: string): PreferencesService {
  const client = getSupabaseClient();
  const cache = new LocalPreferencesCache(userId);
  const durable = client ? new SupabasePreferencesRepository(client) : null;
  return new PreferencesService(durable, cache, userId);
}
