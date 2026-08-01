import type { Metadata } from "next";

export const metadata: Metadata = { title: "Community" };

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-32 pb-24 lg:px-8">
      <p className="font-heading text-sm font-medium tracking-[0.18em] text-primary uppercase">
        Community Work
      </p>
      <h1 className="mt-3 font-heading text-4xl font-semibold">
        Projects & Impact
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Blood donation, education camps, scholarships, and volunteer programs —
        each with progress and impact tracking.
      </p>
    </div>
  );
}
