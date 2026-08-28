-- COMPOSTEL — sub-level unit progress (composite acquisition score)
--
-- One row per (user, language, unit) carrying the three signals, the composite
-- score and completion. The UI aggregates rows into sub-level scores and
-- acquisition. Owner-only RLS. Upserted on (user_id, language_code, unit_id).

create extension if not exists "pgcrypto";

create table if not exists public.unit_progress (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users (id) on delete cascade,
  language_code text        not null,
  sublevel_id   text        not null,
  unit_id       text        not null,
  quiz          real        not null default 0,
  reuse         real        not null default 0,
  corrections   real        not null default 0,
  score         real        not null default 0,
  completed     boolean     not null default false,
  updated_at    timestamptz not null default now(),
  unique (user_id, language_code, unit_id)
);

create index if not exists unit_progress_user_lang_idx
  on public.unit_progress (user_id, language_code, sublevel_id);

alter table public.unit_progress enable row level security;

drop policy if exists "unit_progress is owner-only (select)" on public.unit_progress;
create policy "unit_progress is owner-only (select)"
  on public.unit_progress for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "unit_progress is owner-only (insert)" on public.unit_progress;
create policy "unit_progress is owner-only (insert)"
  on public.unit_progress for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "unit_progress is owner-only (update)" on public.unit_progress;
create policy "unit_progress is owner-only (update)"
  on public.unit_progress for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
