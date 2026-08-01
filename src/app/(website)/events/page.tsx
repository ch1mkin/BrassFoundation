import type { Metadata } from "next";

export const metadata: Metadata = { title: "Events" };

export default function EventsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-32 pb-24 lg:px-8">
      <p className="font-heading text-sm font-medium tracking-[0.18em] text-primary uppercase">
        Events
      </p>
      <h1 className="mt-3 font-heading text-4xl font-semibold">
        Upcoming Events
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Calendar, registration, QR check-in, and certificates will power this
        module.
      </p>
    </div>
  );
}
