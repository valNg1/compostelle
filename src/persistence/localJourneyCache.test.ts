import { describe, it, expect, beforeEach } from "vitest";
import { createJourney } from "../domain/journey";
import { STORAGE_KEY } from "./journeyStorage";
import { LocalJourneyCache, JOURNEYS_KEY } from "./localJourneyCache";

/** Minimal in-memory Storage for the cache under test. */
function installMemoryStorage(): Map<string, string> {
  const map = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (k) => void map.delete(k),
    setItem: (k, v) => void map.set(k, v),
  };
  (globalThis as { localStorage: Storage }).localStorage = storage;
  return map;
}

const italian = createJourney({
  language: "it",
  declaredLevel: "B1",
  interests: ["history"],
});
const spanish = createJourney({
  language: "es",
  declaredLevel: "A2",
  interests: ["travel"],
});

describe("LocalJourneyCache — multi-language cache", () => {
  beforeEach(() => installMemoryStorage());

  it("stores several journeys, one per language", () => {
    const cache = new LocalJourneyCache("local-user");
    cache.save(italian);
    cache.save(spanish);
    const langs = cache.loadAll().map((j) => j.language).sort();
    expect(langs).toEqual(["es", "it"]);
  });

  it("removing one language keeps the other", () => {
    const cache = new LocalJourneyCache("local-user");
    cache.save(italian);
    cache.save(spanish);
    cache.remove("it");
    expect(cache.loadAll().map((j) => j.language)).toEqual(["es"]);
  });

  it("tracks the current language", () => {
    const cache = new LocalJourneyCache("local-user");
    cache.setCurrentLanguage("es");
    expect(cache.getCurrentLanguage()).toBe("es");
  });

  it("migrates a legacy single journey for the anonymous owner (no loss)", () => {
    const map = installMemoryStorage();
    // Simulate the previous single-journey key.
    map.set(STORAGE_KEY, JSON.stringify(italian));

    const cache = new LocalJourneyCache("local-user", { migrateLegacy: true });
    const all = cache.loadAll();

    expect(all).toEqual([italian]);
    // Legacy key dropped, user-scoped v2 key populated.
    expect(map.get(STORAGE_KEY)).toBeUndefined();
    expect(map.get(`${JOURNEYS_KEY}::local-user`)).toBeTruthy();
  });

  it("does NOT migrate the legacy key for an authenticated user", () => {
    const map = installMemoryStorage();
    map.set(STORAGE_KEY, JSON.stringify(italian));

    // migrateLegacy defaults to false (authenticated-user path).
    const cache = new LocalJourneyCache("auth-uid-123");
    expect(cache.loadAll()).toEqual([]);
    // Legacy key untouched (belongs to the anonymous owner, not this user).
    expect(map.get(STORAGE_KEY)).toBeTruthy();
  });
});
