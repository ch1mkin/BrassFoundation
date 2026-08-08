-- Referrals, family members, achievers, brochure, useful links, membership category

-- Membership application extras
alter table public.membership_applications
  add column if not exists category text,
  add column if not exists referred_by_membership_id text,
  add column if not exists age integer;

comment on column public.membership_applications.category is
  'Reservation category: SC, ST, or OBC';
comment on column public.membership_applications.referred_by_membership_id is
  'Referrer membership_id (BF-YYYY-…) captured from ?ref= link';

create index if not exists membership_applications_referred_by_idx
  on public.membership_applications (referred_by_membership_id);

-- Family members added by an existing paid member
create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references public.profiles (id) on delete cascade,
  parent_application_id uuid references public.membership_applications (id) on delete set null,
  parent_membership_id text,
  full_name text not null,
  age integer not null check (age > 0 and age < 120),
  gender text not null,
  occupation text,
  category text not null check (category in ('SC', 'ST', 'OBC')),
  photo_url text,
  fee_paise integer not null default 0,
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'pending', 'paid', 'waived')),
  payment_order_id uuid,
  membership_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists family_members_parent_user_idx
  on public.family_members (parent_user_id, created_at desc);

drop trigger if exists family_members_set_updated_at on public.family_members;
create trigger family_members_set_updated_at
before update on public.family_members
for each row execute function public.set_updated_at();

alter table public.family_members enable row level security;

drop policy if exists "Members read own family" on public.family_members;
create policy "Members read own family"
  on public.family_members for select to authenticated
  using (
    parent_user_id = auth.uid()
    or public.current_user_has_permission('members', 'read')
  );

drop policy if exists "Members insert own family" on public.family_members;
create policy "Members insert own family"
  on public.family_members for insert to authenticated
  with check (parent_user_id = auth.uid());

drop policy if exists "Members update own family" on public.family_members;
create policy "Members update own family"
  on public.family_members for update to authenticated
  using (
    parent_user_id = auth.uid()
    or public.current_user_has_permission('members', 'update')
  )
  with check (
    parent_user_id = auth.uid()
    or public.current_user_has_permission('members', 'update')
  );

drop policy if exists "Admins delete family" on public.family_members;
create policy "Admins delete family"
  on public.family_members for delete to authenticated
  using (public.current_user_has_permission('members', 'update'));

-- Achievers showcase
create table if not exists public.achievers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  age integer,
  photo_url text,
  achievement text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists achievers_set_updated_at on public.achievers;
create trigger achievers_set_updated_at
before update on public.achievers
for each row execute function public.set_updated_at();

alter table public.achievers enable row level security;

drop policy if exists "Public read achievers" on public.achievers;
create policy "Public read achievers"
  on public.achievers for select
  using (is_published = true);

drop policy if exists "Admins manage achievers" on public.achievers;
create policy "Admins manage achievers"
  on public.achievers for all to authenticated
  using (public.current_user_has_permission('website', 'update'))
  with check (public.current_user_has_permission('website', 'update'));

-- Organisation brochure
create table if not exists public.organisation_brochures (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Organisation Brochure',
  description text,
  file_url text not null,
  cover_image_url text,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists organisation_brochures_set_updated_at on public.organisation_brochures;
create trigger organisation_brochures_set_updated_at
before update on public.organisation_brochures
for each row execute function public.set_updated_at();

alter table public.organisation_brochures enable row level security;

drop policy if exists "Public read brochures" on public.organisation_brochures;
create policy "Public read brochures"
  on public.organisation_brochures for select
  using (is_published = true);

drop policy if exists "Admins manage brochures" on public.organisation_brochures;
create policy "Admins manage brochures"
  on public.organisation_brochures for all to authenticated
  using (public.current_user_has_permission('website', 'update'))
  with check (public.current_user_has_permission('website', 'update'));

-- Useful links (resources page)
create table if not exists public.useful_links (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  description text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists useful_links_set_updated_at on public.useful_links;
create trigger useful_links_set_updated_at
before update on public.useful_links
for each row execute function public.set_updated_at();

alter table public.useful_links enable row level security;

drop policy if exists "Public read useful links" on public.useful_links;
create policy "Public read useful links"
  on public.useful_links for select
  using (is_published = true);

drop policy if exists "Admins manage useful links" on public.useful_links;
create policy "Admins manage useful links"
  on public.useful_links for all to authenticated
  using (
    public.current_user_has_permission('resources', 'update')
    or public.current_user_has_permission('website', 'update')
  )
  with check (
    public.current_user_has_permission('resources', 'update')
    or public.current_user_has_permission('website', 'update')
  );
