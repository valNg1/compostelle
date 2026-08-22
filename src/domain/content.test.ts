import { describe, it, expect } from "vitest";
import { getContentById, CATEGORIES, type ContentItem } from "./content";
import { isLanguage } from "./language";
import { CATALOG } from "../content/catalog";

const sample: ContentItem[] = [
  {
    id: "a",
    language: "it",
    title: "A",
    category: "thriller",
    teaser: "t",
    body: "b",
    estimatedMinutes: 2,
    modality: "read",
  },
  {
    id: "b",
    language: "it",
    title: "B",
    category: "history",
    teaser: "t",
    body: "b",
    estimatedMinutes: 2,
    modality: "read",
  },
];

describe("getContentById", () => {
  it("returns the matching item", () => {
    expect(getContentById(sample, "a")?.id).toBe("a");
  });

  it("returns null for an unknown id", () => {
    expect(getContentById(sample, "zzz")).toBeNull();
  });

  it("returns null for an empty catalog", () => {
    expect(getContentById([], "a")).toBeNull();
  });
});

describe("CATALOG integrity", () => {
  it("is non-empty", () => {
    expect(CATALOG.length).toBeGreaterThan(0);
  });

  it("has unique ids", () => {
    const ids = CATALOG.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only uses known categories", () => {
    for (const c of CATALOG) {
      expect(CATEGORIES).toContain(c.category);
    }
  });

  it("has meaningful, non-empty editorial fields", () => {
    for (const c of CATALOG) {
      expect(c.title.trim().length).toBeGreaterThan(0);
      expect(c.teaser.trim().length).toBeGreaterThan(0);
      expect(c.body.trim().length).toBeGreaterThan(0);
      expect(c.estimatedMinutes).toBeGreaterThan(0);
    }
  });

  it("covers every category at least once", () => {
    const present = new Set(CATALOG.map((c) => c.category));
    for (const cat of CATEGORIES) {
      expect(present.has(cat)).toBe(true);
    }
  });

  it("only uses known languages, and ships both it and es", () => {
    for (const c of CATALOG) {
      expect(isLanguage(c.language)).toBe(true);
    }
    const langs = new Set(CATALOG.map((c) => c.language));
    expect(langs.has("it")).toBe(true);
    expect(langs.has("es")).toBe(true);
  });
});
