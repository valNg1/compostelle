/*
 * COMPOSTEL — "no more lessons" notice (issue #8).
 *
 * Shown when the learner asks to continue but every playable lesson for the
 * language is already completed. A clear message with a way forward, never a
 * blank screen.
 */

import { t, type InterfaceLanguage } from "../domain/i18n";

interface NoMoreLessonsProps {
  interfaceLanguage: InterfaceLanguage;
  onBrowseThemes: () => void;
  onViewJourney: () => void;
}

export function NoMoreLessons({
  interfaceLanguage: il,
  onBrowseThemes,
  onViewJourney,
}: NoMoreLessonsProps) {
  return (
    <section className="notice" aria-labelledby="notice-title">
      <p className="onboarding__eyebrow">{t("nomore.eyebrow", il)}</p>
      <h1 id="notice-title" className="step__title">
        {t("nomore.title", il)}
      </h1>
      <p className="notice__body">{t("nomore.body", il)}</p>
      <div className="notice__actions">
        <button type="button" className="cta" onClick={onBrowseThemes}>
          {t("nomore.browse", il)}
        </button>
        <button type="button" className="cta cta--ghost" onClick={onViewJourney}>
          {t("nomore.journey", il)}
        </button>
      </div>
    </section>
  );
}
