import { useState } from "react";
import { levelBadge, type LanguageJourney } from "../domain/journey";
import { languageLabel, type Language } from "../domain/language";
import { t, INTERFACE_LANGUAGES, type InterfaceLanguage } from "../domain/i18n";
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
  interfaceLanguage: InterfaceLanguage;
  onSetInterfaceLanguage: (language: InterfaceLanguage) => void;
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
  interfaceLanguage,
  onSetInterfaceLanguage,
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
        declaredLevel={journey.declaredLevel}
        interfaceLanguage={interfaceLanguage}
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
            {t("nav.start", interfaceLanguage)}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "journey"}
            className={"tab" + (view === "journey" ? " tab--on" : "")}
            onClick={() => setView("journey")}
          >
            {t("nav.journey", interfaceLanguage)}
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
            {t("home.add", interfaceLanguage)}
          </button>
          {onSignOut && (
            <button type="button" className="langbar__signout" onClick={onSignOut}>
              {t("home.signout", interfaceLanguage)}
            </button>
          )}
        </div>
      </nav>

      <div className="ilang" role="group" aria-label="Interface language">
        {INTERFACE_LANGUAGES.filter((l) => l.ready).map((l) => (
          <button
            key={l.code}
            type="button"
            aria-pressed={interfaceLanguage === l.code}
            className={
              "ilang__opt" +
              (interfaceLanguage === l.code ? " ilang__opt--on" : "")
            }
            onClick={() => onSetInterfaceLanguage(l.code)}
          >
            {l.label}
          </button>
        ))}
      </div>

      {view === "start" ? (
        <Start
          journey={journey}
          topics={topics}
          interfaceLanguage={interfaceLanguage}
          onStart={startTheme}
        />
      ) : (
        <MyJourney
          journey={journey}
          memory={memory}
          items={memoryItems}
          interfaceLanguage={interfaceLanguage}
        />
      )}
    </div>
  );
}
