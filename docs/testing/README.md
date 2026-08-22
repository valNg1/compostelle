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
| [`src/domain/discovery.test.ts`](../../src/domain/discovery.test.ts) | Sélection du feed (intérêts, multi-intérêts, `Surprise me`, fallback, vide, déterminisme, non-mutation) **+ isolation par langue** (`Surprise me`/fallback ne traversent jamais la langue). |
| [`src/domain/discovery.catalog.test.ts`](../../src/domain/discovery.catalog.test.ts) | Garde-fous d'intégration sur le vrai catalogue, it **et** es. |
| [`src/domain/content.test.ts`](../../src/domain/content.test.ts) | `getContentById`, intégrité du catalogue, langues valides (it + es présents). |
| [`src/persistence/inMemoryJourneyRepository.test.ts`](../../src/persistence/inMemoryJourneyRepository.test.ts) | CRUD durable **user-scoped multi-langue** : it + es coexistent, maj es ne mute pas it, load it→it / es→es, **isolation inter-usagers**, clear par langue, copie défensive. |
| [`src/persistence/supabaseJourneyRepository.test.ts`](../../src/persistence/supabaseJourneyRepository.test.ts) | Mappers purs `toRow`/`fromRow` (domaine ↔ PostgreSQL, colonnes `user_id`/`language_code`), round-trip. |
| [`src/persistence/localJourneyCache.test.ts`](../../src/persistence/localJourneyCache.test.ts) | Cache multi-langue (un parcours par langue), langue courante, **migration legacy** (parcours unique → v2, sans perte). |
| [`src/persistence/createJourneyService.test.ts`](../../src/persistence/createJourneyService.test.ts) | Fallback cache-only sans Supabase (pas d'auth, pas de durable). |
| [`src/application/journeyService.test.ts`](../../src/application/journeyService.test.ts) | Durable autoritaire scopé par `userId`, **restauration des 2 langues sans localStorage**, isolation inter-usagers, repli cache, seed durable, clear par langue. |

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
