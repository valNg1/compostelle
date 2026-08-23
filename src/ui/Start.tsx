import { useState } from "react";
import { levelBadge, type LanguageJourney } from "../domain/journey";
import { languageLabel } from "../domain/language";
import { CATEGORY_LABELS, type Category } from "../domain/content";
import type { Theme } from "../domain/learningUnit";

interface StartProps {
  journey: LanguageJourney;
  /** Topics (categories) with a playable unit in the active language. */
  topics: Category[];
  onStart: (theme: Theme) => void;
}

/**
 * START — the invitation to begin. Not a pedagogical activity: it makes the
 * learner want to start. Choose a theme (and, later, a modality) and go.
 * "What do I feel like learning through today?"
 */
export function Start({ journey, topics, onStart }: StartProps) {
  const badge = levelBadge(journey.declaredLevel);
  const themes: Theme[] = [...topics, "surprise_me"];
  const [theme, setTheme] = useState<Theme>(themes[0] ?? "surprise_me");

  function themeLabel(t: Theme): string {
    return t === "surprise_me" ? "Surprise me" : CATEGORY_LABELS[t as Category];
  }

  return (
    <section className="start" aria-labelledby="start-title">
      <header className="onboarding__intro">
        <p className="onboarding__eyebrow">Start</p>
        <h1 id="start-title" className="onboarding__title">
          What do you feel like
          <br />
          learning through today?
        </h1>
        <p className="onboarding__language">
          {languageLabel(journey.language)}
          {badge && <span className="langbar__level"> · {badge}</span>}
        </p>
      </header>

      <fieldset className="field">
        <legend className="field__label">How do you want to learn?</legend>
        <div className="chips">
          <button type="button" className="chip chip--on" aria-pressed="true">
            Read
          </button>
          <button type="button" className="chip chip--soon" disabled>
            Listen · soon
          </button>
          <button type="button" className="chip chip--soon" disabled>
            Explore · soon
          </button>
        </div>
      </fieldset>

      <fieldset className="field">
        <legend className="field__label">What are you in the mood for?</legend>
        <div className="chips" role="radiogroup" aria-label="Theme">
          {themes.map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={theme === t}
              className={"chip" + (theme === t ? " chip--on" : "")}
              onClick={() => setTheme(t)}
            >
              {themeLabel(t)}
            </button>
          ))}
        </div>
      </fieldset>

      <button
        type="button"
        className="cta"
        disabled={themes.length === 0}
        onClick={() => onStart(theme)}
      >
        Start learning
      </button>
    </section>
  );
}
