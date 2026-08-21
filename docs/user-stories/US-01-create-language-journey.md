# US-01 — Create my language journey

- **ID** : US-01
- **Statut** : Done — validée par le PO
- **Étape de la boucle pédagogique** : JOURNEY (point d'entrée de la boucle)

## User story

> As a learner,
> I want to define the language I want to learn and my starting level,
> so that every reading experience is adapted to my current ability.

## Valeur utilisateur

L'apprenant pose les fondations de son parcours : la langue cible et une hypothèse de
niveau. C'est le premier pas qui permet à toute l'expérience de lecture d'être
**adaptée à sa capacité actuelle** — et donc de tenir la promesse produit dès la
première session.

## Lien avec la boucle pédagogique

US-01 initialise le **JOURNEY**. Les choix faits ici (langue, niveau déclaré,
centres d'intérêt) alimentent en amont l'étape **DISCOVER** (dont la lecture est la
première modalité du MVP) : ils déterminent les contenus proposés et leur niveau de
départ.

## Règles fonctionnelles

À la création du parcours, l'utilisateur effectue trois choix :

### 1. Language
- Italian

### 2. Starting level
- A1
- A2
- B1
- B2
- C1
- I don't know my level

### 3. Reading interests
- Thriller
- History
- Travel
- Culture
- News
- Sport
- Everyday life
- Surprise me

- Au moins **un centre d'intérêt** est requis pour valider ; « Surprise me » le
  satisfait en un seul geste (choix produit — voir *Décisions*).

### Règle structurante (invariant)

> Le **niveau déclaré** (`declaredLevel`) doit être stocké **séparément** du futur
> modèle de niveau **estimé** (`estimatedLevel`) par LONTANO. Au démarrage,
> `estimatedLevel = null`. Le niveau déclaré n'est qu'une hypothèse initiale, jamais
> une vérité figée, et les deux concepts ne doivent **jamais** être fusionnés.

Voir [`../product/pedagogical-model.md`](../product/pedagogical-model.md#personnalisation).

## Critères d'acceptation

- [ ] Given un nouvel utilisateur, When il crée son parcours, Then il peut choisir
  **Italian** comme langue cible.
- [ ] Given l'écran de création, When l'utilisateur choisit son niveau de départ,
  Then il peut sélectionner l'une des six options (A1, A2, B1, B2, C1, *I don't know
  my level*).
- [ ] Given l'écran de création, When l'utilisateur choisit ses centres d'intérêt,
  Then il peut sélectionner parmi les huit options (Thriller, History, Travel,
  Culture, News, Sport, Everyday life, Surprise me).
- [ ] Given un parcours créé, When le niveau déclaré est enregistré, Then il est
  stocké dans un champ **distinct** de tout futur niveau estimé.
- [ ] Given un parcours créé, Then l'expérience de lecture proposée reflète la langue,
  le niveau déclaré et les centres d'intérêt choisis.

## Implémentation (1ʳᵉ tranche)

- Modèle métier pur : [`src/domain/journey.ts`](../../src/domain/journey.ts)
  (types `DeclaredLevel` / `EstimatedLevel`, `validateDraft`, `createJourney`).
- Persistance locale injectable : [`src/persistence/journeyStorage.ts`](../../src/persistence/journeyStorage.ts).
- UI : [`src/ui/Onboarding.tsx`](../../src/ui/Onboarding.tsx) et
  [`src/ui/JourneySummary.tsx`](../../src/ui/JourneySummary.tsx).
- Tests : [`src/domain/journey.test.ts`](../../src/domain/journey.test.ts),
  [`src/persistence/journeyStorage.test.ts`](../../src/persistence/journeyStorage.test.ts).
- Cahier de recette : [`../testing/recette-US-01.md`](../testing/recette-US-01.md).

## Décisions

- [ADR-0001](../decisions/adr/0001-frontend-foundation-and-local-persistence.md) —
  socle frontend et persistance locale pour la 1ʳᵉ tranche.
- Journal de décisions : [D-03](../decisions/README.md) (stack),
  [D-04](../decisions/README.md) (règle « ≥ 1 intérêt »).

## Statut & historique

- **Validated** — US-01 intégrée au référentiel (Product Discovery).
- **In progress** — première tranche verticale implémentée (onboarding → validation →
  résumé → persistance après rechargement), sous GO MVP du PO.
- **Done** — validée par le PO le 2026-08-21 ; règle D-04 (« ≥ 1 intérêt, Surprise me
  valide ») **confirmée**, plus aucun point ouvert.
