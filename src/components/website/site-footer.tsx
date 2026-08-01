import Link from "next/link";
import { NAV_LINKS, SITE } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="font-heading text-xl font-semibold">{SITE.name}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
            {SITE.description}
          </p>
        </div>

        <div>
          <p className="font-heading text-sm font-semibold tracking-wide uppercase">
            Quick Links
          </p>
          <ul className="mt-4 space-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-white/70 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-heading text-sm font-semibold tracking-wide uppercase">
            Contact
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>contact@brassfoundation.org</li>
            <li>Emergency: +91 XXXXX XXXXX</li>
            <li>India</li>
          </ul>
        </div>

        <div>
          <p className="font-heading text-sm font-semibold tracking-wide uppercase">
            Newsletter
          </p>
          <p className="mt-4 text-sm text-white/70">
            Stay updated on events, resources, and community initiatives.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-block text-sm font-medium text-gold transition-colors hover:text-gold/80"
          >
            Subscribe →
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p className="font-quote italic text-white/40">{SITE.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
