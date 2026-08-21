import { useEffect, useState } from "react";
import type { LanguageJourney } from "./domain/journey";
import { loadJourney, clearJourney } from "./persistence/journeyStorage";
import { Onboarding } from "./ui/Onboarding";
import { JourneySummary } from "./ui/JourneySummary";

/**
 * US-01 vertical slice. Two states:
 *  - no journey yet  -> onboarding
 *  - journey exists  -> summary (also what the learner sees after a reload)
 */
export function App() {
  const [journey, setJourney] = useState<LanguageJourney | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Restore any previously created journey on first render.
  useEffect(() => {
    setJourney(loadJourney());
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  return (
    <main className="app">
      {journey ? (
        <JourneySummary
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
