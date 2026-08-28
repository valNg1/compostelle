/*
 * COMPOSTEL — progression configuration (single source of truth).
 *
 * The PO tunes progression here — nothing below is hard-coded elsewhere. Each
 * CEFR level (A1, A2, B1…) is split into SUBLEVELS_PER_LEVEL sub-milestones
 * (A1.1, A1.2, A1.3…), each made of UNITS_PER_SUBLEVEL units. A sub-level is
 * ACQUIRED when all its units are completed AND its composite score reaches
 * PASS_THRESHOLD.
 *
 * Composite unit score = WEIGHTS.quiz·quiz + WEIGHTS.reuse·reuse
 *                      + WEIGHTS.corrections·corrections   (each signal ∈ [0,1])
 */

export interface ProgressionWeights {
  quiz: number;
  reuse: number;
  corrections: number;
}

export interface ProgressionConfig {
  SUBLEVELS_PER_LEVEL: number;
  UNITS_PER_SUBLEVEL: number;
  PASS_THRESHOLD: number;
  WEIGHTS: ProgressionWeights;
  QUIZ_QUESTIONS_PER_UNIT: number;
}

export const PROGRESSION_CONFIG: ProgressionConfig = {
  SUBLEVELS_PER_LEVEL: 3,
  UNITS_PER_SUBLEVEL: 5,
  // Lowered to 0.60 so a bare LEARN article (no quiz → caps at reuse 0.40 +
  // corrections 0.20 = 0.60, model B) can pass — encouraging real usage.
  PASS_THRESHOLD: 0.6,
  WEIGHTS: { quiz: 0.4, reuse: 0.4, corrections: 0.2 },
  QUIZ_QUESTIONS_PER_UNIT: 5,
};
