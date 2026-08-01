import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-32 pb-24 lg:px-8">
      <p className="font-heading text-sm font-medium tracking-[0.18em] text-primary uppercase">
        Contact
      </p>
      <h1 className="mt-3 font-heading text-4xl font-semibold">Get in Touch</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Contact, volunteer, complaint, and suggestion forms — plus office
        location and social links — will be configured from Settings.
      </p>
    </div>
  );
}
