-- Ensure hero background column exists (safe to re-run)
alter table public.homepage_content
  add column if not exists hero_background_url text;

-- Ensure storage gallery bucket exists for hero uploads
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery',
  'gallery',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read + authenticated upload policies (idempotent)
drop policy if exists "Public read gallery storage" on storage.objects;
create policy "Public read gallery storage"
  on storage.objects for select
  using (bucket_id in ('gallery', 'resources', 'marketplace', 'avatars'));

drop policy if exists "Authenticated upload media" on storage.objects;
create policy "Authenticated upload media"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('gallery', 'resources', 'marketplace', 'avatars'));

drop policy if exists "Authenticated update media" on storage.objects;
create policy "Authenticated update media"
  on storage.objects for update to authenticated
  using (bucket_id in ('gallery', 'resources', 'marketplace', 'avatars'));

drop policy if exists "Authenticated delete media" on storage.objects;
create policy "Authenticated delete media"
  on storage.objects for delete to authenticated
  using (bucket_id in ('gallery', 'resources', 'marketplace', 'avatars'));
