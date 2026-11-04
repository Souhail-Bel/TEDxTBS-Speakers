-- 0007: a short free-text bio per speaker. Nullable, no separate table —
-- it's a single optional field alongside idea_text/experience_text.

alter table public.speakers add column bio text;