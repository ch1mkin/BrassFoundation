-- Allow "General" as a membership / family category alongside SC, ST, OBC

comment on column public.membership_applications.category is
  'Reservation category: SC, ST, OBC, or GENERAL';

alter table public.family_members
  drop constraint if exists family_members_category_check;

alter table public.family_members
  add constraint family_members_category_check
  check (category in ('SC', 'ST', 'OBC', 'GENERAL'));
