-- Paid Featured Books: purchases + owner confirmation entitlement

-- Allow book_purchase on payment_orders.purpose
do $$ begin
  alter table public.payment_orders
    drop constraint if exists payment_orders_purpose_check;
  alter table public.payment_orders
    add constraint payment_orders_purpose_check
    check (purpose in ('registration_fee', 'contribution', 'book_purchase', 'other'));
exception when others then null;
end $$;

create table if not exists public.book_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  marketplace_item_id uuid not null references public.marketplace_items (id) on delete cascade,
  payment_order_id uuid references public.payment_orders (id) on delete set null,
  status text not null default 'pending_payment'
    check (status in (
      'pending_payment',
      'paid_awaiting_approval',
      'approved',
      'rejected'
    )),
  buyer_name text,
  buyer_email text,
  buyer_phone text,
  paid_at timestamptz,
  approved_at timestamptz,
  approved_by uuid references public.profiles (id) on delete set null,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, marketplace_item_id)
);

create index if not exists book_purchases_user_idx
  on public.book_purchases (user_id, status);
create index if not exists book_purchases_status_idx
  on public.book_purchases (status, created_at desc);
create index if not exists book_purchases_item_idx
  on public.book_purchases (marketplace_item_id);

alter table public.book_purchases enable row level security;

drop policy if exists "book_purchases_select_own" on public.book_purchases;
create policy "book_purchases_select_own"
  on public.book_purchases for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.current_user_has_permission('marketplace', 'read')
  );

drop policy if exists "book_purchases_admin_all" on public.book_purchases;
create policy "book_purchases_admin_all"
  on public.book_purchases for all
  to authenticated
  using (public.current_user_has_permission('marketplace', 'update'))
  with check (public.current_user_has_permission('marketplace', 'update'));

-- Unpublish demo marketplace seeds that have no PDF
update public.marketplace_items
set
  is_published = false,
  is_featured = false,
  updated_at = now()
where slug in (
  'annihilation-of-caste',
  'buddha-and-his-dhamma',
  'waiting-for-a-visa'
)
and coalesce(file_url, '') = '';
