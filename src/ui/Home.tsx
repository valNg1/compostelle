import { useState } from "react";
import { levelBadge, type LanguageJourney } from "../domain/journey";
import { languageLabel, type Language } from "../domain/language";
import type { MemoryItem, MemorySummary } from "../domain/memory";
import {
  selectUnitForTheme,
  unitTopics,
  type LearningUnit,
  type Theme,
} from "../domain/learningUnit";
import { CATALOG } from "../content/catalog";
import type { MemoryEvent } from "../application/memoryService";
import { Start } from "./Start";
import { MyJourney } from "./MyJourney";
import { LearningSession } from "./LearningSession";

interface HomeProps {
  journey: LanguageJourney;
  journeys: LanguageJourney[];
  memory: MemorySummary;
  memoryItems: MemoryItem[];
  onSwitchLanguage: (language: Language) => void;
  onAddLanguage: () => void;
  onSignOut?: () => void;
  onFinishSession: (events: MemoryEvent[]) => void;
}

type View = "start" | "journey";

/**
 * Home shell after login. Two destinations — START and MY JOURNEY — and the
 * active-language switch. A learning session (LEARN) is launched from START and
 * takes over the screen until the learner returns.
 */
export function Home({
  journey,
  journeys,
  memory,
  memoryItems,
  onSwitchLanguage,
  onAddLanguage,
  onSignOut,
  onFinishSession,
}: HomeProps) {
  const [view, setView] = useState<View>("start");
  const [unit, setUnit] = useState<LearningUnit | null>(null);

  // LEARN takes over the whole screen.
  if (unit) {
    return (
      <LearningSession
        content={unit}
        onExit={() => setUnit(null)}
        onFinish={onFinishSession}
        onContinue={() => {
          setUnit(null);
          setView("journey");
        }}
        onBackToStart={() => {
          setUnit(null);
          setView("start");
        }}
      />
    );
  }

  function startTheme(theme: Theme) {
    const selected = selectUnitForTheme(CATALOG, journey.language, theme);
    if (selected) setUnit(selected);
  }

  const topics = unitTopics(CATALOG, journey.language);

  return (
    <div className="home">
      <nav className="topnav" aria-label="COMPOSTELLE">
        <div className="topnav__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={view === "start"}
            className={"tab" + (view === "start" ? " tab--on" : "")}
            onClick={() => setView("start")}
          >
            Start
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "journey"}
            className={"tab" + (view === "journey" ? " tab--on" : "")}
            onClick={() => setView("journey")}
          >
            My Journey
          </button>
        </div>
        <div className="topnav__lang">
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
            + Add
          </button>
          {onSignOut && (
            <button type="button" className="langbar__signout" onClick={onSignOut}>
              Sign out
            </button>
          )}
        </div>
      </nav>

      {view === "start" ? (
        <Start journey={journey} topics={topics} onStart={startTheme} />
      ) : (
        <MyJourney journey={journey} memory={memory} items={memoryItems} />
      )}
    </div>
  );
}
