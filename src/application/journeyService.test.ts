import { describe, it, expect, vi } from "vitest";
import { createJourney, type LanguageJourney } from "../domain/journey";
import { InMemoryJourneyRepository } from "../persistence/inMemoryJourneyRepository";
import { JourneyService, type JourneyCache } from "./journeyService";

/** A fake cache (no localStorage) with an explicit learner id and local value. */
function fakeCache(
  init: { learnerId?: string; local?: LanguageJourney | null } = {},
): JourneyCache & { local: LanguageJourney | null; learnerId: string } {
  return {
    learnerId: init.learnerId ?? "learner-1",
    local: init.local ?? null,
    getLearnerId() {
      return this.learnerId;
    },
    loadLocal() {
      return this.local;
    },
    saveLocal(journey) {
      this.local = journey;
    },
    clearLocal() {
      this.local = null;
    },
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
  it("saves to both durable and cache", async () => {
    const durable = new InMemoryJourneyRepository();
    const cache = fakeCache();
    const service = new JourneyService(durable, cache);

    await service.save(italian);

    expect(await durable.load("learner-1")).toEqual(italian);
    expect(cache.local).toEqual(italian);
  });

  it("restores from durable WITHOUT relying on the local cache", async () => {
    const durable = new InMemoryJourneyRepository();
    await durable.save("learner-1", spanish);
    // Cache is empty — the only source is durable storage.
    const cache = fakeCache({ learnerId: "learner-1", local: null });
    const service = new JourneyService(durable, cache);

    const restored = await service.load();

    expect(restored).toEqual(spanish);
    expect(cache.local).toEqual(spanish); // durable seeded the cache
  });

  it("prefers durable over a stale local cache", async () => {
    const durable = new InMemoryJourneyRepository();
    await durable.save("learner-1", spanish);
    const cache = fakeCache({ learnerId: "learner-1", local: italian });
    const service = new JourneyService(durable, cache);

    expect(await service.load()).toEqual(spanish);
  });

  it("falls back to the cache when durable is unreachable", async () => {
    const durable = new InMemoryJourneyRepository();
    vi.spyOn(durable, "load").mockRejectedValueOnce(new Error("offline"));
    const cache = fakeCache({ local: italian });
    const service = new JourneyService(durable, cache);

    expect(await service.load()).toEqual(italian);
  });

  it("seeds durable from a cache-only (e.g. legacy-migrated) journey", async () => {
    const durable = new InMemoryJourneyRepository();
    const cache = fakeCache({ learnerId: "learner-1", local: italian });
    const service = new JourneyService(durable, cache);

    await service.load();

    expect(await durable.load("learner-1")).toEqual(italian);
  });

  it("works cache-only when no durable repository is configured", async () => {
    const cache = fakeCache({ local: spanish });
    const service = new JourneyService(null, cache);
    expect(service.isDurable).toBe(false);
    expect(await service.load()).toEqual(spanish);
  });

  it("clears both durable and cache", async () => {
    const durable = new InMemoryJourneyRepository();
    const cache = fakeCache({ learnerId: "learner-1", local: italian });
    await durable.save("learner-1", italian);
    const service = new JourneyService(durable, cache);

    await service.clear();

    expect(cache.local).toBeNull();
    expect(await durable.load("learner-1")).toBeNull();
  });
});
