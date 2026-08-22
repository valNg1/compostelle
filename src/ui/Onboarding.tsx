import { useState } from "react";
import {
  DECLARED_LEVEL_OPTIONS,
  INTEREST_OPTIONS,
  createJourney,
  emptyDraft,
  toggleInterest,
  validateDraft,
  type DeclaredLevel,
  type LanguageJourney,
} from "../domain/journey";
import { saveJourney } from "../persistence/journeyStorage";

interface OnboardingProps {
  onCreated: (journey: LanguageJourney) => void;
}

/**
 * Single-screen onboarding: pick a level, pick interests, begin.
 * Deliberately light — it should feel like starting a journey, not filling a form.
 */
export function Onboarding({ onCreated }: OnboardingProps) {
  const [draft, setDraft] = useState(emptyDraft);
  const { valid } = validateDraft(draft);

  function selectLevel(level: DeclaredLevel) {
    setDraft((d) => ({ ...d, declaredLevel: level }));
  }

  function begin() {
    if (!valid) return;
    const journey = createJourney(draft);
    saveJourney(journey);
    onCreated(journey);
  }

  return (
    <section className="onboarding" aria-labelledby="onboarding-title">
      <header className="onboarding__intro">
        <p className="onboarding__eyebrow">Your journey begins</p>
        <h1 id="onboarding-title" className="onboarding__title">
          Learn a language through
          <br />
          things worth discovering.
        </h1>
        <p className="onboarding__language">
          Discovering in <strong>Italian</strong>
        </p>
      </header>

      <fieldset className="field">
        <legend className="field__label">Where are you starting from?</legend>
        <div className="chips" role="radiogroup" aria-label="Starting level">
          {DECLARED_LEVEL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={draft.declaredLevel === opt.value}
              className={
                "chip" + (draft.declaredLevel === opt.value ? " chip--on" : "")
              }
              onClick={() => selectLevel(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="field">
        <legend className="field__label">What would you love to discover?</legend>
        <div className="chips" aria-label="Interests">
          {INTEREST_OPTIONS.map((opt) => {
            const on = draft.interests.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={on}
                className={"chip" + (on ? " chip--on" : "")}
                onClick={() => setDraft((d) => toggleInterest(d, opt.value))}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <button
        type="button"
        className="cta"
        disabled={!valid}
        onClick={begin}
      >
        Start discovering
      </button>
    </section>
  );
}
