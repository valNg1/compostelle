/**
 * COMPOSTELLE — interface language (i18n of the pedagogical chrome).
 *
 * targetLanguage ≠ interfaceLanguage:
 *  - targetLanguage  = the language being learned (content, UNDERSTAND material,
 *    gaps to fill, production) — see `./language`.
 *  - interfaceLanguage = the language COMPOSTELLE uses to explain, translate,
 *    instruct and give feedback (this module).
 *
 * MVP ships FR + EN fully; the other languages are declared (architecture-ready)
 * and fall back to English until their dictionaries are added.
 */

export type InterfaceLanguage = "fr" | "en" | "es" | "it" | "ru" | "zh";

export const INTERFACE_LANGUAGES: ReadonlyArray<{
  code: InterfaceLanguage;
  label: string;
  /** Fully translated at MVP? (FR/EN yes; others fall back to EN.) */
  ready: boolean;
}> = [
  { code: "en", label: "English", ready: true },
  { code: "fr", label: "Français", ready: true },
  { code: "es", label: "Español", ready: false },
  { code: "it", label: "Italiano", ready: false },
  { code: "ru", label: "Русский", ready: false },
  { code: "zh", label: "中文", ready: false },
];

export const DEFAULT_INTERFACE_LANGUAGE: InterfaceLanguage = "en";

const CODES: ReadonlySet<string> = new Set(
  INTERFACE_LANGUAGES.map((l) => l.code),
);

export function isInterfaceLanguage(v: unknown): v is InterfaceLanguage {
  return typeof v === "string" && CODES.has(v);
}

type Dict = Record<string, string>;

/**
 * English is the complete base dictionary. Other languages override keys; any
 * missing key falls back to English. Placeholders use `{name}`.
 */
const EN: Dict = {
  "start.eyebrow": "Start",
  "start.title": "What do you feel like\nlearning through today?",
  "start.how": "How do you want to learn?",
  "start.mood": "What are you in the mood for?",
  "start.cta": "Start learning",
  "modality.read": "Read",
  "modality.listen": "Listen · soon",
  "modality.explore": "Explore · soon",
  "theme.surprise": "Surprise me",

  "nav.start": "Start",
  "nav.journey": "My Journey",
  "nav.home": "Home",
  "nav.learn": "Learn",
  "nav.me": "My Space",
  "home.add": "+ Add",
  "home.signout": "Sign out",

  "home.greeting": "Welcome back",
  "home.continue": "Continue your journey",
  "home.progress": "Your progress",
  "home.review_count": "{n} expressions to review",
  "home.review_none": "Nothing to review yet.",
  "home.review_soon": "Review · soon",
  "home.recent_activity": "Recent activity",
  "home.no_activity": "No sessions yet — start one above.",
  "home.view_journey": "View my journey →",
  "activity.recalled": "{n} recalled",
  "activity.used_yes": "used",

  "me.eyebrow": "My Space",
  "me.profile": "Profile",
  "me.email": "Email",
  "me.local_account": "Local session (no account)",
  "me.explain_in": "Explain things to me in",
  "me.learning": "Languages you're learning",
  "me.add_language": "+ Add a language",
  "me.account": "Account",
  "me.reset_password": "Reset password · soon",

  "ls.hint": "Tap the highlighted expressions to understand them.",
  "ls.continue": "Continue",

  "recall.eyebrow": "Recall",
  "recall.correct": "Correct.",
  "recall.incorrect": "Not quite — here's the idea.",
  "recall.next": "Next",

  "use.eyebrow": "Use the language",
  "use.your_sentence": "Your sentence",
  "use.check": "Check",
  "use.checking": "Checking…",
  "use.sample": "Sample answer:",
  "use.used": "Nice — you reused the expression.",
  "use.not_used": "Try using “{expr}” in your sentence.",
  "use.valid": "Nice — the expression is used and your sentence is correct.",
  "use.needs_correction":
    "You used the expression, but the sentence needs a small fix. Here is a corrected version:",
  "use.correction": "Suggested:",
  "use.scaffold_expr": "Expression to use:",
  "use.scaffold_start": "You can start with:",

  "complete.eyebrow": "Session complete",
  "complete.title": "You made progress.",
  "complete.explored": "{n} expressions explored",
  "complete.recalled": "{n} recalled",
  "complete.used": "{n} used",
  "complete.to_review": "{n} to review",
  "complete.continue": "Continue your journey",
  "complete.next": "Continue learning",
  "complete.replay": "Redo this lesson",
  "resume.eyebrow": "Already done",
  "resume.title": "You've already completed this lesson.",
  "resume.replay": "Redo the lesson",
  "resume.continue": "Continue learning",
  "resume.all_done":
    "You've finished every lesson in this theme. Redo this one, or pick another theme.",
  "complete.back": "Back to Start",

  "journey.eyebrow": "My Journey",
  "journey.learning": "Learning",
  "journey.acquired": "Acquired",
  "journey.to_review": "To review",
  "journey.recent": "Recently learned",
  "journey.empty": "Start a session to begin building your memory.",

  "state.NEW": "New",
  "state.LEARNING": "Learning",
  "state.ACQUIRED": "Acquired",
  "state.TO_REVIEW": "To review",

  "recall.meaning_q": "What does “{expr}” mean here?",
  "recall.gap_q": "Complete in the target language:",
};

const FR: Dict = {
  "start.eyebrow": "Commencer",
  "start.title": "Qu'avez-vous envie\nd'apprendre aujourd'hui ?",
  "start.how": "Comment voulez-vous apprendre ?",
  "start.mood": "De quoi avez-vous envie ?",
  "start.cta": "Commencer à apprendre",
  "modality.read": "Lire",
  "modality.listen": "Écouter · bientôt",
  "modality.explore": "Explorer · bientôt",
  "theme.surprise": "Surprenez-moi",

  "nav.start": "Commencer",
  "nav.journey": "Mon parcours",
  "nav.home": "Accueil",
  "nav.learn": "Apprendre",
  "nav.me": "Mon espace",
  "home.add": "+ Ajouter",
  "home.signout": "Se déconnecter",

  "home.greeting": "Bon retour",
  "home.continue": "Continuez votre parcours",
  "home.progress": "Votre progression",
  "home.review_count": "{n} expressions à revoir",
  "home.review_none": "Rien à revoir pour l'instant.",
  "home.review_soon": "Révision · bientôt",
  "home.recent_activity": "Activité récente",
  "home.no_activity": "Aucune session pour l'instant — lancez-en une ci-dessus.",
  "home.view_journey": "Voir mon parcours →",
  "activity.recalled": "{n} rappelées",
  "activity.used_yes": "utilisée",

  "me.eyebrow": "Mon espace",
  "me.profile": "Profil",
  "me.email": "E-mail",
  "me.local_account": "Session locale (sans compte)",
  "me.explain_in": "Expliquez-moi les choses en",
  "me.learning": "Langues que vous apprenez",
  "me.add_language": "+ Ajouter une langue",
  "me.account": "Compte",
  "me.reset_password": "Réinitialiser le mot de passe · bientôt",

  "ls.hint": "Touchez les expressions surlignées pour les comprendre.",
  "ls.continue": "Continuer",

  "recall.eyebrow": "Rappel",
  "recall.correct": "Exact.",
  "recall.incorrect": "Pas tout à fait — voici l'idée.",
  "recall.next": "Suivant",

  "use.eyebrow": "Utilisez la langue",
  "use.your_sentence": "Votre phrase",
  "use.check": "Vérifier",
  "use.checking": "Vérification…",
  "use.sample": "Exemple de réponse :",
  "use.used": "Bravo — vous avez réutilisé l'expression.",
  "use.not_used": "Essayez d'utiliser « {expr} » dans votre phrase.",
  "use.valid": "Bravo — l'expression est employée et votre phrase est correcte.",
  "use.needs_correction":
    "Vous avez employé l'expression, mais la phrase demande une correction. Voici une version corrigée :",
  "use.correction": "Proposition :",
  "use.scaffold_expr": "Expression à utiliser :",
  "use.scaffold_start": "Vous pouvez commencer par :",

  "complete.eyebrow": "Session terminée",
  "complete.title": "Vous avez progressé.",
  "complete.explored": "{n} expressions explorées",
  "complete.recalled": "{n} rappelées",
  "complete.used": "{n} utilisée(s)",
  "complete.to_review": "{n} à revoir",
  "complete.continue": "Continuer votre parcours",
  "complete.next": "Poursuivre l'apprentissage",
  "complete.replay": "Refaire cette leçon",
  "resume.eyebrow": "Déjà terminée",
  "resume.title": "Vous avez déjà terminé cette leçon.",
  "resume.replay": "Refaire la leçon",
  "resume.continue": "Poursuivre l'apprentissage",
  "resume.all_done":
    "Vous avez terminé toutes les leçons de ce thème. Refaites celle-ci, ou choisissez un autre thème.",
  "complete.back": "Retour au départ",

  "journey.eyebrow": "Mon parcours",
  "journey.learning": "En apprentissage",
  "journey.acquired": "Acquis",
  "journey.to_review": "À revoir",
  "journey.recent": "Appris récemment",
  "journey.empty": "Lancez une session pour commencer à construire votre mémoire.",

  "state.NEW": "Nouveau",
  "state.LEARNING": "En apprentissage",
  "state.ACQUIRED": "Acquis",
  "state.TO_REVIEW": "À revoir",

  "recall.meaning_q": "Que signifie « {expr} » ici ?",
  "recall.gap_q": "Complétez dans la langue cible :",
};

const DICTS: Partial<Record<InterfaceLanguage, Dict>> = { en: EN, fr: FR };

/** Translate a chrome key into `language`, falling back to English. */
export function t(
  key: string,
  language: InterfaceLanguage,
  params?: Record<string, string | number>,
): string {
  const dict = DICTS[language] ?? EN;
  let value = dict[key] ?? EN[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(`{${k}}`, String(v));
    }
  }
  return value;
}
