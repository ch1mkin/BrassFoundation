-- Editable Digital Library categories (admin can add more with icons)

create table if not exists public.resource_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  icon text not null default 'menu_book',
  tone text not null default 'primary'
    check (tone in ('primary', 'secondary', 'tertiary', 'brand')),
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resource_categories_sort_idx
  on public.resource_categories (is_published, sort_order);

alter table public.resource_categories enable row level security;

drop policy if exists "resource_categories_public_read" on public.resource_categories;
create policy "resource_categories_public_read"
  on public.resource_categories for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "resource_categories_admin_all" on public.resource_categories;
create policy "resource_categories_admin_all"
  on public.resource_categories for all
  to authenticated
  using (public.current_user_has_permission('resources', 'update'))
  with check (public.current_user_has_permission('resources', 'update'));

insert into public.resource_categories (slug, title, subtitle, icon, tone, sort_order)
values
  ('constitution-of-india', 'Constitution of India', 'Multi-language PDF Version', 'menu_book', 'primary', 1),
  ('ambedkars-writings', 'Ambedkar’s Writings', 'Educational Philosophy', 'history_edu', 'secondary', 2),
  ('rights-awareness-kit', 'Rights Awareness Kit', 'Guide for Rural Communities', 'gavel', 'tertiary', 3),
  ('leadership-podcast', 'Leadership Podcast', 'Audio Series', 'mic', 'brand', 4)
on conflict (slug) do nothing;
