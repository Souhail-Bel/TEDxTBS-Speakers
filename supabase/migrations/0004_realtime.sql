-- 0004: enable Realtime so the speaker table/board, speaker detail page and
-- comment thread update live for everyone without a manual refresh.

alter publication supabase_realtime add table public.speakers;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.speaker_trackers;
alter publication supabase_realtime add table public.speaker_tags;
alter publication supabase_realtime add table public.tags;
