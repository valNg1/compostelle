import { describe, it, expect, vi } from "vitest";
import { createJourney, type LanguageJourney } from "../domain/journey";
import type { Language } from "../domain/language";
import { InMemoryJourneyRepository } from "../persistence/inMemoryJourneyRepository";
import { JourneyService, type JourneyCache } from "./journeyService";

/** In-memory JourneyCache (no localStorage), with test hooks. */
function fakeCache(
  seed: LanguageJourney[] = [],
): JourneyCache & { size(): number } {
  const byLanguage = new Map<Language, LanguageJourney>(
    seed.map((j) => [j.language, j]),
  );
  let current: Language | null = null;
  return {
    loadAll: () => [...byLanguage.values()],
    save: (j) => void byLanguage.set(j.language, j),
    remove: (l) => void byLanguage.delete(l),
    clearAll: () => byLanguage.clear(),
    getCurrentLanguage: () => current,
    setCurrentLanguage: (l) => void (current = l),
    size: () => byLanguage.size,
  };
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

describe("JourneyService — durable authoritative + cache resilience", () => {
  it("saves to both durable and cache and tracks the current language", async () => {
    const durable = new InMemoryJourneyRepository();
    const cache = fakeCache();
    const service = new JourneyService(durable, cache, "user-1");

    await service.save(italian);

    expect(await durable.loadByLanguage("user-1", "it")).toEqual(italian);
    expect(cache.loadAll()).toEqual([italian]);
    expect(service.getCurrentLanguage()).toBe("it");
  });

  it("restores BOTH languages from durable WITHOUT relying on the cache", async () => {
    const durable = new InMemoryJourneyRepository();
    await durable.save("user-1", italian);
    await durable.save("user-1", spanish);
    const cache = fakeCache(); // empty — durable is the only source
    const service = new JourneyService(durable, cache, "user-1");

    const all = await service.listAll();

    expect(all.map((j) => j.language).sort()).toEqual(["es", "it"]);
    expect((await service.load("it"))?.language).toBe("it");
    expect((await service.load("es"))?.language).toBe("es");
    expect(cache.size()).toBe(2); // durable seeded the cache
  });

  it("only sees the scoped user's journeys (no cross-user access)", async () => {
    const durable = new InMemoryJourneyRepository();
    await durable.save("user-1", italian);
    await durable.save("user-2", spanish);
    const service = new JourneyService(durable, fakeCache(), "user-1");

    const all = await service.listAll();
    expect(all).toEqual([italian]);
  });

  it("falls back to the cache when durable is unreachable", async () => {
    const durable = new InMemoryJourneyRepository();
    vi.spyOn(durable, "listByUser").mockRejectedValueOnce(new Error("offline"));
    const cache = fakeCache([italian]);
    const service = new JourneyService(durable, cache, "user-1");

    expect(await service.listAll()).toEqual([italian]);
  });

  it("seeds durable from cache-only (e.g. legacy-migrated) journeys", async () => {
    const durable = new InMemoryJourneyRepository();
    const cache = fakeCache([italian]);
    const service = new JourneyService(durable, cache, "user-1");

    await service.listAll();

    expect(await durable.loadByLanguage("user-1", "it")).toEqual(italian);
  });

  it("works cache-only when no durable repository is configured", async () => {
    const service = new JourneyService(null, fakeCache([spanish]), "user-1");
    expect(service.isDurable).toBe(false);
    expect(await service.listAll()).toEqual([spanish]);
  });

  it("clears one language without destroying the other", async () => {
    const durable = new InMemoryJourneyRepository();
    const cache = fakeCache([italian, spanish]);
    await durable.save("user-1", italian);
    await durable.save("user-1", spanish);
    const service = new JourneyService(durable, cache, "user-1");

    await service.clear("it");

    expect(await service.load("it")).toBeNull();
    expect((await service.load("es"))?.language).toBe("es");
  });
});
