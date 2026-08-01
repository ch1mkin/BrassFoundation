import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-32 pb-24 lg:px-8">
      <p className="font-heading text-sm font-medium tracking-[0.18em] text-primary uppercase">
        About
      </p>
      <h1 className="mt-3 font-heading text-4xl font-semibold">
        About Brass Foundation
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
        Brass Foundation is an Ambedkarite social organization dedicated to
        education, empowerment, equality, leadership, and community development.
        Mission, vision, history, and founder message content will be managed
        through the CMS.
      </p>
      <Link
        href="/membership"
        className={cn(buttonVariants(), "mt-8 inline-flex rounded-2xl")}
      >
        Become a Member
      </Link>
    </div>
  );
}
