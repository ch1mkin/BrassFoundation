-- Quote/image slider, events section background, admin panel background

alter table public.homepage_content
  add column if not exists about_quotes jsonb not null default '[
    {
      "quote": "Education is the most powerful weapon which you can use to change the world.",
      "attribution": "Dr. B. R. Ambedkar",
      "image_url": ""
    }
  ]'::jsonb;

alter table public.homepage_content
  add column if not exists events_background_url text;

alter table public.homepage_content
  add column if not exists admin_background_url text;

comment on column public.homepage_content.about_quotes is
  'Array of { quote, attribution?, image_url? } for the About vision slider.';
comment on column public.homepage_content.events_background_url is
  'Optional background image behind the Upcoming Events section.';
comment on column public.homepage_content.admin_background_url is
  'Optional background image for the admin portal main area.';
