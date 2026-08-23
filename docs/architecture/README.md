# Architecture

Ce document décrit l'architecture **telle qu'elle existe aujourd'hui** (US-01 +
US-02, fondation MVP). Les choix structurants sont tracés en **ADR**
([`../decisions/adr/`](../decisions/adr/README.md)) :
[ADR-0001](../decisions/adr/0001-frontend-foundation-and-local-persistence.md) socle,
[ADR-0002](../decisions/adr/0002-durable-persistence-supabase.md) persistance durable,
[ADR-0003](../decisions/adr/0003-language-agnostic-domain.md) domaine multilingue.

## Architecture fonctionnelle (D-18)

```
START → LEARN → MY JOURNEY
                LEARN = CONTENT → UNDERSTAND → RECALL → USE → MEMORY
```

L'unité pédagogique est la **Learning Unit** (contenu + payload UNDERSTAND/RECALL/USE).
START en choisit une par thème et lance toujours la boucle complète. Le futur pipeline
IA doit produire exactement cette structure — contrat :
[`ai-learning-units.md`](ai-learning-units.md).

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
│  ├─ language.ts   Modèle de langue (it | es), langue-agnostique
│  ├─ journey.ts    Parcours : types, validation, niveau, levelBadge
│  ├─ content.ts    Contenu : types (langue + payload pédagogique), getContentById
│  ├─ discovery.ts  Sélection déterministe du feed, isolée par langue
│  ├─ learning.ts   Boucle : Annotation/RecallItem/UsePrompt, segments annotés
│  ├─ learningUnit.ts  Learning Unit canonique + sélection par thème + contrat IA
│  └─ memory.ts     MEMORY : états + transitions déterministes (nextState)
├─ content/       Données de contenu (même schéma pour toutes les langues)
│  ├─ catalog.it.ts  Contenus italiens
│  ├─ catalog.es.ts  Contenus espagnols (preuve)
│  └─ catalog.ts     Catalogue combiné
├─ application/   Ports + orchestration, découplés du stockage
│  ├─ journeyRepository.ts  PORT — user-scoped multi-langue, aucune dép. Supabase
│  ├─ memoryRepository.ts   PORT — mémoire user + langue, aucune dép. Supabase
│  ├─ authService.ts        PORT — identité (email+password), aucune dép. Supabase
│  ├─ signIn.ts             Logique de connexion testable (attemptSignIn)
│  ├─ journeyService.ts     Durable autoritaire + cache + migration
│  └─ memoryService.ts      Applique les signaux (nextState), durable + cache
├─ persistence/   Adaptateurs de stockage / auth
│  ├─ supabaseJourneyRepository.ts  Adaptateur PostgreSQL journeys (mappers purs)
│  ├─ supabaseMemoryRepository.ts   Adaptateur PostgreSQL memory_items (mappers purs)
│  ├─ supabaseAuth.ts               Adaptateur Supabase Auth (email+password)
│  ├─ supabaseClient.ts             Client env-driven (nullable)
│  ├─ inMemoryJourneyRepository.ts  Journeys en mémoire (tests/stand-in)
│  ├─ inMemoryMemoryRepository.ts   Mémoire en mémoire (tests/stand-in)
│  ├─ localJourneyCache.ts          Cache journeys (localStorage, user-scoped)
│  ├─ localMemoryCache.ts           Cache mémoire (localStorage, user+langue)
│  ├─ journeyStorage.ts             localStorage (cache/migration legacy)
│  └─ createJourneyService.ts       Composition root (auth + journey + memory)
└─ ui/            Composants React ; ne portent aucune règle métier
   ├─ AuthScreen.tsx      Connexion email + password (mode durable)
   ├─ Onboarding.tsx      Création d'un parcours (langue + niveau + intérêts)
   ├─ Home.tsx            Shell post-login : nav START / MY JOURNEY + langue
   ├─ Start.tsx           START : langue·niveau, modalité, thème → lance LEARN
   ├─ MyJourney.tsx       MY JOURNEY : progression + mémoire récente
   ├─ AnnotatedText.tsx   Lecture avec expressions tappables (UNDERSTAND)
   └─ LearningSession.tsx LEARN : CONTENT→UNDERSTAND→RECALL→USE→MEMORY→complete
```

Principe : **les règles métier vivent dans `domain/`** (pures, testables sans DOM).
L'application orchestre ; la persistance et l'UI dépendent du domaine, jamais
l'inverse.

## Invariant produit reflété dans le modèle

`declaredLevel` (hypothèse déclarée par l'apprenant) et `estimatedLevel` (futur
niveau estimé par COMPOSTELLE) sont **deux champs distincts**. `estimatedLevel` vaut
`null` à la création et n'est jamais dérivé du niveau déclaré. Ils ne doivent jamais
être fusionnés.

## Persistance durable (source de vérité)

La persistance suit un port/adaptateur ([ADR-0002](../decisions/adr/0002-durable-persistence-supabase.md)) :

```
UI → JourneyService (application) → JourneyRepository (port)
                                    → SupabaseJourneyRepository → PostgreSQL   (autoritaire)
                                    → InMemoryJourneyRepository                 (tests/stand-in)
     JourneyService ─ cache ─────→ localStorage (résilience + migration legacy)
```

- Le **domaine ne dépend jamais de Supabase** ; il ne connaît que `LanguageJourney`.
- **Postgres est la source de vérité** ; `localStorage` est un cache/résilience et la
  source de migration de l'ancienne clé.
- Modèle **user-scoped multi-langue** : `unique(user_id, language_code)`, une ligne
  par (utilisateur, langue) — changer de langue ne détruit aucun parcours.
- **Identité = Supabase Auth email + password** ; propriété `auth.uid()` ; **RLS owner-only**
  (aucun accès inter-usagers). En cache-only : id local anonyme, mono-appareil.
- Schéma + RLS : [`supabase/migrations/0001_create_journeys.sql`](../../supabase/migrations/0001_create_journeys.sql).
- Déploiement/provisionning : [`../operations/DEPLOYMENT.md`](../operations/DEPLOYMENT.md).
- Sans `.env` Supabase, l'app dégrade proprement en **cache-only**.

## Langue-agnostique

La langue est une **donnée** (`journey.language`, `content.language`), jamais codée
dans les composants. `selectDiscoveryFeed` filtre par langue (isolation stricte, y
compris `Surprise me`). Ajouter une langue = config `language.ts` + données de
contenu. Voir [ADR-0003](../decisions/adr/0003-language-agnostic-domain.md).

## Ce qui n'existe pas encore

Pas d'authentification, pas de moteur de recommandation/IA, pas d'UNDERSTAND /
RECALL / USE / MEMORY. Ces éléments seront documentés ici **quand** ils existeront.
