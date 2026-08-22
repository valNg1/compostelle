# ADR-0003 — Language-agnostic domain model

- **Statut** : Accepted
- **Date** : 2026-08-22

## Contexte

L'italien était structurellement codé en dur comme unique langue cible. Le PO exige
que le MVP prouve au moins **deux langues** (italien + espagnol) en utilisant **la
même structure applicative** : pas de composants séparés par langue.

## Décision

Faire de la **langue une donnée**, portée par le parcours et par le contenu, jamais
codée dans les composants ni dans la logique de sélection.

- **Modèle de langue** : [`src/domain/language.ts`](../../../src/domain/language.ts)
  — `type Language = "it" | "es"`, liste `LANGUAGES` (label + endonyme),
  `DEFAULT_LANGUAGE`, `isLanguage`. Ajouter une langue = éditer cette config + des
  données de contenu.
- **`LanguageJourney.language`** et **`ContentItem.language`** portent la langue.
- **`selectDiscoveryFeed`** filtre d'abord le catalogue par `journey.language`
  (isolation) : `Surprise me` explore d'autres catégories, **jamais** d'autres
  langues. Signature inchangée — la fonction marche à l'identique pour `it` et `es`.
- **Catalogue** : un fichier par langue (`catalog.it.ts`, `catalog.es.ts`) partageant
  **exactement** le même schéma `ContentItem`, combinés dans `catalog.ts`. Le domaine
  filtre par langue ; aucun code par langue.
- **UI** : `Onboarding` propose la langue (it/es) ; `DiscoveryFeed` et `ContentView`
  sont **les mêmes composants** pour toutes les langues, pilotés par la donnée.

## Conséquences

- **Positives** : preuve multilingue sans duplication d'UI ni de domaine ; ajouter
  une langue est additif (config + contenu) ; isolation de langue garantie et testée
  (y compris `Surprise me` et le fallback).
- **Négatives / limites** : catalogue espagnol volontairement **minimal** (preuve,
  4 catégories) ; le `teaser` reste en anglais (chrome d'accueil) — choix éditorial
  réversible. Pas d'adaptation au niveau (voir D-07), inchangé.

## Alternatives envisagées

- **Composants/catalogues dupliqués par langue** : rejeté explicitement par le PO.
- **i18n de l'UI (chrome multilingue)** : hors périmètre — ici la langue *cible*
  (le contenu) est ce qui compte, pas la langue de l'interface.
