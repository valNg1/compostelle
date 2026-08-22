import { describe, it, expect } from "vitest";
import type { DeclaredLevel, Interest, LanguageJourney } from "./journey";
import { selectDiscoveryFeed } from "./discovery";
import { getContentById } from "./content";
import { CATALOG } from "../content/catalog";

/**
 * Integration guards: the shipped catalog + selection must produce a sane feed
 * for a real learner. These protect the delivered experience against a catalog
 * that drifts out of sync with the selection rules.
 */

function journeyWith(
  interests: Interest[],
  declaredLevel: DeclaredLevel = "A1",
): LanguageJourney {
  return {
    language: "it",
    declaredLevel,
    estimatedLevel: null,
    interests,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("discovery against the real catalog", () => {
  it("gives a Thriller learner a Thriller featured pick", () => {
    const feed = selectDiscoveryFeed(journeyWith(["thriller"]), CATALOG);
    expect(feed.featured?.category).toBe("thriller");
  });

  it("always fills a featured pick for any single declared interest", () => {
    for (const interest of [
      "thriller",
      "history",
      "travel",
      "culture",
      "news",
      "sport",
      "everyday_life",
    ] as const) {
      const feed = selectDiscoveryFeed(journeyWith([interest]), CATALOG);
      expect(feed.featured).not.toBeNull();
      expect(feed.featured?.category).toBe(interest);
    }
  });

  it("can surface an outside category when Surprise me is on", () => {
    const feed = selectDiscoveryFeed(
      journeyWith(["thriller", "surprise_me"]),
      CATALOG,
    );
    const shown = [feed.featured, ...feed.alternatives].filter(Boolean);
    expect(shown.some((c) => c?.category !== "thriller")).toBe(true);
  });

  it("every item shown in a feed is resolvable by id (feed <-> content view)", () => {
    const feed = selectDiscoveryFeed(
      journeyWith(["history", "travel"]),
      CATALOG,
    );
    for (const item of [feed.featured, ...feed.alternatives]) {
      if (!item) continue;
      expect(getContentById(CATALOG, item.id)?.id).toBe(item.id);
    }
  });
});
