-- Hero background framing: focal point + zoom for desktop and mobile
alter table public.homepage_content
  add column if not exists hero_bg_focus_x numeric not null default 50,
  add column if not exists hero_bg_focus_y numeric not null default 50,
  add column if not exists hero_bg_zoom numeric not null default 1,
  add column if not exists hero_bg_mobile_focus_x numeric not null default 50,
  add column if not exists hero_bg_mobile_focus_y numeric not null default 50,
  add column if not exists hero_bg_mobile_zoom numeric not null default 1;

comment on column public.homepage_content.hero_bg_focus_x is
  'Desktop hero object-position X percent (0–100)';
comment on column public.homepage_content.hero_bg_focus_y is
  'Desktop hero object-position Y percent (0–100)';
comment on column public.homepage_content.hero_bg_zoom is
  'Desktop hero zoom scale (1–3)';
comment on column public.homepage_content.hero_bg_mobile_focus_x is
  'Mobile hero object-position X percent (0–100)';
comment on column public.homepage_content.hero_bg_mobile_focus_y is
  'Mobile hero object-position Y percent (0–100)';
comment on column public.homepage_content.hero_bg_mobile_zoom is
  'Mobile hero zoom scale (1–3)';
