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
3. Copy the project URL and anon key into a local `.env` (see `../.env.example`):
   ```
   VITE_SUPABASE_URL=https://<project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon-key>
   ```
   Never commit `.env`.

When these are unset the app runs cache-only (localStorage), so no secret is
required for local development or CI.

## Data model

`public.journeys` — one row per anonymous learner:

| column | type | notes |
|--------|------|-------|
| `learner_id` | `text` (PK) | opaque per-device id; no auth (MVP) |
| `language` | `text` | `it` / `es` |
| `declared_level` | `text` | learner hypothesis |
| `estimated_level` | `text` null | stays null — no fake estimation |
| `interests` | `text[]` | selected interests |
| `created_at` | `timestamptz` | journey creation |
| `updated_at` | `timestamptz` | maintained by trigger |

## Security note (OPEN-01)

RLS is enabled but the MVP policy is **permissive** (anon full access) to prove
durable data + two languages without building auth. This must be hardened before
launch (scope rows to their owner once auth or a signed learner claim exists).
