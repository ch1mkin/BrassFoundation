import {
  AboutSection,
  CommunitySection,
  MembershipCta,
  StatsSection,
} from "@/components/website/home-sections";
import { HeroSection } from "@/components/website/hero-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <StatsSection />
      <CommunitySection />
      <MembershipCta />
    </>
  );
}
