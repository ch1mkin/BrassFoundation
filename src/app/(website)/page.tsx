import {
  AboutSection,
  CommunitySection,
  EventsSection,
  LeadershipSection,
  MarketplaceSection,
  MembershipCta,
  ResourcesSection,
  StatsSection,
} from "@/components/website/home-sections";
import { HeroSection } from "@/components/website/hero-section";
import { getPublishedHomepage } from "@/lib/cms/homepage";

export default async function HomePage() {
  const content = await getPublishedHomepage();

  return (
    <>
      <HeroSection
        eyebrow={content.hero_eyebrow}
        headline={content.hero_headline}
        subheadline={content.hero_subheadline}
        primaryLabel={content.hero_cta_primary_label}
        primaryHref={content.hero_cta_primary_href}
        secondaryLabel={content.hero_cta_secondary_label}
        secondaryHref={content.hero_cta_secondary_href}
        floatingStats={content.stats.slice(0, 2)}
      />
      <StatsSection stats={content.stats} />
      <AboutSection
        eyebrow={content.about_eyebrow}
        headline={content.about_headline}
        body={content.about_body}
        values={content.core_values}
      />
      <LeadershipSection />
      <CommunitySection items={content.community_work} />
      <EventsSection />
      <ResourcesSection />
      <MarketplaceSection />
      <MembershipCta
        headline={content.membership_headline}
        body={content.membership_body}
      />
    </>
  );
}
