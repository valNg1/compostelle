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

L'identité est gérée par **Supabase Auth (email + password)** ; la **RLS est owner-only**
(`user_id = auth.uid()`), aucun accès inter-usagers. Sans ces variables, l'app tourne
en **cache-only** (localStorage) — aucun secret requis en dev/CI. Détails :
[`supabase/README.md`](../../supabase/README.md).

## Correction grammaticale USE (LanguageTool, issue #5)

L'étape USE peut évaluer la **correction grammaticale de toute la phrase** et
proposer une **version corrigée** via **[LanguageTool](https://languagetool.org)**
(open-source, gratuit) auto-hébergé — aucune API payante, cohérent avec la
pédagogie déterministe (D-16).

1. Lancer une instance LanguageTool (ex. Docker) exposant `/v2/check` :
   ```bash
   docker run -d --name languagetool -p 8010:8010 erikvl87/languagetool
   ```
2. La rendre joignable en HTTPS (reverse proxy) puis renseigner
   `VITE_LANGUAGETOOL_URL=https://…/v2/check` dans `.env` (et les variables
   d'env de l'hébergeur).

**Sans cette variable**, l'app reste fonctionnelle : l'étape USE utilise un
**repli déterministe** (correction de surface : espaces, majuscule, ponctuation).
En cas d'erreur réseau du service, le même repli s'applique automatiquement.
Le contrat des 3 états (expression absente / à corriger / valide) est identique
dans les deux modes ; seule la profondeur de l'analyse grammaticale change.

## Déploiement

Cible : **`https://compostel.org`** (Vite SPA sur Vercel + Supabase). Le repo
contient `vercel.json` (build + rewrites SPA) prêt à l'emploi. **Le provisionnement
Supabase, la configuration des variables d'env sur l'hébergeur et le DNS de
`compostel.org` nécessitent une action PO** (comptes/accès) : procédure exacte pas à
pas dans **[`DEPLOYMENT.md`](DEPLOYMENT.md)** (OPEN-03).

Tant que ces actions PO ne sont pas faites, **aucun environnement de production n'est
en ligne** — la validation MVP (test d'acceptation runtime) reste en attente.
