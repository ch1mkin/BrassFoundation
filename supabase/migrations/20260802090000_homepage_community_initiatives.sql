-- Homepage initiative cards (match site COMMUNITY_WORK slugs)
insert into public.community_projects (
  slug, title, summary, badge, badge_tone, status, is_featured, is_published, sort_order
)
values
  (
    'free-study-centres',
    'Free Study Centres',
    'Academic support, mentoring, and confidence-building for students growing through education — 150+ learners across 10+ centres.',
    'IMPACT',
    'primary',
    'ongoing',
    true,
    true,
    1
  ),
  (
    'career-guidance-mentorship',
    'Career Guidance & Mentorship',
    'Workshops and mentoring that help students make informed academic and professional decisions.',
    'ONGOING',
    'secondary',
    'ongoing',
    true,
    true,
    2
  ),
  (
    'womens-empowerment-wing',
    'Women''s Empowerment Wing',
    'Inspired by Savitribai Phule and Fatima Sheikh — education, leadership, and self-reliance for women and girls.',
    'FEATURED',
    'tertiary',
    'ongoing',
    true,
    true,
    3
  )
on conflict (slug) do update set
  title = excluded.title,
  summary = coalesce(public.community_projects.summary, excluded.summary),
  badge = excluded.badge,
  badge_tone = excluded.badge_tone,
  is_featured = true,
  is_published = true,
  sort_order = excluded.sort_order;

-- Older seed cards should not displace homepage initiatives
update public.community_projects
set is_featured = false
where slug in (
  'blood-donation',
  'digital-literacy',
  'women-leadership-circle'
);
