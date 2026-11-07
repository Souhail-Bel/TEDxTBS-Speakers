-- 0008: Custom status states, general rules & warnings, custom speaker outreach message,
-- enriched team profiles (avatar, bio, contacted count), and auto-tracking by speaker creator.

-- 1. Convert speakers.status from fixed enum to text and create speaker_statuses table
drop index if exists public.speakers_status_idx;
alter table public.speakers alter column status drop default;
alter table public.speakers alter column status type text using status::text;
alter table public.speakers alter column status set default 'no_reply';
create index speakers_status_idx on public.speakers (status) where deleted_at is null;

create table if not exists public.speaker_statuses (
  slug       text primary key,
  label      text not null,
  color      text,
  position   int not null default 0,
  is_builtin boolean not null default false,
  created_at timestamptz not null default now()
);

insert into public.speaker_statuses (slug, label, color, position, is_builtin) values
  ('no_reply', 'No reply yet', null, 0, true),
  ('unclear',  'Unclear',      null, 1, true),
  ('accepted', 'Accepted',     null, 2, true),
  ('refused',  'Refused',      null, 3, true)
on conflict (slug) do nothing;

alter table public.speaker_statuses enable row level security;

drop policy if exists speaker_statuses_select_all on public.speaker_statuses;
create policy speaker_statuses_select_all
  on public.speaker_statuses for select
  to authenticated
  using (true);

drop policy if exists speaker_statuses_insert_all on public.speaker_statuses;
create policy speaker_statuses_insert_all
  on public.speaker_statuses for insert
  to authenticated
  with check (true);

drop policy if exists speaker_statuses_update_all on public.speaker_statuses;
create policy speaker_statuses_update_all
  on public.speaker_statuses for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists speaker_statuses_delete_custom on public.speaker_statuses;
create policy speaker_statuses_delete_custom
  on public.speaker_statuses for delete
  to authenticated
  using (not is_builtin);

-- 2. General rules & warnings on event_settings
alter table public.event_settings
  add column if not exists rules_and_warnings jsonb not null default '[
    {"id": "w1", "type": "warning", "text": "Never contact a speaker who is already being tracked by another team member without coordinating with them first."},
    {"id": "w2", "type": "warning", "text": "Do not send official confirmations or promise speaking slots without approval from the Speaker Coordinator."},
    {"id": "r1", "type": "rule", "text": "Always check the speaker list before adding a new speaker to avoid duplicates."},
    {"id": "r2", "type": "rule", "text": "Log every outreach attempt (email, LinkedIn, Instagram, phone call) in the speaker''s Progress & comments section."},
    {"id": "r3", "type": "rule", "text": "Keep the speaker''s status and custom outreach message up to date as conversations progress."}
  ]'::jsonb;

drop policy if exists event_settings_update_admin on public.event_settings;
drop policy if exists event_settings_update_authenticated on public.event_settings;
create policy event_settings_update_authenticated
  on public.event_settings for update
  to authenticated
  using (true)
  with check (true);

-- 3. Custom message per speaker
alter table public.speakers add column if not exists custom_message text;

-- 4. Enriched team member profiles (picture, who they are / bio, speakers contacted count)
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists contacted_count int;

-- 5. Default tracking profile is the one who added the speaker for the first time
create or replace function public.handle_new_speaker_tracker()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.added_by is not null then
    insert into public.speaker_trackers (speaker_id, profile_id, source)
    values (new.id, new.added_by, 'manual')
    on conflict (speaker_id, profile_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_speaker_created_add_tracker on public.speakers;
create trigger on_speaker_created_add_tracker
  after insert on public.speakers
  for each row execute function public.handle_new_speaker_tracker();

-- Backfill existing speakers so their creator is set as a tracker
insert into public.speaker_trackers (speaker_id, profile_id, source)
select id, added_by, 'manual'
from public.speakers
where added_by is not null
on conflict (speaker_id, profile_id) do nothing;

-- 6. Grants for authenticated and service_role
grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on table public.speaker_statuses to authenticated, service_role;
grant select, insert, update, delete on table public.profiles         to authenticated, service_role;
grant select, insert, update, delete on table public.speakers         to authenticated, service_role;
grant select, insert, update, delete on table public.speaker_links    to authenticated, service_role;
grant select, insert, update, delete on table public.tags             to authenticated, service_role;
grant select, insert, update, delete on table public.speaker_tags     to authenticated, service_role;
grant select, insert, update, delete on table public.speaker_trackers to authenticated, service_role;
grant select, insert, update, delete on table public.comments         to authenticated, service_role;
grant select, insert, update, delete on table public.audit_log        to authenticated, service_role;
grant select, insert, update, delete on table public.event_settings   to authenticated, service_role;

-- 7. Enable realtime on speaker_statuses and event_settings
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'speaker_statuses'
  ) then
    alter publication supabase_realtime add table public.speaker_statuses;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'event_settings'
  ) then
    alter publication supabase_realtime add table public.event_settings;
  end if;
end $$;
