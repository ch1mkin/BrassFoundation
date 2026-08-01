import type { Metadata } from "next";

export const metadata: Metadata = { title: "News" };

export default function NewsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-32 pb-24 lg:px-8">
      <p className="font-heading text-sm font-medium tracking-[0.18em] text-primary uppercase">
        News
      </p>
      <h1 className="mt-3 font-heading text-4xl font-semibold">
        Announcements & Articles
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Press releases, media coverage, and community updates will appear here.
      </p>
    </div>
  );
}
