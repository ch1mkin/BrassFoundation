-- Executive Committee members (homepage + about), with optional photos.

create table if not exists public.executive_committee (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role_title text not null,
  photo_url text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists executive_committee_published_idx
  on public.executive_committee (is_published, sort_order);

drop trigger if exists executive_committee_set_updated_at on public.executive_committee;
create trigger executive_committee_set_updated_at
before update on public.executive_committee
for each row execute function public.set_updated_at();

alter table public.executive_committee enable row level security;

drop policy if exists "Public read published executive committee" on public.executive_committee;
create policy "Public read published executive committee"
  on public.executive_committee for select
  using (is_published = true);

drop policy if exists "Admins manage executive committee" on public.executive_committee;
create policy "Admins manage executive committee"
  on public.executive_committee for all to authenticated
  using (
    public.current_user_has_permission('website', 'update')
    or public.current_user_has_permission('users', 'update')
  )
  with check (
    public.current_user_has_permission('website', 'update')
    or public.current_user_has_permission('users', 'update')
  );

-- Seed default roster when empty
insert into public.executive_committee (full_name, role_title, sort_order)
select * from (
  values
    ('Sh. Labh Singh Gobindgarh', 'Chairman', 1),
    ('Sh. Kuldip Singh', 'Vice Chairman', 2),
    ('Sh. Lakhwinder Singh', 'General Secretary', 3),
    ('Sh. Rinku Singh', 'Treasurer', 4),
    ('Sh. Harwinder Singh', 'Principal Advisor', 5),
    ('Sh. Gursewak Singh', 'Advertising Secretary', 6),
    ('Sh. Ajaib Singh Neelowal', 'Press Secretary', 7),
    ('Sh. Nirmal Singh', 'Executive Member', 8),
    ('Sh. Jarnail Singh', 'Executive Member', 9),
    ('Sh. Jagsir Singh', 'Executive Member', 10),
    ('Sh. Harpreet Kaur', 'Executive Member', 11),
    ('Adv. Hans Raj', 'Legal Advisor', 12)
) as seed(full_name, role_title, sort_order)
where not exists (select 1 from public.executive_committee limit 1);
