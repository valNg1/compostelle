import {
  CATEGORY_LABELS,
  type ContentItem,
  type Modality,
} from "../domain/content";

interface ContentViewProps {
  content: ContentItem;
  onBack: () => void;
}

const MODALITY_LABELS: Record<Modality, string> = {
  read: "Read",
  listen: "Listen",
  explore: "Explore",
};

/**
 * Minimal content view: category, title, the content itself, and a way back.
 * Deliberately nothing more — no translation, vocabulary, grammar, quiz, recall
 * or audio (those belong to later user stories).
 */
export function ContentView({ content, onBack }: ContentViewProps) {
  const paragraphs = content.body.split(/\n{2,}/);

  return (
    <article className="content" aria-labelledby="content-title">
      <button type="button" className="content__back" onClick={onBack}>
        ← Back to discover
      </button>

      <p className="content__category">{CATEGORY_LABELS[content.category]}</p>
      <h1 id="content-title" className="content__title">
        {content.title}
      </h1>
      <p className="content__meta">
        {MODALITY_LABELS[content.modality]} · {content.estimatedMinutes} min
      </p>

      <div className="content__body">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </article>
  );
}
