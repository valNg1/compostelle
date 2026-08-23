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
import {
  LANGUAGES,
  languageLabel,
  DEFAULT_LANGUAGE,
  type Language,
} from "../domain/language";
import { INTERFACE_LANGUAGES, type InterfaceLanguage } from "../domain/i18n";

interface OnboardingProps {
  onCreated: (journey: LanguageJourney, interfaceLanguage?: InterfaceLanguage) => void;
  /** Pre-selected language (e.g. when adding a second language journey). */
  initialLanguage?: Language;
  /** Current interface language (pre-selected in the "Explain things to me in" chooser). */
  interfaceLanguage: InterfaceLanguage;
  /** Show the "Explain things to me in" chooser (first onboarding only). */
  askInterfaceLanguage: boolean;
  /** When present (e.g. adding a language with journeys already), show a Back link. */
  onCancel?: () => void;
}

/**
 * Single-screen onboarding: pick a target language, the interface language
 * ("Explain things to me in"), a level and some interests. Deliberately light.
 * Persistence is handled by the caller (App) so this stays UI-only.
 */
export function Onboarding({
  onCreated,
  initialLanguage,
  interfaceLanguage,
  askInterfaceLanguage,
  onCancel,
}: OnboardingProps) {
  const [draft, setDraft] = useState(() =>
    emptyDraft(initialLanguage ?? DEFAULT_LANGUAGE),
  );
  const [explainIn, setExplainIn] = useState<InterfaceLanguage>(interfaceLanguage);
  const { valid } = validateDraft(draft);

  function selectLanguage(language: Language) {
    setDraft((d) => ({ ...d, language }));
  }

  function selectLevel(level: DeclaredLevel) {
    setDraft((d) => ({ ...d, declaredLevel: level }));
  }

  function begin() {
    if (!valid) return;
    onCreated(createJourney(draft), askInterfaceLanguage ? explainIn : undefined);
  }

  return (
    <section className="onboarding" aria-labelledby="onboarding-title">
      {onCancel && (
        <button type="button" className="content__back" onClick={onCancel}>
          ← Back
        </button>
      )}
      <header className="onboarding__intro">
        <img
          className="intro__logo"
          src="/icon-192.png"
          alt="Compostel"
          width={48}
          height={48}
        />
        <p className="onboarding__eyebrow">Your journey begins</p>
        <h1 id="onboarding-title" className="onboarding__title">
          A new language.
          <br />
          A wider world.
        </h1>
        <p className="onboarding__language">
          Discovering in <strong>{languageLabel(draft.language)}</strong>
        </p>
      </header>

      <fieldset className="field">
        <legend className="field__label">Which language?</legend>
        <div className="chips" role="radiogroup" aria-label="Target language">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="radio"
              aria-checked={draft.language === lang.code}
              className={
                "chip" + (draft.language === lang.code ? " chip--on" : "")
              }
              onClick={() => selectLanguage(lang.code)}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </fieldset>

      {askInterfaceLanguage && (
        <fieldset className="field">
          <legend className="field__label">Explain things to me in</legend>
          <div className="chips" role="radiogroup" aria-label="Interface language">
            {INTERFACE_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                role="radio"
                aria-checked={explainIn === lang.code}
                disabled={!lang.ready}
                className={
                  "chip" +
                  (explainIn === lang.code ? " chip--on" : "") +
                  (lang.ready ? "" : " chip--soon")
                }
                onClick={() => lang.ready && setExplainIn(lang.code)}
              >
                {lang.label}
                {!lang.ready && " · soon"}
              </button>
            ))}
          </div>
        </fieldset>
      )}

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

      <button type="button" className="cta" disabled={!valid} onClick={begin}>
        Start discovering
      </button>
    </section>
  );
}
