-- Optional mobile-specific hero background
alter table public.homepage_content
  add column if not exists hero_background_mobile_url text;
