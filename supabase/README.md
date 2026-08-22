# Supabase (durable persistence)

Durable source of truth for learner journeys (US-02 MVP foundation). See
[ADR-0002](../docs/decisions/adr/0002-durable-persistence-supabase.md).

## Setup

1. Create a Supabase project (PostgreSQL).
2. Apply the migration in [`migrations/0001_create_journeys.sql`](migrations/0001_create_journeys.sql)
   via the Supabase SQL editor or the Supabase CLI:
   ```bash
   supabase db push
   ```
3. Enable **Email (magic link)** auth (Authentication → Providers → Email) and add
   your dev/prod URLs to the redirect allow-list.
4. Copy the project URL and anon key into a local `.env` (see `../.env.example`):
   ```
   VITE_SUPABASE_URL=https://<project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon-key>
   ```
   Never commit `.env`.

Full step-by-step (incl. production + `compostel.org`):
[`../docs/operations/DEPLOYMENT.md`](../docs/operations/DEPLOYMENT.md). When these are
unset the app runs cache-only (localStorage), so no secret is required for dev/CI.

## Data model

`public.journeys` — **one row per (user, language)**; a user keeps separate journeys:

| column | type | notes |
|--------|------|-------|
| `id` | `uuid` (PK) | `gen_random_uuid()` |
| `user_id` | `uuid` not null | owner → `auth.users(id)`; **not** the PK |
| `language_code` | `text` | `it` / `es` |
| `declared_level` | `text` | learner hypothesis |
| `estimated_level` | `text` null | stays null — no fake estimation |
| `interests` | `text[]` | selected interests |
| `created_at` / `updated_at` | `timestamptz` | `updated_at` by trigger |

`UNIQUE(user_id, language_code)` — one journey per language per user.

## Security model

RLS is **owner-only**: every SELECT/INSERT/UPDATE/DELETE requires
`user_id = auth.uid()`. No anonymous access; **no user can read another user's
journey**. The anon key is public and safe in the client precisely because of this
RLS. Never expose the `service_role` key in the frontend.
