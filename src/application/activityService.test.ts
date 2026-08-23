import { describe, it, expect } from "vitest";
import type { Language } from "../domain/language";
import type { LearningActivity } from "../domain/activity";
import { InMemoryActivityRepository } from "../persistence/inMemoryActivityRepository";
import { ActivityService, type ActivityCache } from "./activityService";

function fakeCache(): ActivityCache & { store: Map<Language, LearningActivity[]> } {
  const store = new Map<Language, LearningActivity[]>();
  return {
    store,
    load: (lang) => store.get(lang) ?? [],
    saveAll: (lang, a) => void store.set(lang, a),
  };
}

function activity(
  language: Language,
  id: string,
  completedAt: string,
): LearningActivity {
  return { language, learningUnitId: id, unitTitle: id, completedAt, recalled: 2, used: 1 };
}

describe("ActivityService — recent completed sessions", () => {
  it("records an activity and lists it (durable + cache)", async () => {
    const durable = new InMemoryActivityRepository();
    const service = new ActivityService(durable, fakeCache(), "user-1");
    await service.record(activity("it", "pompei", "2026-01-01T10:00:00.000Z"));
    const list = await service.list("it");
    expect(list.map((a) => a.learningUnitId)).toEqual(["pompei"]);
    expect(await durable.listByUserLanguage("user-1", "it", 5)).toHaveLength(1);
  });

  it("returns most recent first, capped by limit", async () => {
    const service = new ActivityService(new InMemoryActivityRepository(), fakeCache(), "u");
    await service.record(activity("it", "a", "2026-01-01T00:00:00.000Z"));
    await service.record(activity("it", "b", "2026-01-02T00:00:00.000Z"));
    await service.record(activity("it", "c", "2026-01-03T00:00:00.000Z"));
    const list = await service.list("it", 2);
    expect(list.map((a) => a.learningUnitId)).toEqual(["c", "b"]);
  });

  it("isolates activity by language", async () => {
    const service = new ActivityService(new InMemoryActivityRepository(), fakeCache(), "u");
    await service.record(activity("it", "pompei", "2026-01-01T00:00:00.000Z"));
    await service.record(activity("es", "camino", "2026-01-01T00:00:00.000Z"));
    expect((await service.list("it")).map((a) => a.learningUnitId)).toEqual(["pompei"]);
    expect((await service.list("es")).map((a) => a.learningUnitId)).toEqual(["camino"]);
  });

  it("isolates activity by user and restores from durable on a fresh cache", async () => {
    const durable = new InMemoryActivityRepository();
    await new ActivityService(durable, fakeCache(), "user-A").record(
      activity("it", "pompei", "2026-01-01T00:00:00.000Z"),
    );
    const aFresh = new ActivityService(durable, fakeCache(), "user-A");
    expect((await aFresh.list("it")).map((a) => a.learningUnitId)).toEqual(["pompei"]);
    const b = new ActivityService(durable, fakeCache(), "user-B");
    expect(await b.list("it")).toEqual([]);
  });

  it("works cache-only when no durable repository is configured", async () => {
    const service = new ActivityService(null, fakeCache(), "u");
    await service.record(activity("es", "camino", "2026-01-01T00:00:00.000Z"));
    expect((await service.list("es")).map((a) => a.learningUnitId)).toEqual(["camino"]);
  });
});
