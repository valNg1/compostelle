/*
 * COMPOSTEL — journey actions (issue #18 / #20).
 *
 * Guarantees that EVERY journey state offers at least one explicit action verb —
 * no dead-end screen. "start" (choose language + level + theme) is always
 * available and is the escape hatch out of any empty state (e.g. a level with no
 * content yet, #20). The others appear only when the state justifies them.
 */

export type JourneyAction = "start" | "continue" | "redo";

export interface JourneyState {
  /** An uncompleted lesson exists to resume (#20 "Poursuivre l'apprentissage"). */
  canContinue: boolean;
  /** A completed lesson exists to replay freely (#15 "Refaire une leçon"). */
  canRedo: boolean;
}

/**
 * The actions to offer, in priority order. `start` is ALWAYS present, so the
 * result is never empty — there is never a dead-end.
 */
export function journeyActions(state: JourneyState): JourneyAction[] {
  const actions: JourneyAction[] = [];
  if (state.canContinue) actions.push("continue");
  actions.push("start"); // always available — the guaranteed escape
  if (state.canRedo) actions.push("redo");
  return actions;
}
