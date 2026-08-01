"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/components/i18n/locale-provider";
import { NewsletterForm } from "@/components/website/newsletter-form";
import { SITE } from "@/lib/constants";

export function SiteFooter() {
  const { t } = useLocale();

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
            <span className="notranslate font-heading text-lg font-bold text-white">
              {SITE.name}
            </span>
          </div>
          <p className="notranslate text-sm leading-relaxed text-white/70">
            {t("footer.blurb")}
          </p>
          <div className="[&_input]:border-white/20 [&_input]:bg-white/10 [&_input]:text-white [&_input]:placeholder:text-white/40 [&_button]:bg-brand [&_button]:text-[#004149] [&_.text-destructive]:text-red-300 [&_.text-success]:text-emerald-300">
            <NewsletterForm />
          </div>
        </div>

        <div>
          <h4 className="notranslate mb-4 text-xs font-semibold tracking-wide text-brand uppercase">
            {t("footer.quickLinks")}
          </h4>
          <ul className="notranslate space-y-2">
            <li>
              <Link
                href="/about"
                className="text-xs font-semibold text-white/70 transition hover:text-brand"
              >
                {t("nav.about")}
              </Link>
            </li>
            <li>
              <Link
                href="/community"
                className="text-xs font-semibold text-white/70 transition hover:text-brand"
              >
                {t("nav.community")}
              </Link>
            </li>
            <li>
              <Link
                href="/events"
                className="text-xs font-semibold text-white/70 transition hover:text-brand"
              >
                {t("nav.events")}
              </Link>
            </li>
            <li>
              <Link
                href="/resources"
                className="text-xs font-semibold text-white/70 transition hover:text-brand"
              >
                {t("nav.resources")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="notranslate mb-4 text-xs font-semibold tracking-wide text-brand uppercase">
            {t("footer.community")}
          </h4>
          <ul className="notranslate space-y-2">
            <li>
              <Link
                href="/membership"
                className="text-xs font-semibold text-white/70 hover:text-brand"
              >
                {t("footer.becomeMember")}
              </Link>
            </li>
            <li>
              <Link
                href="/gallery"
                className="text-xs font-semibold text-white/70 hover:text-brand"
              >
                {t("footer.gallery")}
              </Link>
            </li>
            <li>
              <Link
                href="/marketplace"
                className="text-xs font-semibold text-white/70 hover:text-brand"
              >
                {t("footer.marketplace")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="notranslate mb-4 text-xs font-semibold tracking-wide text-brand uppercase">
            {t("footer.contactUs")}
          </h4>
          <p className="mb-4 text-xs font-semibold text-white/70">India</p>
          <a
            href="mailto:contact@brassfoundation.org"
            className="notranslate text-xs font-semibold text-white/70 hover:text-brand"
          >
            contact@brassfoundation.org
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 border-t border-white/10 px-4 py-6 sm:flex-row sm:px-6 lg:px-20">
        <span className="text-xs font-semibold text-white/55">
          <span className="notranslate">
            © {new Date().getFullYear()} {SITE.name}.
          </span>{" "}
          {t("footer.rights")}
        </span>
        <div className="flex gap-6">
          <Link
            href="/contact"
            className="text-xs font-semibold text-white/55 hover:text-brand"
          >
            {t("footer.contact")}
          </Link>
          <Link
            href="/gallery"
            className="text-xs font-semibold text-white/55 hover:text-brand"
          >
            {t("footer.gallery")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
