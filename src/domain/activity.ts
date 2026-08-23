/**
 * COMPOSTELLE — learning activity (completed sessions history).
 *
 * A lightweight record of a finished Learning Unit, used to show "recent
 * activity" on HOME and MY JOURNEY. Owned by a user, isolated per language.
 */

import type { Language } from "./language";

export interface LearningActivity {
  language: Language;
  /** Id of the Learning Unit that was played. */
  learningUnitId: string;
  /** Title snapshot (target language) for display. */
  unitTitle: string;
  /** ISO-8601 completion time. */
  completedAt: string;
  /** Number of expressions recalled correctly in the session. */
  recalled: number;
  /** Number of expressions used in the session. */
  used: number;
}
