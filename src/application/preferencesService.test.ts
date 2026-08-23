import { describe, it, expect } from "vitest";
import { InMemoryPreferencesRepository } from "../persistence/inMemoryPreferencesRepository";
import {
  PreferencesService,
  type PreferencesCache,
  type UserPreferences,
} from "./preferencesService";

function fakeCache(): PreferencesCache & { value: UserPreferences | null } {
  return {
    value: null,
    load() {
      return this.value;
    },
    save(p) {
      this.value = p;
    },
  };
}

describe("PreferencesService (interface language, per user)", () => {
  it("saves durably + in cache and reads back", async () => {
    const durable = new InMemoryPreferencesRepository();
    const cache = fakeCache();
    const service = new PreferencesService(durable, cache, "user-1");
    await service.save({ interfaceLanguage: "fr" });
    expect((await service.load())?.interfaceLanguage).toBe("fr");
    expect(await durable.load("user-1")).toEqual({ interfaceLanguage: "fr" });
  });

  it("restores from durable on a fresh cache (new browser)", async () => {
    const durable = new InMemoryPreferencesRepository();
    await new PreferencesService(durable, fakeCache(), "user-1").save({
      interfaceLanguage: "fr",
    });
    const fresh = new PreferencesService(durable, fakeCache(), "user-1");
    expect((await fresh.load())?.interfaceLanguage).toBe("fr");
  });

  it("isolates preferences per user", async () => {
    const durable = new InMemoryPreferencesRepository();
    await new PreferencesService(durable, fakeCache(), "user-1").save({
      interfaceLanguage: "fr",
    });
    const other = new PreferencesService(durable, fakeCache(), "user-2");
    expect(await other.load()).toBeNull();
  });

  it("works cache-only without a durable repository", async () => {
    const cache = fakeCache();
    const service = new PreferencesService(null, cache, "u");
    await service.save({ interfaceLanguage: "en" });
    expect((await service.load())?.interfaceLanguage).toBe("en");
  });
});
