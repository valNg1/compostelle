import { useEffect, useState } from "react";
import type { LanguageJourney } from "./domain/journey";
import { loadJourney, clearJourney } from "./persistence/journeyStorage";
import { Onboarding } from "./ui/Onboarding";
import { Discover } from "./ui/Discover";

/**
 * App flow (US-01 + US-02):
 *  - no journey yet -> onboarding (US-01)
 *  - journey exists -> Discover (US-02), also the destination after a reload.
 * A corrupted/absent persisted journey resolves to `null` and thus onboarding.
 */
export function App() {
  const [journey, setJourney] = useState<LanguageJourney | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Restore any previously created journey on first render (migrates legacy keys).
  useEffect(() => {
    setJourney(loadJourney());
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  return (
    <main className="app">
      {journey ? (
        <Discover
          journey={journey}
          onReset={() => {
            clearJourney();
            setJourney(null);
          }}
        />
      ) : (
        <Onboarding onCreated={setJourney} />
      )}
    </main>
  );
}
