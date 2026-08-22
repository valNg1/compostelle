import {
  DECLARED_LEVEL_OPTIONS,
  INTEREST_OPTIONS,
  type LanguageJourney,
} from "../domain/journey";

interface JourneySummaryProps {
  journey: LanguageJourney;
  onReset: () => void;
}

const LANGUAGE_LABEL: Record<LanguageJourney["language"], string> = {
  it: "Italian",
};

function levelLabel(journey: LanguageJourney): string {
  return (
    DECLARED_LEVEL_OPTIONS.find((o) => o.value === journey.declaredLevel)
      ?.label ?? journey.declaredLevel
  );
}

function interestLabels(journey: LanguageJourney): string[] {
  return journey.interests.map(
    (i) => INTEREST_OPTIONS.find((o) => o.value === i)?.label ?? i,
  );
}

/**
 * Shown once a journey exists — including after a page reload, which is how the
 * learner sees that their preferences were remembered.
 */
export function JourneySummary({ journey, onReset }: JourneySummaryProps) {
  return (
    <section className="summary" aria-labelledby="summary-title">
      <p className="onboarding__eyebrow">Your journey is ready</p>
      <h1 id="summary-title" className="onboarding__title">
        Welcome back to your
        <br />
        {LANGUAGE_LABEL[journey.language]} discoveries.
      </h1>

      <dl className="summary__grid">
        <div>
          <dt>Language</dt>
          <dd>{LANGUAGE_LABEL[journey.language]}</dd>
        </div>
        <div>
          <dt>Your starting point</dt>
          <dd>{levelLabel(journey)}</dd>
        </div>
        <div className="summary__interests">
          <dt>Interests</dt>
          <dd>
            <div className="chips chips--static">
              {interestLabels(journey).map((label) => (
                <span key={label} className="chip chip--on">
                  {label}
                </span>
              ))}
            </div>
          </dd>
        </div>
      </dl>

      <button type="button" className="link" onClick={onReset}>
        Start a new journey
      </button>
    </section>
  );
}
