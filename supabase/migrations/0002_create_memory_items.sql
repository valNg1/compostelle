-- COMPOSTELLE — durable learning memory (US-06, MEMORY step)
--
-- One row per (user, language, expression): what a learner has met, looked up,
-- recalled and used, with a current state. Owned by the authenticated user and
-- isolated per language. RLS owner-only — no anonymous access, no cross-user reads.
--
-- Depends on 0001 (public.set_updated_at()).

create extension if not exists "pgcrypto";

create table if not exists public.memory_items (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users (id) on delete cascade,
  language_code    text        not null,
  expression       text        not null,
  meaning          text        not null default '',
  state            text        not null default 'NEW'
                     check (state in ('NEW', 'LEARNING', 'ACQUIRED', 'TO_REVIEW')),
  last_interaction timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, language_code, expression)
);

create index if not exists memory_items_user_lang_idx
  on public.memory_items (user_id, language_code);

drop trigger if exists memory_items_set_updated_at on public.memory_items;
create trigger memory_items_set_updated_at
  before update on public.memory_items
  for each row execute function public.set_updated_at();

alter table public.memory_items enable row level security;

drop policy if exists "memory is owner-only (select)" on public.memory_items;
create policy "memory is owner-only (select)"
  on public.memory_items for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "memory is owner-only (insert)" on public.memory_items;
create policy "memory is owner-only (insert)"
  on public.memory_items for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "memory is owner-only (update)" on public.memory_items;
create policy "memory is owner-only (update)"
  on public.memory_items for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "memory is owner-only (delete)" on public.memory_items;
create policy "memory is owner-only (delete)"
  on public.memory_items for delete
  to authenticated
  using (user_id = auth.uid());
