-- Card thumbnails for Digital Library / resource category cards

alter table public.resource_categories
  add column if not exists thumbnail_url text;

comment on column public.resource_categories.thumbnail_url is
  'Optional cover image for homepage and /resources category cards';
