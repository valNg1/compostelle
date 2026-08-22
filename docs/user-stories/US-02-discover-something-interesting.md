# US-02 — Discover something interesting

- **ID** : US-02
- **Statut** : Implemented — awaiting MVP foundation validation
- **Étape de la boucle pédagogique** : DISCOVER (principalement)

> L'UI de découverte est acceptée techniquement. Deux prérequis MVP posés par le PO
> ont été ajoutés et livrés : **persistance durable** (Supabase/PostgreSQL, D-10 /
> [ADR-0002](../decisions/adr/0002-durable-persistence-supabase.md)) et **preuve
> multilingue it + es** avec la même structure applicative (D-11 /
> [ADR-0003](../decisions/adr/0003-language-agnostic-domain.md)). US-02 ne repasse
> `Done` qu'après validation de la fondation MVP par le PO (D-12).

## User story

> As a learner,
> I want to discover content related to my interests,
> so that I have a reason to come back and learn something new in the language I am
> learning.

## Valeur utilisateur

Après avoir créé son parcours (US-01), l'apprenant reçoit **une raison de revenir** :
quelque chose d'intéressant à découvrir aujourd'hui, dans la langue cible, en lien
avec ce qu'il aime. La découverte précède et motive l'apprentissage.

## Principe produit structurant

> **The learner chooses what interests them. COMPOSTELLE adapts the learning experience.**

Conséquences appliquées ici :

- le produit ne demande **jamais** « Do you want an A2 or B1 text? » ;
- le niveau (CEFR) est géré par COMPOSTELLE, **jamais** au centre visuel de l'expérience ;
- **aucun CEFR n'est affiché** dans le feed de découverte.

## Périmètre (cette tranche)

Écran de découverte personnalisé, affiché **après** US-01, qui présente :

1. **Une proposition principale** (featured) : `title`, `category`, `short teaser`,
   `estimated duration`, et une indication légère de modalité si pertinente. **Pas de
   CEFR.**
2. **Quelques alternatives** (maximum raisonnable, pas de grille type Netflix).

Puis l'ouverture d'un contenu → **vue de découverte minimale** (consultation du
contenu). Flow complet livré : **Journey → Discovery Feed → Content**.

Hors périmètre (ne PAS développer ici) : vocabulaire interactif, traduction mot à mot,
grammaire contextuelle, quiz, recall, production, mémoire pédagogique (ce sont
UNDERSTAND / RECALL / USE / MEMORY, pas US-02).

## Règles fonctionnelles

### Catalogue

- Petit catalogue **local** de contenus de qualité (pas de backend, pas d'actualité
  temps réel).
- Catégories : `thriller`, `history`, `travel`, `culture`, `news`, `sport`,
  `everyday_life`.
- `surprise_me` **n'est pas une catégorie** : c'est une préférence autorisant COMPOSTELLE
  à proposer autre chose que les intérêts explicites.
- Exigence éditoriale : contenus intéressants indépendamment de la pédagogie ; pas de
  faux texte scolaire (« Maria goes to the supermarket »). Narratif = original ;
  historique/culturel = factuel et prudent.

### Sélection (simple, déterministe, explicable, testable)

Entrée : le `Journey` (intérêts) + le catalogue. Sortie : `{ featured, alternatives }`.

1. `explicit` = intérêts déclarés **sauf** `surprise_me` → catégories choisies.
2. `matched` = contenus dont la catégorie ∈ `explicit` (ordre catalogue, stable).
3. `unmatched` = le reste (ordre catalogue).
4. Liste classée `ranked` :
   - si `matched` vide → **fallback** : catalogue complet (« something worth
     discovering today ») ;
   - sinon si `surprise_me` actif → `matched` puis `unmatched` (exploration) ;
   - sinon → `matched` seul.
5. `featured` = `ranked[0]` (ou `null` si catalogue vide).
6. `alternatives` = éléments suivants, plafonnés (défaut : 3).

La sélection est une **fonction pure** : elle ne mute jamais le `Journey`, ni
`declaredLevel`, ni `estimatedLevel`, et n'accède pas au stockage.

### Niveau linguistique

- Pas de moteur d'adaptation au niveau dans cette tranche (choix assumé, réversible —
  voir [D-07](../decisions/README.md)).
- `estimatedLevel` reste `null` : aucune fausse estimation.
- `declaredLevel` reste inchangé par la découverte.

## Critères d'acceptation

- [x] Given un apprenant avec l'intérêt Thriller, When il arrive sur DISCOVER, Then
  il voit au moins une proposition de catégorie Thriller.
- [x] Given plusieurs intérêts, When le feed est calculé, Then les contenus des
  différentes catégories choisies sont pris en compte.
- [x] Given `Surprise me`, When le feed est calculé, Then une catégorie **hors**
  intérêts explicites peut apparaître.
- [x] Given aucun contenu correspondant aux intérêts, Then un fallback propre propose
  tout de même quelque chose (jamais un feed vide artificiel).
- [x] Given un catalogue vide, Then le feed est vide et l'UI affiche un état vide
  propre (pas de crash).
- [x] Given un contenu choisi par ID, Then sa vue de découverte s'ouvre.
- [x] Given un ID inexistant, Then l'application gère proprement (pas de page blanche).
- [x] Given le calcul du feed, Then le `Journey` (dont `declaredLevel` /
  `estimatedLevel`) est inchangé.
- [x] Given des entrées identiques, Then le résultat de la sélection est
  **déterministe**.
- [x] Given un Journey absent/corrompu, Then l'application retombe proprement sur
  l'onboarding (US-01 non régressée).
- [x] Given un parcours italien, Then le feed ne contient que du contenu italien ;
  given un parcours espagnol, que du contenu espagnol (mêmes composants).
- [x] Given `Surprise me`, Then l'exploration ne traverse **jamais** la langue cible.
- [x] Given une persistance durable configurée, Then le parcours est restaurable
  **indépendamment** de `localStorage` (prouvé par les tests repository/service).

## Implementation notes

- Modèle métier : [`src/domain/content.ts`](../../src/domain/content.ts) (types +
  `getContentById`), [`src/domain/discovery.ts`](../../src/domain/discovery.ts)
  (`selectDiscoveryFeed`).
- Langue : [`src/domain/language.ts`](../../src/domain/language.ts) (it | es).
- Catalogue : [`catalog.it.ts`](../../src/content/catalog.it.ts) +
  [`catalog.es.ts`](../../src/content/catalog.es.ts) →
  [`catalog.ts`](../../src/content/catalog.ts).
- Persistance durable : port [`journeyRepository.ts`](../../src/application/journeyRepository.ts),
  service [`journeyService.ts`](../../src/application/journeyService.ts), adaptateurs
  [`supabaseJourneyRepository.ts`](../../src/persistence/supabaseJourneyRepository.ts) /
  [`inMemoryJourneyRepository.ts`](../../src/persistence/inMemoryJourneyRepository.ts),
  schéma [`supabase/migrations/0001_create_journeys.sql`](../../supabase/migrations/0001_create_journeys.sql).
- UI : [`src/ui/Discover.tsx`](../../src/ui/Discover.tsx) (conteneur feed↔content),
  [`src/ui/DiscoveryFeed.tsx`](../../src/ui/DiscoveryFeed.tsx),
  [`src/ui/ContentView.tsx`](../../src/ui/ContentView.tsx).
- Câblage : [`src/App.tsx`](../../src/App.tsx) route un parcours existant vers
  **Discover** (l'écran résumé US-01 a été retiré, superseded par Discover).
- Tests : [`src/domain/discovery.test.ts`](../../src/domain/discovery.test.ts),
  [`src/domain/content.test.ts`](../../src/domain/content.test.ts),
  [`src/domain/discovery.catalog.test.ts`](../../src/domain/discovery.catalog.test.ts)
  (garde-fous d'intégration sur le vrai catalogue).
- Cahier de recette : [`../testing/recette-US-02.md`](../testing/recette-US-02.md).
- Choix éditorial : `title`/`body` en italien (langue cible), `teaser` en anglais
  (chrome d'accueil) — donnée, donc réversible.
- Meta d'affichage : indication légère de modalité + durée (« Read · N min »),
  **aucun CEFR affiché**.

## Fondation MVP (prérequis ajoutés par le PO)

- **Persistance durable user-scoped multi-langue** (D-10/D-14 / ADR-0002) : Postgres
  source de vérité via `JourneyRepository` + adaptateur Supabase + `JourneyService`.
  Schéma `unique(user_id, language_code)` — un utilisateur garde **plusieurs parcours
  durables** (un par langue) ; changer de langue n'en détruit aucun. Restauration
  prouvée **indépendamment de `localStorage`** (tests service/repository). Sans `.env`,
  cache-only.
- **Identité durable** (D-13 / ADR-0004) : Supabase Auth **email magic-link** ;
  propriété = `auth.uid()`. **RLS owner-only** : aucun accès inter-usagers.
- **Multilingue it + es** (D-11 / ADR-0003) : la langue est une donnée ;
  `selectDiscoveryFeed` isole par langue ; **mêmes composants** ; catalogue espagnol
  de preuve. UX : choix/ajout/bascule de langue (barre de langues) préservant tous les
  parcours.
- **Validation** : le test d'acceptation runtime (login → it+es durables → sign-out +
  vidage localStorage → reconnexion → restauration) exige un Supabase live +
  déploiement — **action PO** (OPEN-03, [DEPLOYMENT.md](../operations/DEPLOYMENT.md)).
  Non validé tant que ce test réel n'est pas passé (D-12).

## Statut & historique

- **In progress** — domaine + catalogue + tests livrés (session autonome).
- **Done (UI)** — UI câblée (Journey → Discover → Content), flow vérifié (Flows A–D).
- **Implemented — awaiting MVP foundation validation** — ajout des prérequis MVP
  (durable + multilingue it/es). Preuves livrées ; en attente de validation PO (D-12).
