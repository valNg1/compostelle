# US-06 — Build my memory

- **ID** : US-06
- **Statut** : Implemented · Awaiting PO validation
- **Étape de la boucle** : MEMORY

## User story

> As a learner, I want COMPOSTELLE to remember what I am learning, so that my
> future sessions build on my previous ones.

## Règles / périmètre

- États : `NEW → LEARNING → ACQUIRED`, avec branche `TO_REVIEW` (pas d'algorithme de
  spaced repetition complet — transitions déterministes).
- Le système sait : les éléments rencontrés, consultés (UNDERSTAND), utilisés
  (RECALL/USE), leur état, leur langue, leur dernière interaction.
- Mémoire **durable** : liée à `auth.uid()`, isolée par utilisateur ET par langue,
  RLS owner-only, restaurée sur un autre navigateur.

## Acceptance criteria

- [x] Transitions déterministes (`nextState`) selon les signaux du parcours.
- [x] Persistance durable Supabase (`memory_items`), unique(user_id, language_code,
  expression), RLS owner-only.
- [x] Isolation par utilisateur et par langue (tests) ; restauration sur navigateur
  neuf depuis le durable.
- [x] Mode cache-only fonctionnel sans Supabase.

## Implementation notes

- Domaine : [`domain/memory.ts`](../../src/domain/memory.ts) (états, `nextState`,
  `summarize`).
- Persistance : port [`application/memoryRepository.ts`](../../src/application/memoryRepository.ts),
  service [`memoryService.ts`](../../src/application/memoryService.ts), adaptateurs
  in-memory + Supabase, cache localStorage scopée user+langue.
- Migration : [`supabase/migrations/0002_create_memory_items.sql`](../../supabase/migrations/0002_create_memory_items.sql).
