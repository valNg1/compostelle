import {
  CATEGORY_LABELS,
  type ContentItem,
  type Modality,
} from "../domain/content";
import { languageLabel, type Language } from "../domain/language";
import type { DiscoveryFeed as Feed } from "../domain/discovery";

interface DiscoveryFeedProps {
  feed: Feed;
  language: Language;
  onOpen: (id: string) => void;
  onReset: () => void;
}

const MODALITY_LABELS: Record<Modality, string> = {
  read: "Read",
  listen: "Listen",
  explore: "Explore",
};

/** Light meta line: modality + estimated duration. No CEFR, ever. */
function meta(item: ContentItem): string {
  return `${MODALITY_LABELS[item.modality]} · ${item.estimatedMinutes} min`;
}

/**
 * The discovery feed: one highlight plus a few alternatives.
 * Intent — "Here is something worth discovering today." Calm and editorial,
 * no grid, no filters, no level shown.
 */
export function DiscoveryFeed({
  feed,
  language,
  onOpen,
  onReset,
}: DiscoveryFeedProps) {
  return (
    <section className="discover" aria-labelledby="discover-title">
      <header className="discover__intro">
        <p className="onboarding__eyebrow">Today in {languageLabel(language)}</p>
        <h1 id="discover-title" className="onboarding__title">
          Something worth
          <br />
          discovering today.
        </h1>
      </header>

      {feed.featured === null ? (
        <p className="discover__empty">
          Nothing to discover just yet. Please check back soon.
        </p>
      ) : (
        <>
          <button
            type="button"
            className="feature"
            onClick={() => onOpen(feed.featured!.id)}
          >
            <span className="feature__category">
              {CATEGORY_LABELS[feed.featured.category]}
            </span>
            <span className="feature__title">{feed.featured.title}</span>
            <span className="feature__teaser">{feed.featured.teaser}</span>
            <span className="feature__meta">{meta(feed.featured)}</span>
          </button>

          {feed.alternatives.length > 0 && (
            <div className="discover__more">
              <h2 className="discover__more-label">More to discover</h2>
              <ul className="cards">
                {feed.alternatives.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="card"
                      onClick={() => onOpen(item.id)}
                    >
                      <span className="card__category">
                        {CATEGORY_LABELS[item.category]}
                      </span>
                      <span className="card__title">{item.title}</span>
                      <span className="card__teaser">{item.teaser}</span>
                      <span className="card__meta">{meta(item)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <button type="button" className="link" onClick={onReset}>
        Start a new journey
      </button>
    </section>
  );
}
