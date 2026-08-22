# COMPOSTELLE

**COMPOSTELLE helps you learn a language through things worth discovering.**
*(formulation de travail — pas une tagline définitive)*

- **Brand:** COMPOSTELLE
- **Official domain:** https://compostel.org
- **Public domain (short form):** compostel.org
- **Repository:** https://github.com/valNg1/compostelle.git

COMPOSTELLE est une application d'apprentissage des langues fondée sur
**CONTENTS + TRANSMISSION + PERSONALISATION** : apprendre une langue à travers des
contenus qui ont une valeur propre (histoire, culture, fiction, voyage, actualité,
sport, vie quotidienne…). La pédagogie soutient la découverte, et non l'inverse.

**Ce n'est pas une application de lecture.** La lecture est une modalité importante —
et la première du MVP — mais le produit est pensé comme **multimodal** (lire,
écouter, explorer, interagir…). Voir la décision [D-06](docs/decisions/README.md).

Boucle pédagogique :

```
DISCOVER → UNDERSTAND → RECALL → USE → MEMORY → JOURNEY
```

---

## Phase actuelle : MVP DELIVERY

- **US-01 « Create my language journey »** : `Done` (validée PO).
- **US-02 « Discover something interesting »** : `Implemented — awaiting MVP
  foundation validation`.
- **Modalité** : la lecture (première du MVP). Pas d'autre modalité, pas de moteur IA.
- **Langues cibles** : **Italian (`it`) + Spanish (`es`)** via la **même** structure
  applicative (D-11 / [ADR-0003](docs/decisions/adr/0003-language-agnostic-domain.md)).
- **Persistance durable** : Supabase / PostgreSQL comme source de vérité derrière une
  interface repository ; `localStorage` = cache/résilience/migration (D-10 /
  [ADR-0002](docs/decisions/adr/0002-durable-persistence-supabase.md)). Sans `.env`
  Supabase, l'app tourne en cache-only.

> **Le MVP n'est pas validé** tant que COMPOSTELLE n'a pas prouvé **des données
> apprenant durables** ET **au moins deux langues cibles** avec la **même structure
> applicative** (D-12). Ces preuves sont livrées ; restent la connexion Supabase live
> et le durcissement RLS (voir OPEN-01/02/03 dans les décisions).

Le repository documente **ce qui existe réellement**, jamais une architecture
imaginée pour plus tard.

---

## Gouvernance

| Rôle | Personne / agent | Responsabilité |
|------|------------------|----------------|
| Product Owner | Valéry | Vision, arbitrages, validation |
| Directeur Technique | ChatGPT | Conception produit/pédagogique, technique |
| Développeur full-stack & mainteneur | Claude Code | Maintien opérationnel du repository |

Ce repository Git est le **référentiel officiel** du projet.

---

## Application

Socle technique : **Vite + React + TypeScript + Vitest**. Domaine en fonctions pures
séparé de l'UI ; persistance derrière une interface repository (durable Supabase +
cache local). Détails : [`docs/architecture/`](docs/architecture/README.md).

```bash
npm install       # installer les dépendances
npm run dev       # lancer l'app en développement
npm test          # exécuter les tests
npm run build     # build de production
npm run typecheck # vérification des types
```

Persistance durable (optionnelle en dev) : copier `.env.example` → `.env` et
renseigner `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (voir
[`supabase/`](supabase/README.md)). Sans ces variables, l'app tourne en cache-only.

Structure du code :

```
src/
├─ domain/        # modèle métier pur : journey, language, content, discovery
├─ content/       # données : catalog.it.ts + catalog.es.ts (+ catalog.ts)
├─ application/   # port JourneyRepository + JourneyService (orchestration)
├─ persistence/   # adaptateurs : Supabase, in-memory, cache localStorage
└─ ui/            # composants React (Onboarding, Discover, DiscoveryFeed, ContentView)
```

---

## Documentation

| Domaine | Emplacement |
|---------|-------------|
| Vision produit | [`docs/product/vision.md`](docs/product/vision.md) |
| Modèle pédagogique | [`docs/product/pedagogical-model.md`](docs/product/pedagogical-model.md) |
| Product Backlog | [`docs/product/backlog.md`](docs/product/backlog.md) |
| User Stories | [`docs/user-stories/`](docs/user-stories/README.md) |
| Architecture | [`docs/architecture/`](docs/architecture/README.md) |
| Décisions (ADR + journal) | [`docs/decisions/`](docs/decisions/README.md) |
| Tests / Cahiers de recette | [`docs/testing/`](docs/testing/README.md) |
| Opérations | [`docs/operations/`](docs/operations/README.md) |

---

## Question fondamentale du MVP

Tout arbitrage fonctionnel se juge à cette aune :

> Est-ce que COMPOSTELLE donne envie de revenir apprendre demain, parce que l'expérience
> est intéressante, personnalisée et réellement utile ?
