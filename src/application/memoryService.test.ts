import { describe, it, expect } from "vitest";
import type { Language } from "../domain/language";
import type { MemoryItem } from "../domain/memory";
import { InMemoryMemoryRepository } from "../persistence/inMemoryMemoryRepository";
import { MemoryService, type MemoryCache } from "./memoryService";

/** In-memory MemoryCache (no localStorage), per language. */
function fakeCache(): MemoryCache & { store: Map<Language, MemoryItem[]> } {
  const store = new Map<Language, MemoryItem[]>();
  return {
    store,
    load: (lang) => store.get(lang) ?? [],
    saveAll: (lang, items) => void store.set(lang, items),
  };
}

describe("MemoryService — deterministic, durable, isolated", () => {
  it("applies signals and progresses state (understood -> LEARNING -> used -> ACQUIRED)", async () => {
    const durable = new InMemoryMemoryRepository();
    const service = new MemoryService(durable, fakeCache(), "user-1");

    await service.apply("it", [
      { expression: "mettersi in gioco", meaning: "impegnarsi", signal: "understood" },
    ]);
    let mem = await service.list("it");
    expect(mem.find((m) => m.expression === "mettersi in gioco")?.state).toBe("LEARNING");

    await service.apply("it", [
      { expression: "mettersi in gioco", meaning: "impegnarsi", signal: "used" },
    ]);
    mem = await service.list("it");
    expect(mem.find((m) => m.expression === "mettersi in gioco")?.state).toBe("ACQUIRED");
  });

  it("marks TO_REVIEW on a wrong recall", async () => {
    const service = new MemoryService(new InMemoryMemoryRepository(), fakeCache(), "u");
    await service.apply("it", [
      { expression: "seppellì", meaning: "coprì", signal: "understood" },
      { expression: "seppellì", meaning: "coprì", signal: "recalled_wrong" },
    ]);
    const mem = await service.list("it");
    expect(mem[0]?.state).toBe("TO_REVIEW");
  });

  it("isolates memory by language", async () => {
    const service = new MemoryService(new InMemoryMemoryRepository(), fakeCache(), "u");
    await service.apply("it", [{ expression: "senza fretta", meaning: "", signal: "understood" }]);
    await service.apply("es", [{ expression: "sin prisa", meaning: "", signal: "understood" }]);
    expect((await service.list("it")).map((m) => m.expression)).toEqual(["senza fretta"]);
    expect((await service.list("es")).map((m) => m.expression)).toEqual(["sin prisa"]);
  });

  it("isolates memory by user and restores on a fresh cache from durable", async () => {
    const durable = new InMemoryMemoryRepository();
    const a = new MemoryService(durable, fakeCache(), "user-A");
    await a.apply("it", [{ expression: "gli scavi", meaning: "excavations", signal: "used" }]);

    // Fresh browser (empty cache), same durable, same user.
    const aFresh = new MemoryService(durable, fakeCache(), "user-A");
    const restored = await aFresh.list("it");
    expect(restored[0]?.expression).toBe("gli scavi");
    expect(restored[0]?.state).toBe("ACQUIRED");

    // Another user sees nothing.
    const b = new MemoryService(durable, fakeCache(), "user-B");
    expect(await b.list("it")).toEqual([]);
  });

  it("works cache-only when no durable repository is configured", async () => {
    const service = new MemoryService(null, fakeCache(), "u");
    expect(service.isDurable).toBe(false);
    await service.apply("es", [{ expression: "peregrinos", meaning: "", signal: "understood" }]);
    expect((await service.list("es"))[0]?.state).toBe("LEARNING");
  });
});
