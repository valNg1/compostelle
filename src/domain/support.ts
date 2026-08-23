/*
 * COMPOSTEL — support ticket helper.
 *
 * No transactional mail backend is configured, so a support request is turned
 * into a pre-filled `mailto:` addressed to the admin. This keeps the feature
 * dependency-free while remaining a real, working channel (the user's mail
 * client sends the ticket).
 */

export const SUPPORT_EMAIL = "contact@compostel.fr";

export interface SupportTicket {
  subject: string;
  message: string;
  /** Sender's email, appended to the body so the admin can reply. */
  email: string;
}

/**
 * Build a `mailto:` URL for a support ticket. Subject and body are fully
 * percent-encoded, so special characters (`&`, accents, newlines) never leak
 * into the query structure.
 */
export function buildSupportMailto({ subject, message, email }: SupportTicket): string {
  const subj = subject.trim() || "Support Compostel";
  const signature = email.trim() ? `\n\n— ${email.trim()}` : "";
  const body = `${message}${signature}`;
  const query = `subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
  return `mailto:${SUPPORT_EMAIL}?${query}`;
}
