/*
 * COMPOSTEL — support form (issue #4).
 *
 * Sends a ticket to the admin. No mail backend is configured, so submitting
 * opens the user's mail client with a pre-filled message to contact@compostel.fr.
 * A plain mailto: link is always shown as a fallback.
 */

import { useState, type FormEvent } from "react";
import { SUPPORT_EMAIL, buildSupportMailto } from "../domain/support";

interface SupportFormProps {
  /** Pre-fill the sender email when the user is signed in. */
  userEmail: string | null;
  /** Optional back link (returns to the app). */
  onClose?: () => void;
}

export function SupportForm({ userEmail, onClose }: SupportFormProps) {
  const [email, setEmail] = useState(userEmail ?? "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const mailto = buildSupportMailto({ subject, message, email });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    window.location.href = mailto;
    setSent(true);
  }

  return (
    <section className="support" aria-labelledby="support-title">
      {onClose && (
        <button type="button" className="link-back" onClick={onClose}>
          ← Back
        </button>
      )}
      <header className="support__intro">
        <p className="onboarding__eyebrow">Support</p>
        <h1 id="support-title" className="support__title">
          Contact the team
        </h1>
        <p className="support__lead">
          A question or a problem? Send us a ticket — we answer at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </header>

      <form className="support__form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Your email</span>
          <input
            type="email"
            className="field__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        <label className="field">
          <span className="field__label">Subject</span>
          <input
            type="text"
            className="field__input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What is it about?"
          />
        </label>

        <label className="field">
          <span className="field__label">Message</span>
          <textarea
            className="field__input field__input--area"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            placeholder="Describe what happened…"
          />
        </label>

        <div className="support__actions">
          <button type="submit" className="cta">
            Send ticket
          </button>
          <a className="support__fallback" href={mailto}>
            Open in my mail app instead
          </a>
        </div>

        {sent && (
          <p className="support__sent" role="status">
            Your mail app should have opened with the ticket ready to send. If it
            didn't, write to{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </p>
        )}
      </form>
    </section>
  );
}
