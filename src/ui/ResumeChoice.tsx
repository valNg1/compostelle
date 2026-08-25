/*
 * COMPOSTEL — resume choice (issue #7).
 *
 * Shown when a learner arrives on a lesson they have already completed. Two
 * explicit buttons: redo the same lesson (replaying with the previous mistakes
 * prioritised), or continue with a new lesson of the same theme.
 */

import { t, type InterfaceLanguage } from "../domain/i18n";

interface ResumeChoiceProps {
  /** Title of the already-completed lesson (target language). */
  unitTitle: string;
  /** Whether a not-yet-completed lesson exists for this theme. */
  hasNext: boolean;
  interfaceLanguage: InterfaceLanguage;
  onReplay: () => void;
  onContinue: () => void;
}

export function ResumeChoice({
  unitTitle,
  hasNext,
  interfaceLanguage: il,
  onReplay,
  onContinue,
}: ResumeChoiceProps) {
  return (
    <section className="resume" aria-labelledby="resume-title">
      <p className="onboarding__eyebrow">{t("resume.eyebrow", il)}</p>
      <h1 id="resume-title" className="step__title">
        {t("resume.title", il)}
      </h1>
      <p className="resume__lesson">{unitTitle}</p>
      <div className="resume__actions">
        <button type="button" className="cta cta--ghost" onClick={onReplay}>
          {t("resume.replay", il)}
        </button>
        <button
          type="button"
          className="cta"
          onClick={onContinue}
          disabled={!hasNext}
        >
          {t("resume.continue", il)}
        </button>
      </div>
      {!hasNext && <p className="resume__note">{t("resume.all_done", il)}</p>}
    </section>
  );
}
