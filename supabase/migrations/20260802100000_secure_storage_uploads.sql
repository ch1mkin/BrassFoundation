-- Restrict storage writes: staff with content permissions only (not every logged-in member).
-- Membership avatar uploads use the service role and are unaffected.

drop policy if exists "Authenticated upload media" on storage.objects;
drop policy if exists "Authenticated update media" on storage.objects;
drop policy if exists "Authenticated delete media" on storage.objects;
drop policy if exists "Staff upload media" on storage.objects;
drop policy if exists "Staff update media" on storage.objects;
drop policy if exists "Staff delete media" on storage.objects;

create or replace function public.can_manage_storage_media()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.current_user_has_permission('website', 'update')
    or public.current_user_has_permission('gallery', 'create')
    or public.current_user_has_permission('gallery', 'update')
    or public.current_user_has_permission('resources', 'create')
    or public.current_user_has_permission('resources', 'update')
    or public.current_user_has_permission('marketplace', 'create')
    or public.current_user_has_permission('marketplace', 'update')
    or public.current_user_has_permission('community', 'create')
    or public.current_user_has_permission('community', 'update')
    or public.current_user_has_permission('news', 'create')
    or public.current_user_has_permission('news', 'update')
    or public.current_user_has_permission('users', 'update');
$$;

create policy "Staff upload media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('gallery', 'resources', 'marketplace', 'avatars')
    and public.can_manage_storage_media()
  );

create policy "Staff update media"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('gallery', 'resources', 'marketplace', 'avatars')
    and public.can_manage_storage_media()
  )
  with check (
    bucket_id in ('gallery', 'resources', 'marketplace', 'avatars')
    and public.can_manage_storage_media()
  );

create policy "Staff delete media"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('gallery', 'resources', 'marketplace', 'avatars')
    and public.can_manage_storage_media()
  );
