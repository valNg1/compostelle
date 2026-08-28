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
import { ActivityService } from "../application/activityService";
import { ProgressionService } from "../application/progressionService";
import { LocalJourneyCache } from "./localJourneyCache";
import { LocalMemoryCache } from "./localMemoryCache";
import { LocalPreferencesCache } from "./localPreferencesCache";
import { LocalActivityCache } from "./localActivityCache";
import { LocalProgressionCache } from "./localProgressionCache";
import { getSupabaseClient } from "./supabaseClient";
import { SupabaseAuthService } from "./supabaseAuth";
import { SupabaseJourneyRepository } from "./supabaseJourneyRepository";
import { SupabaseMemoryRepository } from "./supabaseMemoryRepository";
import { SupabasePreferencesRepository } from "./supabasePreferencesRepository";
import { SupabaseActivityRepository } from "./supabaseActivityRepository";
import { SupabaseProgressionRepository } from "./supabaseProgressionRepository";

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

/** Build an activity service scoped to `userId` (recent completed sessions). */
export function createActivityService(userId: string): ActivityService {
  const client = getSupabaseClient();
  const cache = new LocalActivityCache(userId);
  const durable = client ? new SupabaseActivityRepository(client) : null;
  return new ActivityService(durable, cache, userId);
}

/** Build a progression service scoped to `userId` (sub-level unit scores). */
export function createProgressionService(userId: string): ProgressionService {
  const client = getSupabaseClient();
  const cache = new LocalProgressionCache(userId);
  const durable = client ? new SupabaseProgressionRepository(client) : null;
  return new ProgressionService(durable, cache, userId);
}
