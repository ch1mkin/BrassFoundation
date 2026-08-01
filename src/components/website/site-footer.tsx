import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "@/components/website/newsletter-form";
import { NAV_LINKS, SITE } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="w-full bg-surface-highest">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-4 py-16 sm:px-6 md:grid-cols-4 lg:px-20">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/brand/logo.png"
              alt=""
              width={40}
              height={40}
              className="rounded-full bg-white p-0.5"
            />
            <span className="font-heading text-lg font-bold text-foreground">
              {SITE.name}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Empowering the marginalized through the light of knowledge and
            unity.
          </p>
          <NewsletterForm />
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold tracking-wide text-primary uppercase">
            Quick Links
          </h4>
          <ul className="space-y-2">
            {NAV_LINKS.slice(0, 4).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-xs font-semibold text-muted-foreground transition hover:text-secondary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold tracking-wide text-primary uppercase">
            Community
          </h4>
          <ul className="space-y-2">
            <li>
              <Link
                href="/membership"
                className="text-xs font-semibold text-muted-foreground hover:text-secondary"
              >
                Become a Member
              </Link>
            </li>
            <li>
              <Link
                href="/gallery"
                className="text-xs font-semibold text-muted-foreground hover:text-secondary"
              >
                Gallery
              </Link>
            </li>
            <li>
              <Link
                href="/marketplace"
                className="text-xs font-semibold text-muted-foreground hover:text-secondary"
              >
                Marketplace
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold tracking-wide text-primary uppercase">
            Contact Us
          </h4>
          <p className="mb-4 text-xs font-semibold text-muted-foreground">
            India
          </p>
          <a
            href="mailto:contact@brassfoundation.org"
            className="text-xs font-semibold text-muted-foreground hover:text-primary"
          >
            contact@brassfoundation.org
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 border-t border-border/20 px-4 py-6 sm:flex-row sm:px-6 lg:px-20">
        <span className="text-xs font-semibold text-muted-foreground">
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </span>
        <div className="flex gap-6">
          <Link
            href="/contact"
            className="text-xs font-semibold text-muted-foreground hover:text-primary"
          >
            Contact
          </Link>
          <Link
            href="/gallery"
            className="text-xs font-semibold text-muted-foreground hover:text-primary"
          >
            Gallery
          </Link>
        </div>
      </div>
    </footer>
  );
}
