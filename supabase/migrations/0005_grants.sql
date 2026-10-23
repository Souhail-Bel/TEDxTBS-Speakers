-- 0005: explicit table-level grants for the `authenticated` role.
--
-- This project has Supabase's "Automatically expose new tables" setting
-- turned off (deliberately, for manual access control). With it off,
-- Supabase does NOT run its usual default grants when a migration creates
-- a table, so the `authenticated` role has zero base privileges on any
-- table here — every query fails with "permission denied for table X"
-- (Postgres error 42501), regardless of what Row Level Security policies
-- say. RLS narrows which *rows* a query can touch; it is evaluated only
-- after Postgres has already confirmed the role may touch the table at
-- all, so RLS can't substitute for this.
--
-- Nothing is granted to `anon` here: every policy in 0002_rls.sql is
-- `to authenticated`, so unauthenticated access should stay impossible
-- regardless of table-level grants.
--
-- IMPORTANT: any future migration that adds a new table needs its own
-- grant statement here (or in that migration) for the same reason —
-- "Automatically expose new tables" being off is permanent for this
-- project, not a one-time setup step.

grant usage on schema public to authenticated;

grant select, insert, update, delete on table public.profiles         to authenticated;
grant select, insert, update, delete on table public.speakers         to authenticated;
grant select, insert, update, delete on table public.speaker_links    to authenticated;
grant select, insert, update, delete on table public.tags             to authenticated;
grant select, insert, update, delete on table public.speaker_tags     to authenticated;
grant select, insert, update, delete on table public.speaker_trackers to authenticated;
grant select, insert, update, delete on table public.comments         to authenticated;
grant select, insert, update, delete on table public.audit_log        to authenticated;
grant select, insert, update, delete on table public.event_settings   to authenticated;