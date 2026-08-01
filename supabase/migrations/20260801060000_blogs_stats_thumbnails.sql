-- Blogs + resource PDF thumbnails + homepage stats defaults

alter table public.resources
  add column if not exists thumbnail_url text;

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body_html text not null default '',
  cover_image_url text,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  published_at timestamptz,
  author_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_published_idx
  on public.blog_posts (is_published, published_at desc);

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

alter table public.blog_posts enable row level security;

drop policy if exists "Public read published blogs" on public.blog_posts;
create policy "Public read published blogs"
  on public.blog_posts for select
  using (is_published = true);

drop policy if exists "Admins manage blogs" on public.blog_posts;
create policy "Admins manage blogs"
  on public.blog_posts for all to authenticated
  using (
    public.current_user_has_permission('news', 'update')
    or public.current_user_has_permission('news', 'create')
    or public.current_user_has_permission('website', 'update')
  )
  with check (
    public.current_user_has_permission('news', 'update')
    or public.current_user_has_permission('news', 'create')
    or public.current_user_has_permission('website', 'update')
  );

-- Refresh default homepage stats (members + events focused)
update public.homepage_content
set stats = '[
  {"label":"Members","value":10000,"suffix":"+","icon":"groups"},
  {"label":"Events Held","value":150,"suffix":"+","icon":"event"},
  {"label":"Books Distributed","value":5000,"suffix":"+","icon":"library_books"}
]'::jsonb
where is_published = true
  and (
    stats::text like '%Scholarships%'
    or stats::text like '%Districts%'
    or stats::text like '%Books Published%'
  );
