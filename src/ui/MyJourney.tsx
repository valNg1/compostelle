import { levelBadge, type LanguageJourney } from "../domain/journey";
import { languageLabel } from "../domain/language";
import { t, type InterfaceLanguage } from "../domain/i18n";
import type { MemoryItem, MemorySummary } from "../domain/memory";
import type { LearningActivity } from "../domain/activity";

interface MyJourneyProps {
  journey: LanguageJourney;
  memory: MemorySummary;
  items: MemoryItem[];
  activities: LearningActivity[];
  interfaceLanguage: InterfaceLanguage;
}

/**
 * MY JOURNEY — the personal space (opened independently of START). Shows, for
 * the active language, what COMPOSTELLE remembers: what's learning, acquired, to
 * review, and recent activity. Quiet and real — not a SaaS dashboard.
 */
export function MyJourney({
  journey,
  memory,
  items,
  activities,
  interfaceLanguage,
}: MyJourneyProps) {
  const il = interfaceLanguage;
  const badge = levelBadge(journey.declaredLevel);
  const recent = [...items]
    .sort((a, b) => (a.lastInteraction < b.lastInteraction ? 1 : -1))
    .slice(0, 6);

  return (
    <section className="journey" aria-labelledby="journey-title">
      <header className="onboarding__intro">
        <p className="onboarding__eyebrow">{t("journey.eyebrow", il)}</p>
        <h1 id="journey-title" className="onboarding__title">
          {languageLabel(journey.language)}
          {badge && <span className="langbar__level"> · {badge}</span>}
        </h1>
      </header>

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

      <div className="recent">
        <h2 className="recent__label">{t("journey.recent", il)}</h2>
        {recent.length === 0 ? (
          <p className="discover__empty">{t("journey.empty", il)}</p>
        ) : (
          <ul className="recent__list">
            {recent.map((item) => (
              <li key={item.expression} className="recent__item">
                <span className="recent__expr">{item.expression}</span>
                <span className={"tag tag--" + item.state.toLowerCase()}>
                  {t("state." + item.state, il)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="recent">
        <h2 className="recent__label">{t("home.recent_activity", il)}</h2>
        {activities.length === 0 ? (
          <p className="discover__empty">{t("home.no_activity", il)}</p>
        ) : (
          <ul className="activity">
            {activities.map((a, i) => (
              <li key={a.learningUnitId + i} className="activity__item">
                <span className="activity__title">{a.unitTitle}</span>
                <span className="activity__meta">
                  {new Date(a.completedAt).toLocaleDateString(
                    il === "fr" ? "fr-FR" : "en-GB",
                    { day: "numeric", month: "short" },
                  )}{" "}
                  · {t("activity.recalled", il, { n: a.recalled })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
