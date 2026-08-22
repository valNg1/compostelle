/**
 * COMPOSTELLE — Supabase email + password auth adapter.
 *
 * Implements the AuthService port with Supabase Auth (email + password). Only the
 * client type is imported; behaviour requires a configured client at runtime.
 * Ownership stays `auth.uid()`; RLS is unchanged.
 */

import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { AuthService, AuthUser } from "../application/authService";

function toAuthUser(user: User | null | undefined): AuthUser | null {
  if (!user) return null;
  return { id: user.id, email: user.email ?? null };
}

export class SupabaseAuthService implements AuthService {
  constructor(private readonly client: SupabaseClient) {}

  async getUser(): Promise<AuthUser | null> {
    const { data } = await this.client.auth.getUser();
    return toAuthUser(data.user);
  }

  async signInWithPassword(email: string, password: string): Promise<void> {
    const { error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  onAuthChange(callback: (user: AuthUser | null) => void): () => void {
    const { data } = this.client.auth.onAuthStateChange((_event, session) => {
      callback(toAuthUser(session?.user));
    });
    return () => data.subscription.unsubscribe();
  }
}
