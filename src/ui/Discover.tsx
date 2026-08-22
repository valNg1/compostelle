import { useMemo, useState } from "react";
import type { LanguageJourney } from "../domain/journey";
import { getContentById } from "../domain/content";
import { selectDiscoveryFeed } from "../domain/discovery";
import { CATALOG } from "../content/catalog";
import { DiscoveryFeed } from "./DiscoveryFeed";
import { ContentView } from "./ContentView";

interface DiscoverProps {
  journey: LanguageJourney;
  onReset: () => void;
}

/**
 * DISCOVER stage (US-02). Owns the small navigation between the personalised
 * feed and a single content view. The feed is a pure function of the journey
 * and the catalog, so it never mutates the journey.
 */
export function Discover({ journey, onReset }: DiscoverProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const feed = useMemo(
    () => selectDiscoveryFeed(journey, CATALOG),
    [journey],
  );

  // Resolve defensively: an unknown id simply falls back to the feed.
  const openContent = openId ? getContentById(CATALOG, openId) : null;

  if (openContent) {
    return <ContentView content={openContent} onBack={() => setOpenId(null)} />;
  }

  return <DiscoveryFeed feed={feed} onOpen={setOpenId} onReset={onReset} />;
}
