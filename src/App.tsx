import { useEffect, useMemo, useState } from "react";
import type { LanguageJourney } from "./domain/journey";
import { LANGUAGES, DEFAULT_LANGUAGE, type Language } from "./domain/language";
import { summarize, type MemorySummary, type MemoryItem } from "./domain/memory";
import {
  DEFAULT_INTERFACE_LANGUAGE,
  type InterfaceLanguage,
} from "./domain/i18n";
import type { JourneyService } from "./application/journeyService";
import type { MemoryService, MemoryEvent } from "./application/memoryService";
import type { PreferencesService } from "./application/preferencesService";
import {
  getAuthService,
  createJourneyService,
  createMemoryService,
  createPreferencesService,
} from "./persistence/createJourneyService";
import { getLocalUserId } from "./persistence/localJourneyCache";
import { Onboarding } from "./ui/Onboarding";
import { Home } from "./ui/Home";
import { AuthScreen } from "./ui/AuthScreen";

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
  const [journeys, setJourneys] = useState<LanguageJourney[]>([]);
  const [current, setCurrent] = useState<Language | null>(null);
  const [adding, setAdding] = useState(false);
  const [memory, setMemory] = useState<MemorySummary>(EMPTY_SUMMARY);
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>([]);
  const [interfaceLanguage, setInterfaceLanguage] = useState<InterfaceLanguage>(
    DEFAULT_INTERFACE_LANGUAGE,
  );

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
      setNeedsAuth(user === null);
    });
    authService
      .getUser()
      .then((user) => {
        if (!active) return;
        setUserId(user?.id ?? null);
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

  if (!ready) return null;

  if (authService && needsAuth && !userId) {
    return (
      <main className="app">
        <AuthScreen auth={authService} />
      </main>
    );
  }

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

  function handleFinishSession(language: Language, events: MemoryEvent[]) {
    if (!memoryService || events.length === 0) return;
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

  return (
    <main className="app">
      {showOnboarding ? (
        <Onboarding
          onCreated={handleCreated}
          initialLanguage={adding ? suggestedLanguage : undefined}
          interfaceLanguage={interfaceLanguage}
          askInterfaceLanguage={journeys.length === 0}
          onCancel={
            adding && journeys.length > 0
              ? () => setAdding(false)
              : undefined
          }
        />
      ) : (
        <Home
          journey={currentJourney}
          journeys={orderedJourneys}
          memory={memory}
          memoryItems={memoryItems}
          interfaceLanguage={interfaceLanguage}
          onSetInterfaceLanguage={handleSetInterfaceLanguage}
          onSwitchLanguage={handleSwitch}
          onAddLanguage={() => setAdding(true)}
          onSignOut={authService ? handleSignOut : undefined}
          onFinishSession={(events) =>
            handleFinishSession(currentJourney.language, events)
          }
        />
      )}
    </main>
  );
}
