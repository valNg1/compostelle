import { describe, it, expect } from "vitest";
import type { DeclaredLevel, Interest, LanguageJourney } from "./journey";
import type { Language } from "./language";
import type { Category, ContentItem } from "./content";
import { selectDiscoveryFeed } from "./discovery";

// --- fixtures ------------------------------------------------------------

function item(
  id: string,
  category: Category,
  language: Language = "it",
): ContentItem {
  return {
    id,
    language,
    title: `title-${id}`,
    category,
    teaser: `teaser-${id}`,
    body: `body-${id}`,
    estimatedMinutes: 3,
    modality: "read",
  };
}

function journeyWith(
  interests: Interest[],
  declaredLevel: DeclaredLevel = "A1",
  language: Language = "it",
): LanguageJourney {
  return {
    language,
    declaredLevel,
    estimatedLevel: null,
    interests,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

const t1 = item("t1", "thriller");
const t2 = item("t2", "thriller");
const h1 = item("h1", "history");
const c1 = item("c1", "culture");

function shownItems(feed: {
  featured: ContentItem | null;
  alternatives: ContentItem[];
}): ContentItem[] {
  return [feed.featured, ...feed.alternatives].filter(
    (x): x is ContentItem => x !== null,
  );
}

// --- tests ---------------------------------------------------------------

describe("selectDiscoveryFeed — interests", () => {
  it("a Thriller interest surfaces a Thriller proposal", () => {
    const feed = selectDiscoveryFeed(journeyWith(["thriller"]), [t1, t2, h1]);
    expect(feed.featured).not.toBeNull();
    expect(feed.featured?.category).toBe("thriller");
    // Without Surprise me, nothing outside the declared interests shows up.
    expect(shownItems(feed).every((c) => c.category === "thriller")).toBe(true);
  });

  it("takes several interests into account", () => {
    const feed = selectDiscoveryFeed(journeyWith(["thriller", "history"]), [
      t1,
      h1,
      c1,
      t2,
    ]);
    const categories = new Set(shownItems(feed).map((c) => c.category));
    expect(categories.has("thriller")).toBe(true);
    expect(categories.has("history")).toBe(true);
    // Culture was not among the interests and there is no Surprise me.
    expect(categories.has("culture")).toBe(false);
  });
});

describe("selectDiscoveryFeed — Surprise me", () => {
  it("allows a category outside the explicit interests to appear", () => {
    const feed = selectDiscoveryFeed(
      journeyWith(["thriller", "surprise_me"]),
      [t1, t2, h1],
    );
    const hasOutside = shownItems(feed).some((c) => c.category !== "thriller");
    expect(hasOutside).toBe(true);
  });

  it("does not surface outside categories when Surprise me is absent", () => {
    const feed = selectDiscoveryFeed(journeyWith(["thriller"]), [t1, t2, h1]);
    expect(shownItems(feed).some((c) => c.category === "history")).toBe(false);
  });
});

describe("selectDiscoveryFeed — fallbacks & edge cases", () => {
  it("falls back to the whole catalog when nothing matches the interests", () => {
    const feed = selectDiscoveryFeed(journeyWith(["sport"]), [t1, h1]);
    expect(feed.featured).not.toBeNull();
  });

  it("handles an empty catalog cleanly", () => {
    const feed = selectDiscoveryFeed(journeyWith(["thriller"]), []);
    expect(feed.featured).toBeNull();
    expect(feed.alternatives).toEqual([]);
  });

  it("never duplicates the featured item among alternatives", () => {
    const feed = selectDiscoveryFeed(journeyWith(["thriller"]), [t1, t2]);
    const ids = shownItems(feed).map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("caps the number of alternatives", () => {
    const many = Array.from({ length: 10 }, (_, i) => item(`t${i}`, "thriller"));
    const feed = selectDiscoveryFeed(journeyWith(["thriller"]), many, {
      maxAlternatives: 3,
    });
    expect(feed.alternatives.length).toBeLessThanOrEqual(3);
  });
});

describe("selectDiscoveryFeed — purity & invariants", () => {
  it("does not mutate the journey (interests, declaredLevel, estimatedLevel)", () => {
    const journey = journeyWith(["thriller", "surprise_me"], "B1");
    const snapshot = structuredClone(journey);
    selectDiscoveryFeed(journey, [t1, t2, h1]);
    expect(journey).toEqual(snapshot);
    expect(journey.declaredLevel).toBe("B1");
    expect(journey.estimatedLevel).toBeNull();
  });

  it("does not mutate the catalog", () => {
    const catalog = [t1, t2, h1];
    const snapshot = structuredClone(catalog);
    selectDiscoveryFeed(journeyWith(["thriller"]), catalog);
    expect(catalog).toEqual(snapshot);
  });

  it("is deterministic for identical inputs", () => {
    const j = journeyWith(["thriller", "history", "surprise_me"]);
    const catalog = [t1, h1, c1, t2];
    expect(selectDiscoveryFeed(j, catalog)).toEqual(
      selectDiscoveryFeed(j, catalog),
    );
  });
});

describe("selectDiscoveryFeed — language isolation", () => {
  const itThriller = item("it-t", "thriller", "it");
  const itHistory = item("it-h", "history", "it");
  const esHistory = item("es-h", "history", "es");
  const esTravel = item("es-tr", "travel", "es");
  const mixed = [itThriller, itHistory, esHistory, esTravel];

  it("an Italian journey only ever receives Italian content", () => {
    const feed = selectDiscoveryFeed(
      journeyWith(["history"], "A1", "it"),
      mixed,
    );
    expect(shownItems(feed).every((c) => c.language === "it")).toBe(true);
  });

  it("a Spanish journey only ever receives Spanish content", () => {
    const feed = selectDiscoveryFeed(
      journeyWith(["history"], "A1", "es"),
      mixed,
    );
    expect(shownItems(feed).length).toBeGreaterThan(0);
    expect(shownItems(feed).every((c) => c.language === "es")).toBe(true);
  });

  it("Surprise me never crosses the target language", () => {
    // Spanish journey, single interest + surprise: exploration stays Spanish.
    const feed = selectDiscoveryFeed(
      journeyWith(["history", "surprise_me"], "A1", "es"),
      mixed,
    );
    expect(shownItems(feed).every((c) => c.language === "es")).toBe(true);
    // ...and can still surface an outside category within Spanish (travel).
    expect(shownItems(feed).some((c) => c.category !== "history")).toBe(true);
  });

  it("the fallback stays within the target language", () => {
    // No Spanish sport exists -> fallback must not leak Italian content.
    const feed = selectDiscoveryFeed(journeyWith(["sport"], "A1", "es"), mixed);
    expect(shownItems(feed).every((c) => c.language === "es")).toBe(true);
  });

  it("works unchanged (same signature) for both languages", () => {
    const itFeed = selectDiscoveryFeed(journeyWith(["history"], "A1", "it"), mixed);
    const esFeed = selectDiscoveryFeed(journeyWith(["history"], "A1", "es"), mixed);
    expect(itFeed.featured?.language).toBe("it");
    expect(esFeed.featured?.language).toBe("es");
  });
});
