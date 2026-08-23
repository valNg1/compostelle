import { useState } from "react";
import { levelBadge, type LanguageJourney } from "../domain/journey";
import { languageLabel } from "../domain/language";
import { t, type InterfaceLanguage } from "../domain/i18n";
import { CATEGORY_LABELS, type Category } from "../domain/content";
import type { Theme } from "../domain/learningUnit";

interface StartProps {
  journey: LanguageJourney;
  /** Topics (categories) with a playable unit in the active language. */
  topics: Category[];
  interfaceLanguage: InterfaceLanguage;
  onStart: (theme: Theme) => void;
}

/**
 * START — the invitation to begin. Not a pedagogical activity: it makes the
 * learner want to start. Choose a theme (and, later, a modality) and go.
 * "What do I feel like learning through today?"
 */
export function Start({
  journey,
  topics,
  interfaceLanguage,
  onStart,
}: StartProps) {
  const il = interfaceLanguage;
  const badge = levelBadge(journey.declaredLevel);
  const themes: Theme[] = [...topics, "surprise_me"];
  const [theme, setTheme] = useState<Theme>(themes[0] ?? "surprise_me");

  function themeLabel(item: Theme): string {
    return item === "surprise_me"
      ? t("theme.surprise", il)
      : CATEGORY_LABELS[item as Category];
  }

  return (
    <section className="start" aria-labelledby="start-title">
      <header className="onboarding__intro">
        <p className="onboarding__eyebrow">{t("start.eyebrow", il)}</p>
        <h1 id="start-title" className="onboarding__title">
          {t("start.title", il)}
        </h1>
        <p className="onboarding__language">
          {languageLabel(journey.language)}
          {badge && <span className="langbar__level"> · {badge}</span>}
        </p>
      </header>

      <fieldset className="field">
        <legend className="field__label">{t("start.how", il)}</legend>
        <div className="chips">
          <button type="button" className="chip chip--on" aria-pressed="true">
            {t("modality.read", il)}
          </button>
          <button type="button" className="chip chip--soon" disabled>
            {t("modality.listen", il)}
          </button>
          <button type="button" className="chip chip--soon" disabled>
            {t("modality.explore", il)}
          </button>
        </div>
      </fieldset>

      <fieldset className="field">
        <legend className="field__label">{t("start.mood", il)}</legend>
        <div className="chips" role="radiogroup" aria-label="Theme">
          {themes.map((item) => (
            <button
              key={item}
              type="button"
              role="radio"
              aria-checked={theme === item}
              className={"chip" + (theme === item ? " chip--on" : "")}
              onClick={() => setTheme(item)}
            >
              {themeLabel(item)}
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
        {t("start.cta", il)}
      </button>
    </section>
  );
}
