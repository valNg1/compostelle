/**
 * COMPOSTELLE — sign-in orchestration.
 *
 * Thin, testable controller over the AuthService port used by the login screen:
 * validates inputs, calls the adapter, and turns any failure into a clean,
 * user-facing message (never throws).
 */

import type { AuthService } from "./authService";

export type SignInResult = { ok: true } | { ok: false; message: string };

export async function attemptSignIn(
  auth: AuthService,
  email: string,
  password: string,
): Promise<SignInResult> {
  const trimmedEmail = email.trim();
  if (!trimmedEmail || !password) {
    return { ok: false, message: "Enter your email and password." };
  }
  try {
    await auth.signInWithPassword(trimmedEmail, password);
    return { ok: true };
  } catch {
    return { ok: false, message: "Incorrect email or password." };
  }
}
