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


export const COMMUNITY_WORK = [
  {
    title: "Blood Donation Camps",
    slug: "blood-donation",
    description:
      "Organizing quarterly camps to support local hospitals and emergency reserves.",
    badge: "URGENT",
    badgeTone: "error" as const,
  },
  {
    title: "Digital Literacy Program",
    slug: "educational-programs",
    description:
      "Empowering youth with coding, software use, and internet navigation skills.",
    badge: "ONGOING",
    badgeTone: "primary" as const,
  },
  {
    title: "Women Leadership Circle",
    slug: "womens-empowerment",
    description:
      "Providing a platform for women to develop leadership skills and community impact.",
    badge: "FEATURED",
    badgeTone: "secondary" as const,
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
