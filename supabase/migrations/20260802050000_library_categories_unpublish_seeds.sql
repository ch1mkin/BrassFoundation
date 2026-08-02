-- Unpublish original Digital Library demo seed rows (no real files).
-- Categories are code-defined; materials are uploaded via /admin/resources.

update public.resources
set
  is_published = false,
  updated_at = now()
where slug in (
  'constitution-of-india',
  'ambedkar-writings-vol-1',
  'rights-awareness-kit',
  'leadership-podcasts-s1'
)
and coalesce(file_url, '') = ''
and coalesce(external_url, '') = '';
