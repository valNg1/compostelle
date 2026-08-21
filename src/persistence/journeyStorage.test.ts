import { describe, it, expect } from "vitest";
import { createJourney } from "../domain/journey";
import {
  saveJourney,
  loadJourney,
  clearJourney,
  STORAGE_KEY,
  type KeyValueStore,
} from "./journeyStorage";

/** In-memory Storage-like double, so tests need no DOM. */
function memoryStore(): KeyValueStore & { raw: Map<string, string> } {
  const raw = new Map<string, string>();
  return {
    raw,
    getItem: (k) => raw.get(k) ?? null,
    setItem: (k, v) => void raw.set(k, v),
    removeItem: (k) => void raw.delete(k),
  };
}

describe("journey persistence", () => {
  it("returns null when nothing has been saved", () => {
    expect(loadJourney(memoryStore())).toBeNull();
  });

  it("persists a journey and reloads it identically (round-trip)", () => {
    const store = memoryStore();
    const journey = createJourney({
      declaredLevel: "B2",
      interests: ["thriller", "travel"],
    });

    saveJourney(journey, store);
    const reloaded = loadJourney(store);

    expect(reloaded).toEqual(journey);
  });

  it("preserves declaredLevel and estimatedLevel as separate fields", () => {
    const store = memoryStore();
    const journey = createJourney({
      declaredLevel: "UNKNOWN",
      interests: ["culture"],
    });

    saveJourney(journey, store);
    const reloaded = loadJourney(store);

    expect(reloaded?.declaredLevel).toBe("UNKNOWN");
    expect(reloaded?.estimatedLevel).toBeNull();
    expect("estimatedLevel" in (reloaded as object)).toBe(true);
  });

  it("treats corrupted data as no journey (never throws)", () => {
    const store = memoryStore();
    store.setItem(STORAGE_KEY, "{ not valid json");
    expect(loadJourney(store)).toBeNull();
  });

  it("clears a saved journey", () => {
    const store = memoryStore();
    saveJourney(
      createJourney({ declaredLevel: "A1", interests: ["news"] }),
      store,
    );
    clearJourney(store);
    expect(loadJourney(store)).toBeNull();
  });
});
