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
      <div className="mx-auto max-w-2xl">
        <ContactForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {SITE.slogan} — send a message and our team will respond as soon as
          possible.
        </p>
      </div>
    </PageShell>
  );
}
