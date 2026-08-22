import { useEffect, useMemo, useState } from "react";
import type { LanguageJourney } from "./domain/journey";
import { LANGUAGES, DEFAULT_LANGUAGE, type Language } from "./domain/language";
import type { JourneyService } from "./application/journeyService";
import {
  getAuthService,
  createJourneyService,
} from "./persistence/createJourneyService";
import { getLocalUserId } from "./persistence/localJourneyCache";
import { Onboarding } from "./ui/Onboarding";
import { Discover } from "./ui/Discover";
import { AuthScreen } from "./ui/AuthScreen";

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
  const [journeys, setJourneys] = useState<LanguageJourney[]>([]);
  const [current, setCurrent] = useState<Language | null>(null);
  const [adding, setAdding] = useState(false);

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

  function handleCreated(journey: LanguageJourney) {
    setJourneys((prev) => upsertByLanguage(prev, journey));
    setCurrent(journey.language);
    setAdding(false);
    void service?.save(journey);
  }

  function handleSwitch(language: Language) {
    setCurrent(language);
    service?.setCurrentLanguage(language);
  }

  function handleResetCurrent() {
    if (current === null) return;
    const removed = current;
    void service?.clear(removed);
    setJourneys((prev) => {
      const next = prev.filter((j) => j.language !== removed);
      setCurrent(next[0]?.language ?? null);
      return next;
    });
    setAdding(false);
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

  const showOnboarding = adding || journeys.length === 0 || !currentJourney;

  return (
    <main className="app">
      {showOnboarding ? (
        <Onboarding
          onCreated={handleCreated}
          initialLanguage={adding ? suggestedLanguage : undefined}
          onCancel={
            adding && journeys.length > 0
              ? () => setAdding(false)
              : undefined
          }
        />
      ) : (
        <Discover
          journey={currentJourney}
          ownedLanguages={ownedLanguages}
          onSwitchLanguage={handleSwitch}
          onAddLanguage={() => setAdding(true)}
          onResetCurrent={handleResetCurrent}
          onSignOut={authService ? handleSignOut : undefined}
        />
      )}
    </main>
  );
}
