import { useMemo, useState } from "react";
import { levelBadge, type LanguageJourney } from "../domain/journey";
import { getContentById } from "../domain/content";
import { languageLabel, type Language } from "../domain/language";
import { selectDiscoveryFeed } from "../domain/discovery";
import { CATALOG } from "../content/catalog";
import { DiscoveryFeed } from "./DiscoveryFeed";
import { ContentView } from "./ContentView";

interface DiscoverProps {
  journey: LanguageJourney;
  /** The learner's journeys (for switching, with their declared levels). */
  journeys: LanguageJourney[];
  onSwitchLanguage: (language: Language) => void;
  onAddLanguage: () => void;
  onResetCurrent: () => void;
  onSignOut?: () => void;
}

/**
 * DISCOVER stage (US-02). Owns the navigation between the personalised feed and
 * a single content view, plus a minimal bar to switch between the learner's
 * existing language journeys (switching never destroys a journey). The bar keeps
 * the declared level visible as quiet context: "Italian · B2".
 */
export function Discover({
  journey,
  journeys,
  onSwitchLanguage,
  onAddLanguage,
  onResetCurrent,
  onSignOut,
}: DiscoverProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const feed = useMemo(
    () => selectDiscoveryFeed(journey, CATALOG),
    [journey],
  );

  const openContent = openId ? getContentById(CATALOG, openId) : null;
  if (openContent) {
    return <ContentView content={openContent} onBack={() => setOpenId(null)} />;
  }

  return (
    <div className="discover-shell">
      <nav className="langbar" aria-label="Your languages">
        <div className="langbar__langs">
          {journeys.map((j) => {
            const active = j.language === journey.language;
            const badge = levelBadge(j.declaredLevel);
            return (
              <button
                key={j.language}
                type="button"
                aria-current={active}
                className={"langbar__lang" + (active ? " langbar__lang--on" : "")}
                onClick={() => onSwitchLanguage(j.language)}
              >
                {languageLabel(j.language)}
                {badge && <span className="langbar__level"> · {badge}</span>}
              </button>
            );
          })}
          <button type="button" className="langbar__add" onClick={onAddLanguage}>
            + Add a language
          </button>
        </div>
        {onSignOut && (
          <button type="button" className="langbar__signout" onClick={onSignOut}>
            Sign out
          </button>
        )}
      </nav>

      <DiscoveryFeed
        feed={feed}
        language={journey.language}
        onOpen={setOpenId}
        onReset={onResetCurrent}
      />
    </div>
  );
}
