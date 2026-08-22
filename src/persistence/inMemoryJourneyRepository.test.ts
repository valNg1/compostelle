import { describe, it, expect } from "vitest";
import { createJourney } from "../domain/journey";
import { InMemoryJourneyRepository } from "./inMemoryJourneyRepository";

const italian = createJourney({
  language: "it",
  declaredLevel: "B1",
  interests: ["history", "travel"],
});
const spanish = createJourney({
  language: "es",
  declaredLevel: "A2",
  interests: ["culture"],
});

describe("InMemoryJourneyRepository — user-scoped, multi-language CRUD", () => {
  it("returns null / empty for an unknown user", async () => {
    const repo = new InMemoryJourneyRepository();
    expect(await repo.loadByLanguage("nobody", "it")).toBeNull();
    expect(await repo.listByUser("nobody")).toEqual([]);
  });

  it("lets one user hold Italian AND Spanish journeys simultaneously", async () => {
    const repo = new InMemoryJourneyRepository();
    await repo.save("user-1", italian);
    await repo.save("user-1", spanish);

    const all = await repo.listByUser("user-1");
    const langs = all.map((j) => j.language).sort();
    expect(langs).toEqual(["es", "it"]);
  });

  it("updating Spanish does not mutate the Italian journey", async () => {
    const repo = new InMemoryJourneyRepository();
    await repo.save("user-1", italian);
    await repo.save("user-1", spanish);

    const updatedSpanish = createJourney({
      language: "es",
      declaredLevel: "C1",
      interests: ["travel", "everyday_life"],
    });
    await repo.save("user-1", updatedSpanish);

    expect(await repo.loadByLanguage("user-1", "it")).toEqual(italian);
    expect(await repo.loadByLanguage("user-1", "es")).toEqual(updatedSpanish);
  });

  it("loading Italian returns Italian state; loading Spanish returns Spanish state", async () => {
    const repo = new InMemoryJourneyRepository();
    await repo.save("user-1", italian);
    await repo.save("user-1", spanish);

    expect((await repo.loadByLanguage("user-1", "it"))?.language).toBe("it");
    expect((await repo.loadByLanguage("user-1", "es"))?.language).toBe("es");
  });

  it("isolates data between users (no cross-user access)", async () => {
    const repo = new InMemoryJourneyRepository();
    await repo.save("user-1", italian);
    expect(await repo.listByUser("user-2")).toEqual([]);
    expect(await repo.loadByLanguage("user-2", "it")).toBeNull();
  });

  it("clears one language without touching the other", async () => {
    const repo = new InMemoryJourneyRepository();
    await repo.save("user-1", italian);
    await repo.save("user-1", spanish);
    await repo.clear("user-1", "it");

    expect(await repo.loadByLanguage("user-1", "it")).toBeNull();
    expect(await repo.loadByLanguage("user-1", "es")).toEqual(spanish);
  });

  it("stores a copy (no external mutation leaks in)", async () => {
    const repo = new InMemoryJourneyRepository();
    const mutable = createJourney({
      language: "it",
      declaredLevel: "A1",
      interests: ["news"],
    });
    await repo.save("user-1", mutable);
    mutable.interests.push("sport");
    expect((await repo.loadByLanguage("user-1", "it"))?.interests).toEqual([
      "news",
    ]);
  });
});
