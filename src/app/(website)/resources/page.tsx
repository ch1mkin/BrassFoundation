import type { Metadata } from "next";

export const metadata: Metadata = { title: "Resources" };

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-32 pb-24 lg:px-8">
      <p className="font-heading text-sm font-medium tracking-[0.18em] text-primary uppercase">
        Resources
      </p>
      <h1 className="mt-3 font-heading text-4xl font-semibold">
        Download Center
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Constitution, study material, books, PDFs, training content, and videos
        — with secure in-app viewing.
      </p>
    </div>
  );
}
