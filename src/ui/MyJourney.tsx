import { levelBadge, type LanguageJourney } from "../domain/journey";
import { languageLabel } from "../domain/language";
import type { MemoryItem, MemoryState, MemorySummary } from "../domain/memory";

interface MyJourneyProps {
  journey: LanguageJourney;
  memory: MemorySummary;
  items: MemoryItem[];
}

const STATE_LABEL: Record<MemoryState, string> = {
  NEW: "New",
  LEARNING: "Learning",
  ACQUIRED: "Acquired",
  TO_REVIEW: "To review",
};

/**
 * MY JOURNEY — the personal space (opened independently of START). Shows, for
 * the active language, what COMPOSTELLE remembers: what's learning, acquired, to
 * review, and recent activity. Quiet and real — not a SaaS dashboard.
 */
export function MyJourney({ journey, memory, items }: MyJourneyProps) {
  const badge = levelBadge(journey.declaredLevel);
  const recent = [...items]
    .sort((a, b) => (a.lastInteraction < b.lastInteraction ? 1 : -1))
    .slice(0, 6);

  return (
    <section className="journey" aria-labelledby="journey-title">
      <header className="onboarding__intro">
        <p className="onboarding__eyebrow">My Journey</p>
        <h1 id="journey-title" className="onboarding__title">
          {languageLabel(journey.language)}
          {badge && <span className="langbar__level"> · {badge}</span>}
        </h1>
      </header>

      <dl className="counts">
        <div>
          <dt>Learning</dt>
          <dd>{memory.learning}</dd>
        </div>
        <div>
          <dt>Acquired</dt>
          <dd>{memory.acquired}</dd>
        </div>
        <div>
          <dt>To review</dt>
          <dd>{memory.toReview}</dd>
        </div>
      </dl>

      <div className="recent">
        <h2 className="recent__label">Recently learned</h2>
        {recent.length === 0 ? (
          <p className="discover__empty">
            Start a session to begin building your memory.
          </p>
        ) : (
          <ul className="recent__list">
            {recent.map((item) => (
              <li key={item.expression} className="recent__item">
                <span className="recent__expr">{item.expression}</span>
                <span className={"tag tag--" + item.state.toLowerCase()}>
                  {STATE_LABEL[item.state]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
