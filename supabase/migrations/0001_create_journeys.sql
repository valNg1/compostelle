-- COMPOSTELLE — durable learner journeys (US-02 MVP foundation)
--
-- One row per anonymous learner (keyed by an opaque per-device id). This is the
-- authoritative source of truth; the browser localStorage is only a cache.

create table if not exists public.journeys (
  learner_id     text        primary key,
  language       text        not null,
  declared_level text        not null,
  estimated_level text,                 -- nullable: no fake estimation (D-02/D-07)
  interests      text[]      not null default '{}',
  created_at     timestamptz not null,
  updated_at     timestamptz not null default now()
);

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

-- Row Level Security.
alter table public.journeys enable row level security;

-- MVP (anonymous, no auth yet): the anon role may manage rows.
-- WARNING: permissive on purpose for the two-language / durable-data proof.
-- MUST be hardened before any real launch — scope rows to their owner once auth
-- (or a signed learner-scoped policy) exists. Tracked as OPEN-01 / ADR-0002.
drop policy if exists "anon full access to journeys" on public.journeys;
create policy "anon full access to journeys"
  on public.journeys
  for all
  to anon
  using (true)
  with check (true);
