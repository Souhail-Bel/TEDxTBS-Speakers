-- TEDxTBS Speaker Coordination Platform
-- 0001: core schema (tables, enums, indexes, triggers)

create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists pg_trgm;    -- fast ILIKE search on speaker names

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('admin', 'member');
create type public.speaker_status as enum ('no_reply', 'accepted', 'refused', 'unclear');
create type public.link_platform as enum ('linkedin', 'facebook', 'x', 'instagram', 'website', 'other');

-- ---------------------------------------------------------------------------
-- profiles — one row per team member, mirrors auth.users
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text not null,
  phone       text,
  facebook_url text,
  role        public.user_role not null default 'member',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Team members. Row is created automatically when an admin invites a new auth user.';

-- ---------------------------------------------------------------------------
-- speakers
-- ---------------------------------------------------------------------------
create table public.speakers (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(trim(name)) > 0),
  photo_url       text,
  origin          text not null default 'Tunisian',
  age             int check (age is null or (age > 0 and age < 120)),
  email           text,
  phone           text,
  idea_text       text,
  experience_text text,
  status          public.speaker_status not null default 'no_reply',
  added_by        uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- soft delete / review-before-confirm queue
  deleted_at      timestamptz,
  deleted_by      uuid references public.profiles(id) on delete set null
);

create index speakers_status_idx on public.speakers (status) where deleted_at is null;
create index speakers_created_at_idx on public.speakers (created_at desc);
create index speakers_deleted_at_idx on public.speakers (deleted_at) where deleted_at is not null;
create index speakers_name_trgm_idx on public.speakers using gin (name gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- speaker_links — social / profile links, per speaker
-- ---------------------------------------------------------------------------
create table public.speaker_links (
  id         uuid primary key default gen_random_uuid(),
  speaker_id uuid not null references public.speakers(id) on delete cascade,
  platform   public.link_platform not null,
  url        text not null check (char_length(trim(url)) > 0),
  label      text, -- used when platform = 'other'
  position   int not null default 0,
  created_at timestamptz not null default now()
);

create index speaker_links_speaker_id_idx on public.speaker_links (speaker_id);

-- ---------------------------------------------------------------------------
-- tags — freeform, reusable, autocompleted
-- ---------------------------------------------------------------------------
create table public.tags (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now()
);

create unique index tags_name_lower_idx on public.tags (lower(name));

create table public.speaker_tags (
  speaker_id uuid not null references public.speakers(id) on delete cascade,
  tag_id     uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (speaker_id, tag_id)
);

create index speaker_tags_tag_id_idx on public.speaker_tags (tag_id);

-- ---------------------------------------------------------------------------
-- speaker_trackers — "currently contacting / keeping track of" this speaker
-- ---------------------------------------------------------------------------
create table public.speaker_trackers (
  speaker_id uuid not null references public.speakers(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  source     text not null default 'manual' check (source in ('manual', 'comment')),
  added_at   timestamptz not null default now(),
  primary key (speaker_id, profile_id)
);

create index speaker_trackers_profile_id_idx on public.speaker_trackers (profile_id);

-- ---------------------------------------------------------------------------
-- comments — progress log per speaker, immutable once posted
-- ---------------------------------------------------------------------------
create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  speaker_id uuid not null references public.speakers(id) on delete cascade,
  author_id  uuid references public.profiles(id) on delete set null,
  body       text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create index comments_speaker_id_created_at_idx on public.comments (speaker_id, created_at);

-- ---------------------------------------------------------------------------
-- audit_log — admin-only trail of who did what
-- ---------------------------------------------------------------------------
create table public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  entity_type text not null,
  entity_id   uuid,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index audit_log_created_at_idx on public.audit_log (created_at desc);
create index audit_log_entity_idx on public.audit_log (entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- event_settings — singleton row holding the (initially unknown) event date
-- ---------------------------------------------------------------------------
create table public.event_settings (
  id         smallint primary key default 1 check (id = 1),
  event_date date,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.event_settings (id, event_date) values (1, null);

-- ---------------------------------------------------------------------------
-- updated_at helper trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger speakers_set_updated_at
  before update on public.speakers
  for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- auth.users -> profiles provisioning
-- Admin invites a user via the Supabase Admin API and passes full_name / role
-- in user_metadata; this trigger creates the matching profiles row.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    case
      when new.raw_user_meta_data->>'role' = 'admin' then 'admin'::public.user_role
      else 'member'::public.user_role
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep profiles.email in sync if it's ever changed in auth.users
create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.sync_profile_email();

-- ---------------------------------------------------------------------------
-- Auto-add the comment author as a tracker on the speaker they commented on
-- ---------------------------------------------------------------------------
create or replace function public.handle_comment_tracker()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.author_id is not null then
    insert into public.speaker_trackers (speaker_id, profile_id, source)
    values (new.speaker_id, new.author_id, 'comment')
    on conflict (speaker_id, profile_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger on_comment_created
  after insert on public.comments
  for each row execute function public.handle_comment_tracker();
