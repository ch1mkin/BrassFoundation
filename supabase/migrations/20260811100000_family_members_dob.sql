-- Store DOB for family members (age remains for fee logic / reporting).
alter table public.family_members
  add column if not exists date_of_birth date;
