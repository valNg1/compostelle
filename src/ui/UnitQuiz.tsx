/*
 * COMPOSTEL — unit quiz player with an error recap (issue #16).
 *
 * Produces the three composite signals (quiz / reuse / corrections), then shows
 * a recap of what was right/wrong (not just the score) and offers to replay ONLY
 * the wrong answers. The USE sentence reuses the #10 diff to explain a fix.
 */

import { useState } from "react";
import { t, type InterfaceLanguage } from "../domain/i18n";
import {
  deterministicCorrector,
  normalizeForCompare,
  diffWords,
  answerUsesKeyExpression,
} from "../domain/learning";
import {
  scoreQuiz,
  wrongQuizIndices,
  quizPrompt,
  quizOptions,
  type UnitSignals,
} from "../domain/progression";
import type { ExampleUnit } from "../content/sublevels";

interface UnitQuizProps {
  unit: ExampleUnit;
  interfaceLanguage: InterfaceLanguage;
  onComplete: (unitId: string, sublevelId: string, signals: UnitSignals) => void;
  onExit: () => void;
}

function reuseScore(sentence: string, targets: string[]): number {
  if (targets.length === 0) return 0;
  const hit = targets.filter((k) => answerUsesKeyExpression(sentence, [k])).length;
  return hit / targets.length;
}

function correctionsScore(sentence: string): number {
  if (sentence.trim().length === 0) return 0;
  const { correct, correction } = deterministicCorrector(sentence);
  const grammarOk =
    correct || normalizeForCompare(sentence) === normalizeForCompare(correction);
  return grammarOk ? 1 : 0;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

export function UnitQuiz({ unit, interfaceLanguage: il, onComplete, onExit }: UnitQuizProps) {
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => unit.quiz.map(() => null),
  );
  const [sentence, setSentence] = useState("");
  const [phase, setPhase] = useState<"answer" | "recap">("answer");
  // When replaying, only these question indices are shown/editable.
  const [replaySet, setReplaySet] = useState<number[] | null>(null);

  const activeIndices = replaySet ?? unit.quiz.map((_, i) => i);
  const allAnswered = activeIndices.every((i) => answers[i] !== null);

  const signals: UnitSignals = {
    quiz: scoreQuiz(unit.quiz, answers),
    reuse: reuseScore(sentence, unit.targetExpressions),
    corrections: correctionsScore(sentence),
  };
  const wrong = wrongQuizIndices(unit.quiz, answers);

  function replayWrong() {
    setAnswers((prev) => prev.map((a, i) => (wrong.includes(i) ? null : a)));
    setReplaySet(wrong);
    setPhase("answer");
  }

  // --- ANSWER phase ---
  if (phase === "answer") {
    return (
      <section className="content" aria-labelledby="quiz-title">
        <button type="button" className="content__back" onClick={onExit}>
          ←
        </button>
        <p className="content__category">{unit.sublevelId}</p>
        <h1 id="quiz-title" className="content__title">
          {unit.title}
        </h1>
        <p className="quiz__intro">{unit.intro}</p>

        <ol className="quiz">
          {unit.quiz.map((q, qi) =>
            activeIndices.includes(qi) ? (
              <li key={q.id} className="quiz__q">
                <p className="quiz__prompt">{quizPrompt(q, il)}</p>
                <div className="chips">
                  {quizOptions(q, il).map((opt, oi) => (
                    <button
                      key={oi}
                      type="button"
                      className={"chip" + (answers[qi] === oi ? " chip--on" : "")}
                      aria-pressed={answers[qi] === oi}
                      onClick={() =>
                        setAnswers((prev) =>
                          prev.map((a, i) => (i === qi ? oi : a)),
                        )
                      }
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </li>
            ) : null,
          )}
        </ol>

        {replaySet === null && (
          <>
            <label className="field__label" htmlFor="quiz-use">
              {unit.usePrompt}
            </label>
            <p className="reuse__label">
              {t("use.reuse_hint", il)}{" "}
              <strong>{unit.targetExpressions.join(", ")}</strong>
            </p>
            <textarea
              id="quiz-use"
              className="text-input use__input"
              rows={2}
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
            />
          </>
        )}

        <button
          type="button"
          className="cta"
          disabled={!allAnswered}
          onClick={() => {
            setReplaySet(null);
            setPhase("recap");
          }}
        >
          {t("quiz.finish", il)}
        </button>
      </section>
    );
  }

  // --- RECAP phase (issue #16) ---
  const correctSentence = deterministicCorrector(sentence).correction;
  const sentenceHasFix =
    sentence.trim().length > 0 &&
    normalizeForCompare(sentence) !== normalizeForCompare(correctSentence);

  return (
    <section className="content" aria-labelledby="recap-title">
      <p className="content__category">{unit.sublevelId}</p>
      <h1 id="recap-title" className="content__title">
        {t("quiz.recap_title", il)}
      </h1>
      <ul className="tally">
        <li>{t("quiz.score_quiz", il, { pct: pct(signals.quiz ?? 0) })}</li>
        <li>{t("quiz.score_reuse", il, { pct: pct(signals.reuse ?? 0) })}</li>
        <li>{t("quiz.score_corrections", il, { pct: pct(signals.corrections ?? 0) })}</li>
      </ul>

      <ol className="quiz quiz--recap">
        {unit.quiz.map((q, qi) => {
          const ok = answers[qi] === q.answerIndex;
          return (
            <li key={q.id} className={"recap__q " + (ok ? "recap__q--ok" : "recap__q--ko")}>
              <p className="quiz__prompt">
                {ok ? "✓" : "✗"} {quizPrompt(q, il)}
              </p>
              {!ok && (
                <p className="recap__answer">
                  <span className="diff diff--remove">
                    {answers[qi] !== null ? quizOptions(q, il)[answers[qi]!] : "—"}
                  </span>{" "}
                  <span className="diff diff--add">
                    {quizOptions(q, il)[q.answerIndex]}
                  </span>
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {sentenceHasFix && (
        <p className="use__correction">
          {diffWords(sentence, correctSentence).map((d, i) =>
            d.type === "same" ? (
              <span key={i}>{d.text} </span>
            ) : d.type === "add" ? (
              <span key={i} className="diff diff--add">{d.text} </span>
            ) : (
              <span key={i} className="diff diff--remove">{d.text} </span>
            ),
          )}
        </p>
      )}

      <div className="support__actions">
        {wrong.length > 0 && (
          <button type="button" className="cta cta--ghost" onClick={replayWrong}>
            {t("quiz.replay_wrong", il, { n: `${wrong.length}` })}
          </button>
        )}
        <button
          type="button"
          className="cta"
          onClick={() => onComplete(unit.id, unit.sublevelId, signals)}
        >
          {t("quiz.done", il)}
        </button>
      </div>
    </section>
  );
}
