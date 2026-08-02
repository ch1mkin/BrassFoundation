import type { Metadata } from "next";
import { PageShell } from "@/components/website/page-shell";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  const updated = "2 August 2026";

  return (
    <PageShell
      eyebrow="Legal"
      title="Privacy Policy"
      description={`How ${SITE.name} collects, uses, and protects information when you use our website and membership services.`}
    >
      <article className="prose prose-neutral max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground sm:text-base">
        <p>Last updated: {updated}</p>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            1. Who we are
          </h2>
          <p>
            {SITE.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
            &ldquo;our&rdquo;) operates this website and related membership
            services. For privacy questions, contact us at{" "}
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
            2. Information we collect
          </h2>
          <p>We may collect:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Account and membership details such as name, email address, phone
              number, and profile photo when you register or apply.
            </li>
            <li>
              Payment-related information processed by our payment partners
              (for example Razorpay). We do not store full card numbers on our
              servers.
            </li>
            <li>
              Messages you send through contact or support forms.
            </li>
            <li>
              Technical data such as browser type, device information, and
              approximate usage analytics needed to operate and improve the
              site.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            3. How we use information
          </h2>
          <p>We use personal information to:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Provide membership, events, resources, and community features.</li>
            <li>Process payments and issue membership records or digital cards.</li>
            <li>Respond to enquiries and send service-related notices.</li>
            <li>Maintain security, prevent abuse, and improve our services.</li>
            <li>Comply with applicable legal obligations.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            4. Sharing of information
          </h2>
          <p>
            We do not sell your personal information. We may share limited data
            with trusted service providers who help us operate the website
            (hosting, authentication, email, and payments), only as needed to
            provide those services, or when required by law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            5. Cookies and similar technologies
          </h2>
          <p>
            We may use cookies or similar technologies for essential site
            functions (such as keeping you signed in) and to understand how the
            site is used. You can control cookies through your browser settings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            6. Data retention and security
          </h2>
          <p>
            We retain information only as long as needed for the purposes
            described above or as required by law. We take reasonable technical
            and organisational measures to protect personal data, but no method
            of transmission or storage is completely secure.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            7. Your choices
          </h2>
          <p>
            Depending on applicable law, you may request access to, correction
            of, or deletion of your personal information, or ask us to limit
            certain processing. Contact us using the email above and we will
            respond within a reasonable time.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            8. Children
          </h2>
          <p>
            Our services are not directed at children under 13. If you believe
            we have collected information from a child, please contact us so we
            can take appropriate action.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            9. Changes to this policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. The
            &ldquo;Last updated&rdquo; date at the top will reflect the latest
            revision. Continued use of the site after changes means you accept
            the updated policy.
          </p>
        </section>
      </article>
    </PageShell>
  );
}
