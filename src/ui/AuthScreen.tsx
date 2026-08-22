import { useState } from "react";
import type { AuthService } from "../application/authService";

interface AuthScreenProps {
  auth: AuthService;
}

/**
 * Minimal passwordless sign-in (email magic link). Shown only when durable
 * persistence (Supabase) is configured and no user is signed in.
 */
export function AuthScreen({ auth }: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    try {
      await auth.signInWithEmail(email.trim());
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="onboarding" aria-labelledby="auth-title">
      <header className="onboarding__intro">
        <p className="onboarding__eyebrow">Sign in to save your journeys</p>
        <h1 id="auth-title" className="onboarding__title">
          Learn a language through
          <br />
          things worth discovering.
        </h1>
        <p className="onboarding__language">
          We'll email you a secure sign-in link — no password.
        </p>
      </header>

      {status === "sent" ? (
        <p className="discover__empty" role="status">
          Check your inbox for a sign-in link at <strong>{email}</strong>.
        </p>
      ) : (
        <form className="field" onSubmit={submit}>
          <label className="field__label" htmlFor="auth-email">
            Your email
          </label>
          <input
            id="auth-email"
            className="text-input"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="cta"
            disabled={status === "sending" || email.trim().length === 0}
          >
            {status === "sending" ? "Sending…" : "Email me a link"}
          </button>
          {status === "error" && (
            <p className="form-error" role="alert">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      )}
    </section>
  );
}
