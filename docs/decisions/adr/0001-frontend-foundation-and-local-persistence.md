# ADR-0001 — Socle frontend et persistance locale pour la 1ʳᵉ tranche

- **Statut** : Accepted
- **Date** : 2026-08-21

## Contexte

Le PO a donné le GO pour développer une première tranche verticale de US-01 (créer
son parcours de lecture). Contraintes : rester léger, ne pas sur-architecturer, pas
de backend ni de moteur IA pour cette US, du TypeScript, un modèle métier séparé de
l'UI, des tests sur les règles importantes, et une persistance suffisante pour
retrouver le parcours après rechargement.

## Décision

- **Stack : Vite + React + TypeScript + Vitest.** Base frontend moderne, simple,
  rapide et testable ; Vitest est natif à l'écosystème Vite (pas d'outillage de test
  supplémentaire à assembler).
- **Modèle métier en fonctions pures** dans `src/domain/`, sans dépendance UI ni I/O.
- **Persistance locale injectable** : le module `persistence/` expose une interface
  `KeyValueStore` et utilise `localStorage` par défaut. L'injection permet de tester
  la logique sans DOM et n'enferme pas le code dans le stockage navigateur.
- **Dépendances minimales** : uniquement `react` / `react-dom` + l'outillage. Pas de
  librairie UI, de state manager, ni de testing-library (les règles métier sont
  testées comme des fonctions pures).

## Conséquences

- **Positives** : peu de dépendances, tests rapides sans environnement DOM, frontière
  nette domaine / UI / persistance, montée vers un backend possible sans réécrire les
  appelants (il suffira de fournir une autre implémentation de persistance).
- **Négatives / limites** : la persistance locale est propre au navigateur (pas de
  synchronisation multi-appareils) — acceptable et explicitement suffisant pour
  US-01. Les composants React ne sont pas couverts par des tests d'intégration DOM ;
  ce sera à réévaluer si l'UI se complexifie.

## Alternatives envisagées

- **Frameworks lourds (Next.js, backend dès le départ)** : écartés — sur-ingénierie
  pour cette tranche, contraire à la consigne.
- **jsdom + @testing-library** pour tester l'UI : écartés pour l'instant — les règles
  métier critiques sont entièrement couvrables en pur, sans ces dépendances.
