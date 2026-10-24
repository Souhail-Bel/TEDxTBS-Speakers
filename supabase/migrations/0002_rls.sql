-- 0002: Row Level Security — enforces the admin / member split at the DB layer,
-- not just in the UI.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Prevent a non-admin from granting themselves the admin role through the
-- "edit my own profile" update policy below.
create or replace function public.protect_role_column()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only an admin can change a team member''s role';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_role_column();

alter table public.profiles enable row level security;
alter table public.speakers enable row level security;
alter table public.speaker_links enable row level security;
alter table public.tags enable row level security;
alter table public.speaker_tags enable row level security;
alter table public.speaker_trackers enable row level security;
alter table public.comments enable row level security;
alter table public.audit_log enable row level security;
alter table public.event_settings enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy profiles_select_all
  on public.profiles for select
  to authenticated
  using (true);

create policy profiles_update_self
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy profiles_update_admin
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy profiles_delete_admin
  on public.profiles for delete
  to authenticated
  using (public.is_admin());

-- Inserts happen only via the handle_new_user trigger (security definer),
-- itself only reachable through the admin invite API using the service role,
-- which bypasses RLS. No client-facing insert policy on purpose.

-- ---------------------------------------------------------------------------
-- speakers
-- ---------------------------------------------------------------------------
-- `or deleted_by = auth.uid()`: Postgres requires a row to remain visible
-- under the table's SELECT policies for the role performing an UPDATE, in
-- addition to satisfying the UPDATE policy's own WITH CHECK — otherwise a
-- member soft-deleting a speaker sets deleted_at, immediately making
-- `deleted_at is null` false for them with no other policy covering them,
-- and the write itself gets rejected with "new row violates row-level
-- security policy". Letting a member keep seeing rows THEY personally
-- deleted fixes this. It isn't a real visibility change in the app:
-- fetchSpeakers() filters `deleted_at is null` at the query level
-- regardless of RLS, and /trash is gated by requireAdmin() at the route
-- level, so deleted speakers still never appear in the UI for a member.
create policy speakers_select_active
  on public.speakers for select
  to authenticated
  using (deleted_at is null or deleted_by = auth.uid());

create policy speakers_select_admin_all
  on public.speakers for select
  to authenticated
  using (public.is_admin());

create policy speakers_insert
  on public.speakers for insert
  to authenticated
  with check (added_by = auth.uid());

-- Members can edit (and soft-delete) any speaker that isn't already pending
-- deletion. Once deleted_at is set, this condition no longer matches the
-- row, so a member cannot un-delete it themselves — only an admin can
-- (via is_admin()). Deliberately ONE policy, not two separate permissive
-- ones for member/admin: Postgres requires the UPDATE's resulting row to
-- also remain visible under the table's SELECT policies for the acting
-- role (see speakers_select_active below), and in testing, splitting this
-- into member+admin policies ran into that interaction in a way a single
-- policy does not.
create policy speakers_update
  on public.speakers for update
  to authenticated
  using (deleted_at is null or public.is_admin())
  with check (true);

create policy speakers_delete_admin
  on public.speakers for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- speaker_links
-- ---------------------------------------------------------------------------
create policy speaker_links_select
  on public.speaker_links for select
  to authenticated
  using (
    exists (
      select 1 from public.speakers s
      where s.id = speaker_links.speaker_id and (s.deleted_at is null or public.is_admin())
    )
  );

create policy speaker_links_insert
  on public.speaker_links for insert
  to authenticated
  with check (
    exists (select 1 from public.speakers s where s.id = speaker_links.speaker_id and s.deleted_at is null)
  );

create policy speaker_links_update
  on public.speaker_links for update
  to authenticated
  using (
    exists (select 1 from public.speakers s where s.id = speaker_links.speaker_id and s.deleted_at is null)
  );

create policy speaker_links_delete
  on public.speaker_links for delete
  to authenticated
  using (
    exists (
      select 1 from public.speakers s
      where s.id = speaker_links.speaker_id and (s.deleted_at is null or public.is_admin())
    )
  );

-- ---------------------------------------------------------------------------
-- tags
-- ---------------------------------------------------------------------------
create policy tags_select_all
  on public.tags for select
  to authenticated
  using (true);

create policy tags_insert_all
  on public.tags for insert
  to authenticated
  with check (true);

create policy tags_admin_write
  on public.tags for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy tags_admin_delete
  on public.tags for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- speaker_tags
-- ---------------------------------------------------------------------------
create policy speaker_tags_select
  on public.speaker_tags for select
  to authenticated
  using (
    exists (
      select 1 from public.speakers s
      where s.id = speaker_tags.speaker_id and (s.deleted_at is null or public.is_admin())
    )
  );

create policy speaker_tags_insert
  on public.speaker_tags for insert
  to authenticated
  with check (
    exists (select 1 from public.speakers s where s.id = speaker_tags.speaker_id and s.deleted_at is null)
  );

create policy speaker_tags_delete
  on public.speaker_tags for delete
  to authenticated
  using (
    exists (
      select 1 from public.speakers s
      where s.id = speaker_tags.speaker_id and (s.deleted_at is null or public.is_admin())
    )
  );

-- ---------------------------------------------------------------------------
-- speaker_trackers
-- ---------------------------------------------------------------------------
create policy speaker_trackers_select
  on public.speaker_trackers for select
  to authenticated
  using (
    exists (
      select 1 from public.speakers s
      where s.id = speaker_trackers.speaker_id and (s.deleted_at is null or public.is_admin())
    )
  );

create policy speaker_trackers_insert
  on public.speaker_trackers for insert
  to authenticated
  with check (
    exists (select 1 from public.speakers s where s.id = speaker_trackers.speaker_id and s.deleted_at is null)
  );

create policy speaker_trackers_delete
  on public.speaker_trackers for delete
  to authenticated
  using (profile_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- comments (immutable: no update policy)
-- ---------------------------------------------------------------------------
create policy comments_select
  on public.comments for select
  to authenticated
  using (
    exists (
      select 1 from public.speakers s
      where s.id = comments.speaker_id and (s.deleted_at is null or public.is_admin())
    )
  );

create policy comments_insert
  on public.comments for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and exists (select 1 from public.speakers s where s.id = comments.speaker_id and s.deleted_at is null)
  );

create policy comments_delete
  on public.comments for delete
  to authenticated
  using (author_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- audit_log (admin reads; any authenticated action can append, never edited)
-- ---------------------------------------------------------------------------
create policy audit_log_select_admin
  on public.audit_log for select
  to authenticated
  using (public.is_admin());

create policy audit_log_insert
  on public.audit_log for insert
  to authenticated
  with check (actor_id = auth.uid());

-- ---------------------------------------------------------------------------
-- event_settings
-- ---------------------------------------------------------------------------
create policy event_settings_select_all
  on public.event_settings for select
  to authenticated
  using (true);

create policy event_settings_update_admin
  on public.event_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
