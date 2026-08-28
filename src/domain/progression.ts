/*
 * COMPOSTEL — progression mechanics (pure, deterministic, testable).
 *
 * Turns the three learning signals (quiz / reuse / corrections) into a composite
 * unit score, aggregates unit scores into a sub-level score, and decides
 * acquisition, targeted retry and unlocking. All tunables live in
 * `progression.config.ts` — no magic numbers here.
 */

import { PROGRESSION_CONFIG, type ProgressionWeights } from "./progression.config";
import type { Language } from "./language";

/** The three normalized signals for a unit; any may be missing (counts as 0). */
export interface UnitSignals {
  /** Correct answers / quiz questions. */
  quiz?: number;
  /** Correct reuse of target expressions. */
  reuse?: number;
  /** Proportion of sentences whose grammar correction succeeded. */
  corrections?: number;
}

function clamp01(v: number | undefined): number {
  if (v === undefined || Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

/** Composite unit score in [0,1]. A missing signal counts as 0. */
export function unitScore(
  signals: UnitSignals,
  weights: ProgressionWeights = PROGRESSION_CONFIG.WEIGHTS,
): number {
  return (
    weights.quiz * clamp01(signals.quiz) +
    weights.reuse * clamp01(signals.reuse) +
    weights.corrections * clamp01(signals.corrections)
  );
}

/** A single multiple-choice quiz question attached to a unit. */
export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
}

/**
 * Quiz signal in [0,1]: correct answers / number of questions. `answers[i]` is
 * the option index the learner picked for question `i` (or null / undefined if
 * skipped — counts as wrong).
 */
export function scoreQuiz(
  questions: readonly QuizQuestion[],
  answers: readonly (number | null | undefined)[],
): number {
  if (questions.length === 0) return 0;
  let correct = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.answerIndex) correct++;
  });
  return correct / questions.length;
}

/** Mean of unit scores (0 for an empty sub-level). */
export function sublevelScore(unitScores: readonly number[]): number {
  if (unitScores.length === 0) return 0;
  return unitScores.reduce((sum, x) => sum + x, 0) / unitScores.length;
}

/** Persisted progress of one unit within a sub-level. */
export interface UnitProgress {
  unitId: string;
  completed: boolean;
  /** Composite score [0,1] at last completion. */
  score: number;
}

/** A durably-stored unit result (signals kept for a readable breakdown). */
export interface UnitProgressRecord {
  language: Language;
  sublevelId: string;
  unitId: string;
  quiz: number;
  reuse: number;
  corrections: number;
  /** Composite score, = unitScore({quiz, reuse, corrections}). */
  score: number;
  completed: boolean;
  updatedAt: string;
}

/**
 * A sub-level is ACQUIRED when every expected unit is completed AND the mean of
 * the completed units' scores reaches the pass threshold.
 */
export function isSublevelAcquired(
  units: readonly UnitProgress[],
  expectedUnitCount: number = PROGRESSION_CONFIG.UNITS_PER_SUBLEVEL,
  threshold: number = PROGRESSION_CONFIG.PASS_THRESHOLD,
): boolean {
  const completed = units.filter((u) => u.completed);
  if (completed.length < expectedUnitCount) return false;
  return sublevelScore(completed.map((u) => u.score)) >= threshold;
}

/** Units to redo in a targeted retry: completed but below the threshold. */
export function failingUnits(
  units: readonly UnitProgress[],
  threshold: number = PROGRESSION_CONFIG.PASS_THRESHOLD,
): string[] {
  return units
    .filter((u) => u.completed && u.score < threshold)
    .map((u) => u.unitId);
}

export type SublevelStatus = "acquired" | "retry" | "in-progress" | "locked";

/**
 * Status of a sub-level for the UI:
 *  - `locked`: not unlocked yet (previous sub-level not acquired);
 *  - `acquired`: all units done and threshold reached;
 *  - `retry`: all units done but composite below threshold → targeted retry;
 *  - `in-progress`: units still to complete.
 */
export function sublevelStatus(
  units: readonly UnitProgress[],
  unlocked: boolean,
  expectedUnitCount: number = PROGRESSION_CONFIG.UNITS_PER_SUBLEVEL,
  threshold: number = PROGRESSION_CONFIG.PASS_THRESHOLD,
): SublevelStatus {
  if (!unlocked) return "locked";
  if (isSublevelAcquired(units, expectedUnitCount, threshold)) return "acquired";
  const completed = units.filter((u) => u.completed).length;
  if (completed >= expectedUnitCount) return "retry";
  return "in-progress";
}

/** Sub-level ids for a level, e.g. `A1` → `["A1.1", "A1.2", "A1.3"]`. */
export function sublevelIdsForLevel(
  level: string,
  count: number = PROGRESSION_CONFIG.SUBLEVELS_PER_LEVEL,
): string[] {
  return Array.from({ length: count }, (_, i) => `${level}.${i + 1}`);
}

/** A sub-level is unlocked if it is the first, or the previous one is acquired. */
export function isSublevelUnlocked(
  index: number,
  acquiredByIndex: readonly boolean[],
): boolean {
  if (index <= 0) return true;
  return acquiredByIndex[index - 1] === true;
}
