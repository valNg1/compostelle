import { describe, it, expect } from "vitest";
import { createJourney } from "../domain/journey";
import { toRow, fromRow, type JourneyRow } from "./supabaseJourneyRepository";

/**
 * Pure row-mapper tests. No Supabase client / no live database required — these
 * guard the domain <-> PostgreSQL boundary of the durable adapter.
 */

describe("Supabase journey row mapping", () => {
  it("maps a journey to a row (snake_case columns)", () => {
    const journey = createJourney({
      language: "es",
      declaredLevel: "B2",
      interests: ["history", "travel"],
    });
    const row = toRow("learner-1", journey);
    expect(row).toMatchObject({
      learner_id: "learner-1",
      language: "es",
      declared_level: "B2",
      estimated_level: null,
      interests: ["history", "travel"],
    });
    expect(row.created_at).toBe(journey.createdAt);
  });

  it("round-trips journey -> row -> journey", () => {
    const journey = createJourney({
      language: "it",
      declaredLevel: "UNKNOWN",
      interests: ["surprise_me"],
    });
    expect(fromRow(toRow("learner-x", journey))).toEqual(journey);
  });

  it("keeps declaredLevel and estimatedLevel separate through the mapping", () => {
    const row: JourneyRow = {
      learner_id: "l",
      language: "es",
      declared_level: "C1",
      estimated_level: null,
      interests: ["culture"],
      created_at: "2026-01-01T00:00:00.000Z",
    };
    const journey = fromRow(row);
    expect(journey.declaredLevel).toBe("C1");
    expect(journey.estimatedLevel).toBeNull();
  });

  it("defaults an unknown stored language to Italian", () => {
    const row: JourneyRow = {
      learner_id: "l",
      language: "xx",
      declared_level: "A1",
      estimated_level: null,
      interests: [],
      created_at: "2026-01-01T00:00:00.000Z",
    };
    expect(fromRow(row).language).toBe("it");
  });
});
