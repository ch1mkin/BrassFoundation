import type { Metadata } from "next";
import { ContactForm } from "@/components/website/contact-form";
import { PageShell } from "@/components/website/page-shell";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="Get in Touch"
      description="Questions, volunteer interest, or partnership ideas — we would love to hear from you."
      wide
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <ContactForm />
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-heading text-lg font-semibold">Email</h2>
            <a
              href="mailto:contact@brassfoundation.org"
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              contact@brassfoundation.org
            </a>
            <p className="mt-4 text-sm text-muted-foreground">
              {SITE.slogan} — reach out anytime and our team will respond as
              soon as possible.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
