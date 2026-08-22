import { describe, it, expect } from "vitest";
import { createJourney } from "../domain/journey";
import {
  saveJourney,
  loadJourney,
  clearJourney,
  STORAGE_KEY,
  LEGACY_STORAGE_KEY,
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

describe("legacy key migration (lontano -> compostelle)", () => {
  it("uses the new storage key and keeps the legacy key documented", () => {
    expect(STORAGE_KEY).toBe("compostelle.journey.v1");
    expect(LEGACY_STORAGE_KEY).toBe("lontano.journey.v1");
  });

  it("migrates a valid journey from the legacy key to the new key", () => {
    const store = memoryStore();
    const journey = createJourney({
      declaredLevel: "B1",
      interests: ["history", "travel"],
    });
    // Only the legacy key holds data; the new key is empty.
    store.setItem(LEGACY_STORAGE_KEY, JSON.stringify(journey));

    const loaded = loadJourney(store);

    // The journey is recovered...
    expect(loaded).toEqual(journey);
    // ...re-saved under the new key...
    expect(store.getItem(STORAGE_KEY)).toBe(JSON.stringify(journey));
    // ...and the legacy key is removed.
    expect(store.getItem(LEGACY_STORAGE_KEY)).toBeNull();
  });

  it("prefers the new key over the legacy key when both exist", () => {
    const store = memoryStore();
    const current = createJourney({ declaredLevel: "C1", interests: ["news"] });
    const legacy = createJourney({ declaredLevel: "A1", interests: ["sport"] });
    store.setItem(STORAGE_KEY, JSON.stringify(current));
    store.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacy));

    expect(loadJourney(store)).toEqual(current);
  });

  it("ignores an invalid legacy journey (no false migration)", () => {
    const store = memoryStore();
    store.setItem(LEGACY_STORAGE_KEY, '{"totally":"not a journey"}');
    expect(loadJourney(store)).toBeNull();
  });

  it("saveJourney writes only the new key", () => {
    const store = memoryStore();
    saveJourney(
      createJourney({ declaredLevel: "A2", interests: ["culture"] }),
      store,
    );
    expect(store.getItem(STORAGE_KEY)).not.toBeNull();
    expect(store.getItem(LEGACY_STORAGE_KEY)).toBeNull();
  });

  it("clearJourney removes both the new and the legacy keys", () => {
    const store = memoryStore();
    store.setItem(LEGACY_STORAGE_KEY, "anything");
    saveJourney(
      createJourney({ declaredLevel: "A1", interests: ["news"] }),
      store,
    );
    clearJourney(store);
    expect(store.getItem(STORAGE_KEY)).toBeNull();
    expect(store.getItem(LEGACY_STORAGE_KEY)).toBeNull();
  });
});
