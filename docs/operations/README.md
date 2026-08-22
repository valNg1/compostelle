# Opérations

## Exécution locale

Les commandes pour lancer, tester et builder l'application sont dans le
[README](../../README.md#application-us-01) (`npm run dev`, `npm test`,
`npm run build`).

## Domaine officiel

Le domaine public officiel est **`https://compostel.org`** (décision
[D-09](../decisions/README.md)). La marque reste **COMPOSTELLE** ; `compostel.org`
en est la forme courte. C'est la cible sous laquelle l'application devra être servie
lors du premier déploiement.

## Persistance durable (Supabase / PostgreSQL)

Source de vérité des parcours (ADR-0002). Configuration :

1. Créer un projet Supabase et appliquer
   [`supabase/migrations/0001_create_journeys.sql`](../../supabase/migrations/0001_create_journeys.sql).
2. Copier `.env.example` → `.env` et renseigner `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY` (**jamais commité** ; `.env` est gitignoré).

Sans ces variables, l'app tourne en **cache-only** (localStorage) — aucun secret
requis en dev/CI. Détails : [`supabase/README.md`](../../supabase/README.md).

> **OPEN-01 (sécurité)** : la politique RLS MVP est permissive (anon) et doit être
> durcie avant tout lancement public.

## Déploiement

**Aucun déploiement à ce jour.** L'application fonctionne en local avec une
persistance navigateur ; il n'y a ni environnement hébergé, ni backend, ni base de
données à exploiter. Aucune configuration DNS/hébergement n'est donc créée à ce
stade — seul le domaine officiel est enregistré ci-dessus.

La documentation d'exploitation (environnements, hébergement, supervision, runbooks,
sauvegardes) sera renseignée ici lorsqu'un premier déploiement sera décidé, avec
`compostel.org` comme domaine cible.
