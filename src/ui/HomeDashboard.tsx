import { levelBadge, type LanguageJourney } from "../domain/journey";
import { languageLabel } from "../domain/language";
import { t, type InterfaceLanguage } from "../domain/i18n";
import type { MemoryItem, MemorySummary, MemoryState } from "../domain/memory";
import type { LearningActivity } from "../domain/activity";

interface HomeDashboardProps {
  journey: LanguageJourney;
  memory: MemorySummary;
  memoryItems: MemoryItem[];
  activities: LearningActivity[];
  interfaceLanguage: InterfaceLanguage;
  onStartLearning: () => void;
  onViewJourney: () => void;
}

function stateLabel(state: MemoryState, il: InterfaceLanguage): string {
  return t("state." + state, il);
}

function formatDate(iso: string, il: InterfaceLanguage): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const locale = il === "fr" ? "fr-FR" : "en-GB";
  return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
}

/**
 * HOME — the learning dashboard. Answers, at a glance: where am I, and what
 * should I do next? Real data only (no fake numbers).
 */
export function HomeDashboard({
  journey,
  memory,
  memoryItems,
  activities,
  interfaceLanguage,
  onStartLearning,
  onViewJourney,
}: HomeDashboardProps) {
  const il = interfaceLanguage;
  const badge = levelBadge(journey.declaredLevel);
  const recent = [...memoryItems]
    .sort((a, b) => (a.lastInteraction < b.lastInteraction ? 1 : -1))
    .slice(0, 4);

  return (
    <section className="dash" aria-labelledby="dash-title">
      <header className="dash__hero">
        <p className="onboarding__eyebrow">{t("home.greeting", il)}</p>
        <h1 id="dash-title" className="onboarding__title">
          {languageLabel(journey.language)}
          {badge && <span className="langbar__level"> · {badge}</span>}
        </h1>
        <p className="dash__continue">{t("home.continue", il)}</p>
        <button type="button" className="cta" onClick={onStartLearning}>
          {t("start.cta", il)}
        </button>
      </header>

      <div className="dash__block">
        <h2 className="recent__label">{t("home.progress", il)}</h2>
        <dl className="counts">
          <div>
            <dt>{t("journey.learning", il)}</dt>
            <dd>{memory.learning}</dd>
          </div>
          <div>
            <dt>{t("journey.acquired", il)}</dt>
            <dd>{memory.acquired}</dd>
          </div>
          <div>
            <dt>{t("journey.to_review", il)}</dt>
            <dd>{memory.toReview}</dd>
          </div>
        </dl>
        <p className="dash__review">
          {memory.toReview > 0
            ? t("home.review_count", il, { n: memory.toReview })
            : t("home.review_none", il)}
          <span className="dash__soon"> · {t("home.review_soon", il)}</span>
        </p>
      </div>

      {recent.length > 0 && (
        <div className="dash__block recent">
          <h2 className="recent__label">{t("journey.recent", il)}</h2>
          <ul className="recent__list">
            {recent.map((item) => (
              <li key={item.expression} className="recent__item">
                <span className="recent__expr">{item.expression}</span>
                <span className={"tag tag--" + item.state.toLowerCase()}>
                  {stateLabel(item.state, il)}
                </span>
              </li>
            ))}
          </ul>
          <button type="button" className="link" onClick={onViewJourney}>
            {t("home.view_journey", il)}
          </button>
        </div>
      )}

      <div className="dash__block">
        <h2 className="recent__label">{t("home.recent_activity", il)}</h2>
        {activities.length === 0 ? (
          <p className="discover__empty">{t("home.no_activity", il)}</p>
        ) : (
          <ul className="activity">
            {activities.map((a, i) => (
              <li key={a.learningUnitId + i} className="activity__item">
                <span className="activity__title">{a.unitTitle}</span>
                <span className="activity__meta">
                  {formatDate(a.completedAt, il)} ·{" "}
                  {t("activity.recalled", il, { n: a.recalled })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
