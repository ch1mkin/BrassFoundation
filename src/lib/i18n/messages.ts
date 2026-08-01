import type { Locale } from "@/lib/i18n/config";

export type MessageKey =
  | "nav.home"
  | "nav.about"
  | "nav.community"
  | "nav.resources"
  | "nav.events"
  | "nav.gallery"
  | "nav.contact"
  | "nav.login"
  | "nav.becomeMember"
  | "nav.memberPortal"
  | "nav.adminPortal"
  | "nav.signOut"
  | "footer.blurb"
  | "footer.quickLinks"
  | "footer.community"
  | "footer.contactUs"
  | "footer.becomeMember"
  | "footer.gallery"
  | "footer.marketplace"
  | "footer.contact"
  | "footer.rights"
  | "footer.newsletterPlaceholder"
  | "footer.newsletterJoin"
  | "lang.switchTo"
  | "lang.english"
  | "lang.punjabi";

const en: Record<MessageKey, string> = {
  "nav.home": "Home",
  "nav.about": "About",
  "nav.community": "Community",
  "nav.resources": "Resources",
  "nav.events": "Events",
  "nav.gallery": "Gallery",
  "nav.contact": "Contact",
  "nav.login": "Login",
  "nav.becomeMember": "Become Member",
  "nav.memberPortal": "Member portal",
  "nav.adminPortal": "Admin portal",
  "nav.signOut": "Sign out",
  "footer.blurb":
    "Empowering the marginalized through the light of knowledge and unity.",
  "footer.quickLinks": "Quick Links",
  "footer.community": "Community",
  "footer.contactUs": "Contact Us",
  "footer.becomeMember": "Become a Member",
  "footer.gallery": "Gallery",
  "footer.marketplace": "Marketplace",
  "footer.contact": "Contact",
  "footer.rights": "All rights reserved.",
  "footer.newsletterPlaceholder": "Email for updates",
  "footer.newsletterJoin": "Join",
  "lang.switchTo": "Language",
  "lang.english": "English",
  "lang.punjabi": "ਪੰਜਾਬੀ",
};

/** Hand-tuned Gurmukhi for chrome (nav/footer) — page body uses auto-translate */
const pa: Record<MessageKey, string> = {
  "nav.home": "ਘਰ",
  "nav.about": "ਬਾਰੇ",
  "nav.community": "ਕਮਿਊਨਿਟੀ",
  "nav.resources": "ਸਰੋਤ",
  "nav.events": "ਸਮਾਗਮ",
  "nav.gallery": "ਗੈਲਰੀ",
  "nav.contact": "ਸੰਪਰਕ",
  "nav.login": "ਲਾਗਇਨ",
  "nav.becomeMember": "ਮੈਂਬਰ ਬਣੋ",
  "nav.memberPortal": "ਮੈਂਬਰ ਪੋਰਟਲ",
  "nav.adminPortal": "ਐਡਮਿਨ ਪੋਰਟਲ",
  "nav.signOut": "ਸਾਈਨ ਆਉਟ",
  "footer.blurb":
    "ਗਿਆਨ ਅਤੇ ਏਕਤਾ ਦੀ ਰੋਸ਼ਨੀ ਨਾਲ ਪਿਛੜੇ ਵਰਗਾਂ ਨੂੰ ਸਸ਼ਕਤ ਬਣਾਉਣਾ।",
  "footer.quickLinks": "ਤੇਜ਼ ਲਿੰਕ",
  "footer.community": "ਕਮਿਊਨਿਟੀ",
  "footer.contactUs": "ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੋ",
  "footer.becomeMember": "ਮੈਂਬਰ ਬਣੋ",
  "footer.gallery": "ਗੈਲਰੀ",
  "footer.marketplace": "ਬਾਜ਼ਾਰ",
  "footer.contact": "ਸੰਪਰਕ",
  "footer.rights": "ਸਾਰੇ ਅਧਿਕਾਰ ਰਾਖਵੇਂ ਹਨ।",
  "footer.newsletterPlaceholder": "ਅਪਡੇਟ ਲਈ ਈਮੇਲ",
  "footer.newsletterJoin": "ਜੁੜੋ",
  "lang.switchTo": "ਭਾਸ਼ਾ",
  "lang.english": "English",
  "lang.punjabi": "ਪੰਜਾਬੀ",
};

const catalogs: Record<Locale, Record<MessageKey, string>> = { en, pa };

export function t(locale: Locale, key: MessageKey | string): string {
  const catalog = catalogs[locale] as Record<string, string>;
  const enCatalog = catalogs.en as Record<string, string>;
  return catalog[key] ?? enCatalog[key] ?? String(key);
}

export const NAV_MESSAGE_KEYS: Record<string, MessageKey> = {
  Home: "nav.home",
  About: "nav.about",
  Community: "nav.community",
  Resources: "nav.resources",
  Events: "nav.events",
  Gallery: "nav.gallery",
  Contact: "nav.contact",
};
