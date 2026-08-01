-- Membership applications, types, and approved members

create type public.membership_type as enum (
  'volunteer',
  'student',
  'general',
  'life_member'
);

create type public.membership_status as enum (
  'pending',
  'under_review',
  'approved',
  'rejected',
  'expired'
);

create table if not exists public.membership_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  membership_type public.membership_type not null default 'general',
  status public.membership_status not null default 'pending',

  full_name text not null,
  email text not null,
  phone text,
  date_of_birth date,
  gender text,
  education text,
  occupation text,
  district text,
  state text,
  address text,
  interests text[] not null default '{}',
  reason_for_joining text,
  photo_url text,
  id_proof_url text,
  document_urls text[] not null default '{}',

  membership_id text unique,
  qr_payload text,
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  review_notes text,
  approved_at timestamptz,
  expires_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists membership_applications_status_idx
  on public.membership_applications (status, created_at desc);

create index if not exists membership_applications_email_idx
  on public.membership_applications (email);

create index if not exists membership_applications_user_id_idx
  on public.membership_applications (user_id);

drop trigger if exists membership_applications_set_updated_at
  on public.membership_applications;
create trigger membership_applications_set_updated_at
before update on public.membership_applications
for each row execute function public.set_updated_at();

-- Generate membership IDs like BF-2026-000123
create or replace function public.generate_membership_id()
returns text
language plpgsql
as $$
declare
  yr text := to_char(now(), 'YYYY');
  seq int;
begin
  select count(*) + 1 into seq
  from public.membership_applications
  where membership_id is not null
    and membership_id like 'BF-' || yr || '-%';

  return 'BF-' || yr || '-' || lpad(seq::text, 6, '0');
end;
$$;

create or replace function public.approve_membership_application(
  p_application_id uuid,
  p_reviewer_id uuid,
  p_notes text default null
)
returns public.membership_applications
language plpgsql
security definer
set search_path = public
as $$
declare
  app public.membership_applications;
  new_id text;
begin
  if not public.user_has_permission(p_reviewer_id, 'members', 'approve') then
    raise exception 'Not allowed to approve memberships';
  end if;

  select * into app
  from public.membership_applications
  where id = p_application_id
  for update;

  if not found then
    raise exception 'Application not found';
  end if;

  if app.status = 'approved' then
    return app;
  end if;

  new_id := coalesce(app.membership_id, public.generate_membership_id());

  update public.membership_applications
  set
    status = 'approved',
    membership_id = new_id,
    qr_payload = new_id,
    reviewed_by = p_reviewer_id,
    reviewed_at = now(),
    review_notes = p_notes,
    approved_at = now(),
    expires_at = case
      when membership_type = 'life_member' then null
      else now() + interval '1 year'
    end
  where id = p_application_id
  returning * into app;

  return app;
end;
$$;

alter table public.membership_applications enable row level security;

drop policy if exists "Anyone can submit membership" on public.membership_applications;
create policy "Anyone can submit membership"
  on public.membership_applications for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Users read own membership apps" on public.membership_applications;
create policy "Users read own membership apps"
  on public.membership_applications for select
  to authenticated
  using (
    auth.uid() = user_id
    or email = (select email from public.profiles where id = auth.uid())
    or public.current_user_has_permission('members', 'read')
  );

drop policy if exists "Staff manage memberships" on public.membership_applications;
create policy "Staff manage memberships"
  on public.membership_applications for all
  to authenticated
  using (public.current_user_has_permission('members', 'update'))
  with check (public.current_user_has_permission('members', 'update'));
