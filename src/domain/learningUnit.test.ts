import { describe, it, expect } from "vitest";
import {
  playableUnits,
  unitTopics,
  selectUnitForTheme,
  toLearningUnit,
  memoryTargets,
} from "./learningUnit";
import { CATALOG } from "../content/catalog";

describe("Learning Unit selection over the real catalog", () => {
  it("lists playable units per language", () => {
    expect(playableUnits(CATALOG, "it").length).toBeGreaterThanOrEqual(2);
    expect(playableUnits(CATALOG, "es").length).toBeGreaterThanOrEqual(2);
    expect(playableUnits(CATALOG, "it").every((u) => u.language === "it")).toBe(true);
  });

  it("exposes topics that actually have a playable unit", () => {
    const topics = unitTopics(CATALOG, "it");
    expect(topics.length).toBeGreaterThan(0);
    for (const t of topics) {
      expect(selectUnitForTheme(CATALOG, "it", t)?.category).toBe(t);
    }
  });

  it("selects a unit for a theme, and falls back for surprise_me", () => {
    const topic = unitTopics(CATALOG, "it")[0]!;
    expect(selectUnitForTheme(CATALOG, "it", topic)?.category).toBe(topic);

    const surprise = selectUnitForTheme(CATALOG, "it", "surprise_me");
    expect(surprise).not.toBeNull();
    expect(surprise?.language).toBe("it");
  });

  it("never returns a non-playable unit", () => {
    const unit = selectUnitForTheme(CATALOG, "es", "surprise_me");
    expect(unit && toLearningUnit(unit)).not.toBeNull();
    expect((unit?.annotations.length ?? 0)).toBeGreaterThan(0);
  });

  it("derives memory targets from a unit's annotations", () => {
    const unit = selectUnitForTheme(CATALOG, "it", "surprise_me")!;
    expect(memoryTargets(unit)).toEqual(unit.annotations.map((a) => a.expression));
  });

  it("stays within the requested language for a theme", () => {
    // Spanish journey must never receive an Italian unit.
    const unit = selectUnitForTheme(CATALOG, "es", "history");
    expect(unit?.language).toBe("es");
  });
});
