import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "@/components/website/newsletter-form";
import { NAV_LINKS, SITE } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="w-full bg-[#0B1C28] text-white">
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
            <span className="font-heading text-lg font-bold text-white">
              {SITE.name}
            </span>
          </div>
          <p className="text-sm text-white/70">
            Empowering the marginalized through the light of knowledge and
            unity.
          </p>
          <div className="[&_input]:border-white/20 [&_input]:bg-white/10 [&_input]:text-white [&_input]:placeholder:text-white/40 [&_button]:bg-brand [&_button]:text-[#004149] [&_.text-destructive]:text-red-300 [&_.text-success]:text-emerald-300">
            <NewsletterForm />
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold tracking-wide text-brand uppercase">
            Quick Links
          </h4>
          <ul className="space-y-2">
            {NAV_LINKS.slice(0, 4).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-xs font-semibold text-white/70 transition hover:text-brand"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold tracking-wide text-brand uppercase">
            Community
          </h4>
          <ul className="space-y-2">
            <li>
              <Link
                href="/membership"
                className="text-xs font-semibold text-white/70 hover:text-brand"
              >
                Become a Member
              </Link>
            </li>
            <li>
              <Link
                href="/gallery"
                className="text-xs font-semibold text-white/70 hover:text-brand"
              >
                Gallery
              </Link>
            </li>
            <li>
              <Link
                href="/marketplace"
                className="text-xs font-semibold text-white/70 hover:text-brand"
              >
                Marketplace
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold tracking-wide text-brand uppercase">
            Contact Us
          </h4>
          <p className="mb-4 text-xs font-semibold text-white/70">India</p>
          <a
            href="mailto:contact@brassfoundation.org"
            className="text-xs font-semibold text-white/70 hover:text-brand"
          >
            contact@brassfoundation.org
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 border-t border-white/10 px-4 py-6 sm:flex-row sm:px-6 lg:px-20">
        <span className="text-xs font-semibold text-white/55">
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </span>
        <div className="flex gap-6">
          <Link
            href="/contact"
            className="text-xs font-semibold text-white/55 hover:text-brand"
          >
            Contact
          </Link>
          <Link
            href="/gallery"
            className="text-xs font-semibold text-white/55 hover:text-brand"
          >
            Gallery
          </Link>
        </div>
      </div>
    </footer>
  );
}
