/**
 * COMPOSTELLE — Supabase client factory.
 *
 * Reads configuration from Vite env vars. Never hardcode credentials; copy
 * `.env.example` to `.env` and fill them in (the anon key is a public,
 * RLS-guarded key — see the durable-persistence ADR).
 *
 * Returns `null` when unconfigured, so the app degrades gracefully to its local
 * cache instead of crashing.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null | undefined;

function readEnv(name: string): string | undefined {
  const env = import.meta.env as Record<string, string | undefined>;
  const value = env[name];
  return value && value.length > 0 ? value : undefined;
}

/** True when both Supabase env vars are present. */
export function isSupabaseConfigured(): boolean {
  return (
    readEnv("VITE_SUPABASE_URL") !== undefined &&
    readEnv("VITE_SUPABASE_ANON_KEY") !== undefined
  );
}

/** The shared Supabase client, or `null` when unconfigured. */
export function getSupabaseClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = readEnv("VITE_SUPABASE_URL");
  const key = readEnv("VITE_SUPABASE_ANON_KEY");
  cached = url && key ? createClient(url, key) : null;
  return cached;
}
