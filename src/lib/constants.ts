export const SITE = {
  name: "Brass Foundation",
  tagline: "Education · Empowerment · Equality",
  description:
    "An Ambedkarite organization dedicated to education, empowerment, equality, leadership, and community development.",
} as const;

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
