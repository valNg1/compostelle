# ADR-0002 — Durable persistence with Supabase / PostgreSQL

- **Statut** : Accepted
- **Date** : 2026-08-22

## Contexte

`localStorage` ne peut pas rester la source de vérité d'un MVP : les parcours des
apprenants doivent survivre au navigateur (autre appareil, cache vidé, session
différente). Le PO a fait de la persistance durable un prérequis de validation du MVP.

Contraintes : ne pas coupler le domaine à une techno de stockage ; pas
d'authentification à ce stade ; l'app doit continuer à fonctionner sans backend
configuré (dev/CI).

## Décision

Introduire une **persistance durable via Supabase / PostgreSQL**, derrière une
interface (port) que le domaine et l'application ne connaissent que de façon
abstraite :

```
UI → application (JourneyService) → JourneyRepository (port)
                                     → SupabaseJourneyRepository → PostgreSQL
                                     → InMemoryJourneyRepository (tests/stand-in)
```

- **Port** : [`src/application/journeyRepository.ts`](../../../src/application/journeyRepository.ts)
  (`load/save/clear` par `learnerId`, async). Aucune dépendance Supabase.
- **Adaptateur** : [`src/persistence/supabaseJourneyRepository.ts`](../../../src/persistence/supabaseJourneyRepository.ts)
  avec des mappers `toRow`/`fromRow` **purs** (testés sans client live).
- **Service applicatif** : [`src/application/journeyService.ts`](../../../src/application/journeyService.ts)
  — le durable est **autoritaire** ; `localStorage` devient un **cache /
  résilience / source de migration legacy**, jamais la source de vérité. Au load :
  durable d'abord ; repli sur le cache si injoignable ; remontée opportuniste du
  cache/legacy vers le durable.
- **Identité** : un `learnerId` anonyme par appareil (UUID en `localStorage`) sert de
  clé, ce qui permet le durable **sans authentification**.
- **Schéma** : [`supabase/migrations/0001_create_journeys.sql`](../../../supabase/migrations/0001_create_journeys.sql).
- **Config** : variables d'env `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
  (`.env`, jamais commité). Non configuré ⇒ l'app tourne en cache-only.

## Conséquences

- **Positives** : domaine découplé du stockage ; restauration possible
  indépendamment de `localStorage` (prouvé par les tests du repository/service) ;
  migration future vers auth/multi-appareil sans réécrire l'appelant ; l'app reste
  exécutable sans secret.
- **Négatives / limites** :
  - **OPEN-01 (sécurité)** : RLS activée mais **politique permissive** (anon) pour la
    preuve MVP — **à durcir** avant tout lancement (scoping par propriétaire une fois
    l'auth ou une claim signée disponibles).
  - **OPEN-02 (identité)** : le `learnerId` vit dans `localStorage`. Un effacement
    complet du navigateur perd le pointeur ; la récupération durable cross-effacement
    exige une identité stable (auth ou « code de restauration ») — décision PO.
  - **OPEN-03 (infra)** : aucun projet Supabase provisionné à ce jour ; brancher un
    projet réel (URL + anon key) est une action PO/infra. Tant que non configuré,
    l'app reste en cache-only.

## Alternatives envisagées

- **Rester en `localStorage`** : rejeté — non durable, contraire au prérequis MVP.
- **IndexedDB** : rejeté — toujours local au navigateur, pas une source de vérité
  durable.
- **Backend maison** : rejeté — plus lourd que nécessaire ; Supabase fournit
  Postgres + API managés pour l'échelle d'un MVP.
