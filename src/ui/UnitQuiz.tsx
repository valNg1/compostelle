/*
 * COMPOSTEL — unit quiz player (progression example).
 *
 * Plays one example unit end-to-end and produces the three composite signals:
 *  - quiz: the 5-question MCQ score,
 *  - reuse: fraction of target expressions reused in a short sentence,
 *  - corrections: whether that sentence is grammatically correct (deterministic
 *    fallback; a real SentenceCorrector/LanguageTool can be plugged in).
 */

import { useState } from "react";
import { t, type InterfaceLanguage } from "../domain/i18n";
import {
  deterministicCorrector,
  normalizeForCompare,
  answerUsesKeyExpression,
} from "../domain/learning";
import { scoreQuiz, type UnitSignals } from "../domain/progression";
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

export function UnitQuiz({ unit, interfaceLanguage: il, onComplete, onExit }: UnitQuizProps) {
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => unit.quiz.map(() => null),
  );
  const [sentence, setSentence] = useState("");

  const allAnswered = answers.every((a) => a !== null);

  function finish() {
    const signals: UnitSignals = {
      quiz: scoreQuiz(unit.quiz, answers),
      reuse: reuseScore(sentence, unit.targetExpressions),
      corrections: correctionsScore(sentence),
    };
    onComplete(unit.id, unit.sublevelId, signals);
  }

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
        {unit.quiz.map((q, qi) => (
          <li key={q.id} className="quiz__q">
            <p className="quiz__prompt">{q.prompt}</p>
            <div className="chips">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  type="button"
                  className={"chip" + (answers[qi] === oi ? " chip--on" : "")}
                  aria-pressed={answers[qi] === oi}
                  onClick={() =>
                    setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))
                  }
                >
                  {opt}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ol>

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

      <button
        type="button"
        className="cta"
        disabled={!allAnswered}
        onClick={finish}
      >
        {t("quiz.finish", il)}
      </button>
    </section>
  );
}
