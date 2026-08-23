-- COMPOSTELLE — per-user preferences (interface language)
--
-- The interface language (how COMPOSTELLE explains/translates) is a per-user
-- preference, independent of journeys. One row per user, owner-only RLS.

create extension if not exists "pgcrypto";

create table if not exists public.user_preferences (
  user_id            uuid        primary key references auth.users (id) on delete cascade,
  interface_language text        not null default 'en',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

drop trigger if exists user_preferences_set_updated_at on public.user_preferences;
create trigger user_preferences_set_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

alter table public.user_preferences enable row level security;

drop policy if exists "preferences are owner-only (select)" on public.user_preferences;
create policy "preferences are owner-only (select)"
  on public.user_preferences for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "preferences are owner-only (insert)" on public.user_preferences;
create policy "preferences are owner-only (insert)"
  on public.user_preferences for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "preferences are owner-only (update)" on public.user_preferences;
create policy "preferences are owner-only (update)"
  on public.user_preferences for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
