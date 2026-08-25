/*
 * COMPOSTEL — function-word guard (issue #6).
 *
 * A static, in-repo list of grammatical "tool words" (articles, prepositions,
 * conjunctions, common pronouns/auxiliaries) for the target languages (it/es)
 * plus the interface languages (en/fr). It is NOT a dictionary and needs no
 * external service: its only job is to make sure the contextual-help selection
 * never spends the ~20% budget on a lone function word instead of real
 * vocabulary. Multi-word idioms are always kept — a phrase carrying at least
 * one content word is pedagogically valuable.
 */

const FUNCTION_WORDS: ReadonlySet<string> = new Set([
  // --- Italian ---
  "il", "lo", "la", "i", "gli", "le", "un", "uno", "una",
  "del", "dello", "della", "dei", "degli", "delle",
  "al", "allo", "alla", "ai", "agli", "alle",
  "dal", "dalla", "dai", "nel", "nella", "nei", "negli", "sul", "sulla",
  "di", "a", "da", "in", "con", "su", "per", "tra", "fra",
  "e", "ed", "o", "od", "ma", "che", "se", "non", "come", "più", "meno",
  "si", "ci", "mi", "ti", "vi", "ne", "li", "cui", "chi", "ha", "hanno",
  // --- Spanish ---
  "el", "los", "las", "unos", "unas",
  "de", "al", "en", "sin", "sobre", "entre", "hasta", "desde", "hacia",
  "y", "u", "pero", "porque", "que", "si", "no", "se", "su", "sus",
  "lo", "le", "les", "me", "te", "nos", "más", "muy", "ya", "como",
  "por", "para", "con", "una", "un",
  // --- English (interface) ---
  "the", "an", "of", "to", "on", "at", "by", "for", "with", "from",
  "and", "or", "but", "if", "that", "this", "is", "are", "was", "were",
  "be", "it", "as", "not", "so", "than", "then", "into", "about",
  // --- French (interface) ---
  "les", "des", "du", "et", "ou", "mais", "dans", "pour", "avec", "sur",
  "ne", "pas", "ce", "cette", "ces", "qui",
]);

/**
 * True when EVERY token of an expression is a grammatical function word (or a
 * single letter, e.g. an elided "l'"). Such expressions carry no real
 * vocabulary value and must never be underlined as contextual help. Any
 * expression containing at least one content word returns false (kept).
 */
export function isFunctionWordOnly(expression: string): boolean {
  const tokens = expression.toLowerCase().match(/\p{L}+/gu) ?? [];
  if (tokens.length === 0) return true;
  return tokens.every((t) => FUNCTION_WORDS.has(t));
}
