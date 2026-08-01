-- Storage buckets, gallery layout, org family tree, membership leave status

-- ---------------------------------------------------------------------------
-- Membership status extensions
-- ---------------------------------------------------------------------------
do $$
begin
  alter type public.membership_status add value if not exists 'left';
  alter type public.membership_status add value if not exists 'inactive';
  alter type public.membership_status add value if not exists 'suspended';
exception
  when others then null;
end $$;

alter table public.membership_applications
  add column if not exists member_status text not null default 'active'
    check (member_status in ('active', 'left', 'inactive', 'suspended'));

alter table public.membership_applications
  add column if not exists left_at timestamptz;

alter table public.membership_applications
  add column if not exists status_notes text;

-- ---------------------------------------------------------------------------
-- Profiles avatar / org fields
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists org_title text;

alter table public.profiles
  add column if not exists show_in_family boolean not null default false;

-- ---------------------------------------------------------------------------
-- Gallery album layout
-- ---------------------------------------------------------------------------
alter table public.gallery_albums
  add column if not exists heading text;

alter table public.gallery_albums
  add column if not exists display_mode text not null default 'grid'
    check (display_mode in ('slider', 'grid', 'both'));

alter table public.gallery_albums
  add column if not exists event_date date;

update public.gallery_albums
set heading = coalesce(heading, title)
where heading is null;

alter table public.gallery_media
  add column if not exists display_target text not null default 'grid'
    check (display_target in ('slider', 'grid'));

-- ---------------------------------------------------------------------------
-- Marketplace PDF file
-- ---------------------------------------------------------------------------
alter table public.marketplace_items
  add column if not exists file_url text;

alter table public.marketplace_items
  add column if not exists file_size_label text;

-- ---------------------------------------------------------------------------
-- Organization family tree
-- ---------------------------------------------------------------------------
create table if not exists public.org_nodes (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.org_nodes (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete set null,
  full_name text not null,
  role_title text not null,
  avatar_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists org_nodes_parent_idx on public.org_nodes (parent_id, sort_order);

drop trigger if exists org_nodes_set_updated_at on public.org_nodes;
create trigger org_nodes_set_updated_at
before update on public.org_nodes
for each row execute function public.set_updated_at();

alter table public.org_nodes enable row level security;

drop policy if exists "Public read active org nodes" on public.org_nodes;
create policy "Public read active org nodes"
  on public.org_nodes for select
  using (is_active = true);

drop policy if exists "Admins manage org nodes" on public.org_nodes;
create policy "Admins manage org nodes"
  on public.org_nodes for all to authenticated
  using (
    public.current_user_has_permission('users', 'update')
    or public.current_user_has_permission('website', 'update')
  )
  with check (
    public.current_user_has_permission('users', 'update')
    or public.current_user_has_permission('website', 'update')
  );

-- Seed a simple root if empty
insert into public.org_nodes (full_name, role_title, sort_order)
select 'Brass Foundation', 'Organization', 0
where not exists (select 1 from public.org_nodes);

-- ---------------------------------------------------------------------------
-- Storage buckets (public read)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'gallery',
    'gallery',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'resources',
    'resources',
    true,
    52428800,
    array['application/pdf', 'image/jpeg', 'image/png', 'audio/mpeg', 'video/mp4']
  ),
  (
    'marketplace',
    'marketplace',
    true,
    52428800,
    array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'avatars',
    'avatars',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do nothing;

-- Public read
drop policy if exists "Public read gallery storage" on storage.objects;
create policy "Public read gallery storage"
  on storage.objects for select
  using (bucket_id in ('gallery', 'resources', 'marketplace', 'avatars'));

-- Authenticated uploads (admins via app)
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
