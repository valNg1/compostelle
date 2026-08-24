import { describe, it, expect, vi } from "vitest";
import { createLanguageToolCorrector } from "./languageToolCorrector";

function jsonResponse(body: unknown, ok = true) {
  return { ok, status: ok ? 200 : 500, json: async () => body } as Response;
}

describe("createLanguageToolCorrector (self-hosted LanguageTool adapter)", () => {
  it("reports a correct sentence when the service finds no matches", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ matches: [] }));
    const correct = createLanguageToolCorrector({
      endpoint: "https://lt.example/v2/check",
      fetchImpl,
    });
    const r = await correct("Prendo l'ultima corsa.", "it");
    expect(r).toEqual({ correct: true, correction: "Prendo l'ultima corsa." });
  });

  it("returns the corrected sentence built from the matches", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({
        matches: [{ offset: 0, length: 6, replacements: [{ value: "Prendo" }] }],
      }),
    );
    const correct = createLanguageToolCorrector({
      endpoint: "https://lt.example/v2/check",
      fetchImpl,
    });
    const r = await correct("prendo l'ultima corsa", "it");
    expect(r.correct).toBe(false);
    expect(r.correction).toBe("Prendo l'ultima corsa");
  });

  it("POSTs the text and language to the endpoint", async () => {
    const fetchImpl = vi.fn(
      async (_url: RequestInfo | URL, _init?: RequestInit) =>
        jsonResponse({ matches: [] }),
    );
    const correct = createLanguageToolCorrector({
      endpoint: "https://lt.example/v2/check",
      fetchImpl,
    });
    await correct("Hola mundo.", "es");
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe("https://lt.example/v2/check");
    expect(init?.method).toBe("POST");
    const body = String(init?.body);
    expect(body).toContain("language=es");
    expect(body).toContain("text=Hola");
  });

  it("throws on a non-ok response (so the UI can fall back)", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({}, false));
    const correct = createLanguageToolCorrector({
      endpoint: "https://lt.example/v2/check",
      fetchImpl,
    });
    await expect(correct("x", "it")).rejects.toThrow();
  });
});
