# TEDxTBS Speaker Coordination Platform

Internal tool for the TEDxTBS speaker coordination team: track speakers, log
progress in comments, manage the team, and keep an audit trail — all behind
Supabase Auth with reCAPTCHA.

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS, deployed on Vercel
- **Backend:** Supabase (Postgres + Auth + Storage + Realtime)

This guide assumes neither a Supabase project nor a Vercel project exists
yet. Follow it top to bottom once; after that, every `git push` to `main`
redeploys automatically.

---

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Pick an org, name it (e.g. `tedxtbs-speakers`), set a strong database
   password (save it somewhere safe — you won't need it day to day, but
   you'll want it if you ever connect a DB client directly), and choose a
   region close to Tunisia (e.g. `eu-central-1`).
3. Wait for the project to finish provisioning (~2 minutes).

### Run the database migrations

The schema, Row Level Security policies, storage bucket, and Realtime
publication are defined as SQL files in `supabase/migrations/`, in order:

1. `0001_schema.sql` — tables, enums, triggers
2. `0002_rls.sql` — Row Level Security policies (this is what enforces the
   admin/member split at the database level, not just in the UI)
3. `0003_storage.sql` — the `speaker-photos` storage bucket
4. `0004_realtime.sql` — enables live updates

**Easiest path (no CLI install needed):** open your Supabase project →
**SQL Editor** → paste the contents of each file in order → **Run**. Do
this four times, once per file, in order.

**If you prefer the CLI:**

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>   # found in Project Settings > General
supabase db push
```

### Get your API keys

Project Settings → **API**:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** (click to reveal) → `SUPABASE_SERVICE_ROLE_KEY`

The service role key bypasses Row Level Security entirely. It's only ever
used server-side (inviting team members, confirming permanent deletions) —
never commit it, never expose it to the browser.

### Turn off public sign-ups

The platform only ever creates accounts through admin invites, but as a
safety net: **Authentication → Providers → Email** → turn off
"Allow new users to sign up". Also disable any other auth providers you
don't need (Google, GitHub, etc.) so email/password is the only path in.

### Configure email sending (for invites and password resets)

Supabase's built-in email sender works out of the box but has a low daily
send limit, fine for a small team. **Authentication → Email Templates** —
you can customize the "Invite user" and "Reset password" templates if
you'd like TEDxTBS branding on them. If invites ever stop arriving (hit the
free limit), go to **Authentication → Settings → SMTP Settings** and plug
in a provider like Resend, SendGrid, or Postmark.

**Authentication → URL Configuration** — set:
- **Site URL** to your production URL once you have it (step 3), e.g.
  `https://tedxtbs-speakers.vercel.app`
- **Redirect URLs** — add `http://localhost:3000/**` for local development
  and your production URL + `/**` once deployed.

---

## 2. Create the reCAPTCHA keys

1. Go to the [reCAPTCHA admin console](https://www.google.com/recaptcha/admin).
2. **Create** a new site, type **reCAPTCHA v2 → "I'm not a robot" Checkbox**.
3. Add both domains you'll use: `localhost` and your Vercel domain (e.g.
   `tedxtbs-speakers.vercel.app`).
4. Copy the **Site key** → `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
5. Copy the **Secret key** → `RECAPTCHA_SECRET_KEY`

---

## 3. Local development

```bash
npm install
cp .env.local.example .env.local
# fill in the five values from steps 1 and 2 above
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on the
login page. You don't have an account yet; create your own as the first
admin (next step).

### Creating the first admin account

There's no sign-up page on purpose, so the very first account has to be
created directly in Supabase:

1. Supabase dashboard → **Authentication → Users → Add user → Create new user**.
2. Enter your email, set a password, and check **Auto Confirm User**.
3. Under **User Metadata**, add:
   ```json
   { "full_name": "Your Name", "role": "admin" }
   ```
4. Save. A matching row is created automatically in the `profiles` table
   (via a database trigger) with the `admin` role.
5. Log in at `/login` with that email and password.

From here on, you (and the speaker coordinator, who you should set up the
same way) can invite the rest of the team from the **Team** page in the app
— no more manual Supabase steps needed for new teammates.

---

## 4. Deploy to Vercel

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. Vercel auto-detects Next.js — no build settings to change.
4. Add the same five environment variables from `.env.local` under
   **Settings → Environment Variables** (Production, and Preview if you
   want preview deploys to work too).
5. Deploy.
6. Go back to Supabase **Authentication → URL Configuration** and make sure
   your real Vercel URL is in **Site URL** and **Redirect URLs** (see step 1)
   — invite and password-reset links are built from this.

That's it — every push to `main` redeploys automatically.

---

## How the pieces fit together

- **Auth & roles** — Supabase Auth handles login; a `profiles` table (one
  row per `auth.users` row, kept in sync by a trigger) stores `role`
  (`admin` or `member`). Row Level Security policies, not just UI checks,
  enforce what each role can read/write.
- **Soft delete** — a team member "deleting" a speaker just sets
  `deleted_at`/`deleted_by`; it disappears from the main list but stays in
  the admin-only **Trash** page until an admin restores it or confirms
  permanent deletion.
- **Audit log** — every speaker and team-member mutation writes a row to
  `audit_log`, visible only to admins.
- **Realtime** — the speaker list, board, and detail page subscribe to
  Postgres changes on the relevant tables and refetch automatically, so
  the whole team sees updates live.
- **Photos** — cropped to a square and compressed in the browser before
  upload, so nothing oversized ever touches Supabase Storage.

## Project structure

```
src/
  app/
    login/, reset-password/        — public auth pages
    (app)/                         — everything behind auth (shared layout + nav)
      page.tsx                     — speaker list (table/board, filters)
      speakers/[id]/                — speaker detail (comments, tracking, status)
      team/, trash/, audit-log/     — admin-only pages
      settings/                     — event date + your own profile/password
    api/                            — server-only routes (invite, team edits, auth)
  components/                       — UI building blocks, by feature folder
  lib/
    supabase/                       — browser/server/proxy Supabase clients
    speakers/, team/, audit/        — data queries + mutations
    auth/                           — profile/role helpers, reCAPTCHA verification
supabase/migrations/                 — the database schema, run in order
```
