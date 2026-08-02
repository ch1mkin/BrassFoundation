-- Rename core value "Community" → "Fraternity" on homepage CMS

update public.homepage_content
set core_values = (
  select coalesce(
    jsonb_agg(
      case
        when elem->>'title' = 'Community'
          then jsonb_set(elem, '{title}', '"Fraternity"')
        else elem
      end
      order by ordinality
    ),
    '[]'::jsonb
  )
  from jsonb_array_elements(coalesce(core_values, '[]'::jsonb))
    with ordinality as t(elem, ordinality)
)
where core_values is not null
  and core_values::text like '%Community%';
