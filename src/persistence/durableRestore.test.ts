import { describe, it, expect, beforeEach } from "vitest";
import { createJourney } from "../domain/journey";
import { JourneyService } from "../application/journeyService";
import { InMemoryJourneyRepository } from "./inMemoryJourneyRepository";
import { LocalJourneyCache } from "./localJourneyCache";

/**
 * §2/§3 regression: durable persistence must restore an authenticated user's
 * journeys with their correct declared levels, independently of localStorage,
 * and the local cache must never become a competing source of truth across users.
 */

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

const italianB2 = createJourney({
  language: "it",
  declaredLevel: "B2",
  interests: ["history", "travel"],
});
const spanishA2 = createJourney({
  language: "es",
  declaredLevel: "A2",
  interests: ["culture"],
});

describe("durable restore after sign in (PO production scenario)", () => {
  beforeEach(() => installMemoryStorage());

  it("restores IT=B2 and ES=A2 from durable with an empty/fresh localStorage", async () => {
    // Given: durable holds the two journeys with the correct levels.
    const durable = new InMemoryJourneyRepository();
    await durable.save("user-1", italianB2);
    await durable.save("user-1", spanishA2);

    // When: a fresh browser session (no useful localStorage) for the same user.
    installMemoryStorage(); // wipe local state — a truly clean session
    const service = new JourneyService(
      durable,
      new LocalJourneyCache("user-1"),
      "user-1",
    );

    // Then: levels are restored exactly.
    const all = await service.listAll();
    const byLang = Object.fromEntries(all.map((j) => [j.language, j.declaredLevel]));
    expect(byLang).toEqual({ it: "B2", es: "A2" });
    expect((await service.load("it"))?.declaredLevel).toBe("B2");
    expect((await service.load("es"))?.declaredLevel).toBe("A2");
  });

  it("lets durable override a stale local cache (Supabase authoritative)", async () => {
    const durable = new InMemoryJourneyRepository();
    await durable.save("user-1", italianB2); // durable: IT=B2
    const cache = new LocalJourneyCache("user-1");
    cache.save(createJourney({ language: "it", declaredLevel: "A1", interests: ["news"] })); // stale IT=A1

    const service = new JourneyService(durable, cache, "user-1");
    expect((await service.load("it"))?.declaredLevel).toBe("B2");
  });
});

describe("local cache is user-scoped (no cross-user leak)", () => {
  beforeEach(() => installMemoryStorage());

  it("does not expose user A's journeys to user B on the same device", async () => {
    const durable = new InMemoryJourneyRepository();

    // User A signs in and creates a journey (cache written under A).
    const serviceA = new JourneyService(
      durable,
      new LocalJourneyCache("user-A"),
      "user-A",
    );
    await serviceA.save(italianB2);

    // User B signs in on the SAME browser (localStorage NOT cleared); durable has
    // nothing for B.
    const serviceB = new JourneyService(
      durable,
      new LocalJourneyCache("user-B"),
      "user-B",
    );

    // B must see nothing — and durable must not be seeded with A's journey.
    expect(await serviceB.listAll()).toEqual([]);
    expect(await durable.listByUser("user-B")).toEqual([]);
  });
});
