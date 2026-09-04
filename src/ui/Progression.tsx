/*
 * COMPOSTEL — progression view (free access, issue #15 / #17).
 *
 * Everything is always playable — the composite score and "acquired at 0.60"
 * are shown as a NON-BLOCKING indicator, never a barrier. Units come from both
 * the quiz flow and LEARN articles (one composite). Only the learner's own CEFR
 * level is shown (issue #17).
 */

import { t, sublevelLabel, levelName, type InterfaceLanguage } from "../domain/i18n";
import { PROGRESSION_CONFIG } from "../domain/progression.config";
import {
  sublevelScore,
  sublevelStatus,
  failingUnits,
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
const THRESHOLD_PCT = Math.round(PROGRESSION_CONFIG.PASS_THRESHOLD * 100);

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

  return (
    <section className="prog" aria-labelledby="prog-title">
      <h2 id="prog-title" className="prog__title">
        {t("progress.title", il)}
        {" · "}
        {levelName(level, il) ?? level}
        <span className="prog__code"> · {level}</span>
      </h2>

      {sublevels.length === 0 ? (
        <p className="prog__intro">{t("progress.empty", il, { level })}</p>
      ) : (
        <p className="prog__intro">{t("progress.free_access", il, { pct: `${THRESHOLD_PCT}` })}</p>
      )}

      {sublevels.map((sl) => {
        const unitProgress = sl.units.map((u) => {
          const r = byUnit.get(u.unitId);
          return {
            unitId: u.unitId,
            completed: r?.completed ?? false,
            score: r?.score ?? 0,
          };
        });
        const status = sublevelStatus(unitProgress, sl.units.length);
        const composite = sublevelScore(
          unitProgress.filter((u) => u.completed).map((u) => u.score),
        );
        const failing = failingUnits(unitProgress);
        const failingSet = new Set(failing);

        return (
          <div key={sl.id} className={`sublevel sublevel--${status}`}>
            <div className="sublevel__head">
              <span className="sublevel__id">
                {sublevelLabel(sl.id, il) ?? sl.title}
                <span className="sublevel__code"> · {sl.id}</span>
              </span>
              <span className={`badge badge--${status}`}>
                {statusLabel(status, il)} · {pct(composite)}
              </span>
            </div>

            {failing.length > 0 && (
              <p className="sublevel__note sublevel__note--retry">
                {t("progress.suggestion", il, {
                  n: `${failing.length}`,
                  pct: `${THRESHOLD_PCT}`,
                })}
              </p>
            )}

            <ul className="unitlist">
              {sl.units.map((u) => {
                const p = byUnit.get(u.unitId);
                const done = p?.completed ?? false;
                const weak = failingSet.has(u.unitId);
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
                      className={"chip" + (weak ? " chip--on" : "")}
                      onClick={() => onPlayUnit(u.unitId)}
                    >
                      {done ? t("progress.redo", il) : t("progress.play", il)}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
