-- Allow family membership fee payments on payment_orders.purpose
alter table public.payment_orders
  drop constraint if exists payment_orders_purpose_check;

alter table public.payment_orders
  add constraint payment_orders_purpose_check
  check (
    purpose in (
      'registration_fee',
      'contribution',
      'book_purchase',
      'family_registration',
      'other'
    )
  );
