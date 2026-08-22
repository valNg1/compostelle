/**
 * COMPOSTELLE — learning memory (MEMORY step).
 *
 * A small, deterministic memory model — NOT a full spaced-repetition engine.
 * It records which expressions a learner has met, looked up, recalled and used,
 * with a current state, per language, per user. Persistence is durable
 * (Supabase) via a repository port; see `../application/memoryRepository.ts`.
 */

import type { Language } from "./language";

export type MemoryState = "NEW" | "LEARNING" | "ACQUIRED" | "TO_REVIEW";

export interface MemoryItem {
  language: Language;
  /** The expression, the identity key within a (user, language). */
  expression: string;
  /** Snapshot of the meaning at last interaction. */
  meaning: string;
  state: MemoryState;
  /** ISO-8601 of the last interaction. */
  lastInteraction: string;
}

/** Signals produced by the learning loop. */
export type MemorySignal =
  | "encountered" // met while reading
  | "understood" // looked up in UNDERSTAND
  | "recalled_correct" // answered a recall item correctly
  | "recalled_wrong" // answered a recall item wrongly
  | "used"; // produced in USE

/**
 * Deterministic state transition. Progression is roughly
 * `NEW → LEARNING → ACQUIRED`, with a `TO_REVIEW` branch on a wrong recall.
 * `ACQUIRED` is only ever lowered by an explicit wrong recall.
 */
export function nextState(
  current: MemoryState | null,
  signal: MemorySignal,
): MemoryState {
  const cur: MemoryState = current ?? "NEW";
  switch (signal) {
    case "encountered":
      return cur;
    case "understood":
      return cur === "ACQUIRED" ? "ACQUIRED" : "LEARNING";
    case "recalled_correct":
      return cur === "ACQUIRED" ? "ACQUIRED" : "LEARNING";
    case "recalled_wrong":
      return "TO_REVIEW";
    case "used":
      return "ACQUIRED";
  }
}

/** Human-friendly counts for the JOURNEY view. */
export interface MemorySummary {
  learning: number;
  acquired: number;
  toReview: number;
  total: number;
}

export function summarize(items: readonly MemoryItem[]): MemorySummary {
  let learning = 0;
  let acquired = 0;
  let toReview = 0;
  for (const it of items) {
    if (it.state === "LEARNING") learning++;
    else if (it.state === "ACQUIRED") acquired++;
    else if (it.state === "TO_REVIEW") toReview++;
  }
  return { learning, acquired, toReview, total: items.length };
}
