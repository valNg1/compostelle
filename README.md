# LONTANO

**Learn a language by reading what you actually want to read.**

LONTANO est une application d'apprentissage des langues par la **lecture assistée et
personnalisée**. Son principe fondateur est la **TRANSMISSION** : donner accès à une
langue par ce qu'elle permet de lire, comprendre, découvrir, mémoriser et explorer
d'une culture.

Boucle pédagogique :

```
READ → UNDERSTAND → RECALL → MEMORY → JOURNEY
```

---

## Phase actuelle : MVP DELIVERY

Le Product Owner a donné le **GO** pour développer le MVP. Le développement est
lancé, focalisé sur une **première tranche verticale de US-01**.

Périmètre volontairement resserré à ce stade :

- première langue : **Italian** ;
- pas de backend, pas de moteur IA, pas de US-02+ ;
- persistance **locale** (navigateur) pour US-01.

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

## Application (US-01)

Socle technique : **Vite + React + TypeScript + Vitest**. Le modèle métier est en
fonctions pures, séparé de l'UI ; la persistance est injectable et locale. Détails :
[`docs/architecture/`](docs/architecture/README.md).

```bash
npm install       # installer les dépendances
npm run dev       # lancer l'app en développement
npm test          # exécuter les tests (règles métier + persistance)
npm run build     # build de production
npm run typecheck # vérification des types
```

Structure du code :

```
src/
├─ domain/        # modèle métier pur (journey.ts) + tests
├─ persistence/   # persistance locale injectable + tests
└─ ui/            # composants React (Onboarding, JourneySummary)
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

> Est-ce que cette expérience donne envie à l'utilisateur de revenir lire demain,
> tout en lui permettant réellement d'apprendre ?
