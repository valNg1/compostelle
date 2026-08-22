import { useMemo, useState } from "react";
import type { ContentItem } from "../domain/content";
import { CATEGORY_LABELS } from "../domain/content";
import {
  answerUsesKeyExpression,
  type Annotation,
  type LearningContent,
} from "../domain/learning";
import { nextState, type MemoryState } from "../domain/memory";
import type { MemoryEvent } from "../application/memoryService";
import { AnnotatedText } from "./AnnotatedText";

type Phase = "read" | "recall" | "use" | "complete";

interface LearningSessionProps {
  content: ContentItem & LearningContent;
  onExit: () => void;
  /** Persist the collected memory events (fire-and-forget on the caller side). */
  onFinish: (events: MemoryEvent[]) => void;
  /** Move on to a new discovery. */
  onContinue: () => void;
}

/** Fold events into a per-expression final state for the session summary. */
function sessionStates(
  events: MemoryEvent[],
): Map<string, MemoryState> {
  const map = new Map<string, MemoryState>();
  for (const e of events) {
    map.set(e.expression, nextState(map.get(e.expression) ?? null, e.signal));
  }
  return map;
}

/**
 * The end-to-end learning session: READ + UNDERSTAND → RECALL → USE → MEMORY
 * summary → JOURNEY continuation. Deterministic; collects memory events and
 * hands them to the caller to persist.
 */
export function LearningSession({
  content,
  onExit,
  onFinish,
  onContinue,
}: LearningSessionProps) {
  const [phase, setPhase] = useState<Phase>("read");
  const [events, setEvents] = useState<MemoryEvent[]>(() =>
    // Every annotation is at least "encountered" when the session starts.
    content.annotations.map((a) => ({
      expression: a.expression,
      meaning: a.meaning,
      signal: "encountered",
    })),
  );

  const meaningByExpression = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of content.annotations) m.set(a.expression, a.meaning);
    return m;
  }, [content.annotations]);

  function record(expression: string, signal: MemoryEvent["signal"]) {
    setEvents((prev) => [
      ...prev,
      { expression, meaning: meaningByExpression.get(expression) ?? "", signal },
    ]);
  }

  // --- READ + UNDERSTAND ---------------------------------------------------
  const [activeAnnotation, setActiveAnnotation] = useState<Annotation | null>(
    null,
  );
  function openAnnotation(a: Annotation) {
    setActiveAnnotation((cur) => (cur?.id === a.id ? null : a));
    record(a.expression, "understood");
  }

  // --- RECALL --------------------------------------------------------------
  const [recallIndex, setRecallIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const recallItem = content.recall[recallIndex];

  function pickOption(i: number) {
    if (picked !== null || !recallItem) return;
    setPicked(i);
    const correct = i === recallItem.answerIndex;
    const expr = content.annotations.find(
      (a) => a.id === recallItem.annotationId,
    )?.expression;
    if (expr) record(expr, correct ? "recalled_correct" : "recalled_wrong");
  }

  function nextRecall() {
    if (recallIndex + 1 < content.recall.length) {
      setRecallIndex((n) => n + 1);
      setPicked(null);
    } else {
      setPhase("use");
    }
  }

  // --- USE -----------------------------------------------------------------
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  function checkUse() {
    setChecked(true);
    const used = answerUsesKeyExpression(answer, content.use.keyExpressions);
    if (used) {
      const matched = content.annotations.filter((a) =>
        answerUsesKeyExpression(answer, [a.expression]),
      );
      const targets = matched.length > 0 ? matched : [content.annotations[0]];
      for (const a of targets) if (a) record(a.expression, "used");
    }
  }

  // --- COMPLETE ------------------------------------------------------------
  function finish() {
    onFinish(events);
    setPhase("complete");
  }

  const category = CATEGORY_LABELS[content.category];

  if (phase === "read") {
    return (
      <article className="content" aria-labelledby="ls-title">
        <button type="button" className="content__back" onClick={onExit}>
          ← Back to discover
        </button>
        <p className="content__category">{category}</p>
        <h1 id="ls-title" className="content__title">
          {content.title}
        </h1>
        <p className="ls-hint">Tap the highlighted expressions to understand them.</p>
        <div className="content__body">
          <AnnotatedText
            body={content.body}
            annotations={content.annotations}
            onOpen={openAnnotation}
            activeId={activeAnnotation?.id ?? null}
          />
        </div>

        {activeAnnotation && (
          <aside className="understand" aria-live="polite">
            <button
              type="button"
              className="understand__close"
              aria-label="Close"
              onClick={() => setActiveAnnotation(null)}
            >
              ×
            </button>
            <p className="understand__expr">{activeAnnotation.expression}</p>
            <p className="understand__translation">
              {activeAnnotation.translation}
            </p>
            <p className="understand__meaning">{activeAnnotation.meaning}</p>
            {activeAnnotation.example && (
              <p className="understand__example">“{activeAnnotation.example}”</p>
            )}
          </aside>
        )}

        <button type="button" className="cta" onClick={() => setPhase("recall")}>
          Continue
        </button>
      </article>
    );
  }

  if (phase === "recall" && recallItem) {
    const correct = picked !== null && picked === recallItem.answerIndex;
    return (
      <section className="step" aria-labelledby="ls-step-title">
        <p className="onboarding__eyebrow">Recall · {recallIndex + 1}/{content.recall.length}</p>
        <h1 id="ls-step-title" className="step__title">
          {recallItem.prompt}
        </h1>
        <div className="options">
          {recallItem.options.map((opt, i) => {
            const isAnswer = i === recallItem.answerIndex;
            const state =
              picked === null
                ? ""
                : isAnswer
                  ? " option--correct"
                  : i === picked
                    ? " option--wrong"
                    : "";
            return (
              <button
                key={i}
                type="button"
                className={"option" + state}
                disabled={picked !== null}
                onClick={() => pickOption(i)}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <p className="feedback" role="status">
            {correct ? "Correct." : "Not quite — the highlighted answer is right."}
          </p>
        )}
        {picked !== null && (
          <button type="button" className="cta" onClick={nextRecall}>
            {recallIndex + 1 < content.recall.length ? "Next" : "Continue"}
          </button>
        )}
      </section>
    );
  }

  if (phase === "use") {
    const used = checked && answerUsesKeyExpression(answer, content.use.keyExpressions);
    return (
      <section className="step" aria-labelledby="ls-use-title">
        <p className="onboarding__eyebrow">Use the language</p>
        <h1 id="ls-use-title" className="step__title">
          {content.use.prompt}
        </h1>
        {content.use.gapSentence && (
          <p className="use__gap">{content.use.gapSentence}</p>
        )}
        <label className="field__label" htmlFor="use-answer">
          Your sentence
        </label>
        <textarea
          id="use-answer"
          className="text-input use__input"
          rows={2}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        {!checked ? (
          <button
            type="button"
            className="cta"
            disabled={answer.trim().length === 0}
            onClick={checkUse}
          >
            Check
          </button>
        ) : (
          <>
            <div className="use__feedback" role="status" aria-live="polite">
              <p className="use__sample">
                <strong>Sample answer:</strong> {content.use.sampleAnswer}
              </p>
              <p className="use__selfcheck">
                {used
                  ? "Nice — you used a key expression."
                  : "Tip: try using one of the key expressions."}
              </p>
            </div>
            <button type="button" className="cta" onClick={finish}>
              Continue
            </button>
          </>
        )}
      </section>
    );
  }

  // --- complete ---
  const states = sessionStates(events);
  const explored = states.size;
  let remembered = 0;
  let toReview = 0;
  for (const s of states.values()) {
    if (s === "LEARNING" || s === "ACQUIRED") remembered++;
    else if (s === "TO_REVIEW") toReview++;
  }
  return (
    <section className="step complete" aria-labelledby="ls-done-title">
      <p className="onboarding__eyebrow">Session complete</p>
      <h1 id="ls-done-title" className="step__title">
        You made progress.
      </h1>
      <ul className="tally">
        <li>
          <span className="tally__n">{explored}</span> expressions explored
        </li>
        <li>
          <span className="tally__n">{remembered}</span> remembered
        </li>
        <li>
          <span className="tally__n">{toReview}</span> to review
        </li>
      </ul>
      <button type="button" className="cta" onClick={onContinue}>
        Continue your journey
      </button>
    </section>
  );
}
