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

// ═══════════════════════════════════════════════════════════════════════════
//  Italian A2 (A2.1–A2.3) — GENERATED CONTENT, TO REVIEW BY A HUMAN (à relire)
//  Same ExampleUnit model as A1.1. Real A2 vocabulary/structures (daily life,
//  past with passato prossimo, plans, city & shopping, simple health). Each
//  quiz answerIndex is verified; targetExpressions appear in the unit intro;
//  fr prompt/option overrides follow the interaction language (issue #14).
//  DO NOT ship to learners before a native/teacher review.
// ═══════════════════════════════════════════════════════════════════════════

export const A2_1_UNITS: ExampleUnit[] = [
  {
    id: "a2-1-sveglia",
    sublevelId: "A2.1",
    title: "La sveglia",
    intro:
      "La mattina mi sveglio alle sette. Poi mi alzo e faccio colazione con caffè e biscotti. Alle otto esco di casa.",
    targetExpressions: ["mi sveglio", "faccio colazione"],
    usePrompt: "Racconta cosa fai la mattina.",
    quiz: [
      q("a211", "“mi sveglio” =", ["I get dressed", "I wake up", "I fall asleep"], 1, { prompt: "« mi sveglio » =", options: ["je m'habille", "je me réveille", "je m'endors"] }),
      q("a212", "“faccio colazione” =", ["I have breakfast", "I cook dinner", "I do the cleaning"], 0, { prompt: "« faccio colazione » =", options: ["je prends le petit-déjeuner", "je prépare le dîner", "je fais le ménage"] }),
      q("a213", "A che ora si sveglia?", ["alle sei", "alle sette", "alle nove"], 1, { prompt: "À quelle heure se réveille-t-il ?" }),
      q("a214", "“mi alzo” =", ["I get up", "I sit down", "I lie down"], 0, { prompt: "« mi alzo » =", options: ["je me lève", "je m'assois", "je m'allonge"] }),
      q("a215", "Che cosa beve a colazione?", ["il tè", "il caffè", "il latte"], 1, { prompt: "Que boit-il au petit-déjeuner ?" }),
    ],
  },
  {
    id: "a2-1-lavoro",
    sublevelId: "A2.1",
    title: "Al lavoro",
    intro:
      "Alle nove vado al lavoro in ufficio. La mattina rispondo alle email; nel pomeriggio c'è la riunione con i colleghi.",
    targetExpressions: ["vado al lavoro", "la riunione"],
    usePrompt: "Descrivi una giornata al lavoro.",
    quiz: [
      q("a221", "“l'ufficio” =", ["the office", "the factory", "the shop"], 0, { prompt: "« l'ufficio » =", options: ["le bureau", "l'usine", "le magasin"] }),
      q("a222", "“la riunione” =", ["the meeting", "the holiday", "the meal"], 0, { prompt: "« la riunione » =", options: ["la réunion", "les vacances", "le repas"] }),
      q("a223", "“i colleghi” =", ["the neighbours", "the colleagues", "the clients"], 1, { prompt: "« i colleghi » =", options: ["les voisins", "les collègues", "les clients"] }),
      q("a224", "Cosa fa la mattina?", ["risponde alle email", "dorme", "cucina"], 0, { prompt: "Que fait-il le matin ?" }),
      q("a225", "“rispondo alle email” =", ["I answer emails", "I write a book", "I call home"], 0, { prompt: "« rispondo alle email » =", options: ["je réponds aux e-mails", "j'écris un livre", "j'appelle la maison"] }),
    ],
  },
  {
    id: "a2-1-pasti",
    sublevelId: "A2.1",
    title: "I pasti",
    intro:
      "A mezzogiorno faccio il pranzo, di solito pasta o un panino. La sera, verso le otto, prepariamo la cena in famiglia.",
    targetExpressions: ["il pranzo", "la cena"],
    usePrompt: "Racconta cosa mangi a pranzo e a cena.",
    quiz: [
      q("a231", "“il pranzo” =", ["breakfast", "lunch", "dinner"], 1, { prompt: "« il pranzo » =", options: ["le petit-déjeuner", "le déjeuner", "le dîner"] }),
      q("a232", "“la cena” =", ["lunch", "the snack", "dinner"], 2, { prompt: "« la cena » =", options: ["le déjeuner", "le goûter", "le dîner"] }),
      q("a233", "A che ora è la cena?", ["a mezzogiorno", "verso le otto", "alle sei"], 1, { prompt: "À quelle heure est le dîner ?" }),
      q("a234", "“un panino” =", ["a sandwich", "a cake", "a soup"], 0, { prompt: "« un panino » =", options: ["un sandwich", "un gâteau", "une soupe"] }),
      q("a235", "Con chi prepara la cena?", ["da solo", "in famiglia", "con i colleghi"], 1, { prompt: "Avec qui prépare-t-il le dîner ?" }),
    ],
  },
  {
    id: "a2-1-casa",
    sublevelId: "A2.1",
    title: "Le faccende",
    intro:
      "Dopo cena devo lavare i piatti e mettere in ordine la cucina. Il sabato faccio il bucato e pulisco il bagno.",
    targetExpressions: ["lavare i piatti", "il bucato"],
    usePrompt: "Quali faccende fai in casa?",
    quiz: [
      q("a241", "“lavare i piatti” =", ["to wash the dishes", "to cook", "to sleep"], 0, { prompt: "« lavare i piatti » =", options: ["faire la vaisselle", "cuisiner", "dormir"] }),
      q("a242", "“il bucato” =", ["the laundry", "the garden", "the floor"], 0, { prompt: "« il bucato » =", options: ["la lessive", "le jardin", "le sol"] }),
      q("a243", "“pulisco il bagno” =", ["I clean the bathroom", "I paint the wall", "I close the door"], 0, { prompt: "« pulisco il bagno » =", options: ["je nettoie la salle de bain", "je peins le mur", "je ferme la porte"] }),
      q("a244", "Quando fa il bucato?", ["ogni mattina", "il sabato", "mai"], 1, { prompt: "Quand fait-il la lessive ?" }),
      q("a245", "“mettere in ordine” =", ["to tidy up", "to go out", "to buy"], 0, { prompt: "« mettere in ordine » =", options: ["ranger", "sortir", "acheter"] }),
    ],
  },
  {
    id: "a2-1-serata",
    sublevelId: "A2.1",
    title: "La sera",
    intro:
      "La sera mi riposo sul divano e guardo la TV. Verso le undici vado a letto perché sono stanco.",
    targetExpressions: ["mi riposo", "vado a letto"],
    usePrompt: "Cosa fai la sera per rilassarti?",
    quiz: [
      q("a251", "“mi riposo” =", ["I rest", "I work", "I run"], 0, { prompt: "« mi riposo » =", options: ["je me repose", "je travaille", "je cours"] }),
      q("a252", "“vado a letto” =", ["I go to bed", "I wake up", "I go out"], 0, { prompt: "« vado a letto » =", options: ["je vais me coucher", "je me réveille", "je sors"] }),
      q("a253", "“sono stanco” =", ["I am tired", "I am hungry", "I am happy"], 0, { prompt: "« sono stanco » =", options: ["je suis fatigué", "j'ai faim", "je suis content"] }),
      q("a254", "A che ora va a letto?", ["alle nove", "verso le undici", "a mezzogiorno"], 1, { prompt: "À quelle heure va-t-il se coucher ?" }),
      q("a255", "Dove si riposa?", ["sul divano", "in ufficio", "in cucina"], 0, { prompt: "Où se repose-t-il ?" }),
    ],
  },
];

export const A2_2_UNITS: ExampleUnit[] = [
  {
    id: "a2-2-negozi",
    sublevelId: "A2.2",
    title: "I negozi",
    intro:
      "Il sabato vado a fare la spesa al supermercato. Poi passo dalla panetteria per comprare il pane fresco.",
    targetExpressions: ["fare la spesa", "supermercato"],
    usePrompt: "Dove fai la spesa di solito?",
    quiz: [
      q("a261", "“fare la spesa” =", ["to do the grocery shopping", "to make a call", "to take a walk"], 0, { prompt: "« fare la spesa » =", options: ["faire les courses", "passer un appel", "se promener"] }),
      q("a262", "“il supermercato” =", ["the supermarket", "the school", "the hospital"], 0, { prompt: "« il supermercato » =", options: ["le supermarché", "l'école", "l'hôpital"] }),
      q("a263", "“la panetteria” =", ["the bakery", "the library", "the station"], 0, { prompt: "« la panetteria » =", options: ["la boulangerie", "la bibliothèque", "la gare"] }),
      q("a264", "Cosa compra in panetteria?", ["il pane", "il latte", "la carne"], 0, { prompt: "Qu'achète-t-il à la boulangerie ?" }),
      q("a265", "“il pane fresco” =", ["fresh bread", "cold water", "hot coffee"], 0, { prompt: "« il pane fresco » =", options: ["le pain frais", "l'eau froide", "le café chaud"] }),
    ],
  },
  {
    id: "a2-2-prezzi",
    sublevelId: "A2.2",
    title: "I prezzi",
    intro:
      "«Quanto costa questa maglietta?» «Venti euro, ma oggi c'è uno sconto del venti per cento.» Posso pagare con la carta.",
    targetExpressions: ["quanto costa", "sconto"],
    usePrompt: "Chiedi il prezzo di un oggetto in un negozio.",
    quiz: [
      q("a271", "“quanto costa?” =", ["how much is it?", "what time is it?", "where is it?"], 0, { prompt: "« quanto costa ? » =", options: ["combien ça coûte ?", "quelle heure est-il ?", "où est-ce ?"] }),
      q("a272", "“lo sconto” =", ["the discount", "the receipt", "the change"], 0, { prompt: "« lo sconto » =", options: ["la remise", "le reçu", "la monnaie"] }),
      q("a273", "“pagare con la carta” =", ["to pay by card", "to pay cash", "to give a gift"], 0, { prompt: "« pagare con la carta » =", options: ["payer par carte", "payer en espèces", "offrir un cadeau"] }),
      q("a274", "Quanto costa la maglietta?", ["dieci euro", "venti euro", "cinquanta euro"], 1, { prompt: "Combien coûte le t-shirt ?" }),
      q("a275", "“il prezzo” =", ["the price", "the door", "the street"], 0, { prompt: "« il prezzo » =", options: ["le prix", "la porte", "la rue"] }),
    ],
  },
  {
    id: "a2-2-mezzi",
    sublevelId: "A2.2",
    title: "I mezzi",
    intro:
      "Per andare in centro prendo l'autobus. La fermata è vicino a casa e il biglietto costa un euro e cinquanta.",
    targetExpressions: ["la fermata", "il biglietto"],
    usePrompt: "Come vai in centro? Con quale mezzo?",
    quiz: [
      q("a281", "“la fermata” =", ["the (bus) stop", "the ticket", "the driver"], 0, { prompt: "« la fermata » =", options: ["l'arrêt", "le billet", "le chauffeur"] }),
      q("a282", "“il biglietto” =", ["the ticket", "the seat", "the map"], 0, { prompt: "« il biglietto » =", options: ["le billet", "le siège", "la carte"] }),
      q("a283", "“l'autobus” =", ["the bus", "the plane", "the boat"], 0, { prompt: "« l'autobus » =", options: ["le bus", "l'avion", "le bateau"] }),
      q("a284", "Dov'è la fermata?", ["lontano", "vicino a casa", "in ufficio"], 1, { prompt: "Où est l'arrêt ?" }),
      q("a285", "Quanto costa il biglietto?", ["un euro e cinquanta", "dieci euro", "è gratis"], 0, { prompt: "Combien coûte le billet ?" }),
    ],
  },
  {
    id: "a2-2-indicazioni",
    sublevelId: "A2.2",
    title: "Le indicazioni",
    intro:
      "«Scusi, dov'è la stazione?» «Vada sempre dritto, poi giri a destra al secondo incrocio.»",
    targetExpressions: ["sempre dritto", "a destra"],
    usePrompt: "Spiega la strada per arrivare a casa tua.",
    quiz: [
      q("a291", "“sempre dritto” =", ["straight ahead", "to the left", "backwards"], 0, { prompt: "« sempre dritto » =", options: ["tout droit", "à gauche", "en arrière"] }),
      q("a292", "“giri a destra” =", ["turn right", "turn left", "stop"], 0, { prompt: "« giri a destra » =", options: ["tournez à droite", "tournez à gauche", "arrêtez-vous"] }),
      q("a293", "“l'incrocio” =", ["the crossroads", "the bridge", "the church"], 0, { prompt: "« l'incrocio » =", options: ["le carrefour", "le pont", "l'église"] }),
      q("a294", "Cosa cerca la persona?", ["la stazione", "il ristorante", "l'albergo"], 0, { prompt: "Que cherche la personne ?" }),
      q("a295", "“a sinistra” =", ["to the right", "to the left", "near"], 1, { prompt: "« a sinistra » =", options: ["à droite", "à gauche", "près"] }),
    ],
  },
  {
    id: "a2-2-vestiti",
    sublevelId: "A2.2",
    title: "I vestiti",
    intro:
      "In negozio vorrei provare questa camicia. Che taglia porta? La media. Ma questi pantaloni sono troppo lunghi.",
    targetExpressions: ["provare", "taglia"],
    usePrompt: "In un negozio di vestiti, cosa dici al commesso?",
    quiz: [
      q("a2a1", "“provare” (un vestito) =", ["to try on", "to sell", "to wash"], 0, { prompt: "« provare » (un vêtement) =", options: ["essayer", "vendre", "laver"] }),
      q("a2a2", "“la taglia” =", ["the size", "the colour", "the price"], 0, { prompt: "« la taglia » =", options: ["la taille", "la couleur", "le prix"] }),
      q("a2a3", "“la camicia” =", ["the shirt", "the shoe", "the hat"], 0, { prompt: "« la camicia » =", options: ["la chemise", "la chaussure", "le chapeau"] }),
      q("a2a4", "“i pantaloni” =", ["the trousers", "the socks", "the gloves"], 0, { prompt: "« i pantaloni » =", options: ["le pantalon", "les chaussettes", "les gants"] }),
      q("a2a5", "Com'è la taglia dei pantaloni?", ["troppo lunghi", "troppo corti", "perfetti"], 0, { prompt: "Comment est la taille du pantalon ?" }),
    ],
  },
];

export const A2_3_UNITS: ExampleUnit[] = [
  {
    id: "a2-3-ieri",
    sublevelId: "A2.3",
    title: "Ieri",
    intro:
      "Ieri sera ho mangiato al ristorante con un amico. Poi sono andato a casa a piedi perché faceva bel tempo.",
    targetExpressions: ["ho mangiato", "sono andato"],
    usePrompt: "Racconta cosa hai fatto ieri sera.",
    quiz: [
      q("a2b1", "“ho mangiato” =", ["I ate", "I will eat", "I eat"], 0, { prompt: "« ho mangiato » =", options: ["j'ai mangé", "je mangerai", "je mange"] }),
      q("a2b2", "“sono andato” =", ["I went", "I go", "I will go"], 0, { prompt: "« sono andato » =", options: ["je suis allé", "je vais", "j'irai"] }),
      q("a2b3", "Con chi ha mangiato?", ["con un amico", "da solo", "con la famiglia"], 0, { prompt: "Avec qui a-t-il mangé ?" }),
      q("a2b4", "Come è tornato a casa?", ["in autobus", "a piedi", "in taxi"], 1, { prompt: "Comment est-il rentré à la maison ?" }),
      q("a2b5", "“ieri sera” =", ["yesterday evening", "tomorrow", "this morning"], 0, { prompt: "« ieri sera » =", options: ["hier soir", "demain", "ce matin"] }),
    ],
  },
  {
    id: "a2-3-weekend",
    sublevelId: "A2.3",
    title: "Il fine settimana",
    intro:
      "Questo fine settimana siamo usciti con gli amici. Sabato abbiamo visto un film e ci siamo divertiti molto.",
    targetExpressions: ["siamo usciti", "ci siamo divertiti"],
    usePrompt: "Racconta il tuo ultimo fine settimana.",
    quiz: [
      q("a2c1", "“siamo usciti” =", ["we went out", "we stayed home", "we slept"], 0, { prompt: "« siamo usciti » =", options: ["nous sommes sortis", "nous sommes restés", "nous avons dormi"] }),
      q("a2c2", "“ci siamo divertiti” =", ["we had fun", "we got bored", "we worked"], 0, { prompt: "« ci siamo divertiti » =", options: ["nous nous sommes amusés", "nous nous sommes ennuyés", "nous avons travaillé"] }),
      q("a2c3", "“abbiamo visto un film” =", ["we watched a film", "we read a book", "we cooked"], 0, { prompt: "« abbiamo visto un film » =", options: ["nous avons vu un film", "nous avons lu un livre", "nous avons cuisiné"] }),
      q("a2c4", "Quando hanno visto il film?", ["venerdì", "sabato", "domenica"], 1, { prompt: "Quand ont-ils vu le film ?" }),
      q("a2c5", "Con chi sono usciti?", ["con gli amici", "da soli", "con i colleghi"], 0, { prompt: "Avec qui sont-ils sortis ?" }),
    ],
  },
  {
    id: "a2-3-progetti",
    sublevelId: "A2.3",
    title: "I progetti",
    intro:
      "La settimana prossima ho intenzione di studiare di più. Vorrei anche iniziare un corso di nuoto.",
    targetExpressions: ["la settimana prossima", "vorrei"],
    usePrompt: "Quali sono i tuoi progetti per la settimana prossima?",
    quiz: [
      q("a2d1", "“la settimana prossima” =", ["next week", "last week", "every week"], 0, { prompt: "« la settimana prossima » =", options: ["la semaine prochaine", "la semaine dernière", "chaque semaine"] }),
      q("a2d2", "“vorrei” =", ["I would like", "I wanted", "I must"], 0, { prompt: "« vorrei » =", options: ["je voudrais", "je voulais", "je dois"] }),
      q("a2d3", "“ho intenzione di” =", ["I plan to", "I refuse to", "I forgot to"], 0, { prompt: "« ho intenzione di » =", options: ["j'ai l'intention de", "je refuse de", "j'ai oublié de"] }),
      q("a2d4", "Cosa vorrebbe iniziare?", ["un corso di nuoto", "un lavoro", "un viaggio"], 0, { prompt: "Que voudrait-il commencer ?" }),
      q("a2d5", "“studiare di più” =", ["to study more", "to sleep more", "to eat less"], 0, { prompt: "« studiare di più » =", options: ["étudier plus", "dormir plus", "manger moins"] }),
    ],
  },
  {
    id: "a2-3-vacanze",
    sublevelId: "A2.3",
    title: "Le vacanze",
    intro:
      "Ad agosto andrò in vacanza al mare. Devo prenotare l'albergo e comprare i biglietti del treno.",
    targetExpressions: ["prenotare", "l'albergo"],
    usePrompt: "Dove andrai in vacanza? Cosa devi organizzare?",
    quiz: [
      q("a2e1", "“prenotare” =", ["to book", "to cancel", "to pay"], 0, { prompt: "« prenotare » =", options: ["réserver", "annuler", "payer"] }),
      q("a2e2", "“l'albergo” =", ["the hotel", "the beach", "the airport"], 0, { prompt: "« l'albergo » =", options: ["l'hôtel", "la plage", "l'aéroport"] }),
      q("a2e3", "“andrò in vacanza” =", ["I will go on holiday", "I went on holiday", "I am on holiday"], 0, { prompt: "« andrò in vacanza » =", options: ["je partirai en vacances", "je suis parti en vacances", "je suis en vacances"] }),
      q("a2e4", "Dove va in vacanza?", ["al mare", "in montagna", "in città"], 0, { prompt: "Où part-il en vacances ?" }),
      q("a2e5", "Come viaggia?", ["in treno", "in aereo", "in nave"], 0, { prompt: "Comment voyage-t-il ?" }),
    ],
  },
  {
    id: "a2-3-salute",
    sublevelId: "A2.3",
    title: "La salute",
    intro:
      "Oggi non sto bene: mi fa male la testa e ho un po' di febbre. Domani vado dal medico.",
    targetExpressions: ["mi fa male", "febbre"],
    usePrompt: "Non stai bene: spiega al medico come ti senti.",
    quiz: [
      q("a2f1", "“mi fa male la testa” =", ["I have a headache", "I am hungry", "I am cold"], 0, { prompt: "« mi fa male la testa » =", options: ["j'ai mal à la tête", "j'ai faim", "j'ai froid"] }),
      q("a2f2", "“la febbre” =", ["the fever", "the cough", "the cold"], 0, { prompt: "« la febbre » =", options: ["la fièvre", "la toux", "le rhume"] }),
      q("a2f3", "“il medico” =", ["the doctor", "the teacher", "the waiter"], 0, { prompt: "« il medico » =", options: ["le médecin", "le professeur", "le serveur"] }),
      q("a2f4", "Come sta oggi?", ["bene", "non bene", "benissimo"], 1, { prompt: "Comment va-t-il aujourd'hui ?" }),
      q("a2f5", "Quando va dal medico?", ["oggi", "domani", "mai"], 1, { prompt: "Quand va-t-il chez le médecin ?" }),
    ],
  },
];

const A2_UNITS: ExampleUnit[] = [...A2_1_UNITS, ...A2_2_UNITS, ...A2_3_UNITS];

export const SUBLEVEL_A2_1: Sublevel = {
  id: "A2.1",
  level: "A2",
  index: 1,
  title: "Daily routine",
  language: "it",
  unitIds: A2_1_UNITS.map((u) => u.id),
};
export const SUBLEVEL_A2_2: Sublevel = {
  id: "A2.2",
  level: "A2",
  index: 2,
  title: "In town",
  language: "it",
  unitIds: A2_2_UNITS.map((u) => u.id),
};
export const SUBLEVEL_A2_3: Sublevel = {
  id: "A2.3",
  level: "A2",
  index: 3,
  title: "Past & plans",
  language: "it",
  unitIds: A2_3_UNITS.map((u) => u.id),
};

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

const ALL_QUIZ_UNITS: ExampleUnit[] = [...A1_1_UNITS, ...A2_UNITS];

export function exampleUnit(unitId: string): ExampleUnit | undefined {
  return ALL_QUIZ_UNITS.find((u) => u.id === unitId);
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

/** Build a quiz sub-level entry (all units are 5-question quizzes). */
function quizSublevel(sl: Sublevel, units: ExampleUnit[]): ProgressionSublevel {
  return {
    id: sl.id,
    level: sl.level,
    index: sl.index,
    title: sl.title,
    language: sl.language,
    units: units.map((u) => ({ unitId: u.id, title: u.title, hasQuiz: true })),
  };
}

export function progressionSublevels(language: Language): ProgressionSublevel[] {
  if (language !== "it") return [];
  return [
    quizSublevel(SUBLEVEL_A1_1, A1_1_UNITS),
    {
      id: "A1.2",
      level: "A1",
      index: 2,
      title: "First readings",
      language: "it",
      units: articleUnits("A1.2", "it"),
    },
    quizSublevel(SUBLEVEL_A2_1, A2_1_UNITS),
    quizSublevel(SUBLEVEL_A2_2, A2_2_UNITS),
    quizSublevel(SUBLEVEL_A2_3, A2_3_UNITS),
  ];
}
