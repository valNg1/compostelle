import { describe, it, expect } from "vitest";
import { ProgressionService, type ProgressionCache } from "./progressionService";
import { InMemoryProgressionRepository } from "../persistence/inMemoryProgressionRepository";
import {
  isSublevelAcquired,
  failingUnits,
  unitScore,
  type UnitProgress,
  type UnitProgressRecord,
} from "../domain/progression";

class MapCache implements ProgressionCache {
  private store = new Map<string, UnitProgressRecord[]>();
  load(language: "it" | "es") {
    return [...(this.store.get(language) ?? [])];
  }
  saveAll(language: "it" | "es", records: UnitProgressRecord[]) {
    this.store.set(language, records);
  }
}

describe("ProgressionService (mocked persistence)", () => {
  it("records a unit with its composite score and lists it", async () => {
    const svc = new ProgressionService(
      new InMemoryProgressionRepository(),
      new MapCache(),
      "user-1",
    );
    const rows = await svc.record("it", "A1.1", "a1-1-saluti", {
      quiz: 1,
      reuse: 0.5,
      corrections: 0,
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]!.score).toBeCloseTo(0.6, 5);
    expect(rows[0]!.completed).toBe(true);
    expect((await svc.list("it")).map((r) => r.unitId)).toEqual(["a1-1-saluti"]);
  });

  it("upserts (a re-done unit replaces its previous row, not appends)", async () => {
    const svc = new ProgressionService(null, new MapCache(), "u");
    await svc.record("it", "A1.1", "u1", { quiz: 0.2 });
    const rows = await svc.record("it", "A1.1", "u1", { quiz: 1, reuse: 1, corrections: 1 });
    expect(rows).toHaveLength(1);
    expect(rows[0]!.score).toBeCloseTo(1, 5);
  });

  it("isolates languages and restores durable rows into a fresh cache", async () => {
    const durable = new InMemoryProgressionRepository();
    const svc = new ProgressionService(durable, new MapCache(), "u");
    await svc.record("it", "A1.1", "u1", { quiz: 1, reuse: 1, corrections: 1 });
    expect(await svc.list("es")).toEqual([]);
    // fresh cache, durable still has the row
    const svc2 = new ProgressionService(durable, new MapCache(), "u");
    const restored = await svc2.list("it");
    expect(restored.map((r) => r.unitId)).toEqual(["u1"]);
  });
});

describe("end-to-end chain: play units → score → acquire / retry / unlock", () => {
  it("acquires A1.1 only after all 5 units pass, retrying the weak ones", async () => {
    const svc = new ProgressionService(null, new MapCache(), "u");
    const units = ["u1", "u2", "u3", "u4", "u5"];
    // First pass: u2 and u4 are weak (below the 0.60 threshold); mean 0.57 < 0.60.
    const firstPass: Record<string, number> = {
      u1: 0.7,
      u2: 0.4,
      u3: 0.7,
      u4: 0.4,
      u5: 0.65,
    };
    for (const id of units) {
      const s = firstPass[id]!;
      await svc.record("it", "A1.1", id, { quiz: s, reuse: s, corrections: s });
    }
    const rows1 = await svc.list("it");
    const prog1: UnitProgress[] = rows1.map((r) => ({
      unitId: r.unitId,
      completed: r.completed,
      score: r.score,
    }));
    expect(isSublevelAcquired(prog1)).toBe(false);
    // targeted retry: only the weak units
    expect(failingUnits(prog1).sort()).toEqual(["u2", "u4"]);

    // Retry ONLY the failing units, now passing.
    for (const id of failingUnits(prog1)) {
      await svc.record("it", "A1.1", id, { quiz: 0.9, reuse: 0.9, corrections: 0.9 });
    }
    const prog2: UnitProgress[] = (await svc.list("it")).map((r) => ({
      unitId: r.unitId,
      completed: r.completed,
      score: r.score,
    }));
    expect(isSublevelAcquired(prog2)).toBe(true);
    expect(failingUnits(prog2)).toEqual([]);
  });

  it("a perfect unit scores 1 via the composite", () => {
    expect(unitScore({ quiz: 1, reuse: 1, corrections: 1 })).toBeCloseTo(1, 5);
  });
});
