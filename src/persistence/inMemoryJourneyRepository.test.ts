import { describe, it, expect } from "vitest";
import { createJourney } from "../domain/journey";
import { InMemoryJourneyRepository } from "./inMemoryJourneyRepository";

const journey = createJourney({
  language: "it",
  declaredLevel: "B1",
  interests: ["history", "travel"],
});

describe("InMemoryJourneyRepository — durable CRUD", () => {
  it("returns null for an unknown learner", async () => {
    const repo = new InMemoryJourneyRepository();
    expect(await repo.load("nobody")).toBeNull();
  });

  it("saves and loads a journey by learner id", async () => {
    const repo = new InMemoryJourneyRepository();
    await repo.save("learner-1", journey);
    expect(await repo.load("learner-1")).toEqual(journey);
  });

  it("isolates journeys per learner id", async () => {
    const repo = new InMemoryJourneyRepository();
    await repo.save("learner-1", journey);
    expect(await repo.load("learner-2")).toBeNull();
  });

  it("overwrites on repeated save (create or replace)", async () => {
    const repo = new InMemoryJourneyRepository();
    await repo.save("learner-1", journey);
    const updated = createJourney({
      language: "es",
      declaredLevel: "A2",
      interests: ["culture"],
    });
    await repo.save("learner-1", updated);
    expect(await repo.load("learner-1")).toEqual(updated);
  });

  it("clears a journey", async () => {
    const repo = new InMemoryJourneyRepository();
    await repo.save("learner-1", journey);
    await repo.clear("learner-1");
    expect(await repo.load("learner-1")).toBeNull();
  });

  it("stores a copy (no external mutation leaks in)", async () => {
    const repo = new InMemoryJourneyRepository();
    const mutable = createJourney({
      language: "it",
      declaredLevel: "A1",
      interests: ["news"],
    });
    await repo.save("learner-1", mutable);
    mutable.interests.push("sport");
    const loaded = await repo.load("learner-1");
    expect(loaded?.interests).toEqual(["news"]);
  });
});
