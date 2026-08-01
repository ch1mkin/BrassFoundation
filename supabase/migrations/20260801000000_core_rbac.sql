-- Brass Foundation OMS — core identity, RBAC, audit
-- Run in Supabase SQL Editor or via supabase db push

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  full_name text,
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Dynamic roles & permissions
-- ---------------------------------------------------------------------------
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  action text not null,
  description text,
  unique (module, action)
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles (id) on delete cascade,
  permission_id uuid not null references public.permissions (id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.user_roles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete cascade,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references public.profiles (id),
  primary key (user_id, role_id)
);

-- ---------------------------------------------------------------------------
-- Audit logs
-- ---------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  module text,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_actor_id_idx on public.audit_logs (actor_id);

-- ---------------------------------------------------------------------------
-- Seed system roles
-- ---------------------------------------------------------------------------
insert into public.roles (slug, name, description, is_system)
values
  ('super_admin', 'Super Admin', 'Full platform authority', true),
  ('admin', 'Admin', 'Configurable administrative access', true),
  ('secretary', 'Secretary', 'Meetings, notices, membership records', true),
  ('treasurer', 'Treasurer', 'Donations, fees, financial reports', true),
  ('volunteer', 'Volunteer', 'Tasks, attendance, uploads', true),
  ('member', 'Member', 'Standard member access', true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Seed permission matrix (module × action)
-- ---------------------------------------------------------------------------
insert into public.permissions (module, action, description)
values
  ('members', 'create', 'Create members'),
  ('members', 'read', 'View members'),
  ('members', 'update', 'Update members'),
  ('members', 'delete', 'Delete members'),
  ('members', 'approve', 'Approve memberships'),
  ('members', 'export', 'Export membership data'),
  ('users', 'create', 'Create users'),
  ('users', 'read', 'View users'),
  ('users', 'update', 'Update users'),
  ('users', 'delete', 'Delete users'),
  ('users', 'assign_roles', 'Assign roles to users'),
  ('roles', 'create', 'Create roles'),
  ('roles', 'read', 'View roles'),
  ('roles', 'update', 'Update roles'),
  ('roles', 'delete', 'Delete roles'),
  ('roles', 'manage_settings', 'Manage role settings'),
  ('website', 'read', 'View website CMS'),
  ('website', 'update', 'Edit website CMS'),
  ('website', 'publish', 'Publish website content'),
  ('gallery', 'create', 'Upload gallery media'),
  ('gallery', 'read', 'View gallery'),
  ('gallery', 'update', 'Edit gallery'),
  ('gallery', 'delete', 'Delete gallery media'),
  ('gallery', 'approve', 'Approve gallery media'),
  ('marketplace', 'create', 'Create marketplace posts'),
  ('marketplace', 'read', 'View marketplace'),
  ('marketplace', 'update', 'Edit marketplace posts'),
  ('marketplace', 'delete', 'Delete marketplace posts'),
  ('marketplace', 'approve', 'Approve marketplace posts'),
  ('marketplace', 'reject', 'Reject marketplace posts'),
  ('resources', 'create', 'Upload resources'),
  ('resources', 'read', 'View resources'),
  ('resources', 'update', 'Edit resources'),
  ('resources', 'delete', 'Delete resources'),
  ('resources', 'approve', 'Approve resources'),
  ('resources', 'publish', 'Publish resources'),
  ('events', 'create', 'Create events'),
  ('events', 'read', 'View events'),
  ('events', 'update', 'Edit events'),
  ('events', 'delete', 'Delete events'),
  ('events', 'publish', 'Publish events'),
  ('news', 'create', 'Create news'),
  ('news', 'read', 'View news'),
  ('news', 'update', 'Edit news'),
  ('news', 'delete', 'Delete news'),
  ('news', 'publish', 'Publish news'),
  ('community', 'create', 'Create community projects'),
  ('community', 'read', 'View community projects'),
  ('community', 'update', 'Edit community projects'),
  ('community', 'delete', 'Delete community projects'),
  ('analytics', 'read', 'View analytics'),
  ('analytics', 'export', 'Export analytics'),
  ('audit', 'read', 'View audit logs'),
  ('settings', 'read', 'View settings'),
  ('settings', 'manage_settings', 'Manage platform settings')
on conflict (module, action) do nothing;

-- Super Admin gets every permission
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.slug = 'super_admin'
on conflict do nothing;

-- Member baseline: read resources/events/marketplace/news/community
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.action = 'read'
  and p.module in ('resources', 'events', 'marketplace', 'news', 'community')
where r.slug = 'member'
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Helpers
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

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists roles_set_updated_at on public.roles;
create trigger roles_set_updated_at
before update on public.roles
for each row execute function public.set_updated_at();

-- Auto-create profile + default member role on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  member_role_id uuid;
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name);

  select id into member_role_id from public.roles where slug = 'member' limit 1;

  if member_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, member_role_id)
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Permission check helper
create or replace function public.user_has_permission(
  p_user_id uuid,
  p_module text,
  p_action text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role_id = ur.role_id
    join public.permissions p on p.id = rp.permission_id
    where ur.user_id = p_user_id
      and p.module = p_module
      and p.action = p_action
  );
$$;

create or replace function public.current_user_has_permission(
  p_module text,
  p_action text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.user_has_permission(auth.uid(), p_module, p_action);
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles
drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update
  to authenticated
  using (public.current_user_has_permission('users', 'update'))
  with check (public.current_user_has_permission('users', 'update'));

-- Roles / permissions readable by authenticated
drop policy if exists "Roles are readable" on public.roles;
create policy "Roles are readable"
  on public.roles for select to authenticated using (true);

drop policy if exists "Permissions are readable" on public.permissions;
create policy "Permissions are readable"
  on public.permissions for select to authenticated using (true);

drop policy if exists "Role permissions are readable" on public.role_permissions;
create policy "Role permissions are readable"
  on public.role_permissions for select to authenticated using (true);

drop policy if exists "User roles are readable" on public.user_roles;
create policy "User roles are readable"
  on public.user_roles for select to authenticated using (true);

-- Role management
drop policy if exists "Manage roles" on public.roles;
create policy "Manage roles"
  on public.roles for all to authenticated
  using (public.current_user_has_permission('roles', 'update'))
  with check (public.current_user_has_permission('roles', 'update'));

drop policy if exists "Manage role permissions" on public.role_permissions;
create policy "Manage role permissions"
  on public.role_permissions for all to authenticated
  using (public.current_user_has_permission('roles', 'update'))
  with check (public.current_user_has_permission('roles', 'update'));

drop policy if exists "Assign user roles" on public.user_roles;
create policy "Assign user roles"
  on public.user_roles for all to authenticated
  using (public.current_user_has_permission('users', 'assign_roles'))
  with check (public.current_user_has_permission('users', 'assign_roles'));

-- Audit logs
drop policy if exists "Read audit logs" on public.audit_logs;
create policy "Read audit logs"
  on public.audit_logs for select to authenticated
  using (public.current_user_has_permission('audit', 'read'));

drop policy if exists "Insert audit logs" on public.audit_logs;
create policy "Insert audit logs"
  on public.audit_logs for insert to authenticated
  with check (actor_id = auth.uid() or public.current_user_has_permission('audit', 'read'));
