# COMPOSTELLE

**COMPOSTELLE helps you learn a language through things worth discovering.**
*(formulation de travail — pas une tagline définitive)*

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

Le Product Owner a donné le **GO** pour développer le MVP. Le développement est
lancé, focalisé sur une **première tranche verticale de US-01**.

Périmètre volontairement resserré à ce stade :

- première langue : **Italian** ;
- **une seule modalité concrète (lecture)** suffit pour le MVP — les autres
  modalités ne sont pas développées ;
- pas de backend, pas de moteur IA, pas de US-02+ ;
- persistance **locale** (navigateur) pour US-01.

> US-01 « Create my language journey » est **DONE**. La prochaine US sera
> **redéfinie** par le PO et ChatGPT à partir du modèle produit multimodal (D-06)
> avant tout développement.

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

> Est-ce que COMPOSTELLE donne envie de revenir apprendre demain, parce que l'expérience
> est intéressante, personnalisée et réellement utile ?
