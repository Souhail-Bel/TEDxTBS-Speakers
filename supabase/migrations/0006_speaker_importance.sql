-- 0006: speaker importance tiers (S/A/B/C/F). Fixed set, not admin-editable —
-- unlike tags/statuses this is a simple closed scale, so a Postgres enum is
-- the right fit. Declared worst-to-best so `order by importance` ascending
-- naturally puts 'f' first; the app does `desc` to get S first.

create type public.speaker_tier as enum ('f', 'c', 'b', 'a', 's');

alter table public.speakers add column importance public.speaker_tier;

create index speakers_importance_idx on public.speakers (importance) where deleted_at is null;