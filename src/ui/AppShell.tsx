import { useEffect, useMemo, useState } from "react";
import { levelBadge, type LanguageJourney } from "../domain/journey";
import { languageLabel, type Language } from "../domain/language";
import { t, type InterfaceLanguage } from "../domain/i18n";
import type { MemoryItem, MemorySummary } from "../domain/memory";
import type { LearningActivity } from "../domain/activity";
import {
  selectUnitForTheme,
  selectNextLesson,
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
import { BrandLogo } from "./BrandLogo";
import { ResumeChoice } from "./ResumeChoice";
import { NoMoreLessons } from "./NoMoreLessons";

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
  /** Ids of Learning Units the learner has already completed (this language). */
  completedUnitIds: string[];
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
  completedUnitIds,
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
  const [replay, setReplay] = useState(false);
  const [theme, setTheme] = useState<Theme>("surprise_me");
  // When arriving on an already-completed lesson, offer the resume choice.
  const [resume, setResume] = useState<LearningUnit | null>(null);
  // Set when "continue" finds no lesson left to open (issue #8).
  const [noMore, setNoMore] = useState(false);

  const completedIds = useMemo(
    () => new Set(completedUnitIds),
    [completedUnitIds],
  );

  /**
   * The next lesson "continue" should open. Excludes the just-finished / resumed
   * unit locally so a slow durable write (Supabase) can't make us reopen it
   * (issue #8), and falls back across themes when the current theme is done.
   */
  function nextLesson(): LearningUnit | null {
    const done = new Set(completedIds);
    if (unit) done.add(unit.id);
    if (resume) done.add(resume.id);
    return selectNextLesson(CATALOG, journey.language, theme, done);
  }

  useEffect(() => {
    const onHash = () => setSection(sectionFromHash());
    globalThis.addEventListener("hashchange", onHash);
    return () => globalThis.removeEventListener("hashchange", onHash);
  }, []);

  function go(next: Section) {
    setUnit(null);
    setResume(null);
    setNoMore(false);
    setSection(next);
    if (globalThis.location) globalThis.location.hash = `#/${next}`;
  }

  function launchUnit(next: LearningUnit, isReplay: boolean) {
    setResume(null);
    setNoMore(false);
    setReplay(isReplay);
    setUnit(next);
  }

  /**
   * Continue with a NEW lesson (issue #8): open the next eligible lesson, or —
   * when every playable lesson is completed — show a clear message instead of a
   * blank screen / silent navigation.
   */
  function continueLearning() {
    const next = nextLesson();
    if (next) {
      launchUnit(next, false);
    } else {
      setUnit(null);
      setResume(null);
      setSection("learn");
      setNoMore(true);
    }
  }

  // LEARN session takes over the whole screen. Keyed by unit id so switching
  // to another lesson (continue / replay) mounts a fresh session.
  if (section === "learn" && unit) {
    return (
      <LearningSession
        key={`${unit.id}:${replay ? "replay" : "play"}`}
        content={unit}
        declaredLevel={journey.declaredLevel}
        interfaceLanguage={il}
        replay={replay}
        memoryItems={memoryItems}
        onExit={() => setUnit(null)}
        onFinish={onFinishSession}
        onContinue={() => {
          setUnit(null);
          go("journey");
        }}
        onReplay={() => launchUnit(unit, true)}
        onNextLesson={continueLearning}
        onBackToStart={() => setUnit(null)}
      />
    );
  }

  function startTheme(nextTheme: Theme) {
    setTheme(nextTheme);
    setNoMore(false);
    const selected = selectUnitForTheme(CATALOG, journey.language, nextTheme);
    if (!selected) return;
    if (completedIds.has(selected.id)) {
      // Already completed → ask whether to redo or move on.
      setResume(selected);
    } else {
      launchUnit(selected, false);
    }
  }

  return (
    <div className="shell">
      <header className="appnav">
        <BrandLogo />
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
        {section === "learn" &&
          (noMore ? (
            <NoMoreLessons
              interfaceLanguage={il}
              onBrowseThemes={() => setNoMore(false)}
              onViewJourney={() => go("journey")}
            />
          ) : resume ? (
            <ResumeChoice
              unitTitle={resume.title}
              hasNext={nextLesson() !== null}
              interfaceLanguage={il}
              onReplay={() => launchUnit(resume, true)}
              onContinue={continueLearning}
            />
          ) : (
            <Start
              journey={journey}
              topics={unitTopics(CATALOG, journey.language)}
              interfaceLanguage={il}
              onStart={startTheme}
            />
          ))}
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
