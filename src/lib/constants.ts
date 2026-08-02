export const SITE = {
  name: "Brass Foundation",
  tagline: "Education · Empowerment · Equality",
  slogan: "Education to Prosperity",
  description:
    "Bhim Rao Ambedkar Social Service Foundation (BRASS Foundation) advances education, equality, scientific thinking, constitutional values, and community empowerment.",
  logo: "/brand/logo.png",
} as const;

export type NavChild = {
  href: string;
  label: string;
  description?: string;
};

export type NavItem = {
  label: string;
  href?: string;
  children?: NavChild[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Explore",
    children: [
      {
        href: "/community",
        label: "Fraternity",
        description: "Chapters and local groups",
      },
      {
        href: "/events",
        label: "Events",
        description: "Programs and gatherings",
      },
      {
        href: "/must-read",
        label: "Must Read",
        description: "Essential books with PDF access",
      },
      {
        href: "/gallery",
        label: "Gallery",
        description: "Photos and moments",
      },
    ],
  },
  {
    label: "Learn",
    children: [
      {
        href: "/must-read",
        label: "Must Read",
        description: "Essential books with PDF access",
      },
      {
        href: "/resources",
        label: "Resources",
        description: "Books and study materials",
      },
      { href: "/news", label: "News", description: "Updates and announcements" },
      { href: "/blog", label: "Blog", description: "Stories and reflections" },
      {
        href: "/marketplace",
        label: "Marketplace",
        description: "Community listings",
      },
    ],
  },
  { label: "Contact", href: "/contact" },
];

export const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/community", label: "Fraternity" },
  { href: "/events", label: "Events" },
  { href: "/must-read", label: "Must Read" },
  { href: "/resources", label: "Resources" },
  { href: "/gallery", label: "Gallery" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/news", label: "News" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

export const STATS = [
  { label: "Members", value: 10000, suffix: "+", icon: "groups" },
  { label: "Events Held", value: 150, suffix: "+", icon: "event" },
  { label: "Books Distributed", value: 5000, suffix: "+", icon: "library_books" },
] as const;

export const CORE_VALUES = [
  {
    title: "Our Vision",
    description:
      "A society where every individual has the resources to lead and succeed.",
    icon: "visibility",
  },
  {
    title: "Our Mission",
    description:
      "Providing scholarships, mentorship, and educational materials to marginalized communities.",
    icon: "rocket_launch",
  },
] as const;

export const EXECUTIVE_COMMITTEE = [
  { name: "Sh. Labh Singh Gobindgarh", role: "Chairman" },
  { name: "Sh. Kuldip Singh", role: "Vice Chairman" },
  { name: "Sh. Lakhwinder Singh", role: "General Secretary" },
  { name: "Sh. Rinku Singh", role: "Treasurer" },
  { name: "Sh. Harwinder Singh", role: "Principal Advisor" },
  { name: "Sh. Gursewak Singh", role: "Advertising Secretary" },
  { name: "Sh. Ajaib Singh Neelowal", role: "Press Secretary" },
  { name: "Sh. Nirmal Singh", role: "Executive Member" },
  { name: "Sh. Jarnail Singh", role: "Executive Member" },
  { name: "Sh. Jagsir Singh", role: "Executive Member" },
  { name: "Sh. Harpreet Kaur", role: "Executive Member" },
  { name: "Adv. Hans Raj", role: "Legal Advisor" },
] as const;

/** @deprecated Use EXECUTIVE_COMMITTEE */
export const LEADERSHIP = EXECUTIVE_COMMITTEE.map((m) => ({
  name: m.name,
  role: m.role,
  bio: "",
}));


export const COMMUNITY_PAGE = {
  eyebrow: "Community Work",
  title: "Community Work",
  headline: "Empowering Communities Through Education and Service",
  intro:
    "Community development lies at the heart of everything we do. Our initiatives are designed not only to educate individuals but also to strengthen families and communities through knowledge, awareness, and collective participation.",
  initiatives: [
    {
      slug: "free-study-centres",
      title: "Free Study Centres",
      icon: "menu_book",
      body: "Our Study Centres provide academic assistance, mentoring, and a supportive learning environment for students and families building brighter futures through education. These centres help students grow academically while building confidence and life skills.",
      impact: [
        "150+ students supported",
        "10+ active study centres",
        "Free educational assistance",
        "Career guidance and mentorship",
        "2 Community Libraries",
      ],
    },
    {
      slug: "career-guidance-mentorship",
      title: "Career Guidance & Student Mentorship",
      icon: "school",
      body: "Education extends beyond classrooms. We regularly organize career guidance sessions, mentoring programs, and awareness workshops that help students make informed academic and professional decisions.",
    },
    {
      slug: "ambedkar-sports-meet",
      title: "Ambedkar Sports Meet",
      icon: "sports_soccer",
      body: "Held annually in November, the Sports Meet promotes teamwork, discipline, physical fitness, and leadership among young participants while encouraging community participation.",
    },
    {
      slug: "kranti-mela",
      title: "Kranti Mela",
      icon: "celebration",
      body: "Organized at Village Landhran, Jalandhar, during the last quarter of the financial year, Kranti Mela brings together educators, social workers, students, and community members to celebrate education, awareness, and social empowerment — in the memory of Late Actor, Educator and Social Worker Sh. Makhan Kranti.",
    },
    {
      slug: "mai-bhi-ambedkar-award",
      title: "Mai Bhi Ambedkar Award (MBA Award)",
      icon: "emoji_events",
      body: "Organized twice every year (February & August), this initiative recognizes individuals who demonstrate excellence in education, leadership, social service, and community contribution, encouraging others to become agents of positive change.",
    },
    {
      slug: "educational-tours",
      title: "Educational Tours",
      icon: "directions_bus",
      body: "Conducted during July–August, these educational tours expose students to new experiences, historical places, educational institutions, and cultural heritage, broadening their understanding beyond textbooks.",
    },
    {
      slug: "ambedkar-arts-utsav",
      title: "Ambedkar Arts Utsav",
      icon: "theater_comedy",
      body: "Organized every May, the Arts Utsav celebrates creativity through art, music, literature, theatre, poetry, and cultural performances inspired by the ideals of equality and social justice.",
    },
    {
      slug: "ambedkar-jagriti-kafila",
      title: "Ambedkar Jagriti Kafila",
      icon: "flag",
      body: "Held annually in December, this awareness campaign reaches communities through educational outreach, public interaction, and programs promoting constitutional values, education, and social awareness.",
    },
    {
      slug: "bahujan-kranti-mela",
      title: "Bahujan Kranti Mela",
      icon: "public",
      body: "A community gathering celebrating social awareness, education, culture, and collective progress. The event provides a platform for dialogue, learning, and community participation.",
    },
    {
      slug: "annual-general-body-meeting",
      title: "Annual General Body Meeting",
      icon: "groups",
      body: "Held annually on 4 April, coinciding with the birth anniversary of Dr. B. R. Ambedkar, the General Body Meeting reviews the Foundation's work, plans future initiatives, and strengthens community participation in organizational development.",
    },
    {
      slug: "womens-empowerment-wing",
      title:
        "Savitribai Phule & Fatima Sheikh Women's Empowerment Wing",
      icon: "diversity_3",
      body: "Inspired by the pioneering legacy of Savitribai Phule and Fatima Sheikh, this initiative is dedicated to empowering women through education, leadership, skill development, and social awareness. The Wing promotes equal opportunities, constitutional values, and self-reliance while encouraging women and girls to become confident leaders and active contributors to building an inclusive, educated, and progressive society.",
    },
  ],
} as const;

export const COMMUNITY_WORK = [
  {
    title: "Free Study Centres",
    slug: "free-study-centres",
    description:
      "Academic support, mentoring, and confidence-building for students growing through education — 150+ learners across 10+ centres.",
    badge: "IMPACT",
    badgeTone: "primary" as const,
  },
  {
    title: "Career Guidance & Mentorship",
    slug: "career-guidance-mentorship",
    description:
      "Workshops and mentoring that help students make informed academic and professional decisions.",
    badge: "ONGOING",
    badgeTone: "secondary" as const,
  },
  {
    title: "Women’s Empowerment Wing",
    slug: "womens-empowerment-wing",
    description:
      "Inspired by Savitribai Phule and Fatima Sheikh — education, leadership, and self-reliance for women and girls.",
    badge: "FEATURED",
    badgeTone: "tertiary" as const,
  },
] as const;

export const UPCOMING_EVENTS = [
  {
    month: "OCT",
    day: "14",
    title: "Ambedkar Memorial Lecture 2024",
    location: "Main Auditorium, City University",
    locationIcon: "location_on",
    tone: "primary" as const,
  },
  {
    month: "OCT",
    day: "22",
    title: "Career Guidance Seminar",
    location: "Online Webinar (Zoom)",
    locationIcon: "videocam",
    tone: "secondary" as const,
  },
] as const;

export const DEFAULT_RESOURCE_CATEGORIES = [
  {
    slug: "constitution-of-india",
    title: "Constitution of India",
    subtitle: "Multi-language PDF Version",
    icon: "menu_book",
    tone: "primary" as const,
  },
  {
    slug: "ambedkars-writings",
    title: "Ambedkar’s Writings",
    subtitle: "Educational Philosophy",
    icon: "history_edu",
    tone: "secondary" as const,
  },
  {
    slug: "rights-awareness-kit",
    title: "Rights Awareness Kit",
    subtitle: "Guide for Rural Communities",
    icon: "gavel",
    tone: "tertiary" as const,
  },
  {
    slug: "leadership-podcast",
    title: "Leadership Podcast",
    subtitle: "Audio Series",
    icon: "mic",
    tone: "brand" as const,
  },
] as const;

export const RESOURCE_CATEGORY_ICONS = [
  "menu_book",
  "history_edu",
  "gavel",
  "mic",
  "school",
  "auto_stories",
  "headphones",
  "video_library",
  "folder",
  "lightbulb",
  "diversity_3",
  "balance",
] as const;

/** @deprecated Prefer getResourceCategories() — kept for static fallbacks */
export const RESOURCE_CATEGORIES = DEFAULT_RESOURCE_CATEGORIES;

export type ResourceCategorySlug =
  (typeof DEFAULT_RESOURCE_CATEGORIES)[number]["slug"];

export function getResourceCategory(slug: string) {
  return (
    DEFAULT_RESOURCE_CATEGORIES.find((c) => c.slug === slug) ?? null
  );
}

export function isResourceCategorySlug(
  slug: string,
): slug is ResourceCategorySlug {
  return DEFAULT_RESOURCE_CATEGORIES.some((c) => c.slug === slug);
}

/** @deprecated Prefer RESOURCE_CATEGORIES / DB categories */
export const RESOURCES_PREVIEW = DEFAULT_RESOURCE_CATEGORIES.map((c) => ({
  title: c.title,
  subtitle: c.subtitle,
  size: "",
  icon: c.icon,
  tone: c.tone,
}));

export const FEATURED_BOOKS = [
  { title: "Annihilation of Caste", price: "₹399", rating: 5, reviews: 452 },
  {
    title: "The Buddha and His Dhamma",
    price: "₹549",
    rating: 4,
    reviews: 318,
  },
  { title: "Waiting for a Visa", price: "₹199", rating: 5, reviews: 210 },
] as const;

export const ABOUT_PAGE = {
  eyebrow: "About Us",
  title: "About Us",
  headline: "Building an Educated, Empowered, and Equal Society",
  paragraphs: [
    "Bhim Rao Ambedkar Social Service Foundation popularly known as BRASS Foundation, is a non-profit social organization dedicated to advancing education, equality, scientific thinking, constitutional values, and community empowerment. Inspired by the first pillar of Dr. B. R. Ambedkar's timeless message—\"Educate, Organize, Agitate\", we believe that education is the most powerful instrument for creating an enlightened, inclusive, and progressive society.",
    "Founded on the principle that every individual deserves access to quality education regardless of their social or economic background, BRASS Foundation works tirelessly to provide free educational support to poor and marginalized communities. Our mission extends beyond academics—we strive to cultivate scientific thinking, moral values, leadership, and social responsibility among the youth, empowering them to become informed citizens and catalysts for positive change.",
    "Through a network of study centres, educational initiatives, mentorship programs, community outreach activities, cultural events, and leadership development opportunities, we continue to create pathways for learning, growth, and social transformation.",
    "What began as a small initiative with a single study centre has today evolved into a growing movement that supports more than 150 students across over 10 locations. Alongside academic assistance, we provide career guidance, mentorship, personality development, and value-based education, helping students build brighter futures while contributing meaningfully to society.",
    "At BRASS Foundation, we believe that education is not merely the acquisition of knowledge—it is the foundation of dignity, equality, self-respect, and lasting social progress. Every child educated, every mind awakened, and every life empowered brings us one step closer to realizing the vision of a society built on justice, opportunity, and human dignity for all.",
  ],
} as const;

export const DEFAULT_ABOUT_QUOTES = [
  {
    quote:
      "Education is the most powerful weapon which you can use to change the world.",
    attribution: "Dr. B. R. Ambedkar",
    image_url: "",
  },
] as const;

export const DEFAULT_HOMEPAGE = {
  hero_eyebrow: "Brass Foundation",
  hero_headline: "Empowering Communities\nThrough Education.",
  hero_subheadline:
    "Brass Foundation is dedicated to education, equality, leadership and community development inspired by the vision of Dr. B. R. Ambedkar.",
  hero_cta_primary_label: "Become a Member",
  hero_cta_primary_href: "/membership",
  hero_cta_secondary_label: "Explore Resources",
  hero_cta_secondary_href: "/resources",
  about_eyebrow: "About Us",
  about_headline: "Building an Educated, Empowered, and Equal Society",
  about_body:
    "Bhim Rao Ambedkar Social Service Foundation popularly known as BRASS Foundation, is a non-profit social organization dedicated to advancing education, equality, scientific thinking, constitutional values, and community empowerment. Inspired by the first pillar of Dr. B. R. Ambedkar's timeless message—\"Educate, Organize, Agitate\", we believe that education is the most powerful instrument for creating an enlightened, inclusive, and progressive society.",
  membership_headline: "Become Part of the Movement",
  membership_body:
    "Join thousands of members dedicated to propagating the ideas of equality and justice through education.",
} as const;
