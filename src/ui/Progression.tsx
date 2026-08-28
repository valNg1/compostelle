/*
 * COMPOSTEL — progression view: sub-levels, readable per-unit and per-sub-level
 * scores, acquisition status and targeted retry (only the units below threshold).
 */

import { t, type InterfaceLanguage } from "../domain/i18n";
import { PROGRESSION_CONFIG } from "../domain/progression.config";
import {
  sublevelScore,
  sublevelStatus,
  isSublevelAcquired,
  failingUnits,
  sublevelIdsForLevel,
  isSublevelUnlocked,
  type UnitProgressRecord,
  type SublevelStatus,
} from "../domain/progression";
import type { Sublevel, ExampleUnit } from "../content/sublevels";

interface ProgressionProps {
  level: string; // e.g. "A1"
  sublevel: Sublevel; // the one complete example sub-level (A1.1)
  units: ExampleUnit[];
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
  sublevel,
  units,
  progress,
  interfaceLanguage: il,
  onPlayUnit,
}: ProgressionProps) {
  const byUnit = new Map(progress.map((r) => [r.unitId, r]));
  const unitProgress = units.map((u) => {
    const r = byUnit.get(u.id);
    return { unitId: u.id, completed: r?.completed ?? false, score: r?.score ?? 0 };
  });

  const acquired = isSublevelAcquired(unitProgress);
  const composite = sublevelScore(
    unitProgress.filter((u) => u.completed).map((u) => u.score),
  );
  const status = sublevelStatus(unitProgress, true);
  const failing = new Set(failingUnits(unitProgress));

  // Structure of the whole level (only A1.1 has content; the rest are locked).
  const ids = sublevelIdsForLevel(level);
  const acquiredFlags = ids.map((id) => (id === sublevel.id ? acquired : false));

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

      {ids.map((id, i) => {
        if (id !== sublevel.id) {
          const unlocked = isSublevelUnlocked(i, acquiredFlags);
          return (
            <div key={id} className="sublevel sublevel--locked">
              <div className="sublevel__head">
                <span className="sublevel__id">{id}</span>
                <span className="badge">
                  {statusLabel(unlocked ? "in-progress" : "locked", il)}
                </span>
              </div>
              <p className="sublevel__note">{t("progress.soon", il)}</p>
            </div>
          );
        }
        return (
          <div key={id} className={`sublevel sublevel--${status}`}>
            <div className="sublevel__head">
              <span className="sublevel__id">
                {id} · {sublevel.title}
              </span>
              <span className={`badge badge--${status}`}>
                {statusLabel(status, il)} · {pct(composite)}
              </span>
            </div>

            {status === "retry" && (
              <p className="sublevel__note sublevel__note--retry">
                {t("progress.retry_hint", il)}
              </p>
            )}

            <ul className="unitlist">
              {units.map((u) => {
                const p = byUnit.get(u.id);
                const done = p?.completed ?? false;
                const needsRetry = failing.has(u.id);
                return (
                  <li key={u.id} className="unitrow">
                    <div className="unitrow__main">
                      <span className="unitrow__title">{u.title}</span>
                      <span className="unitrow__score">
                        {done ? pct(p!.score) : "—"}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={"chip" + (needsRetry ? " chip--on" : "")}
                      onClick={() => onPlayUnit(u.id)}
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
