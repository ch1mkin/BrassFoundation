import type { Locale } from "@/lib/i18n/config";

export type MessageKey =
  | "nav.home"
  | "nav.about"
  | "nav.explore"
  | "nav.learn"
  | "nav.community"
  | "nav.resources"
  | "nav.events"
  | "nav.gallery"
  | "nav.news"
  | "nav.blog"
  | "nav.marketplace"
  | "nav.contact"
  | "nav.login"
  | "nav.becomeMember"
  | "nav.donateNow"
  | "nav.memberPortal"
  | "nav.adminPortal"
  | "nav.signOut"
  | "nav.mustRead"
  | "nav.fraternity"
  | "nav.achievers"
  | "nav.brochure"
  | "footer.blurb"
  | "footer.quickLinks"
  | "footer.community"
  | "footer.contactUs"
  | "footer.becomeMember"
  | "footer.donateNow"
  | "footer.gallery"
  | "footer.marketplace"
  | "footer.contact"
  | "footer.rights"
  | "footer.newsletterPlaceholder"
  | "footer.newsletterJoin"
  | "lang.switchTo"
  | "lang.english"
  | "lang.punjabi"
  | "lang.hindi";

const en: Record<MessageKey, string> = {
  "nav.home": "Home",
  "nav.about": "About",
  "nav.explore": "Explore",
  "nav.learn": "Learn",
  "nav.community": "Community",
  "nav.resources": "Resources",
  "nav.events": "Events",
  "nav.gallery": "Gallery",
  "nav.news": "News",
  "nav.blog": "Blog",
  "nav.marketplace": "Marketplace",
  "nav.contact": "Contact",
  "nav.login": "Login",
  "nav.becomeMember": "Become Member",
  "nav.donateNow": "Donate Now",
  "nav.memberPortal": "Member portal",
  "nav.adminPortal": "Admin portal",
  "nav.signOut": "Sign out",
  "nav.mustRead": "Must Read",
  "nav.fraternity": "Fraternity",
  "nav.achievers": "Achievers",
  "nav.brochure": "Brochure",
  "footer.blurb":
    "Empowering the marginalized through the light of knowledge and unity.",
  "footer.quickLinks": "Quick Links",
  "footer.community": "Community",
  "footer.contactUs": "Contact Us",
  "footer.becomeMember": "Become a Member",
  "footer.donateNow": "Donate Now",
  "footer.gallery": "Gallery",
  "footer.marketplace": "Marketplace",
  "footer.contact": "Contact",
  "footer.rights": "All rights reserved.",
  "footer.newsletterPlaceholder": "Email for updates",
  "footer.newsletterJoin": "Join",
  "lang.switchTo": "Language",
  "lang.english": "English",
  "lang.punjabi": "ਪੰਜਾਬੀ",
  "lang.hindi": "हिन्दी",
};

const pa: Record<MessageKey, string> = {
  "nav.home": "ਮੁੱਖ ਪੰਨਾ",
  "nav.about": "ਸਾਡੇ ਬਾਰੇ",
  "nav.explore": "ਖੋਜੋ",
  "nav.learn": "ਸਿੱਖੋ",
  "nav.community": "ਸਮਾਜ",
  "nav.resources": "ਸਰੋਤ",
  "nav.events": "ਸਮਾਗਮ",
  "nav.gallery": "ਗੈਲਰੀ",
  "nav.news": "ਖ਼ਬਰਾਂ",
  "nav.blog": "ਬਲੌਗ",
  "nav.marketplace": "ਬਾਜ਼ਾਰ",
  "nav.contact": "ਸੰਪਰਕ",
  "nav.login": "ਲਾਗਇਨ",
  "nav.becomeMember": "ਮੈਂਬਰ ਬਣੋ",
  "nav.donateNow": "ਦਾਨ ਕਰੋ",
  "nav.memberPortal": "ਮੈਂਬਰ ਪੋਰਟਲ",
  "nav.adminPortal": "ਪ੍ਰਬੰਧਕ ਪੋਰਟਲ",
  "nav.signOut": "ਸਾਈਨ ਆਉਟ",
  "nav.mustRead": "ਜ਼ਰੂਰੀ ਪੜ੍ਹੋ",
  "nav.fraternity": "ਭਾਈਚਾਰਾ",
  "nav.achievers": "ਸਫਲਤਾਵਾਂ",
  "nav.brochure": "ਬ੍ਰੋਸ਼ਰ",
  "footer.blurb":
    "ਗਿਆਨ ਅਤੇ ਏਕਤਾ ਦੀ ਰੋਸ਼ਨੀ ਨਾਲ ਪਿਛੜੇ ਵਰਗਾਂ ਨੂੰ ਸਸ਼ਕਤ ਬਣਾਉਣਾ।",
  "footer.quickLinks": "ਤੇਜ਼ ਲਿੰਕ",
  "footer.community": "ਸਮਾਜ",
  "footer.contactUs": "ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੋ",
  "footer.becomeMember": "ਮੈਂਬਰ ਬਣੋ",
  "footer.donateNow": "ਦਾਨ ਕਰੋ",
  "footer.gallery": "ਗੈਲਰੀ",
  "footer.marketplace": "ਬਾਜ਼ਾਰ",
  "footer.contact": "ਸੰਪਰਕ",
  "footer.rights": "ਸਾਰੇ ਅਧਿਕਾਰ ਰਾਖਵੇਂ ਹਨ।",
  "footer.newsletterPlaceholder": "ਅਪਡੇਟ ਲਈ ਈਮੇਲ",
  "footer.newsletterJoin": "ਜੁੜੋ",
  "lang.switchTo": "ਭਾਸ਼ਾ",
  "lang.english": "English",
  "lang.punjabi": "ਪੰਜਾਬੀ",
  "lang.hindi": "हिन्दी",
};

const hi: Record<MessageKey, string> = {
  "nav.home": "मुख्य पृष्ठ",
  "nav.about": "हमारे बारे में",
  "nav.explore": "खोजें",
  "nav.learn": "सीखें",
  "nav.community": "समुदाय",
  "nav.resources": "संसाधन",
  "nav.events": "कार्यक्रम",
  "nav.gallery": "गैलरी",
  "nav.news": "समाचार",
  "nav.blog": "ब्लॉग",
  "nav.marketplace": "बाज़ार",
  "nav.contact": "संपर्क",
  "nav.login": "लॉगिन",
  "nav.becomeMember": "सदस्य बनें",
  "nav.donateNow": "दान करें",
  "nav.memberPortal": "सदस्य पोर्टल",
  "nav.adminPortal": "प्रशासन पोर्टल",
  "nav.signOut": "साइन आउट",
  "nav.mustRead": "अवश्य पढ़ें",
  "nav.fraternity": "बिरादरी",
  "nav.achievers": "सफ़ल व्यक्तित्व",
  "nav.brochure": "ब्रोशर",
  "footer.blurb":
    "ज्ञान और एकता के प्रकाश से वंचित वर्गों को सशक्त बनाना।",
  "footer.quickLinks": "त्वरित लिंक",
  "footer.community": "समुदाय",
  "footer.contactUs": "हमसे संपर्क करें",
  "footer.becomeMember": "सदस्य बनें",
  "footer.donateNow": "दान करें",
  "footer.gallery": "गैलरी",
  "footer.marketplace": "बाज़ार",
  "footer.contact": "संपर्क",
  "footer.rights": "सर्वाधिकार सुरक्षित।",
  "footer.newsletterPlaceholder": "अपडेट के लिए ईमेल",
  "footer.newsletterJoin": "जुड़ें",
  "lang.switchTo": "भाषा",
  "lang.english": "English",
  "lang.punjabi": "ਪੰਜਾਬੀ",
  "lang.hindi": "हिन्दी",
};

const catalogs: Record<Locale, Record<MessageKey, string>> = { en, pa, hi };

export function t(locale: Locale, key: MessageKey | string): string {
  const catalog = catalogs[locale] as Record<string, string>;
  const enCatalog = catalogs.en as Record<string, string>;
  return catalog[key] ?? enCatalog[key] ?? String(key);
}

export const NAV_MESSAGE_KEYS: Record<string, MessageKey> = {
  Home: "nav.home",
  About: "nav.about",
  Explore: "nav.explore",
  Learn: "nav.learn",
  Community: "nav.community",
  Fraternity: "nav.fraternity",
  Resources: "nav.resources",
  Events: "nav.events",
  Gallery: "nav.gallery",
  News: "nav.news",
  Blog: "nav.blog",
  Marketplace: "nav.marketplace",
  Contact: "nav.contact",
  "Must Read": "nav.mustRead",
  Achievers: "nav.achievers",
  Brochure: "nav.brochure",
};
