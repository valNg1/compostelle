# ADR-0002 — Durable persistence with Supabase / PostgreSQL

- **Statut** : Accepted (révisé 2026-08-22 : modèle multi-parcours user-scoped)
- **Date** : 2026-08-22

## Contexte

`localStorage` ne peut pas être la source de vérité d'un MVP : les parcours doivent
survivre au navigateur. De plus, un apprenant doit pouvoir maintenir **plusieurs
parcours durables** (une langue = un parcours) sans qu'un changement de langue en
détruise un autre. La propriété des données doit être sûre (pas d'accès inter-usagers).

## Décision

Persistance durable **Supabase / PostgreSQL** derrière un port, avec un modèle
**user-scoped multi-langue** :

```
UI → application (JourneyService) → JourneyRepository (port)
                                     → SupabaseJourneyRepository → PostgreSQL
                                     → InMemoryJourneyRepository (tests/stand-in)
     JourneyService ─ cache ───────→ localStorage (résilience + migration legacy)
```

- **Schéma** ([`supabase/migrations/0001_create_journeys.sql`](../../../supabase/migrations/0001_create_journeys.sql)) :
  `journeys(id uuid pk, user_id uuid not null → auth.users, language_code text, …,
  unique(user_id, language_code))`. **Une ligne par (utilisateur, langue)** ;
  `user_id` n'est **pas** la clé primaire.
- **Propriété = `auth.uid()`** (identité via email + password, [ADR-0004](0004-auth-email-password.md)).
- **RLS owner-only** (select/insert/update/delete) : `user_id = auth.uid()`. **Aucun
  accès anonyme, aucune lecture inter-usagers.** (Remplace la politique permissive MVP
  initiale.)
- **Port** : [`journeyRepository.ts`](../../../src/application/journeyRepository.ts)
  (`listByUser`, `loadByLanguage`, `save`, `clear`) — aucune dépendance Supabase.
- **Adaptateur** : [`supabaseJourneyRepository.ts`](../../../src/persistence/supabaseJourneyRepository.ts)
  (upsert `onConflict user_id,language_code`, mappers purs testés).
- **Service** : durable **autoritaire** ; `localStorage` = cache/résilience/migration.
- Config env `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (`.env`, jamais commité) ;
  non configuré ⇒ cache-only avec un id local anonyme (dev/CI).

## Conséquences

- **Positives** : parcours multiples par utilisateur et par langue ; changement de
  langue non destructif ; propriété stricte par RLS (isolation prouvée au niveau
  repository, appliquée par Postgres) ; domaine découplé du stockage ; restauration
  indépendante de `localStorage` (tests service/repository) ; l'app tourne sans secret.
- **Négatives / limites** :
  - **OPEN-03** : provisionner un projet Supabase live + déployer restent des actions
    PO (voir [DEPLOYMENT.md](../../operations/DEPLOYMENT.md)). La preuve d'acceptation
    runtime (session A/B) exige ce projet live.
  - La clé anon est publique côté client — **sûre uniquement grâce à la RLS
    owner-only**. Ne jamais exposer `service_role`.

## Alternatives envisagées

- `learner_id` local unique / clé primaire `user_id` : rejeté — empêchait plusieurs
  langues et n'était pas une identité durable.
- `localStorage` / IndexedDB : rejeté — non durable, pas une source de vérité.
