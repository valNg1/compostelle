# US-04 — Recall what I learned

- **ID** : US-04
- **Statut** : Implemented · Awaiting PO validation
- **Étape de la boucle** : RECALL

## User story

> As a learner, I want to actively recall what I just discovered, so that
> understanding starts becoming learning.

## Règles / périmètre

- Mini-exercice **court** (2 à 5 interactions), directement lié au contenu.
- Actif et **corrigé immédiatement** (bonne réponse mise en évidence + feedback).
- Formats : reconnaissance de sens, texte à trou, question de compréhension.
- Pas un quiz scolaire de 15 questions. Objectif : *did I retain something?*

## Acceptance criteria

- [x] 2 à 5 items par contenu, liés aux annotations.
- [x] Correction immédiate et feedback simple à chaque réponse.
- [x] Réponse correcte → MEMORY `recalled_correct` ; erreur → `recalled_wrong`
  (état `TO_REVIEW`).
- [x] Même architecture it / es.

## Implementation notes

- Modèle : `RecallItem` dans [`domain/learning.ts`](../../src/domain/learning.ts) ;
  données dans les catalogues.
- UI : phase RECALL de [`ui/LearningSession.tsx`](../../src/ui/LearningSession.tsx).
