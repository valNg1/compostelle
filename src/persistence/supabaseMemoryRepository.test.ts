import { describe, it, expect } from "vitest";
import {
  toMemoryRow,
  fromMemoryRow,
  type MemoryRow,
} from "./supabaseMemoryRepository";
import type { MemoryItem } from "../domain/memory";

const item: MemoryItem = {
  language: "es",
  expression: "la sobremesa",
  meaning: "after-meal chat",
  state: "LEARNING",
  lastInteraction: "2026-01-01T00:00:00.000Z",
};

describe("Supabase memory row mapping", () => {
  it("maps a memory item to a user-owned row", () => {
    expect(toMemoryRow("user-1", item)).toEqual({
      user_id: "user-1",
      language_code: "es",
      expression: "la sobremesa",
      meaning: "after-meal chat",
      state: "LEARNING",
      last_interaction: "2026-01-01T00:00:00.000Z",
    });
  });

  it("round-trips item -> row -> item", () => {
    expect(fromMemoryRow(toMemoryRow("u", item))).toEqual(item);
  });

  it("defaults an unknown state to NEW and unknown language to it", () => {
    const row: MemoryRow = {
      user_id: "u",
      language_code: "xx",
      expression: "x",
      meaning: "",
      state: "WAT",
      last_interaction: "2026-01-01T00:00:00.000Z",
    };
    const mapped = fromMemoryRow(row);
    expect(mapped.state).toBe("NEW");
    expect(mapped.language).toBe("it");
  });
});
