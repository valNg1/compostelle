-- COMPOSTELLE — completed learning sessions history (HOME / MY JOURNEY)
--
-- Append-only record of finished Learning Units, per user, per language.
-- Owner-only RLS. Depends on 0001 (public.set_updated_at not needed here).

create extension if not exists "pgcrypto";

create table if not exists public.learning_activity (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users (id) on delete cascade,
  language_code    text        not null,
  learning_unit_id text        not null,
  unit_title       text        not null default '',
  recalled         integer     not null default 0,
  used             integer     not null default 0,
  completed_at     timestamptz not null default now()
);

create index if not exists learning_activity_user_lang_idx
  on public.learning_activity (user_id, language_code, completed_at desc);

alter table public.learning_activity enable row level security;

drop policy if exists "activity is owner-only (select)" on public.learning_activity;
create policy "activity is owner-only (select)"
  on public.learning_activity for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "activity is owner-only (insert)" on public.learning_activity;
create policy "activity is owner-only (insert)"
  on public.learning_activity for insert
  to authenticated
  with check (user_id = auth.uid());
