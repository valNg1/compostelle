# Tests / Recette

## Tests automatisés

Les tests s'exécutent avec **Vitest** :

```bash
npm test
```

Ils portent sur les **règles métier** et la **persistance** (fonctions pures, sans
DOM) :

| Fichier | Couvre |
|---------|--------|
| [`src/domain/journey.test.ts`](../../src/domain/journey.test.ts) | Validation (niveau requis, ≥ 1 intérêt), gestion de `UNKNOWN`, sélection multiple, séparation `declaredLevel` / `estimatedLevel`. |
| [`src/persistence/journeyStorage.test.ts`](../../src/persistence/journeyStorage.test.ts) | Round-trip sauvegarde/rechargement, séparation des deux niveaux persistés, données corrompues/invalides, stockage en erreur, effacement. |
| [`src/domain/discovery.test.ts`](../../src/domain/discovery.test.ts) | Sélection du feed (intérêts, multi-intérêts, `Surprise me`, fallback, catalogue vide, déterminisme, non-mutation du Journey). |
| [`src/domain/content.test.ts`](../../src/domain/content.test.ts) | `getContentById` (existant / inexistant), intégrité du catalogue. |

## Convention critères d'acceptation

Les **critères d'acceptation** de chaque US vivent **dans le fichier de l'US** (source
unique, non dupliquée). Traçabilité :

| US | Critères d'acceptation | Cahier de recette |
|----|------------------------|-------------------|
| US-01 | [Fiche US-01](../user-stories/US-01-create-language-journey.md#critères-dacceptation) | [recette-US-01.md](recette-US-01.md) |
| US-02 | [Fiche US-02](../user-stories/US-02-discover-something-interesting.md#critères-dacceptation) | [recette-US-02.md](recette-US-02.md) |

## Cahiers de recette

Après chaque évolution fonctionnelle, un **cahier de recette** manuel accompagne les
tests automatisés (scénarios pas-à-pas, pré-requis, résultats attendus). Ils sont
rangés ici sous `recette-<US>.md`.
