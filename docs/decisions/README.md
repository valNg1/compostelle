# Décisions

Deux niveaux de traçabilité des décisions :

- **Journal de décisions** (ci-dessous) — décisions **produit / process** légères,
  utiles à retracer mais qui ne justifient pas une ADR.
- **ADR** ([`adr/`](adr/README.md)) — *Architecture Decision Records*, réservés aux
  choix **structurants** (techniques ou d'architecture).

## Journal de décisions

| # | Date | Décision | Contexte / raison |
|---|------|----------|-------------------|
| D-01 | 2026-08-21 | *(superseded par D-05)* Repository en Product Discovery ; aucun développement sans GO du PO. | Cadrage initial de gouvernance. |
| D-02 | 2026-08-21 | Séparer conceptuellement et physiquement `declaredLevel` et `estimatedLevel` (`estimatedLevel = null` au départ). | Invariant du modèle pédagogique (personnalisation). |
| D-03 | 2026-08-21 | Socle applicatif : Vite + React + TypeScript + Vitest, sans backend ni IA pour US-01. | Le plus léger et maintenable pour une tranche frontend testable. Voir [ADR-0001](adr/0001-frontend-foundation-and-local-persistence.md). |
| D-04 | 2026-08-21 | **Confirmée par le PO.** Valider un parcours exige un niveau déclaré **et** au moins un centre d'intérêt ; « Surprise me » est un choix valide. | COMPOSTELLE part de ce que l'utilisateur a réellement envie de lire : les intérêts participent directement à la promesse produit, ce ne sont pas une info de profil secondaire. « Surprise me » permet de poursuivre sans choisir un genre précis. |
| D-05 | 2026-08-21 | GO MVP donné par le PO : le développement est lancé, focalisé sur la 1ʳᵉ tranche de US-01. Supersede D-01. | Passage de Product Discovery à MVP Delivery. |
| D-06 | 2026-08-21 | **COMPOSTELLE is multimodal, not reading-only.** La lecture est une modalité (la première du MVP), pas la définition du produit. Boucle pédagogique générique : `DISCOVER → UNDERSTAND → RECALL → USE → MEMORY → JOURNEY`. Aucune nouvelle modalité développée pour l'instant. | La variété doit augmenter l'envie de revenir dans l'app ; la transmission ne dépend pas d'un seul média ; la lecture reste une modalité forte mais ne doit pas contraindre le futur produit ; le modèle pédagogique doit pouvoir supporter plusieurs types d'expériences. *(Décision produit/pédagogique — pas d'ADR : aucun choix d'architecture technique.)* |
| D-07 | 2026-08-21 | US-02 : sélection de découverte **par intérêts uniquement**, déterministe (pas d'adaptation au niveau CEFR dans cette tranche). `estimatedLevel` reste `null` ; aucune fausse estimation. | Le principe « the learner chooses, COMPOSTELLE adapts » exige à terme une adaptation au niveau, mais un moteur d'adaptation serait prématuré et non testable simplement. Choix **simple et réversible** : quand une vraie estimation existera, elle enrichira la sélection sans réécrire l'appelant. *(Décision de logique métier locale — pas d'ADR.)* |
| D-08 | 2026-08-22 | **Product renamed from LONTANO to COMPOSTELLE.** `lontano` était le nom initial / de travail ; `compostelle` devient le nom officiel du produit et du repository (`github.com/valNg1/compostelle`). Clé de persistance migrée `lontano.journey.v1` → `compostelle.journey.v1` (migration legacy, sans perte de parcours). | Le renommage ne modifie **ni la vision produit, ni le modèle pédagogique, ni la stack** : c'est une décision produit (branding), pas un ADR. *(Le PO avait suggéré l'identifiant D-07 ; celui-ci était déjà attribué à la décision de sélection de découverte lors de la session autonome interrompue — le renommage est donc enregistré en D-08.)* |
| D-09 | 2026-08-22 | **Official public domain is `compostel.org`** (`https://compostel.org`). La marque reste **COMPOSTELLE** ; `compostel.org` est la forme courte du domaine public. La marque n'est **pas** renommée en `COMPOSTEL`. | `compostel.org` est simplement la forme courte retenue pour l'adresse publique. Ce choix ne modifie ni le produit, ni le modèle pédagogique, ni l'architecture, ni le repository (`github.com/valNg1/compostelle`). *(Décision produit/branding — pas d'ADR.)* |
| D-10 | 2026-08-22 | **Persistance durable via Supabase/PostgreSQL** derrière une interface repository ; `localStorage` rétrogradé en cache/résilience/migration, plus source de vérité. | Prérequis MVP posé par le PO. Voir [ADR-0002](adr/0002-durable-persistence-supabase.md). |
| D-11 | 2026-08-22 | **Domaine langue-agnostique (it + es)** : la langue est une donnée du parcours et du contenu ; `selectDiscoveryFeed` isole par langue ; mêmes composants pour toutes les langues. | Prérequis MVP posé par le PO. Voir [ADR-0003](adr/0003-language-agnostic-domain.md). |
| D-12 | 2026-08-22 | **Le MVP n'est pas validé** tant que COMPOSTELLE n'a pas prouvé (a) des données apprenant **durables** et (b) **au moins deux langues cibles** avec la **même structure applicative**. US-02 reste `Implemented — awaiting MVP foundation validation`. | Verrou de validation explicite demandé par le PO. Les preuves (a) et (b) sont livrées ; la connexion Supabase live et le durcissement RLS restent (OPEN-01/02/03). |

## Points ouverts (décisions PO / OPEN)

Ces points nécessitent une décision du Product Owner ou une action infra ; ils ne
bloquent pas les preuves déjà livrées mais conditionnent la validation finale.

| # | Question | Options | Recommandation | Impact | Bloquant ? |
|---|----------|---------|----------------|--------|------------|
| OPEN-01 | Politique RLS Supabase | Permissive anon (MVP) / scopée par propriétaire (auth) | Durcir avant tout lancement public | Sécurité des données | Non pour la preuve, **oui avant prod** |
| OPEN-02 | Identité apprenant | `learnerId` local (actuel) / auth / code de restauration | Introduire une identité stable pour la récupération cross-effacement | Récupération durable après vidage complet du navigateur (Scénario D en conditions réelles) | Non pour l'architecture, **oui pour la démo end-to-end** |
| OPEN-03 | Projet Supabase live | Provisionner un projet + `.env` | Fournir URL + anon key | Active réellement le durable en runtime (sinon cache-only) | **Oui pour prouver le durable en runtime** |
| OPEN-04 | Sélecteur de langue à l'onboarding | Ajouté (it/es) | Confirmer l'UX du choix de langue | Parcours d'entrée | Non |
