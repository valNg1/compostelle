import { useState } from "react";
import type { AuthService } from "../application/authService";
import { attemptSignIn } from "../application/signIn";

interface AuthScreenProps {
  auth: AuthService;
}

/**
 * Email + password sign-in. Shown only when durable persistence (Supabase) is
 * configured and no user is signed in. On success, the auth-change subscription
 * in App loads the user's journeys.
 */
export function AuthScreen({ auth }: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    const result = await attemptSignIn(auth, email, password);
    if (!result.ok) {
      setError(result.message);
      setLoading(false);
    }
    // On success, App's onAuthChange takes over and unmounts this screen.
  }

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  return (
    <section className="onboarding" aria-labelledby="auth-title">
      <header className="onboarding__intro">
        <p className="brandmark">COMPOSTELLE</p>
        <h1 id="auth-title" className="onboarding__title">
          A new language.
          <br />
          A wider world.
        </h1>
        <p className="onboarding__language">Sign in to continue your journey.</p>
      </header>

      <form className="field" onSubmit={submit} noValidate>
        <label className="field__label" htmlFor="auth-email">
          Email
        </label>
        <input
          id="auth-email"
          className="text-input"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="field__label" htmlFor="auth-password">
          Password
        </label>
        <input
          id="auth-password"
          className="text-input"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="cta" disabled={!canSubmit}>
          {loading ? "Signing in…" : "Sign in"}
        </button>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}
