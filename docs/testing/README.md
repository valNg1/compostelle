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
| [`src/persistence/journeyStorage.test.ts`](../../src/persistence/journeyStorage.test.ts) | Round-trip sauvegarde/rechargement, séparation des deux niveaux persistés, données corrompues, effacement. |

## Convention critères d'acceptation

Les **critères d'acceptation** de chaque US vivent **dans le fichier de l'US** (source
unique, non dupliquée). Traçabilité :

| US | Critères d'acceptation | Cahier de recette |
|----|------------------------|-------------------|
| US-01 | [Fiche US-01](../user-stories/US-01-create-language-journey.md#critères-dacceptation) | [recette-US-01.md](recette-US-01.md) |

## Cahiers de recette

Après chaque évolution fonctionnelle, un **cahier de recette** manuel accompagne les
tests automatisés (scénarios pas-à-pas, pré-requis, résultats attendus). Ils sont
rangés ici sous `recette-<US>.md`.
