-- COMPOSTELLE — durable learner journeys (US-02 MVP foundation)
--
-- One row per (user, target language): a learner keeps SEPARATE durable journeys
-- for Italian, Spanish, and any future language. Switching language never
-- destroys another language's journey.
--
-- Ownership is the authenticated Supabase user (auth.uid()). RLS scopes every
-- row to its owner — no anonymous access, no cross-user reads.

create extension if not exists "pgcrypto";

create table if not exists public.journeys (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users (id) on delete cascade,
  language_code   text        not null,
  declared_level  text        not null,
  estimated_level text,                 -- nullable: no fake estimation (D-02/D-07)
  interests       text[]      not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, language_code)
);

create index if not exists journeys_user_id_idx on public.journeys (user_id);

-- Keep updated_at fresh on every write.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists journeys_set_updated_at on public.journeys;
create trigger journeys_set_updated_at
  before update on public.journeys
  for each row execute function public.set_updated_at();

-- Row Level Security: a row belongs to exactly one authenticated user.
alter table public.journeys enable row level security;

drop policy if exists "journeys are owner-only (select)" on public.journeys;
create policy "journeys are owner-only (select)"
  on public.journeys for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "journeys are owner-only (insert)" on public.journeys;
create policy "journeys are owner-only (insert)"
  on public.journeys for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "journeys are owner-only (update)" on public.journeys;
create policy "journeys are owner-only (update)"
  on public.journeys for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "journeys are owner-only (delete)" on public.journeys;
create policy "journeys are owner-only (delete)"
  on public.journeys for delete
  to authenticated
  using (user_id = auth.uid());
