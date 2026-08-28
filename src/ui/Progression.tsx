/*
 * COMPOSTEL — progression view: sub-levels, readable per-unit and per-sub-level
 * scores, acquisition status and targeted retry. Units come from BOTH sources —
 * quiz units and LEARN articles (model B) — feeding one composite, one view.
 */

import { t, type InterfaceLanguage } from "../domain/i18n";
import { PROGRESSION_CONFIG } from "../domain/progression.config";
import {
  sublevelScore,
  sublevelStatus,
  isSublevelAcquired,
  failingUnits,
  isSublevelUnlocked,
  type UnitProgressRecord,
  type SublevelStatus,
} from "../domain/progression";
import type { ProgressionSublevel } from "../content/sublevels";

interface ProgressionProps {
  level: string;
  sublevels: ProgressionSublevel[];
  progress: UnitProgressRecord[];
  interfaceLanguage: InterfaceLanguage;
  onPlayUnit: (unitId: string) => void;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

function statusLabel(status: SublevelStatus, il: InterfaceLanguage): string {
  return t(`progress.status_${status}`, il);
}

export function Progression({
  level,
  sublevels,
  progress,
  interfaceLanguage: il,
  onPlayUnit,
}: ProgressionProps) {
  const byUnit = new Map(progress.map((r) => [r.unitId, r]));

  const perSublevel = sublevels.map((sl) => {
    const unitProgress = sl.units.map((u) => {
      const r = byUnit.get(u.unitId);
      return { unitId: u.unitId, completed: r?.completed ?? false, score: r?.score ?? 0 };
    });
    return {
      sl,
      unitProgress,
      acquired: isSublevelAcquired(unitProgress, sl.units.length),
      allArticles: sl.units.every((u) => !u.hasQuiz),
    };
  });
  const acquiredFlags = perSublevel.map((p) => p.acquired);

  return (
    <section className="prog" aria-labelledby="prog-title">
      <h2 id="prog-title" className="prog__title">
        {t("progress.title", il, { level })}
      </h2>
      <p className="prog__intro">
        {t("progress.threshold", il, {
          pct: `${Math.round(PROGRESSION_CONFIG.PASS_THRESHOLD * 100)}`,
        })}
      </p>

      {perSublevel.map(({ sl, unitProgress, allArticles }, i) => {
        // Article sub-levels mirror the always-open LEARN loop; quiz sub-levels
        // follow the unlock chain.
        const unlocked = allArticles || isSublevelUnlocked(i, acquiredFlags);
        const status = sublevelStatus(unitProgress, unlocked, sl.units.length);
        const composite = sublevelScore(
          unitProgress.filter((u) => u.completed).map((u) => u.score),
        );
        const failing = new Set(failingUnits(unitProgress));

        return (
          <div key={sl.id} className={`sublevel sublevel--${status}`}>
            <div className="sublevel__head">
              <span className="sublevel__id">
                {sl.id} · {sl.title}
              </span>
              <span className={`badge badge--${status}`}>
                {statusLabel(status, il)}
                {status !== "locked" ? ` · ${pct(composite)}` : ""}
              </span>
            </div>

            {status === "locked" ? (
              <p className="sublevel__note">{t("progress.locked_hint", il)}</p>
            ) : (
              <>
                {status === "retry" && (
                  <p className="sublevel__note sublevel__note--retry">
                    {t("progress.retry_hint", il)}
                  </p>
                )}
                <ul className="unitlist">
                  {sl.units.map((u) => {
                    const p = byUnit.get(u.unitId);
                    const done = p?.completed ?? false;
                    const needsRetry = failing.has(u.unitId);
                    return (
                      <li key={u.unitId} className="unitrow">
                        <div className="unitrow__main">
                          <span className="unitrow__title">{u.title}</span>
                          {!u.hasQuiz && (
                            <span className="unitrow__tag">
                              {t("progress.no_quiz", il)}
                            </span>
                          )}
                          <span className="unitrow__score">
                            {done ? pct(p!.score) : "—"}
                          </span>
                        </div>
                        <button
                          type="button"
                          className={"chip" + (needsRetry ? " chip--on" : "")}
                          onClick={() => onPlayUnit(u.unitId)}
                        >
                          {done ? t("progress.redo", il) : t("progress.play", il)}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        );
      })}
    </section>
  );
}
