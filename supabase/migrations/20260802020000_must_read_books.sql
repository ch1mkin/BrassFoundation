-- Must-read books (homepage section + admin-managed PDF links)

create table if not exists public.must_read_books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  summary text,
  cover_image_url text,
  pdf_url text not null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists must_read_books_published_idx
  on public.must_read_books (is_published, sort_order);

drop trigger if exists must_read_books_set_updated_at on public.must_read_books;
create trigger must_read_books_set_updated_at
before update on public.must_read_books
for each row execute function public.set_updated_at();

alter table public.must_read_books enable row level security;

drop policy if exists "Public read published must-read books" on public.must_read_books;
create policy "Public read published must-read books"
  on public.must_read_books for select
  using (is_published = true);

drop policy if exists "Admins manage must-read books" on public.must_read_books;
create policy "Admins manage must-read books"
  on public.must_read_books for all to authenticated
  using (
    public.current_user_has_permission('marketplace', 'update')
    or public.current_user_has_permission('marketplace', 'create')
    or public.current_user_has_permission('website', 'update')
  )
  with check (
    public.current_user_has_permission('marketplace', 'update')
    or public.current_user_has_permission('marketplace', 'create')
    or public.current_user_has_permission('website', 'update')
  );
