# US-03 — Understand what I discover

- **ID** : US-03
- **Statut** : Implemented · Awaiting PO validation
- **Étape de la boucle** : UNDERSTAND

## User story

> As a learner, I want help understanding difficult words and expressions in
> context, so that I can stay immersed in the content.

## Règles / périmètre

- Certaines expressions pédagogiquement utiles sont **tappables** dans la lecture.
- L'aide est **courte, contextuelle** : sens (dans la langue cible), traduction
  (langue UI), exemple optionnel — pas une définition encyclopédique.
- L'aide apparaît **dans le contexte** (panneau sous la lecture), ne masque pas la
  page, et la lecture continue immédiatement.
- **Déterministe et durable** : données pédagogiques structurées (annotations), pas
  de dépendance LLM externe (D-16). Même architecture pour it et es.

## Acceptance criteria

- [x] Les expressions annotées sont visibles et tappables dans la lecture.
- [x] Un tap ouvre une aide courte (expression, traduction, sens, exemple si présent)
  sans quitter le contenu ; refermable.
- [x] Chaque consultation alimente la MEMORY (signal `understood`).
- [x] Fonctionne identiquement en italien et en espagnol (mêmes composants).

## Implementation notes

- Modèle : [`domain/learning.ts`](../../src/domain/learning.ts) (`Annotation`,
  `buildAnnotatedSegments`), enrichi dans `content/catalog.it.ts` / `catalog.es.ts`.
- UI : [`ui/AnnotatedText.tsx`](../../src/ui/AnnotatedText.tsx), intégré dans
  [`ui/LearningSession.tsx`](../../src/ui/LearningSession.tsx) (phase READ).
