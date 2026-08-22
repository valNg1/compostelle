# Deployment — production (compostel.org)

The app is a static Vite SPA + Supabase (durable data & auth). Deployment and the
Supabase project require **PO account access** (hosting, DNS, Supabase). Claude Code
has prepared everything up to those steps; the actions below need the PO.

## A. Provision Supabase (PO action)

1. Go to <https://supabase.com> → **New project** (choose a region, set a DB password).
2. In the project, open **SQL Editor** → paste and run
   [`supabase/migrations/0001_create_journeys.sql`](../../supabase/migrations/0001_create_journeys.sql).
   This creates the `journeys` table (user-scoped, one row per language) and the
   owner-only RLS policies.
3. Open **Authentication → Providers → Email** and enable **Email** with
   **email + password** (turn OFF "Confirm email" for the MVP demo account, or
   confirm it manually). Then create the demo account under **Authentication →
   Users → Add user** (email + password). *Credentials live only in Supabase — never
   in Git.*
4. Open **Authentication → URL Configuration** and set the Site URL /
   redirect allow-list to include `http://localhost:5173` and `https://compostel.org`.
5. Open **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
   These go into your local `.env` (never commit) and the host env vars (step B).

## B. Deploy to Vercel and point compostel.org (PO action)

1. Go to <https://vercel.com> → **Add New → Project** → import
   `github.com/valNg1/compostelle`. Vercel auto-detects Vite; `vercel.json` sets the
   build (`npm run build`), output (`dist`) and SPA rewrites.
2. In **Project Settings → Environment Variables**, add (Production + Preview):
   - `VITE_SUPABASE_URL` = the Project URL from A.5
   - `VITE_SUPABASE_ANON_KEY` = the anon key from A.5
3. **Deploy**. Verify the `*.vercel.app` URL works first.
4. **Project Settings → Domains** → add `compostel.org` (and `www`). Follow Vercel's
   DNS instructions at your registrar (A/CNAME records). Wait for the TLS cert.
5. Redeploy if you added env vars after the first build.

> The anon key is public and safe in the client **because** RLS scopes every row to
> `auth.uid()`. Do not use the `service_role` key in the frontend.

## C. Production acceptance test (the real validation)

Once live at `https://compostel.org`:

1. **Session A**: sign in with the demo **email + password** → create an **Italian**
   journey → **+ Add a language** → create a **Spanish** journey → both visible in the
   language bar. Confirm two rows in Supabase `journeys` for your `auth.uid()`.
2. **Sign out**, then **clear the browser localStorage** (or use a clean browser).
3. **Session B**: sign in with the **same email + password** → both **Italian** and
   **Spanish** journeys are restored from Supabase → switch between them → correct
   content per language.
4. Check: no console errors; login/logout work; no cross-user access.

Record: deployed commit SHA, production URL, and the results above.
