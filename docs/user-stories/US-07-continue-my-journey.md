# US-07 — Continue my journey

- **ID** : US-07
- **Statut** : Implemented · Awaiting PO validation
- **Étape de la boucle** : JOURNEY

## User story

> As a learner, I want each completed learning session to influence what comes
> next, so that COMPOSTELLE feels like a continuous personal journey.

## Règles / périmètre

- À la fin d'une session : écran **Session complete** (explored / remembered / to
  review) puis **Continue your journey**.
- Le Journey montre une **progression réelle** et sobre (pas un dashboard, pas de
  gamification artificielle) : langue active + niveau, ce qui est *learning* /
  *acquired* / *to review*.
- Permet de : continuer (nouvelle découverte), voir sa progression, changer de langue.

## Acceptance criteria

- [x] Écran de fin de session avec un décompte utile, puis « Continue your journey ».
- [x] La progression (compteurs MEMORY par langue) s'affiche sobrement sur DISCOVER.
- [x] Changer de langue conserve les parcours et affiche la progression de la langue
  active.
- [x] La mémoire (donc la progression) est restaurée après reconnexion / navigateur
  neuf (via US-06).

## Personnalisation (amorce)

La sélection de contenu reste : langue cible → intérêts → éviter la répétition
immédiate → (à venir) historique/mémoire. La personnalisation par l'historique est
une évolution proposée (voir backlog).

## Implementation notes

- UI : fin de session dans [`ui/LearningSession.tsx`](../../src/ui/LearningSession.tsx) ;
  ligne de progression dans [`ui/Discover.tsx`](../../src/ui/Discover.tsx) ;
  agrégation via [`domain/memory.summarize`](../../src/domain/memory.ts).
