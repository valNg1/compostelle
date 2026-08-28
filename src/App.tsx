import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { LanguageJourney } from "./domain/journey";
import { LANGUAGES, DEFAULT_LANGUAGE, type Language } from "./domain/language";
import { summarize, type MemorySummary, type MemoryItem } from "./domain/memory";
import {
  DEFAULT_INTERFACE_LANGUAGE,
  type InterfaceLanguage,
} from "./domain/i18n";
import type { LearningActivity } from "./domain/activity";
import type { JourneyService } from "./application/journeyService";
import type { MemoryService, MemoryEvent } from "./application/memoryService";
import type { PreferencesService } from "./application/preferencesService";
import type { ActivityService } from "./application/activityService";
import type { ProgressionService } from "./application/progressionService";
import type { UnitProgressRecord, UnitSignals } from "./domain/progression";
import {
  getAuthService,
  createJourneyService,
  createMemoryService,
  createPreferencesService,
  createActivityService,
  createProgressionService,
} from "./persistence/createJourneyService";
import { getLocalUserId } from "./persistence/localJourneyCache";
import { Onboarding } from "./ui/Onboarding";
import { AppShell } from "./ui/AppShell";
import type { SessionResult } from "./ui/LearningSession";
import { AuthScreen } from "./ui/AuthScreen";
import { SiteFooter } from "./ui/SiteFooter";
import { SupportForm } from "./ui/SupportForm";
import { MentionsLegales, Confidentialite, Cookies } from "./ui/LegalPages";

/** Footer-reachable overlay pages (legal / support), driven by the URL hash. */
type Overlay = "support" | "mentions-legales" | "confidentialite" | "cookies";

function overlayFromHash(hash: string): Overlay | null {
  const h = hash.replace(/^#\/?/, "");
  if (h === "support") return "support";
  if (h === "mentions-legales") return "mentions-legales";
  if (h === "confidentialite") return "confidentialite";
  if (h === "cookies") return "cookies";
  return null;
}

const EMPTY_SUMMARY: MemorySummary = {
  learning: 0,
  acquired: 0,
  toReview: 0,
  total: 0,
};

function upsertByLanguage(
  list: LanguageJourney[],
  journey: LanguageJourney,
): LanguageJourney[] {
  const rest = list.filter((j) => j.language !== journey.language);
  return [...rest, journey];
}

/**
 * App flow (US-01 + US-02, MVP foundation):
 *  - durable mode (Supabase configured): require email + password sign-in; the
 *    owner is auth.uid(). A user keeps SEPARATE journeys per language and switches
 *    between them without destroying any.
 *  - cache-only mode (no Supabase): anonymous local user id, single device.
 */
export function App() {
  const authService = useMemo(() => getAuthService(), []);

  const [userId, setUserId] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [ready, setReady] = useState(false);

  const [service, setService] = useState<JourneyService | null>(null);
  const [memoryService, setMemoryService] = useState<MemoryService | null>(null);
  const [preferencesService, setPreferencesService] =
    useState<PreferencesService | null>(null);
  const [activityService, setActivityService] =
    useState<ActivityService | null>(null);
  const [progressionService, setProgressionService] =
    useState<ProgressionService | null>(null);
  const [unitProgress, setUnitProgress] = useState<UnitProgressRecord[]>([]);
  const [journeys, setJourneys] = useState<LanguageJourney[]>([]);
  const [current, setCurrent] = useState<Language | null>(null);
  const [adding, setAdding] = useState(false);
  const [memory, setMemory] = useState<MemorySummary>(EMPTY_SUMMARY);
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>([]);
  const [activities, setActivities] = useState<LearningActivity[]>([]);
  const [completedUnitIds, setCompletedUnitIds] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [interfaceLanguage, setInterfaceLanguage] = useState<InterfaceLanguage>(
    DEFAULT_INTERFACE_LANGUAGE,
  );
  const [hash, setHash] = useState<string>(() =>
    typeof window !== "undefined" ? window.location.hash : "",
  );

  // Track the URL hash so the footer's legal/support overlays can react to it.
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Resolve identity (auth when configured, else anonymous local id).
  useEffect(() => {
    let active = true;
    if (!authService) {
      setUserId(getLocalUserId());
      return;
    }
    const unsubscribe = authService.onAuthChange((user) => {
      if (!active) return;
      setUserId(user?.id ?? null);
      setUserEmail(user?.email ?? null);
      setNeedsAuth(user === null);
    });
    authService
      .getUser()
      .then((user) => {
        if (!active) return;
        setUserId(user?.id ?? null);
        setUserEmail(user?.email ?? null);
        setNeedsAuth(user === null);
        if (user === null) setReady(true);
      })
      .catch(() => {
        if (!active) return;
        setNeedsAuth(true);
        setReady(true);
      });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [authService]);

  // Load the user's journeys once we have an id.
  useEffect(() => {
    if (!userId) return;
    let active = true;
    const svc = createJourneyService(userId);
    setService(svc);
    setMemoryService(createMemoryService(userId));
    const prefs = createPreferencesService(userId);
    setPreferencesService(prefs);
    setActivityService(createActivityService(userId));
    setProgressionService(createProgressionService(userId));
    prefs
      .load()
      .then((p) => {
        if (active && p) setInterfaceLanguage(p.interfaceLanguage);
      })
      .catch(() => {});
    svc
      .listAll()
      .catch(() => [] as LanguageJourney[])
      .then((list) => {
        if (!active) return;
        setJourneys(list);
        setCurrent(svc.getCurrentLanguage() ?? list[0]?.language ?? null);
        setAdding(false);
        setReady(true);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  // Load the memory (summary + items) for the active language.
  useEffect(() => {
    if (!memoryService || current === null) {
      setMemory(EMPTY_SUMMARY);
      setMemoryItems([]);
      return;
    }
    let active = true;
    memoryService
      .list(current)
      .catch(() => [])
      .then((items) => {
        if (!active) return;
        setMemory(summarize(items));
        setMemoryItems(items);
      });
    return () => {
      active = false;
    };
  }, [memoryService, current]);

  // Load recent activity for the active language.
  useEffect(() => {
    if (!activityService || current === null) {
      setActivities([]);
      setCompletedUnitIds([]);
      setUnitProgress([]);
      return;
    }
    let active = true;
    activityService
      .list(current, 50)
      .catch(() => [])
      .then((list) => {
        if (!active) return;
        setActivities(list.slice(0, 5));
        setCompletedUnitIds([...new Set(list.map((a) => a.learningUnitId))]);
      });
    progressionService
      ?.list(current)
      .catch(() => [])
      .then((rows) => {
        if (active) setUnitProgress(rows);
      });
    return () => {
      active = false;
    };
  }, [activityService, progressionService, current]);

  if (!ready) return null;

  const currentJourney =
    current !== null ? journeys.find((j) => j.language === current) ?? null : null;

  function handleCreated(journey: LanguageJourney, chosen?: InterfaceLanguage) {
    setJourneys((prev) => upsertByLanguage(prev, journey));
    setCurrent(journey.language);
    setAdding(false);
    void service?.save(journey);
    if (chosen) {
      setInterfaceLanguage(chosen);
      void preferencesService?.save({ interfaceLanguage: chosen });
    }
  }

  function handleSetInterfaceLanguage(language: InterfaceLanguage) {
    setInterfaceLanguage(language);
    void preferencesService?.save({ interfaceLanguage: language });
  }

  function handleSwitch(language: Language) {
    setCurrent(language);
    service?.setCurrentLanguage(language);
  }

  function handleFinishSession(
    language: Language,
    events: MemoryEvent[],
    result: SessionResult,
  ) {
    if (memoryService && events.length > 0) {
      void memoryService
        .apply(language, events)
        .then((items) => {
          if (language === current) {
            setMemory(summarize(items));
            setMemoryItems(items);
          }
        })
        .catch(() => {});
    }
    if (activityService) {
      void activityService
        .record(
          {
            language,
            learningUnitId: result.learningUnitId,
            unitTitle: result.unitTitle,
            completedAt: new Date().toISOString(),
            recalled: result.recalled,
            used: result.used,
          },
          50,
        )
        .then((list) => {
          if (language === current) {
            setActivities(list.slice(0, 5));
            setCompletedUnitIds([...new Set(list.map((a) => a.learningUnitId))]);
          }
        })
        .catch(() => {});
    }
    // Fusion LEARN → progression (model B): a LEARN lesson mapped to a sub-level
    // records a unit_progress scored on reuse + corrections (no quiz).
    if (progressionService && result.sublevelId) {
      void progressionService
        .record(language, result.sublevelId, result.learningUnitId, {
          reuse: result.reuse,
          corrections: result.corrections,
        })
        .then((rows) => {
          if (language === current) setUnitProgress(rows);
        })
        .catch(() => {});
    }
  }

  function handleQuizComplete(
    unitId: string,
    sublevelId: string,
    signals: UnitSignals,
  ) {
    if (!progressionService || current === null) return;
    void progressionService
      .record(current, sublevelId, unitId, signals)
      .then((rows) => {
        if (current !== null) setUnitProgress(rows);
      })
      .catch(() => {});
  }

  async function handleSignOut() {
    setJourneys([]);
    setCurrent(null);
    setService(null);
    setUserId(null);
    setNeedsAuth(true);
    await authService?.signOut();
  }

  const ownedLanguages = journeys.map((j) => j.language);
  const suggestedLanguage: Language =
    LANGUAGES.find((l) => !ownedLanguages.includes(l.code))?.code ??
    DEFAULT_LANGUAGE;
  const orderedJourneys = LANGUAGES.map((l) =>
    journeys.find((j) => j.language === l.code),
  ).filter((j): j is LanguageJourney => Boolean(j));

  const showOnboarding = adding || journeys.length === 0 || !currentJourney;
  const overlay = overlayFromHash(hash);
  const closeOverlay = () => {
    window.location.hash = "#/home";
  };

  let content: ReactNode;
  if (overlay === "support") {
    content = <SupportForm userEmail={userEmail} onClose={closeOverlay} />;
  } else if (overlay === "mentions-legales") {
    content = <MentionsLegales onClose={closeOverlay} />;
  } else if (overlay === "confidentialite") {
    content = <Confidentialite onClose={closeOverlay} />;
  } else if (overlay === "cookies") {
    content = <Cookies onClose={closeOverlay} />;
  } else if (authService && needsAuth && !userId) {
    content = <AuthScreen auth={authService} />;
  } else if (showOnboarding) {
    content = (
      <Onboarding
        onCreated={handleCreated}
        initialLanguage={adding ? suggestedLanguage : undefined}
        interfaceLanguage={interfaceLanguage}
        askInterfaceLanguage={journeys.length === 0}
        onCancel={
          adding && journeys.length > 0 ? () => setAdding(false) : undefined
        }
      />
    );
  } else {
    content = (
      <AppShell
        journey={currentJourney}
        journeys={orderedJourneys}
        memory={memory}
        memoryItems={memoryItems}
        activities={activities}
        completedUnitIds={completedUnitIds}
        unitProgress={unitProgress}
        onQuizComplete={handleQuizComplete}
        interfaceLanguage={interfaceLanguage}
        userEmail={userEmail}
        onSetInterfaceLanguage={handleSetInterfaceLanguage}
        onSwitchLanguage={handleSwitch}
        onAddLanguage={() => setAdding(true)}
        onSignOut={authService ? handleSignOut : undefined}
        onFinishSession={(events, result) =>
          handleFinishSession(currentJourney.language, events, result)
        }
      />
    );
  }

  return (
    <div className="app-root">
      <main className="app">{content}</main>
      <SiteFooter />
    </div>
  );
}
