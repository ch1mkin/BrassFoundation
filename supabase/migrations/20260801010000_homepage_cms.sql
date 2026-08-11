-- Landing page CMS — every homepage section editable from admin

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

create table if not exists public.homepage_content (
  id uuid primary key default gen_random_uuid(),
  -- only one active row expected; keep history via is_published
  version integer not null default 1,
  is_published boolean not null default true,
  hero_eyebrow text not null default 'BRASS Foundation',
  hero_headline text not null default 'Knowledge that liberates.\nCommunity that rises.',
  hero_subheadline text not null default 'An Ambedkarite organization building education, equality, and leadership for generations ahead.',
  hero_cta_primary_label text not null default 'Become a Member',
  hero_cta_primary_href text not null default '/membership',
  hero_cta_secondary_label text not null default 'Explore Resources',
  hero_cta_secondary_href text not null default '/resources',
  about_eyebrow text not null default 'Who We Are',
  about_headline text not null default 'Building a platform for dignity, learning, and collective progress.',
  about_body text not null default 'BRASS Foundation exists to advance Ambedkarite values through education, community service, and leadership development.',
  membership_headline text not null default 'Join BRASS Foundation.',
  membership_body text not null default 'Register online, receive your digital membership card, and take part in programs that advance education and equality.',
  stats jsonb not null default '[
    {"label":"Members","value":2500,"suffix":"+"},
    {"label":"Events","value":180,"suffix":"+"},
    {"label":"Scholarships","value":420,"suffix":"+"},
    {"label":"Districts","value":45,"suffix":"+"},
    {"label":"Books Published","value":65,"suffix":"+"},
    {"label":"Community Drives","value":310,"suffix":"+"}
  ]'::jsonb,
  core_values jsonb not null default '[
    {"title":"Knowledge","description":"Education as the foundation of liberation and progress."},
    {"title":"Leadership","description":"Building capable leaders who serve with integrity."},
    {"title":"Equality","description":"Dignity and opportunity for every individual."},
    {"title":"Fraternity","description":"Collective growth through solidarity and service."}
  ]'::jsonb,
  community_work jsonb not null default '[
    {"title":"Blood Donation","slug":"blood-donation"},
    {"title":"Educational Programs","slug":"educational-programs"},
    {"title":"Legal Awareness","slug":"legal-awareness"},
    {"title":"Book Distribution","slug":"book-distribution"},
    {"title":"Scholarships","slug":"scholarships"},
    {"title":"Women''s Empowerment","slug":"womens-empowerment"},
    {"title":"Youth Development","slug":"youth-development"},
    {"title":"Volunteer Programs","slug":"volunteer-programs"}
  ]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

create index if not exists homepage_content_published_idx
  on public.homepage_content (is_published, updated_at desc);

drop trigger if exists homepage_content_set_updated_at on public.homepage_content;
create trigger homepage_content_set_updated_at
before update on public.homepage_content
for each row execute function public.set_updated_at();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

-- Seed default published homepage
insert into public.homepage_content (version, is_published)
select 1, true
where not exists (
  select 1 from public.homepage_content where is_published = true
);

-- Public read for published CMS; writes require website permissions
alter table public.homepage_content enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "Public can read published homepage" on public.homepage_content;
create policy "Public can read published homepage"
  on public.homepage_content for select
  using (is_published = true);

drop policy if exists "Editors can manage homepage" on public.homepage_content;
create policy "Editors can manage homepage"
  on public.homepage_content for all to authenticated
  using (public.current_user_has_permission('website', 'update'))
  with check (public.current_user_has_permission('website', 'update'));

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
  on public.site_settings for select
  using (true);

drop policy if exists "Editors can manage site settings" on public.site_settings;
create policy "Editors can manage site settings"
  on public.site_settings for all to authenticated
  using (public.current_user_has_permission('website', 'update'))
  with check (public.current_user_has_permission('website', 'update'));
