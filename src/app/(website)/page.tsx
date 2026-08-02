import {
  AboutSection,
  CommunitySection,
  EventsSection,
  MarketplaceSection,
  MembershipCta,
  MustReadSection,
  ResourcesSection,
  StatsSection,
} from "@/components/website/home-sections";
import { LeadershipSection } from "@/components/website/executive-committee-section";
import { SectionDivider } from "@/components/website/section-divider";
import { HeroSection } from "@/components/website/hero-section";
import { getUserContext } from "@/lib/auth/session";
import { getPublishedHomepage } from "@/lib/cms/homepage";
import { getUserBookPurchaseMap } from "@/lib/content/book-purchases";
import { getExecutiveCommittee } from "@/lib/content/committee";
import { getPublishedMustReadBooks } from "@/lib/content/must-read-actions";
import {
  getPublishedEvents,
  getPublishedMarketplace,
} from "@/lib/content/queries";
import { getResourceCategories } from "@/lib/content/resource-categories";

export default async function HomePage() {
  const [content, committee, events, mustRead, marketplace, context, resourceCategories] =
    await Promise.all([
      getPublishedHomepage(),
      getExecutiveCommittee(),
      getPublishedEvents(6),
      getPublishedMustReadBooks(),
      getPublishedMarketplace(6),
      getUserContext(),
      getResourceCategories(),
    ]);

  const purchaseMap = context
    ? await getUserBookPurchaseMap(context.userId)
    : {};

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
        backgroundUrl={content.hero_background_url}
        backgroundMobileUrl={content.hero_background_mobile_url}
        backgroundFrame={content.hero_bg_frame}
        backgroundMobileFrame={content.hero_bg_mobile_frame}
        headlinePa={content.hero_headline_pa}
        subheadlinePa={content.hero_subheadline_pa}
        primaryLabelPa={content.hero_cta_primary_label_pa}
        secondaryLabelPa={content.hero_cta_secondary_label_pa}
      />
      <SectionDivider />
      <StatsSection stats={content.stats} />
      <SectionDivider />
      <AboutSection
        eyebrow={content.about_eyebrow}
        headline={content.about_headline}
        body={content.about_body}
        values={content.core_values}
        quotes={content.about_quotes}
      />
      <SectionDivider />
      <LeadershipSection members={committee} />
      <SectionDivider />
      <CommunitySection items={content.community_work} />
      <SectionDivider />
      <EventsSection
        backgroundUrl={content.events_background_url}
        events={events}
      />
      <SectionDivider />
      <ResourcesSection categories={resourceCategories} />
      <SectionDivider />
      <MustReadSection books={mustRead} />
      <SectionDivider />
      <MarketplaceSection books={marketplace} purchaseMap={purchaseMap} />
      <SectionDivider />
      <MembershipCta
        headline={content.membership_headline}
        body={content.membership_body}
      />
    </>
  );
}
