# Architecture

Ce document décrit l'architecture **telle qu'elle existe aujourd'hui** pour la
première tranche de US-01. Elle est volontairement minimale ; elle évoluera au fil
des US, et les choix structurants seront tracés en **ADR**
([`../decisions/adr/`](../decisions/adr/README.md)).

## Socle technique

| Choix | Rôle |
|-------|------|
| **TypeScript** | Typage strict, sûreté du modèle métier |
| **Vite** | Dev server + build |
| **React** | UI par composants |
| **Vitest** | Tests unitaires (règles métier + persistance) |

Aucune dépendance backend, aucun moteur IA à ce stade. Voir
[ADR-0001](../decisions/adr/0001-frontend-foundation-and-local-persistence.md).

## Découpage en couches

```
src/
├─ domain/        Modèle métier PUR, sans dépendance UI ni I/O
│  └─ journey.ts  Types, validation, création du parcours
├─ persistence/   Persistance locale, injectable (Storage-like)
│  └─ journeyStorage.ts
└─ ui/            Composants React ; ne portent aucune règle métier
   ├─ Onboarding.tsx
   └─ JourneySummary.tsx
```

Principe : **les règles métier vivent dans `domain/`** et sont testables sans DOM.
L'UI et la persistance dépendent du domaine, jamais l'inverse.

## Invariant produit reflété dans le modèle

`declaredLevel` (hypothèse déclarée par l'apprenant) et `estimatedLevel` (futur
niveau estimé par COMPOSTELLE) sont **deux champs distincts**. `estimatedLevel` vaut
`null` à la création et n'est jamais dérivé du niveau déclaré. Ils ne doivent jamais
être fusionnés.

## Persistance

Pour US-01, la persistance est **locale** (Web Storage du navigateur), suffisante
pour retrouver le parcours après rechargement. Le module expose une interface
`KeyValueStore` injectable, ce qui permet de tester la logique sans navigateur et
laisse la porte ouverte à un futur backend sans réécrire l'appelant.

## Ce qui n'existe pas encore

Pas de backend, pas d'authentification, pas de moteur de recommandation/IA, pas de
US-02+. Ces éléments seront documentés ici **quand** ils existeront — pas avant.
