-- Translations, registration payments, contributions / mandates

-- UI / CMS string translations (admin-authored Punjabi preferred)
create table if not exists public.ui_translations (
  key text primary key,
  en text not null,
  pa text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

alter table public.ui_translations enable row level security;

drop policy if exists "ui_translations_public_read" on public.ui_translations;
create policy "ui_translations_public_read"
  on public.ui_translations for select
  to anon, authenticated
  using (true);

drop policy if exists "ui_translations_admin_write" on public.ui_translations;
create policy "ui_translations_admin_write"
  on public.ui_translations for all
  to authenticated
  using (public.current_user_has_permission('website', 'update'))
  with check (public.current_user_has_permission('website', 'update'));

-- Homepage Punjabi fields (instant switch when set)
alter table public.homepage_content
  add column if not exists hero_eyebrow_pa text,
  add column if not exists hero_headline_pa text,
  add column if not exists hero_subheadline_pa text,
  add column if not exists hero_cta_primary_label_pa text,
  add column if not exists hero_cta_secondary_label_pa text,
  add column if not exists about_eyebrow_pa text,
  add column if not exists about_headline_pa text,
  add column if not exists about_body_pa text,
  add column if not exists membership_headline_pa text,
  add column if not exists membership_body_pa text;

-- Membership registration extras
alter table public.membership_applications
  add column if not exists government_id text,
  add column if not exists consent_accepted_at timestamptz,
  add column if not exists consent_version text,
  add column if not exists signature_data_url text,
  add column if not exists registration_fee_paise int default 1000,
  add column if not exists payment_status text default 'unpaid';

do $$ begin
  alter table public.membership_applications
    drop constraint if exists membership_applications_payment_status_check;
  alter table public.membership_applications
    add constraint membership_applications_payment_status_check
    check (payment_status in ('unpaid','pending','paid','failed','refunded'));
exception when others then null;
end $$;

-- Payment orders (one-time registration + contribution charges)
create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  application_id uuid references public.membership_applications (id) on delete set null,
  purpose text not null check (purpose in ('registration_fee','contribution','other')),
  amount_paise int not null check (amount_paise > 0),
  currency text not null default 'INR',
  razorpay_order_id text unique,
  razorpay_payment_id text,
  razorpay_signature text,
  status text not null default 'created'
    check (status in ('created','paid','failed','refunded')),
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_orders_user_idx on public.payment_orders (user_id, created_at desc);

-- Monthly contribution mandates (Razorpay subscriptions)
create table if not exists public.payment_mandates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount_paise int not null check (amount_paise > 0),
  currency text not null default 'INR',
  razorpay_plan_id text,
  razorpay_subscription_id text unique,
  razorpay_customer_id text,
  status text not null default 'created'
    check (status in ('created','authenticated','active','halted','cancelled','completed','pending')),
  current_start timestamptz,
  current_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_mandates_user_idx on public.payment_mandates (user_id, created_at desc);

-- Unified transaction history
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  application_id uuid references public.membership_applications (id) on delete set null,
  order_id uuid references public.payment_orders (id) on delete set null,
  mandate_id uuid references public.payment_mandates (id) on delete set null,
  type text not null check (type in ('registration','contribution','refund','mandate_debit')),
  amount_paise int not null,
  currency text not null default 'INR',
  razorpay_payment_id text,
  status text not null default 'captured'
    check (status in ('created','authorized','captured','failed','refunded')),
  description text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_idx on public.transactions (user_id, created_at desc);
create index if not exists transactions_created_idx on public.transactions (created_at desc);

alter table public.payment_orders enable row level security;
alter table public.payment_mandates enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "payment_orders_own_read" on public.payment_orders;
create policy "payment_orders_own_read"
  on public.payment_orders for select to authenticated
  using (
    user_id = auth.uid()
    or public.current_user_has_permission('members', 'update')
    or public.current_user_has_permission('users', 'update')
  );

drop policy if exists "payment_mandates_own_read" on public.payment_mandates;
create policy "payment_mandates_own_read"
  on public.payment_mandates for select to authenticated
  using (
    user_id = auth.uid()
    or public.current_user_has_permission('members', 'update')
    or public.current_user_has_permission('users', 'update')
  );

drop policy if exists "transactions_own_read" on public.transactions;
create policy "transactions_own_read"
  on public.transactions for select to authenticated
  using (
    user_id = auth.uid()
    or public.current_user_has_permission('members', 'update')
    or public.current_user_has_permission('users', 'update')
  );

-- Seed common UI translation keys
insert into public.ui_translations (key, en, pa) values
  ('nav.home', 'Home', 'ਘਰ'),
  ('nav.about', 'About', 'ਬਾਰੇ'),
  ('nav.community', 'Community', 'ਕਮਿਊਨਿਟੀ'),
  ('nav.resources', 'Resources', 'ਸਰੋਤ'),
  ('nav.events', 'Events', 'ਸਮਾਗਮ'),
  ('nav.gallery', 'Gallery', 'ਗੈਲਰੀ'),
  ('nav.contact', 'Contact', 'ਸੰਪਰਕ'),
  ('nav.login', 'Login', 'ਲਾਗਇਨ'),
  ('nav.becomeMember', 'Become Member', 'ਮੈਂਬਰ ਬਣੋ'),
  ('membership.title', 'Become a Member', 'ਮੈਂਬਰ ਬਣੋ'),
  ('membership.subtitle', 'Register with your details, sign consent, and complete a ₹10 fee to join.', 'ਆਪਣੇ ਵੇਰਵੇ ਭਰੋ, ਸਹਿਮਤੀ ਫਾਰਮ ਤੇ ਦਸਤਖਤ ਕਰੋ, ਅਤੇ ₹10 ਫੀਸ ਭਰ ਕੇ ਜੁੜੋ।'),
  ('membership.consentTitle', 'Membership consent', 'ਮੈਂਬਰਸ਼ਿਪ ਸਹਿਮਤੀ'),
  ('contribution.title', 'Monthly contribution', 'ਮਾਸਿਕ ਯੋਗਦਾਨ'),
  ('contribution.subtitle', 'Choose an amount to set up a monthly mandate.', 'ਮਾਸਿਕ ਮੈਂਡੇਟ ਲਈ ਰਕਮ ਚੁਣੋ।')
on conflict (key) do nothing;
