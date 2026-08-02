import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/website/page-shell";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  const updated = "2 August 2026";

  return (
    <PageShell
      eyebrow="Legal"
      title="Terms & Conditions"
      description={`Please read these terms carefully before using the ${SITE.name} website and related services.`}
    >
      <article className="prose prose-neutral max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground sm:text-base">
        <p>Last updated: {updated}</p>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            1. Agreement
          </h2>
          <p>
            By accessing or using this website, membership portal, or related
            services operated by {SITE.name} (&ldquo;we&rdquo;,
            &ldquo;us&rdquo;), you agree to these Terms &amp; Conditions. If you
            do not agree, please do not use the site.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            2. Our mission and services
          </h2>
          <p>
            {SITE.name} provides information, educational resources, community
            programmes, events, and optional membership services in support of
            education, equality, and community development. Features available
            to you may depend on whether you create an account or become a
            member.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            3. Accounts and membership
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              You must provide accurate information when registering or applying
              for membership.
            </li>
            <li>
              You are responsible for keeping your login credentials secure and
              for activity under your account.
            </li>
            <li>
              Membership fees, benefits, and eligibility may change; details
              shown at the time of registration or payment apply to that
              transaction.
            </li>
            <li>
              We may suspend or terminate access if we reasonably believe these
              terms have been violated or if required for security or legal
              reasons.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            4. Acceptable use
          </h2>
          <p>You agree not to:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Use the site for unlawful, harmful, or fraudulent purposes.</li>
            <li>
              Attempt to gain unauthorised access to systems, data, or other
              users&apos; accounts.
            </li>
            <li>
              Upload malware, scrape content in an abusive way, or disrupt the
              service.
            </li>
            <li>
              Misrepresent your identity or affiliation with {SITE.name}.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            5. Content and intellectual property
          </h2>
          <p>
            Site content, branding, and materials are owned by {SITE.name} or
            its licensors unless otherwise stated. You may view and share
            publicly available pages for personal, non-commercial use. You may
            not copy, modify, or redistribute our materials for commercial
            purposes without prior written permission.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            6. Third-party services
          </h2>
          <p>
            The site may link to or integrate third-party services (such as
            payment processors). Those services are governed by their own terms
            and privacy policies. We are not responsible for third-party sites
            or services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            7. Payments and refunds
          </h2>
          <p>
            Fees for membership or other paid offerings are stated at checkout.
            Payment processing is handled by authorised providers. Refund
            eligibility, if any, will be communicated for the relevant programme
            or may be considered on a case-by-case basis by contacting{" "}
            <a
              href="mailto:contact@brassfoundation.org"
              className="font-medium text-primary hover:underline"
            >
              contact@brassfoundation.org
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            8. Disclaimers
          </h2>
          <p>
            The website and content are provided on an &ldquo;as is&rdquo; and
            &ldquo;as available&rdquo; basis. We do not warrant that the site
            will be uninterrupted, error-free, or completely secure. Educational
            and community information is for general purposes and does not
            constitute professional legal, medical, or financial advice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            9. Limitation of liability
          </h2>
          <p>
            To the fullest extent permitted by law, {SITE.name} and its
            officers, volunteers, and partners shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages,
            or any loss of data, profits, or goodwill, arising from your use of
            the site or services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            10. Privacy
          </h2>
          <p>
            Our collection and use of personal information is described in our{" "}
            <Link href="/privacy" className="font-medium text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            11. Changes
          </h2>
          <p>
            We may update these Terms &amp; Conditions periodically. The
            &ldquo;Last updated&rdquo; date will change when we do. Continued
            use after updates constitutes acceptance of the revised terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            12. Contact
          </h2>
          <p>
            Questions about these terms:{" "}
            <a
              href="mailto:contact@brassfoundation.org"
              className="font-medium text-primary hover:underline"
            >
              contact@brassfoundation.org
            </a>{" "}
            or visit our{" "}
            <Link href="/contact" className="font-medium text-primary hover:underline">
              Contact
            </Link>{" "}
            page.
          </p>
        </section>
      </article>
    </PageShell>
  );
}
