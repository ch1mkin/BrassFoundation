-- Hero background image for homepage CMS

alter table public.homepage_content
  add column if not exists hero_background_url text;
