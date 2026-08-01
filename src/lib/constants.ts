export const SITE = {
  name: "Brass Foundation",
  tagline: "Education · Empowerment · Equality",
  slogan: "Education to Prosperity",
  description:
    "An Ambedkarite organization dedicated to education, empowerment, equality, leadership, and community development.",
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
  {
    label: "About",
    href: "/about",
    children: [
      {
        href: "/about",
        label: "Who We Are",
        description: "Mission, vision, and founding purpose",
      },
      {
        href: "/about#history",
        label: "History",
        description: "Our journey and milestones",
      },
      {
        href: "/about#founder",
        label: "Founder Message",
        description: "Words that guide the foundation",
      },
      {
        href: "/about#team",
        label: "Leadership",
        description: "Organization structure and team",
      },
    ],
  },
  {
    label: "Engage",
    children: [
      {
        href: "/community",
        label: "Community Work",
        description: "Programs that create impact",
      },
      {
        href: "/events",
        label: "Events",
        description: "Upcoming gatherings and camps",
      },
      {
        href: "/membership",
        label: "Membership",
        description: "Join and grow with us",
      },
    ],
  },
  {
    label: "Learn",
    children: [
      {
        href: "/resources",
        label: "Resources",
        description: "Books, PDFs, and study material",
      },
      {
        href: "/marketplace",
        label: "Marketplace",
        description: "Community publishing platform",
      },
      {
        href: "/news",
        label: "News",
        description: "Announcements and articles",
      },
    ],
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

/** Flat links kept for footer / simple lists */
export const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/community", label: "Community" },
  { href: "/events", label: "Events" },
  { href: "/resources", label: "Resources" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
] as const;

export const STATS = [
  { label: "Members", value: 2500, suffix: "+" },
  { label: "Events", value: 180, suffix: "+" },
  { label: "Scholarships", value: 420, suffix: "+" },
  { label: "Districts", value: 45, suffix: "+" },
  { label: "Books Published", value: 65, suffix: "+" },
  { label: "Community Drives", value: 310, suffix: "+" },
] as const;

export const CORE_VALUES = [
  {
    title: "Knowledge",
    description: "Education as the foundation of liberation and progress.",
  },
  {
    title: "Leadership",
    description: "Building capable leaders who serve with integrity.",
  },
  {
    title: "Equality",
    description: "Dignity and opportunity for every individual.",
  },
  {
    title: "Community",
    description: "Collective growth through solidarity and service.",
  },
] as const;

export const COMMUNITY_WORK = [
  { title: "Blood Donation", slug: "blood-donation" },
  { title: "Educational Programs", slug: "educational-programs" },
  { title: "Legal Awareness", slug: "legal-awareness" },
  { title: "Book Distribution", slug: "book-distribution" },
  { title: "Scholarships", slug: "scholarships" },
  { title: "Women's Empowerment", slug: "womens-empowerment" },
  { title: "Youth Development", slug: "youth-development" },
  { title: "Volunteer Programs", slug: "volunteer-programs" },
] as const;

/** Fallback homepage CMS content until Supabase CMS is seeded */
export const DEFAULT_HOMEPAGE = {
  hero_eyebrow: "Brass Foundation",
  hero_headline: "Knowledge that liberates.\nCommunity that rises.",
  hero_subheadline:
    "An Ambedkarite organization building education, equality, and leadership for generations ahead.",
  hero_cta_primary_label: "Become a Member",
  hero_cta_primary_href: "/membership",
  hero_cta_secondary_label: "Explore Resources",
  hero_cta_secondary_href: "/resources",
  about_eyebrow: "Who We Are",
  about_headline:
    "Building a platform for dignity, learning, and collective progress.",
  about_body:
    "Brass Foundation exists to advance Ambedkarite values through education, community service, and leadership development — with professionalism that matches our purpose.",
  membership_headline: "Join Brass Foundation.",
  membership_body:
    "Register online, receive your digital membership card, and take part in programs that advance education and equality.",
} as const;
