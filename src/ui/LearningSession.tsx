import { useMemo, useState } from "react";
import type { ContentItem } from "../domain/content";
import { CATEGORY_LABELS } from "../domain/content";
import type { DeclaredLevel } from "../domain/journey";
import type { InterfaceLanguage } from "../domain/i18n";
import { t } from "../domain/i18n";
import {
  answerUsesKeyExpression,
  annotationTranslation,
  recallPrompt,
  recallOptions,
  usePromptText,
  selectAnnotations,
  countWords,
  evaluateUse,
  type Annotation,
  type LearningContent,
  type UseEvaluation,
} from "../domain/learning";
import { nextState, type MemoryState } from "../domain/memory";
import type { MemoryEvent } from "../application/memoryService";
import { AnnotatedText } from "./AnnotatedText";

type Phase = "read" | "recall" | "use" | "complete";

/** Summary of a completed session, for the activity history. */
export interface SessionResult {
  learningUnitId: string;
  unitTitle: string;
  recalled: number;
  used: number;
}

interface LearningSessionProps {
  content: ContentItem & LearningContent;
  declaredLevel: DeclaredLevel;
  interfaceLanguage: InterfaceLanguage;
  onExit: () => void;
  onFinish: (events: MemoryEvent[], result: SessionResult) => void;
  onContinue: () => void;
  onBackToStart: () => void;
}

const LOWER_LEVELS: ReadonlySet<DeclaredLevel> = new Set([
  "A1",
  "A2",
  "UNKNOWN",
]);

/**
 * LEARN: CONTENT + UNDERSTAND → RECALL → USE → MEMORY → complete. UNDERSTAND is
 * adapted to the learner's level (density + selection); all chrome, instructions
 * and feedback follow the interface language, while the material stays in the
 * target language.
 */
export function LearningSession({
  content,
  declaredLevel,
  interfaceLanguage,
  onExit,
  onFinish,
  onContinue,
  onBackToStart,
}: LearningSessionProps) {
  const il = interfaceLanguage;

  // Adaptive UNDERSTAND: which expressions to surface for this learner.
  const annotations = useMemo(
    () =>
      selectAnnotations(
        content.annotations,
        declaredLevel,
        countWords(content.body),
      ),
    [content, declaredLevel],
  );
  const selectedIds = useMemo(
    () => new Set(annotations.map((a) => a.id)),
    [annotations],
  );

  // Recall tests only what was shown (or global comprehension), max 3.
  const recallItems = useMemo(
    () =>
      content.recall
        .filter((r) => !r.annotationId || selectedIds.has(r.annotationId))
        .slice(0, 3),
    [content.recall, selectedIds],
  );

  const [phase, setPhase] = useState<Phase>("read");
  const [events, setEvents] = useState<MemoryEvent[]>(() =>
    annotations.map((a) => ({
      expression: a.expression,
      meaning: a.meaning,
      signal: "encountered",
    })),
  );

  const meaningByExpr = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of annotations) m.set(a.expression, a.meaning);
    return m;
  }, [annotations]);

  function record(expression: string, signal: MemoryEvent["signal"]) {
    setEvents((prev) => [
      ...prev,
      { expression, meaning: meaningByExpr.get(expression) ?? "", signal },
    ]);
  }

  // --- READ + UNDERSTAND ---
  const [active, setActive] = useState<Annotation | null>(null);
  function openAnnotation(a: Annotation) {
    setActive((cur) => (cur?.id === a.id ? null : a));
    record(a.expression, "understood");
  }

  // --- RECALL ---
  const [recallIndex, setRecallIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const item = recallItems[recallIndex];

  function pick(i: number) {
    if (picked !== null || !item) return;
    setPicked(i);
    const correct = i === item.answerIndex;
    const expr = content.annotations.find((a) => a.id === item.annotationId)
      ?.expression;
    if (expr) record(expr, correct ? "recalled_correct" : "recalled_wrong");
  }
  function nextRecall() {
    if (recallIndex + 1 < recallItems.length) {
      setRecallIndex((n) => n + 1);
      setPicked(null);
    } else {
      setPhase("use");
    }
  }

  // --- USE ---
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<UseEvaluation | null>(null);
  function checkUse() {
    const ev = evaluateUse(answer, content.use);
    setEvaluation(ev);
    if (ev.state !== "expression-missing") {
      const matched = annotations.filter((a) =>
        answerUsesKeyExpression(answer, [a.expression]),
      );
      const targets =
        matched.length > 0
          ? matched
          : annotations.filter((a) =>
              content.use.keyExpressions.some(
                (k) => k.toLowerCase() === a.expression.toLowerCase(),
              ),
            );
      for (const a of (targets.length > 0 ? targets : annotations.slice(0, 1))) {
        record(a.expression, "used");
      }
    }
  }

  function finish() {
    const recalled = new Set(
      events.filter((e) => e.signal === "recalled_correct").map((e) => e.expression),
    ).size;
    const usedCount = new Set(
      events.filter((e) => e.signal === "used").map((e) => e.expression),
    ).size;
    onFinish(events, {
      learningUnitId: content.id,
      unitTitle: content.title,
      recalled,
      used: usedCount,
    });
    setPhase("complete");
  }

  const category = CATEGORY_LABELS[content.category];

  if (phase === "read") {
    return (
      <article className="content" aria-labelledby="ls-title">
        <button type="button" className="content__back" onClick={onExit}>
          ←
        </button>
        <p className="content__category">{category}</p>
        <h1 id="ls-title" className="content__title">
          {content.title}
        </h1>
        <p className="ls-hint">{t("ls.hint", il)}</p>
        <div className="content__body">
          <AnnotatedText
            body={content.body}
            annotations={annotations}
            onOpen={openAnnotation}
            activeId={active?.id ?? null}
          />
        </div>

        {active && (
          <aside className="understand" aria-live="polite">
            <button
              type="button"
              className="understand__close"
              aria-label="Close"
              onClick={() => setActive(null)}
            >
              ×
            </button>
            <p className="understand__expr">{active.expression}</p>
            <p className="understand__translation">
              {annotationTranslation(active, il)}
            </p>
            <p className="understand__meaning">{active.meaning}</p>
            {active.example && (
              <p className="understand__example">“{active.example}”</p>
            )}
          </aside>
        )}

        <button type="button" className="cta" onClick={() => setPhase("recall")}>
          {t("ls.continue", il)}
        </button>
      </article>
    );
  }

  if (phase === "recall" && item) {
    const correct = picked !== null && picked === item.answerIndex;
    const options = recallOptions(item, il);
    return (
      <section className="step" aria-labelledby="ls-step-title">
        <p className="onboarding__eyebrow">
          {t("recall.eyebrow", il)} · {recallIndex + 1}/{recallItems.length}
        </p>
        {item.kind === "gap" && <p className="ls-hint">{t("recall.gap_q", il)}</p>}
        <h1 id="ls-step-title" className="step__title">
          {recallPrompt(item, il)}
        </h1>
        <div className="options">
          {options.map((opt, i) => {
            const cls =
              picked === null
                ? ""
                : i === item.answerIndex
                  ? " option--correct"
                  : i === picked
                    ? " option--wrong"
                    : "";
            return (
              <button
                key={i}
                type="button"
                className={"option" + cls}
                disabled={picked !== null}
                onClick={() => pick(i)}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <p className="feedback" role="status">
            {correct ? t("recall.correct", il) : t("recall.incorrect", il)}
          </p>
        )}
        {picked !== null && (
          <button type="button" className="cta" onClick={nextRecall}>
            {recallIndex + 1 < recallItems.length
              ? t("recall.next", il)
              : t("ls.continue", il)}
          </button>
        )}
      </section>
    );
  }

  if (phase === "use") {
    const showScaffold = LOWER_LEVELS.has(declaredLevel);
    return (
      <section className="step" aria-labelledby="ls-use-title">
        <p className="onboarding__eyebrow">{t("use.eyebrow", il)}</p>
        <h1 id="ls-use-title" className="step__title">
          {usePromptText(content.use, il)}
        </h1>
        {content.use.gapSentence && (
          <p className="use__gap">{content.use.gapSentence}</p>
        )}
        <div className="scaffold">
          <p className="scaffold__line">
            {t("use.scaffold_expr", il)}{" "}
            <strong>{content.use.keyExpressions[0]}</strong>
          </p>
          {showScaffold && content.use.starter && (
            <p className="scaffold__line">
              {t("use.scaffold_start", il)} <em>{content.use.starter}</em>
            </p>
          )}
        </div>
        <label className="field__label" htmlFor="use-answer">
          {t("use.your_sentence", il)}
        </label>
        <textarea
          id="use-answer"
          className="text-input use__input"
          rows={2}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        {evaluation === null ? (
          <button
            type="button"
            className="cta"
            disabled={answer.trim().length === 0}
            onClick={checkUse}
          >
            {t("use.check", il)}
          </button>
        ) : (
          <>
            <div className="use__feedback" role="status" aria-live="polite">
              {evaluation.state === "expression-missing" && (
                <p className="use__selfcheck use__selfcheck--miss">
                  {t("use.not_used", il, {
                    expr: content.use.keyExpressions[0] ?? "",
                  })}
                </p>
              )}
              {evaluation.state === "needs-correction" && (
                <>
                  <p className="use__selfcheck use__selfcheck--fix">
                    {t("use.needs_correction", il)}
                  </p>
                  <p className="use__correction">
                    <strong>{t("use.correction", il)}</strong>{" "}
                    {evaluation.correction}
                  </p>
                </>
              )}
              {evaluation.state === "valid" && (
                <p className="use__selfcheck use__selfcheck--ok">
                  {t("use.valid", il)}
                </p>
              )}
              <p className="use__sample">
                <strong>{t("use.sample", il)}</strong> {content.use.sampleAnswer}
              </p>
            </div>
            <button type="button" className="cta" onClick={finish}>
              {t("ls.continue", il)}
            </button>
          </>
        )}
      </section>
    );
  }

  // --- complete (MEMORY summary) ---
  const states = new Map<string, MemoryState>();
  for (const e of events) {
    states.set(e.expression, nextState(states.get(e.expression) ?? null, e.signal));
  }
  const explored = states.size;
  const recalled = new Set(
    events.filter((e) => e.signal === "recalled_correct").map((e) => e.expression),
  ).size;
  const usedCount = new Set(
    events.filter((e) => e.signal === "used").map((e) => e.expression),
  ).size;
  let toReview = 0;
  for (const s of states.values()) if (s === "TO_REVIEW") toReview++;

  return (
    <section className="step complete" aria-labelledby="ls-done-title">
      <p className="onboarding__eyebrow">{t("complete.eyebrow", il)}</p>
      <h1 id="ls-done-title" className="step__title">
        {t("complete.title", il)}
      </h1>
      <ul className="tally">
        <li>{t("complete.explored", il, { n: explored })}</li>
        <li>{t("complete.recalled", il, { n: recalled })}</li>
        <li>{t("complete.used", il, { n: usedCount })}</li>
        <li>{t("complete.to_review", il, { n: toReview })}</li>
      </ul>
      <button type="button" className="cta" onClick={onContinue}>
        {t("complete.continue", il)}
      </button>
      <button type="button" className="link" onClick={onBackToStart}>
        {t("complete.back", il)}
      </button>
    </section>
  );
}
