# US-05 — Use the language

- **ID** : US-05
- **Statut** : Implemented · Awaiting PO validation
- **Étape de la boucle** : USE

## User story

> As a learner, I want to produce a small amount of language myself, so that I
> move from recognition to active use.

## Règles / périmètre

- Une **production courte, faible friction**, liée au contenu (compléter une phrase,
  utiliser une expression). Pas de longue rédaction.
- **Pas de fausse correction IA** : self-check déterministe — réponse type révélée,
  expressions clés, vérification « as-tu utilisé une expression clé ? ».
- Architecture prête à accueillir une évaluation plus intelligente plus tard, sans
  bloquer le MVP.

## Acceptance criteria

- [x] Un prompt de production court + phrase à compléter, avec zone de saisie.
- [x] « Check » révèle une réponse type + expressions clés + retour de self-check.
- [x] Si l'apprenant utilise une expression clé → MEMORY `used` (état `ACQUIRED`).
- [x] Même architecture it / es.

## Implementation notes

- Modèle : `UsePrompt` + `answerUsesKeyExpression` dans
  [`domain/learning.ts`](../../src/domain/learning.ts).
- UI : phase USE de [`ui/LearningSession.tsx`](../../src/ui/LearningSession.tsx).
- Décision : self-check déterministe, pas de LLM obligatoire (D-16).
