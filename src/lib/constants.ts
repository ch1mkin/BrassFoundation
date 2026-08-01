export const SITE = {
  name: "Brass Foundation",
  tagline: "Education · Empowerment · Equality",
  slogan: "Education to Prosperity",
  description:
    "Brass Foundation is dedicated to education, equality, leadership and community development inspired by the vision of Dr. B. R. Ambedkar.",
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
        label: "Community",
        description: "Chapters and local groups",
      },
      {
        href: "/events",
        label: "Events",
        description: "Programs and gatherings",
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
  { href: "/community", label: "Community" },
  { href: "/events", label: "Events" },
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

export const LEADERSHIP = [
  {
    name: "Dr. Anita Shinde",
    role: "President",
    bio: "A dedicated social activist with 20 years of experience in rural education reform.",
  },
  {
    name: "Rahul Kamble",
    role: "General Secretary",
    bio: "Specializing in digital infrastructure for remote learning programs.",
  },
  {
    name: "Prof. V. Jadhav",
    role: "Advisory Board",
    bio: "Former Vice-Chancellor with expertise in institutional development.",
  },
  {
    name: "Meena Pawar",
    role: "Treasurer",
    bio: "Financial expert focused on transparent resource allocation for NGO growth.",
  },
] as const;

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

export const RESOURCES_PREVIEW = [
  {
    title: "Constitution of India",
    subtitle: "Multi-language PDF Version",
    size: "12MB",
    icon: "menu_book",
    tone: "primary" as const,
  },
  {
    title: "Ambedkar’s Writings",
    subtitle: "Volume 1 - Educational Philosophy",
    size: "8MB",
    icon: "history_edu",
    tone: "secondary" as const,
  },
  {
    title: "Rights Awareness Kit",
    subtitle: "Guide for Rural Communities",
    size: "15MB",
    icon: "gavel",
    tone: "tertiary" as const,
  },
  {
    title: "Leadership Podcasts",
    subtitle: "Audio Series - Season 1",
    size: "240MB",
    icon: "mic",
    tone: "brand" as const,
  },
] as const;

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

export const DEFAULT_HOMEPAGE = {
  hero_eyebrow: "Brass Foundation",
  hero_headline: "Empowering Communities\nThrough Education.",
  hero_subheadline:
    "Brass Foundation is dedicated to education, equality, leadership and community development inspired by the vision of Dr. B. R. Ambedkar.",
  hero_cta_primary_label: "Become a Member",
  hero_cta_primary_href: "/membership",
  hero_cta_secondary_label: "Explore Resources",
  hero_cta_secondary_href: "/resources",
  about_eyebrow: "Our Mission & Vision",
  about_headline: "Our Mission & Vision",
  about_body:
    "Inspired by the profound legacy of Dr. B.R. Ambedkar, we strive to break down barriers to education and equality. Brass Foundation is more than an organization; it's a movement toward intellectual freedom.",
  membership_headline: "Become Part of the Movement",
  membership_body:
    "Join thousands of members dedicated to propagating the ideas of equality and justice through education.",
} as const;
