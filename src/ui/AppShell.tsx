import { useEffect, useState } from "react";
import { levelBadge, type LanguageJourney } from "../domain/journey";
import { languageLabel, type Language } from "../domain/language";
import { t, type InterfaceLanguage } from "../domain/i18n";
import type { MemoryItem, MemorySummary } from "../domain/memory";
import type { LearningActivity } from "../domain/activity";
import {
  selectUnitForTheme,
  unitTopics,
  type LearningUnit,
  type Theme,
} from "../domain/learningUnit";
import { CATALOG } from "../content/catalog";
import type { MemoryEvent } from "../application/memoryService";
import type { SessionResult } from "./LearningSession";
import { LearningSession } from "./LearningSession";
import { Start } from "./Start";
import { HomeDashboard } from "./HomeDashboard";
import { MyJourney } from "./MyJourney";
import { MySpace } from "./MySpace";

type Section = "home" | "learn" | "journey" | "me";
const SECTIONS: Section[] = ["home", "learn", "journey", "me"];
const NAV_KEY: Record<Section, string> = {
  home: "nav.home",
  learn: "nav.learn",
  journey: "nav.journey",
  me: "nav.me",
};

interface AppShellProps {
  journey: LanguageJourney;
  journeys: LanguageJourney[];
  memory: MemorySummary;
  memoryItems: MemoryItem[];
  activities: LearningActivity[];
  interfaceLanguage: InterfaceLanguage;
  userEmail: string | null;
  onSetInterfaceLanguage: (language: InterfaceLanguage) => void;
  onSwitchLanguage: (language: Language) => void;
  onAddLanguage: () => void;
  onSignOut?: () => void;
  onFinishSession: (events: MemoryEvent[], result: SessionResult) => void;
}

function sectionFromHash(): Section {
  const h = (globalThis.location?.hash ?? "").replace(/^#\/?/, "");
  return (SECTIONS as string[]).includes(h) ? (h as Section) : "home";
}

/**
 * The COMPOSTELLE application shell: a persistent top navigation over four
 * spaces (HOME dashboard, LEARN, MY JOURNEY, MY SPACE). Learning sessions run
 * full-screen inside LEARN. Section is reflected in the URL hash so the browser
 * Back button stays coherent.
 */
export function AppShell({
  journey,
  journeys,
  memory,
  memoryItems,
  activities,
  interfaceLanguage,
  userEmail,
  onSetInterfaceLanguage,
  onSwitchLanguage,
  onAddLanguage,
  onSignOut,
  onFinishSession,
}: AppShellProps) {
  const il = interfaceLanguage;
  const [section, setSection] = useState<Section>(sectionFromHash);
  const [unit, setUnit] = useState<LearningUnit | null>(null);

  useEffect(() => {
    const onHash = () => setSection(sectionFromHash());
    globalThis.addEventListener("hashchange", onHash);
    return () => globalThis.removeEventListener("hashchange", onHash);
  }, []);

  function go(next: Section) {
    setUnit(null);
    setSection(next);
    if (globalThis.location) globalThis.location.hash = `#/${next}`;
  }

  // LEARN session takes over the whole screen.
  if (section === "learn" && unit) {
    return (
      <LearningSession
        content={unit}
        declaredLevel={journey.declaredLevel}
        interfaceLanguage={il}
        onExit={() => setUnit(null)}
        onFinish={onFinishSession}
        onContinue={() => {
          setUnit(null);
          go("journey");
        }}
        onBackToStart={() => setUnit(null)}
      />
    );
  }

  function startTheme(theme: Theme) {
    const selected = selectUnitForTheme(CATALOG, journey.language, theme);
    if (selected) setUnit(selected);
  }

  return (
    <div className="shell">
      <header className="appnav">
        <span className="appnav__brand">COMPOSTEL</span>
        <nav className="appnav__links" aria-label="Sections">
          {SECTIONS.map((s) => (
            <button
              key={s}
              type="button"
              aria-current={section === s}
              className={"navlink" + (section === s ? " navlink--on" : "")}
              onClick={() => go(s)}
            >
              {t(NAV_KEY[s], il)}
            </button>
          ))}
        </nav>
        <div className="appnav__lang">
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
        </div>
      </header>

      <main className="shell__main">
        {section === "home" && (
          <HomeDashboard
            journey={journey}
            memory={memory}
            memoryItems={memoryItems}
            activities={activities}
            interfaceLanguage={il}
            onStartLearning={() => go("learn")}
            onViewJourney={() => go("journey")}
          />
        )}
        {section === "learn" && (
          <Start
            journey={journey}
            topics={unitTopics(CATALOG, journey.language)}
            interfaceLanguage={il}
            onStart={startTheme}
          />
        )}
        {section === "journey" && (
          <MyJourney
            journey={journey}
            memory={memory}
            items={memoryItems}
            activities={activities}
            interfaceLanguage={il}
          />
        )}
        {section === "me" && (
          <MySpace
            journeys={journeys}
            interfaceLanguage={il}
            userEmail={userEmail}
            onSetInterfaceLanguage={onSetInterfaceLanguage}
            onAddLanguage={onAddLanguage}
            onSignOut={onSignOut}
          />
        )}
      </main>
    </div>
  );
}
