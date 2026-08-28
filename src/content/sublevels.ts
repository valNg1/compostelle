/*
 * COMPOSTEL — example progression content (issue: sub-levels + composite score).
 *
 * A SINGLE complete example sub-level (A1.1) with its 5 units and their 5-question
 * quizzes, to prove the whole chain end-to-end: play a unit → quiz/reuse/
 * corrections signals → composite unit score → sub-level score → acquisition /
 * targeted retry / unlock.
 *
 * This is a MINIMAL example, not mass content. Adding real graded units for the
 * other sub-levels (A1.2, A1.3, A2.1…) is authoring work left to the PO/content
 * pipeline — see the note in the report.
 */

import type { QuizQuestion } from "../domain/progression";

/** A minimal, quiz-driven learning unit inside a sub-level. */
export interface ExampleUnit {
  id: string;
  sublevelId: string;
  title: string;
  /** Short material shown before the quiz (target language). */
  intro: string;
  /** Exactly QUIZ_QUESTIONS_PER_UNIT questions. */
  quiz: QuizQuestion[];
  /** Expressions the learner is invited to reuse (reuse signal). */
  targetExpressions: string[];
  /** Prompt for the short production step (reuse + corrections signals). */
  usePrompt: string;
}

export interface Sublevel {
  id: string;
  level: string;
  index: number;
  title: string;
  language: "it";
  unitIds: string[];
}

const q = (
  id: string,
  prompt: string,
  options: string[],
  answerIndex: number,
): QuizQuestion => ({ id, prompt, options, answerIndex });

export const A1_1_UNITS: ExampleUnit[] = [
  {
    id: "a1-1-saluti",
    sublevelId: "A1.1",
    title: "I saluti",
    intro: "Ciao! Buongiorno. Come stai? Bene, grazie. Arrivederci!",
    targetExpressions: ["ciao", "buongiorno"],
    usePrompt: "Scrivi un breve saluto in italiano.",
    quiz: [
      q("s1", "How do you say “hello” (informal)?", ["Grazie", "Ciao", "Scusa"], 1),
      q("s2", "“Buongiorno” is used…", ["at night", "in the morning", "never"], 1),
      q("s3", "“Arrivederci” means…", ["goodbye", "please", "yes"], 0),
      q("s4", "“Come stai?” asks…", ["your name", "the time", "how are you"], 2),
      q("s5", "A polite reply to “Grazie”:", ["Prego", "Ciao", "No"], 0),
    ],
  },
  {
    id: "a1-1-numeri",
    sublevelId: "A1.1",
    title: "I numeri",
    intro: "uno, due, tre, quattro, cinque… dieci.",
    targetExpressions: ["due", "tre"],
    usePrompt: "Conta da uno a tre in italiano.",
    quiz: [
      q("n1", "“tre” =", ["2", "3", "5"], 1),
      q("n2", "“cinque” =", ["5", "4", "9"], 0),
      q("n3", "Which word is “ten”?", ["otto", "due", "dieci"], 2),
      q("n4", "“sette” =", ["6", "8", "7"], 2),
      q("n5", "“uno” =", ["11", "1", "0"], 1),
    ],
  },
  {
    id: "a1-1-colori",
    sublevelId: "A1.1",
    title: "I colori",
    intro: "rosso, verde, blu, giallo, nero, bianco.",
    targetExpressions: ["rosso", "verde"],
    usePrompt: "Scrivi il tuo colore preferito.",
    quiz: [
      q("c1", "“rosso” =", ["blue", "red", "green"], 1),
      q("c2", "“verde” =", ["green", "yellow", "black"], 0),
      q("c3", "“blu” =", ["white", "blue", "red"], 1),
      q("c4", "“giallo” =", ["grey", "yellow", "brown"], 1),
      q("c5", "“nero” =", ["black", "white", "pink"], 0),
    ],
  },
  {
    id: "a1-1-giorni",
    sublevelId: "A1.1",
    title: "I giorni",
    intro: "lunedì, martedì… domenica. Oggi è lunedì.",
    targetExpressions: ["oggi", "lunedì"],
    usePrompt: "Scrivi che giorno è oggi.",
    quiz: [
      q("g1", "“lunedì” =", ["Sunday", "Monday", "Friday"], 1),
      q("g2", "“domenica” =", ["Sunday", "Saturday", "Tuesday"], 0),
      q("g3", "“venerdì” =", ["Wednesday", "Monday", "Friday"], 2),
      q("g4", "“oggi” means…", ["yesterday", "today", "tomorrow"], 1),
      q("g5", "“ieri” means…", ["yesterday", "today", "tomorrow"], 0),
    ],
  },
  {
    id: "a1-1-famiglia",
    sublevelId: "A1.1",
    title: "La famiglia",
    intro: "madre, padre, sorella, fratello, figlio.",
    targetExpressions: ["madre", "padre"],
    usePrompt: "Presenta un membro della tua famiglia.",
    quiz: [
      q("f1", "“madre” =", ["sister", "mother", "aunt"], 1),
      q("f2", "“padre” =", ["father", "brother", "uncle"], 0),
      q("f3", "“sorella” =", ["mother", "sister", "daughter"], 1),
      q("f4", "“fratello” =", ["brother", "father", "son"], 0),
      q("f5", "“figlio” =", ["cousin", "grandfather", "son"], 2),
    ],
  },
];

export const SUBLEVEL_A1_1: Sublevel = {
  id: "A1.1",
  level: "A1",
  index: 1,
  title: "First words",
  language: "it",
  unitIds: A1_1_UNITS.map((u) => u.id),
};

/** All example sub-levels shipped in this MVP slice (one, complete). */
export const EXAMPLE_SUBLEVELS: Sublevel[] = [SUBLEVEL_A1_1];

export function exampleUnit(unitId: string): ExampleUnit | undefined {
  return A1_1_UNITS.find((u) => u.id === unitId);
}
