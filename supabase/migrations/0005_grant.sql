-- 0005: grant ---

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