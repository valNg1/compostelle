/*
 * COMPOSTEL — LanguageTool adapter for the SentenceCorrector port (issue #5).
 *
 * Talks to a (self-hosted) LanguageTool `/v2/check` endpoint and turns its
 * response into a SentenceCorrection: whether the sentence is clean, and a full
 * corrected version built by applying the suggested replacements.
 *
 * LanguageTool is free and open-source; run it yourself (Docker) and point
 * VITE_LANGUAGETOOL_URL at it. When the variable is unset the app keeps using
 * the deterministic surface-level fallback — no external dependency required.
 */

import {
  applyLanguageToolMatches,
  issueTypesFromMatches,
  type AsyncSentenceCorrector,
  type LanguageToolMatch,
} from "../domain/learning";

/**
 * Free public LanguageTool API (issue #21) — no key, no infra. Used by default
 * when no self-hosted VITE_LANGUAGETOOL_URL is provided. It sends permissive
 * CORS headers, so a direct browser call works; the request is a "simple"
 * form-urlencoded POST (no preflight).
 */
export const PUBLIC_LANGUAGETOOL_URL = "https://api.languagetool.org/v2/check";

export interface LanguageToolOptions {
  /** Full URL of the check endpoint, e.g. https://lt.example/v2/check */
  endpoint: string;
  /** Injectable fetch (defaults to global fetch) — used by tests. */
  fetchImpl?: typeof fetch;
}

interface CheckResponse {
  matches?: LanguageToolMatch[];
}

/** Map a Compostel target language to a LanguageTool language code. */
function toLanguageToolCode(language: string): string {
  // LanguageTool accepts short codes for it/es/fr; English needs a variant.
  return language === "en" ? "en-US" : language;
}

export function createLanguageToolCorrector({
  endpoint,
  fetchImpl = fetch,
}: LanguageToolOptions): AsyncSentenceCorrector {
  return async (sentence, language) => {
    const body = new URLSearchParams({
      text: sentence,
      language: toLanguageToolCode(language),
    });
    const res = await fetchImpl(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) {
      throw new Error(`LanguageTool responded ${res.status}`);
    }
    const data = (await res.json()) as CheckResponse;
    const matches = data.matches ?? [];
    return {
      correct: matches.length === 0,
      correction: applyLanguageToolMatches(sentence, matches),
      issueTypes: issueTypesFromMatches(matches),
    };
  };
}

/**
 * Build the app's grammar corrector (issue #21): a self-hosted
 * `VITE_LANGUAGETOOL_URL` if provided (it primes), otherwise the free PUBLIC
 * LanguageTool API by default. Never returns null now — grammar checking is on
 * by default; the UI still falls back to the deterministic corrector on any
 * network/rate-limit error (and shows the honest #19 message).
 */
export function getSentenceCorrector(): AsyncSentenceCorrector {
  const env = import.meta.env as Record<string, string | undefined>;
  const url = env.VITE_LANGUAGETOOL_URL || PUBLIC_LANGUAGETOOL_URL;
  return createLanguageToolCorrector({ endpoint: url });
}
