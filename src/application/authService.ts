/**
 * COMPOSTELLE — Authentication port.
 *
 * Identity for durable data. The MVP uses email magic-link (passwordless). The
 * durable ownership key is the authenticated user id (Supabase `auth.uid()`),
 * never a home-grown identity system.
 *
 * The application depends on this interface; the Supabase implementation lives in
 * `../persistence/supabaseAuth.ts`, and tests provide a fake.
 */

export interface AuthUser {
  id: string;
  email: string | null;
}

export interface AuthService {
  /** Current signed-in user, or `null`. */
  getUser(): Promise<AuthUser | null>;
  /** Send a magic sign-in link to `email`. */
  signInWithEmail(email: string): Promise<void>;
  /** Sign the current user out. */
  signOut(): Promise<void>;
  /** Subscribe to auth changes; returns an unsubscribe function. */
  onAuthChange(callback: (user: AuthUser | null) => void): () => void;
}
