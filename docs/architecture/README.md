# Architecture

Ce document décrit l'architecture **telle qu'elle existe aujourd'hui** (US-01 +
US-02, fondation MVP). Les choix structurants sont tracés en **ADR**
([`../decisions/adr/`](../decisions/adr/README.md)) :
[ADR-0001](../decisions/adr/0001-frontend-foundation-and-local-persistence.md) socle,
[ADR-0002](../decisions/adr/0002-durable-persistence-supabase.md) persistance durable,
[ADR-0003](../decisions/adr/0003-language-agnostic-domain.md) domaine multilingue.

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
│  ├─ journey.ts    Parcours : types, validation, création (porte la langue)
│  ├─ content.ts    Contenu : types (porte la langue), getContentById
│  └─ discovery.ts  Sélection déterministe du feed, isolée par langue
├─ content/       Données de contenu (même schéma pour toutes les langues)
│  ├─ catalog.it.ts  Contenus italiens
│  ├─ catalog.es.ts  Contenus espagnols (preuve)
│  └─ catalog.ts     Catalogue combiné
├─ application/   Ports + orchestration, découplés du stockage
│  ├─ journeyRepository.ts  PORT — user-scoped multi-langue, aucune dép. Supabase
│  ├─ authService.ts        PORT — identité (magic-link), aucune dép. Supabase
│  └─ journeyService.ts     Durable autoritaire + cache + migration
├─ persistence/   Adaptateurs de stockage / auth
│  ├─ supabaseJourneyRepository.ts  Adaptateur PostgreSQL (+ mappers purs)
│  ├─ supabaseAuth.ts               Adaptateur Supabase Auth (magic-link)
│  ├─ supabaseClient.ts             Client env-driven (nullable)
│  ├─ inMemoryJourneyRepository.ts  Implémentation mémoire (tests/stand-in)
│  ├─ localJourneyCache.ts          Cache localStorage multi-langue + id local
│  ├─ journeyStorage.ts             localStorage (cache/migration legacy)
│  └─ createJourneyService.ts       Composition root (auth + service)
└─ ui/            Composants React ; ne portent aucune règle métier
   ├─ AuthScreen.tsx    Connexion email magic-link (mode durable)
   ├─ Onboarding.tsx    Choix langue + niveau + intérêts
   ├─ Discover.tsx      Conteneur feed↔content + barre de langues
   ├─ DiscoveryFeed.tsx Feed (mêmes composants pour toutes les langues)
   └─ ContentView.tsx   Vue de contenu minimale
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
- **Identité = Supabase Auth magic-link** ; propriété `auth.uid()` ; **RLS owner-only**
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
