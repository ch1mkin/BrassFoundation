-- Website content modules: events, news, resources, community, gallery,
-- marketplace items, contact messages, newsletter

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  body text,
  location text,
  location_icon text not null default 'location_on',
  starts_at timestamptz not null,
  ends_at timestamptz,
  registration_open boolean not null default true,
  is_published boolean not null default true,
  is_featured boolean not null default false,
  cover_image_url text,
  max_attendees integer,
  tone text not null default 'primary',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_published_starts_idx
  on public.events (is_published, starts_at);

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  notes text,
  status text not null default 'registered'
    check (status in ('registered', 'cancelled', 'attended', 'waitlisted')),
  created_at timestamptz not null default now(),
  unique (event_id, email)
);

create index if not exists event_registrations_event_idx
  on public.event_registrations (event_id, created_at desc);

-- ---------------------------------------------------------------------------
-- News
-- ---------------------------------------------------------------------------
create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body text,
  category text not null default 'announcement',
  cover_image_url text,
  is_published boolean not null default true,
  is_pinned boolean not null default false,
  published_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists news_posts_published_idx
  on public.news_posts (is_published, published_at desc);

-- ---------------------------------------------------------------------------
-- Resources
-- ---------------------------------------------------------------------------
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  description text,
  category text not null default 'general',
  resource_type text not null default 'pdf'
    check (resource_type in ('pdf', 'video', 'audio', 'link', 'other')),
  file_url text,
  external_url text,
  file_size_label text,
  icon text not null default 'menu_book',
  tone text not null default 'primary',
  is_published boolean not null default true,
  is_featured boolean not null default false,
  requires_membership boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resources_published_idx
  on public.resources (is_published, sort_order, created_at desc);

-- ---------------------------------------------------------------------------
-- Community projects
-- ---------------------------------------------------------------------------
create table if not exists public.community_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  body text,
  badge text,
  badge_tone text not null default 'primary',
  cover_image_url text,
  status text not null default 'ongoing'
    check (status in ('planned', 'ongoing', 'completed', 'urgent')),
  impact_text text,
  is_published boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists community_projects_published_idx
  on public.community_projects (is_published, sort_order);

-- ---------------------------------------------------------------------------
-- Gallery
-- ---------------------------------------------------------------------------
create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  cover_image_url text,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_media (
  id uuid primary key default gen_random_uuid(),
  album_id uuid references public.gallery_albums (id) on delete cascade,
  title text,
  media_type text not null default 'image'
    check (media_type in ('image', 'video')),
  media_url text not null,
  thumbnail_url text,
  caption text,
  is_published boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists gallery_media_published_idx
  on public.gallery_media (is_published, sort_order);

-- ---------------------------------------------------------------------------
-- Marketplace items (books / publications)
-- ---------------------------------------------------------------------------
create table if not exists public.marketplace_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  author text,
  summary text,
  cover_image_url text,
  price_label text not null default 'Free',
  price_paise integer,
  rating numeric(2,1) default 5.0,
  review_count integer not null default 0,
  category text not null default 'book',
  buy_url text,
  is_published boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketplace_items_published_idx
  on public.marketplace_items (is_published, sort_order);

-- ---------------------------------------------------------------------------
-- Contact + newsletter
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  form_type text not null default 'contact'
    check (form_type in ('contact', 'volunteer', 'complaint', 'suggestion')),
  status text not null default 'new'
    check (status in ('new', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_idx
  on public.contact_messages (created_at desc);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Updated-at triggers
-- ---------------------------------------------------------------------------
drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists news_posts_set_updated_at on public.news_posts;
create trigger news_posts_set_updated_at
before update on public.news_posts
for each row execute function public.set_updated_at();

drop trigger if exists resources_set_updated_at on public.resources;
create trigger resources_set_updated_at
before update on public.resources
for each row execute function public.set_updated_at();

drop trigger if exists community_projects_set_updated_at on public.community_projects;
create trigger community_projects_set_updated_at
before update on public.community_projects
for each row execute function public.set_updated_at();

drop trigger if exists gallery_albums_set_updated_at on public.gallery_albums;
create trigger gallery_albums_set_updated_at
before update on public.gallery_albums
for each row execute function public.set_updated_at();

drop trigger if exists marketplace_items_set_updated_at on public.marketplace_items;
create trigger marketplace_items_set_updated_at
before update on public.marketplace_items
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Seed starter content (idempotent by slug)
-- ---------------------------------------------------------------------------
insert into public.events (
  slug, title, summary, location, location_icon, starts_at, tone, is_featured
)
values
  (
    'ambedkar-memorial-lecture-2024',
    'Ambedkar Memorial Lecture 2024',
    'An evening of reflection on education, equality, and constitutional values.',
    'Main Auditorium, City University',
    'location_on',
    timestamptz '2026-10-14 17:00:00+05:30',
    'primary',
    true
  ),
  (
    'career-guidance-seminar',
    'Career Guidance Seminar',
    'Practical guidance for students and young professionals.',
    'Online Webinar (Zoom)',
    'videocam',
    timestamptz '2026-10-22 18:00:00+05:30',
    'secondary',
    true
  )
on conflict (slug) do nothing;

insert into public.news_posts (slug, title, excerpt, body, category, is_pinned)
values
  (
    'scholarship-outreach-expansion',
    'Foundation expands scholarship outreach',
    'New district partners join our education support network.',
    'Brass Foundation is expanding scholarship outreach with new district partners focused on school readiness and higher-education access.',
    'announcement',
    true
  ),
  (
    'leadership-circle-cohort',
    'District leadership circle announces cohort',
    'A new cohort of community organizers begins training this month.',
    'The leadership circle will focus on local education drives, rights awareness, and volunteer coordination.',
    'article',
    false
  )
on conflict (slug) do nothing;

insert into public.resources (
  slug, title, subtitle, file_size_label, icon, tone, resource_type, is_featured, sort_order
)
values
  ('constitution-of-india', 'Constitution of India', 'Multi-language PDF Version', '12MB', 'menu_book', 'primary', 'pdf', true, 1),
  ('ambedkar-writings-vol-1', 'Ambedkar’s Writings', 'Volume 1 - Educational Philosophy', '8MB', 'history_edu', 'secondary', 'pdf', true, 2),
  ('rights-awareness-kit', 'Rights Awareness Kit', 'Guide for Rural Communities', '15MB', 'gavel', 'tertiary', 'pdf', true, 3),
  ('leadership-podcasts-s1', 'Leadership Podcasts', 'Audio Series - Season 1', '240MB', 'mic', 'brand', 'audio', true, 4)
on conflict (slug) do nothing;

insert into public.community_projects (
  slug, title, summary, badge, badge_tone, status, is_featured, sort_order
)
values
  (
    'blood-donation',
    'Blood Donation Camps',
    'Organizing quarterly camps to support local hospitals and emergency reserves.',
    'URGENT',
    'error',
    'urgent',
    true,
    1
  ),
  (
    'digital-literacy',
    'Digital Literacy Program',
    'Empowering youth with coding, software use, and internet navigation skills.',
    'ONGOING',
    'primary',
    'ongoing',
    true,
    2
  ),
  (
    'women-leadership-circle',
    'Women Leadership Circle',
    'Providing a platform for women to develop leadership skills and community impact.',
    'FEATURED',
    'secondary',
    'ongoing',
    true,
    3
  )
on conflict (slug) do nothing;

insert into public.marketplace_items (
  slug, title, author, price_label, rating, review_count, is_featured, sort_order
)
values
  ('annihilation-of-caste', 'Annihilation of Caste', 'Dr. B. R. Ambedkar', '₹399', 5.0, 452, true, 1),
  ('buddha-and-his-dhamma', 'The Buddha and His Dhamma', 'Dr. B. R. Ambedkar', '₹549', 4.0, 318, true, 2),
  ('waiting-for-a-visa', 'Waiting for a Visa', 'Dr. B. R. Ambedkar', '₹199', 5.0, 210, true, 3)
on conflict (slug) do nothing;

insert into public.gallery_albums (slug, title, description, is_published)
values (
  'moments-of-impact',
  'Moments of Impact',
  'Community programs, camps, and celebrations.',
  true
)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.news_posts enable row level security;
alter table public.resources enable row level security;
alter table public.community_projects enable row level security;
alter table public.gallery_albums enable row level security;
alter table public.gallery_media enable row level security;
alter table public.marketplace_items enable row level security;
alter table public.contact_messages enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Public read published
drop policy if exists "Public read published events" on public.events;
create policy "Public read published events"
  on public.events for select using (is_published = true);

drop policy if exists "Public read published news" on public.news_posts;
create policy "Public read published news"
  on public.news_posts for select using (is_published = true);

drop policy if exists "Public read published resources" on public.resources;
create policy "Public read published resources"
  on public.resources for select using (is_published = true);

drop policy if exists "Public read published community" on public.community_projects;
create policy "Public read published community"
  on public.community_projects for select using (is_published = true);

drop policy if exists "Public read published albums" on public.gallery_albums;
create policy "Public read published albums"
  on public.gallery_albums for select using (is_published = true);

drop policy if exists "Public read published media" on public.gallery_media;
create policy "Public read published media"
  on public.gallery_media for select using (is_published = true);

drop policy if exists "Public read published marketplace" on public.marketplace_items;
create policy "Public read published marketplace"
  on public.marketplace_items for select using (is_published = true);

-- Public inserts
drop policy if exists "Anyone can register for events" on public.event_registrations;
create policy "Anyone can register for events"
  on public.event_registrations for insert
  with check (true);

drop policy if exists "Public can insert contact messages" on public.contact_messages;
create policy "Public can insert contact messages"
  on public.contact_messages for insert
  with check (true);

drop policy if exists "Public can subscribe newsletter" on public.newsletter_subscribers;
create policy "Public can subscribe newsletter"
  on public.newsletter_subscribers for insert
  with check (true);

-- Admin manage policies
drop policy if exists "Admins manage events" on public.events;
create policy "Admins manage events"
  on public.events for all to authenticated
  using (
    public.current_user_has_permission('events', 'update')
    or public.current_user_has_permission('events', 'create')
  )
  with check (
    public.current_user_has_permission('events', 'update')
    or public.current_user_has_permission('events', 'create')
  );

drop policy if exists "Admins manage event registrations" on public.event_registrations;
create policy "Admins manage event registrations"
  on public.event_registrations for all to authenticated
  using (public.current_user_has_permission('events', 'read'))
  with check (public.current_user_has_permission('events', 'update'));

drop policy if exists "Admins manage news" on public.news_posts;
create policy "Admins manage news"
  on public.news_posts for all to authenticated
  using (
    public.current_user_has_permission('news', 'update')
    or public.current_user_has_permission('news', 'create')
  )
  with check (
    public.current_user_has_permission('news', 'update')
    or public.current_user_has_permission('news', 'create')
  );

drop policy if exists "Admins manage resources" on public.resources;
create policy "Admins manage resources"
  on public.resources for all to authenticated
  using (
    public.current_user_has_permission('resources', 'update')
    or public.current_user_has_permission('resources', 'create')
  )
  with check (
    public.current_user_has_permission('resources', 'update')
    or public.current_user_has_permission('resources', 'create')
  );

drop policy if exists "Admins manage community" on public.community_projects;
create policy "Admins manage community"
  on public.community_projects for all to authenticated
  using (
    public.current_user_has_permission('community', 'update')
    or public.current_user_has_permission('community', 'create')
  )
  with check (
    public.current_user_has_permission('community', 'update')
    or public.current_user_has_permission('community', 'create')
  );

drop policy if exists "Admins manage gallery albums" on public.gallery_albums;
create policy "Admins manage gallery albums"
  on public.gallery_albums for all to authenticated
  using (
    public.current_user_has_permission('gallery', 'update')
    or public.current_user_has_permission('gallery', 'create')
  )
  with check (
    public.current_user_has_permission('gallery', 'update')
    or public.current_user_has_permission('gallery', 'create')
  );

drop policy if exists "Admins manage gallery media" on public.gallery_media;
create policy "Admins manage gallery media"
  on public.gallery_media for all to authenticated
  using (
    public.current_user_has_permission('gallery', 'update')
    or public.current_user_has_permission('gallery', 'create')
  )
  with check (
    public.current_user_has_permission('gallery', 'update')
    or public.current_user_has_permission('gallery', 'create')
  );

drop policy if exists "Admins manage marketplace" on public.marketplace_items;
create policy "Admins manage marketplace"
  on public.marketplace_items for all to authenticated
  using (
    public.current_user_has_permission('marketplace', 'update')
    or public.current_user_has_permission('marketplace', 'create')
  )
  with check (
    public.current_user_has_permission('marketplace', 'update')
    or public.current_user_has_permission('marketplace', 'create')
  );

drop policy if exists "Admins read contact messages" on public.contact_messages;
create policy "Admins read contact messages"
  on public.contact_messages for select to authenticated
  using (public.current_user_has_permission('website', 'read'));

drop policy if exists "Admins update contact messages" on public.contact_messages;
create policy "Admins update contact messages"
  on public.contact_messages for update to authenticated
  using (public.current_user_has_permission('website', 'update'))
  with check (public.current_user_has_permission('website', 'update'));

drop policy if exists "Admins read newsletter" on public.newsletter_subscribers;
create policy "Admins read newsletter"
  on public.newsletter_subscribers for select to authenticated
  using (public.current_user_has_permission('website', 'read'));
