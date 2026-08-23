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
| [`src/application/signIn.test.ts`](../../src/application/signIn.test.ts) | Connexion email+password : succès (email trimé), mauvais identifiants → erreur propre (ne lève jamais), garde entrées vides. |
| [`src/application/journeyService.test.ts`](../../src/application/journeyService.test.ts) | Durable autoritaire scopé par `userId`, **restauration des 2 langues sans localStorage**, isolation inter-usagers, repli cache, seed durable, clear par langue. |
| [`src/persistence/durableRestore.test.ts`](../../src/persistence/durableRestore.test.ts) | Restauration durable (scénario PO IT=B2/ES=A2), durable > cache stale, **cache scopée par user** (pas de fuite). |
| [`src/domain/learning.test.ts`](../../src/domain/learning.test.ts) | `isPlayable`, self-check USE, découpage annoté (UNDERSTAND). |
| [`src/domain/memory.test.ts`](../../src/domain/memory.test.ts) | Transitions déterministes `nextState`, `summarize`. |
| [`src/content/catalog.learning.test.ts`](../../src/content/catalog.learning.test.ts) | Contenu jouable ≥ 2 par langue, recall bien formés, annotations/use valides. |
| [`src/domain/learningUnit.test.ts`](../../src/domain/learningUnit.test.ts) | Learning Unit canonique : `playableUnits`, `unitTopics`, `selectUnitForTheme` (déterministe, par langue), `memoryTargets` — START ne lance qu'une unité jouable. |
| [`src/domain/understand.test.ts`](../../src/domain/understand.test.ts) | **Densité UNDERSTAND adaptative** (débutant > avancé, pas de trivial au-dessus du niveau, ordre de lecture, UNKNOWN, legacy) + résolveurs i18n (annotation/recall/use). |
| [`src/domain/i18n.test.ts`](../../src/domain/i18n.test.ts) | `t()` FR/EN, interpolation, fallback EN, FR/EN prêts. |
| [`src/application/preferencesService.test.ts`](../../src/application/preferencesService.test.ts) | Préférence langue d'interface : durable + cache, restauration navigateur neuf, isolation par user, cache-only. |
| [`src/application/activityService.test.ts`](../../src/application/activityService.test.ts) | Historique des sessions : record + list (récent d'abord, limité), isolation user + langue, restauration durable, cache-only. |
| [`src/application/memoryService.test.ts`](../../src/application/memoryService.test.ts) | MEMORY durable : transitions, isolation user + langue, restauration navigateur neuf, cache-only. |
| [`src/persistence/supabaseMemoryRepository.test.ts`](../../src/persistence/supabaseMemoryRepository.test.ts) | Mappers purs mémoire (domaine ↔ PostgreSQL). |

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
