/*
 * COMPOSTEL — journey action verbs (issue #18 / #20).
 *
 * Renders the explicit action verbs for the current journey state. Always shows
 * at least one ("start"), so no screen is ever a dead-end — including the "no
 * content for this level yet" empty state.
 */

import { t, levelName, type InterfaceLanguage } from "../domain/i18n";
import type { JourneyAction } from "../domain/journeyActions";

interface JourneyActionsProps {
  actions: JourneyAction[];
  /** false → show the "content coming for level X" note above the actions. */
  hasContent: boolean;
  level: string;
  interfaceLanguage: InterfaceLanguage;
  onStart: () => void;
  onContinue: () => void;
  onRedo: () => void;
}

export function JourneyActions({
  actions,
  hasContent,
  level,
  interfaceLanguage: il,
  onStart,
  onContinue,
  onRedo,
}: JourneyActionsProps) {
  const handler: Record<JourneyAction, () => void> = {
    start: onStart,
    continue: onContinue,
    redo: onRedo,
  };

  return (
    <section className="jactions" aria-label={t("action.aria", il)}>
      {!hasContent && (
        <p className="jactions__note">
          {t("progress.empty", il, {
            level: levelName(level, il) ?? level,
          })}
        </p>
      )}
      <div className="jactions__row">
        {actions.map((a, i) => (
          <button
            key={a}
            type="button"
            className={i === 0 ? "cta" : "cta cta--ghost"}
            onClick={handler[a]}
          >
            {t(`action.${a}`, il)}
          </button>
        ))}
      </div>
    </section>
  );
}
