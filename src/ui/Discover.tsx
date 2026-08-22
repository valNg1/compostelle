import { useMemo, useState } from "react";
import { levelBadge, type LanguageJourney } from "../domain/journey";
import { getContentById, type ContentItem } from "../domain/content";
import { languageLabel, type Language } from "../domain/language";
import type { MemorySummary } from "../domain/memory";
import { isPlayable, type LearningContent } from "../domain/learning";
import { selectDiscoveryFeed } from "../domain/discovery";
import { CATALOG } from "../content/catalog";
import type { MemoryEvent } from "../application/memoryService";
import { DiscoveryFeed } from "./DiscoveryFeed";
import { ContentView } from "./ContentView";
import { LearningSession } from "./LearningSession";

interface DiscoverProps {
  journey: LanguageJourney;
  journeys: LanguageJourney[];
  memory: MemorySummary;
  onSwitchLanguage: (language: Language) => void;
  onAddLanguage: () => void;
  onResetCurrent: () => void;
  onSignOut?: () => void;
  onFinishSession: (events: MemoryEvent[]) => void;
}

/**
 * DISCOVER stage. Navigates feed → learning session (or plain read for content
 * without a pedagogical payload), switches between language journeys, and shows
 * quiet JOURNEY progression (what's learning / to review).
 */
export function Discover({
  journey,
  journeys,
  memory,
  onSwitchLanguage,
  onAddLanguage,
  onResetCurrent,
  onSignOut,
  onFinishSession,
}: DiscoverProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const feed = useMemo(
    () => selectDiscoveryFeed(journey, CATALOG),
    [journey],
  );

  const openContent = openId ? getContentById(CATALOG, openId) : null;

  if (openContent && isPlayable(openContent)) {
    return (
      <LearningSession
        content={openContent as ContentItem & LearningContent}
        onExit={() => setOpenId(null)}
        onFinish={onFinishSession}
        onContinue={() => setOpenId(null)}
      />
    );
  }
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

      {memory.total > 0 && (
        <p className="progress" aria-label="Your progress">
          <span>
            <strong>{memory.learning}</strong> learning
          </span>
          <span>
            <strong>{memory.acquired}</strong> acquired
          </span>
          <span>
            <strong>{memory.toReview}</strong> to review
          </span>
        </p>
      )}

      <DiscoveryFeed
        feed={feed}
        language={journey.language}
        onOpen={setOpenId}
        onReset={onResetCurrent}
      />
    </div>
  );
}
