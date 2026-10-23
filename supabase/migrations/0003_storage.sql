-- 0003: Storage bucket for speaker photos (already-cropped, already-compressed
-- squares uploaded by the client).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('speaker-photos', 'speaker-photos', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy speaker_photos_read
  on storage.objects for select
  using (bucket_id = 'speaker-photos');

create policy speaker_photos_insert
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'speaker-photos');

create policy speaker_photos_update
  on storage.objects for update
  to authenticated
  using (bucket_id = 'speaker-photos');

create policy speaker_photos_delete
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'speaker-photos');
