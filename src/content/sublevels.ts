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
import type { Language } from "../domain/language";
import { isPlayable } from "../domain/learning";
import { CATALOG } from "./catalog";

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
  fr?: { prompt: string; options?: string[] },
): QuizQuestion => ({
  id,
  prompt,
  options,
  answerIndex,
  ...(fr ? { promptI18n: { fr: fr.prompt } } : {}),
  ...(fr?.options ? { optionsI18n: { fr: fr.options } } : {}),
});

export const A1_1_UNITS: ExampleUnit[] = [
  {
    id: "a1-1-saluti",
    sublevelId: "A1.1",
    title: "I saluti",
    intro: "Ciao! Buongiorno. Come stai? Bene, grazie. Arrivederci!",
    targetExpressions: ["ciao", "buongiorno"],
    usePrompt: "Scrivi un breve saluto in italiano.",
    quiz: [
      q("s1", "How do you say “hello” (informal)?", ["Grazie", "Ciao", "Scusa"], 1, { prompt: "Comment dit-on « bonjour » (familier) ?" }),
      q("s2", "“Buongiorno” is used…", ["at night", "in the morning", "never"], 1, { prompt: "« Buongiorno » s'emploie…", options: ["la nuit", "le matin", "jamais"] }),
      q("s3", "“Arrivederci” means…", ["goodbye", "please", "yes"], 0, { prompt: "« Arrivederci » signifie…", options: ["au revoir", "s'il vous plaît", "oui"] }),
      q("s4", "“Come stai?” asks…", ["your name", "the time", "how are you"], 2, { prompt: "« Come stai ? » demande…", options: ["votre nom", "l'heure", "comment ça va"] }),
      q("s5", "A polite reply to “Grazie”:", ["Prego", "Ciao", "No"], 0, { prompt: "Une réponse polie à « Grazie » :" }),
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
      q("n1", "“tre” =", ["2", "3", "5"], 1, { prompt: "« tre » =" }),
      q("n2", "“cinque” =", ["5", "4", "9"], 0, { prompt: "« cinque » =" }),
      q("n3", "Which word is “ten”?", ["otto", "due", "dieci"], 2, { prompt: "Quel mot signifie « dix » ?" }),
      q("n4", "“sette” =", ["6", "8", "7"], 2, { prompt: "« sette » =" }),
      q("n5", "“uno” =", ["11", "1", "0"], 1, { prompt: "« uno » =" }),
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
      q("c1", "“rosso” =", ["blue", "red", "green"], 1, { prompt: "« rosso » =", options: ["bleu", "rouge", "vert"] }),
      q("c2", "“verde” =", ["green", "yellow", "black"], 0, { prompt: "« verde » =", options: ["vert", "jaune", "noir"] }),
      q("c3", "“blu” =", ["white", "blue", "red"], 1, { prompt: "« blu » =", options: ["blanc", "bleu", "rouge"] }),
      q("c4", "“giallo” =", ["grey", "yellow", "brown"], 1, { prompt: "« giallo » =", options: ["gris", "jaune", "marron"] }),
      q("c5", "“nero” =", ["black", "white", "pink"], 0, { prompt: "« nero » =", options: ["noir", "blanc", "rose"] }),
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
      q("g1", "“lunedì” =", ["Sunday", "Monday", "Friday"], 1, { prompt: "« lunedì » =", options: ["dimanche", "lundi", "vendredi"] }),
      q("g2", "“domenica” =", ["Sunday", "Saturday", "Tuesday"], 0, { prompt: "« domenica » =", options: ["dimanche", "samedi", "mardi"] }),
      q("g3", "“venerdì” =", ["Wednesday", "Monday", "Friday"], 2, { prompt: "« venerdì » =", options: ["mercredi", "lundi", "vendredi"] }),
      q("g4", "“oggi” means…", ["yesterday", "today", "tomorrow"], 1, { prompt: "« oggi » signifie…", options: ["hier", "aujourd'hui", "demain"] }),
      q("g5", "“ieri” means…", ["yesterday", "today", "tomorrow"], 0, { prompt: "« ieri » signifie…", options: ["hier", "aujourd'hui", "demain"] }),
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
      q("f1", "“madre” =", ["sister", "mother", "aunt"], 1, { prompt: "« madre » =", options: ["sœur", "mère", "tante"] }),
      q("f2", "“padre” =", ["father", "brother", "uncle"], 0, { prompt: "« padre » =", options: ["père", "frère", "oncle"] }),
      q("f3", "“sorella” =", ["mother", "sister", "daughter"], 1, { prompt: "« sorella » =", options: ["mère", "sœur", "fille"] }),
      q("f4", "“fratello” =", ["brother", "father", "son"], 0, { prompt: "« fratello » =", options: ["frère", "père", "fils"] }),
      q("f5", "“figlio” =", ["cousin", "grandfather", "son"], 2, { prompt: "« figlio » =", options: ["cousin", "grand-père", "fils"] }),
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

// --- Unified progression registry (quiz units + LEARN article units) --------

/** A unit shown in the progression view, from either a quiz or a LEARN lesson. */
export interface ProgressionUnitRef {
  unitId: string;
  title: string;
  /** true = 5-question quiz unit; false = LEARN article (model B, caps at 0.60). */
  hasQuiz: boolean;
}

export interface ProgressionSublevel {
  id: string;
  level: string;
  index: number;
  title: string;
  language: Language;
  units: ProgressionUnitRef[];
}

/** LEARN articles mapped to a sub-level (model B), in catalog order. */
function articleUnits(sublevelId: string, language: Language): ProgressionUnitRef[] {
  return CATALOG.filter(
    (c) => c.language === language && c.sublevelId === sublevelId && isPlayable(c),
  ).map((c) => ({ unitId: c.id, title: c.title, hasQuiz: false }));
}

/**
 * All progression sub-levels for a language. A1.1 = quiz units; A1.2 = the LEARN
 * articles tagged with that sub-level (fed by completing the LEARN loop). One
 * view, one composite — whatever the unit's source.
 */
/**
 * Sub-levels for a language, filtered to the learner's CEFR level (issue #17):
 * a B2 learner never sees A1 content. `UNKNOWN` maps to A1 (beginner start).
 * Returns [] when no content exists for the level — the UI shows "coming soon",
 * never falling back to another level.
 */
export function sublevelsForLevel(
  language: Language,
  declaredLevel: string,
): ProgressionSublevel[] {
  const level = declaredLevel === "UNKNOWN" ? "A1" : declaredLevel;
  return progressionSublevels(language).filter((s) => s.level === level);
}

export function progressionSublevels(language: Language): ProgressionSublevel[] {
  if (language !== "it") return [];
  return [
    {
      id: SUBLEVEL_A1_1.id,
      level: SUBLEVEL_A1_1.level,
      index: SUBLEVEL_A1_1.index,
      title: SUBLEVEL_A1_1.title,
      language: "it",
      units: A1_1_UNITS.map((u) => ({
        unitId: u.id,
        title: u.title,
        hasQuiz: true,
      })),
    },
    {
      id: "A1.2",
      level: "A1",
      index: 2,
      title: "First readings",
      language: "it",
      units: articleUnits("A1.2", "it"),
    },
  ];
}
