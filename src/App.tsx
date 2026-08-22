import { useEffect, useMemo, useState } from "react";
import type { LanguageJourney } from "./domain/journey";
import { createJourneyService } from "./persistence/createJourneyService";
import { Onboarding } from "./ui/Onboarding";
import { Discover } from "./ui/Discover";

/**
 * App flow (US-01 + US-02):
 *  - no journey yet -> onboarding (US-01)
 *  - journey exists -> Discover (US-02), also the destination after a reload.
 *
 * Persistence goes through the journey service: durable Postgres (Supabase) is
 * the source of truth when configured, with a localStorage resilience cache and
 * legacy-key migration. A corrupted/absent journey resolves to `null` -> onboarding.
 */
export function App() {
  const service = useMemo(() => createJourneyService(), []);
  const [journey, setJourney] = useState<LanguageJourney | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Restore the journey on first render (durable first, then cache/legacy).
  useEffect(() => {
    let active = true;
    service
      .load()
      .catch(() => null)
      .then((restored) => {
        if (!active) return;
        setJourney(restored);
        setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [service]);

  if (!loaded) return null;

  return (
    <main className="app">
      {journey ? (
        <Discover
          journey={journey}
          onReset={() => {
            setJourney(null);
            void service.clear();
          }}
        />
      ) : (
        <Onboarding
          onCreated={(created) => {
            setJourney(created);
            void service.save(created);
          }}
        />
      )}
    </main>
  );
}
