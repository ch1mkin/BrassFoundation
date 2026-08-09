/* eslint-disable @next/next/no-html-link-for-pages --
 * Footer uses native anchors so navigation always works (Next soft-nav was
 * getting swallowed by overlays / i18n). External + internal both use <a>.
 */
"use client";

import Image from "next/image";
import { useLocale } from "@/components/i18n/locale-provider";
import { MembershipLink } from "@/components/membership/membership-link";
import { DonateNowLink } from "@/components/membership/donate-now-link";
import { NewsletterForm } from "@/components/website/newsletter-form";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const linkClass =
  "pointer-events-auto relative z-10 inline-block text-xs font-semibold text-white/70 transition hover:text-brand";

function FooterLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a href={href} className={cn(linkClass, className)}>
      {children}
    </a>
  );
}

export function SiteFooter() {
  const { t } = useLocale();

  return (
    <footer className="pointer-events-auto relative z-50 isolate w-full bg-[#0B1C28] text-white">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-4 py-16 sm:px-6 md:grid-cols-4 lg:px-20">
        <div className="flex flex-col gap-4">
          <a href="/" className="inline-flex items-center gap-2">
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
          </a>
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
              <FooterLink href="/about">{t("nav.about")}</FooterLink>
            </li>
            <li>
              <FooterLink href="/community">{t("nav.community")}</FooterLink>
            </li>
            <li>
              <FooterLink href="/events">{t("nav.events")}</FooterLink>
            </li>
            <li>
              <FooterLink href="/resources">{t("nav.resources")}</FooterLink>
            </li>
            <li>
              <FooterLink href="/must-read">{t("nav.mustRead")}</FooterLink>
            </li>
            <li>
              <FooterLink href="/news">{t("nav.news")}</FooterLink>
            </li>
            <li>
              <FooterLink href="/blog">{t("nav.blog")}</FooterLink>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="notranslate mb-4 text-xs font-semibold tracking-wide text-brand uppercase">
            {t("footer.community")}
          </h4>
          <ul className="notranslate space-y-2">
            <li>
              <MembershipLink className={linkClass}>
                {t("footer.becomeMember")}
              </MembershipLink>
            </li>
            <li>
              <DonateNowLink className={linkClass}>
                {t("footer.donateNow")}
              </DonateNowLink>
            </li>
            <li>
              <FooterLink href="/gallery">{t("footer.gallery")}</FooterLink>
            </li>
            <li>
              <FooterLink href="/marketplace">
                {t("footer.marketplace")}
              </FooterLink>
            </li>
            <li>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
            </li>
            <li>
              <FooterLink href="/terms">Terms &amp; Conditions</FooterLink>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="notranslate mb-4 text-xs font-semibold tracking-wide text-brand uppercase">
            {t("footer.contactUs")}
          </h4>
          <ul className="notranslate space-y-2">
            <li>
              <FooterLink href="/contact">{t("footer.contact")}</FooterLink>
            </li>
            <li>
              <MembershipLink className={linkClass}>
                {t("footer.becomeMember")}
              </MembershipLink>
            </li>
            <li>
              <DonateNowLink className={linkClass}>
                {t("footer.donateNow")}
              </DonateNowLink>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 border-t border-white/10 px-4 py-6 sm:flex-row sm:px-6 lg:px-20">
        <div className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left">
          <span className="text-xs font-semibold text-white/55">
            <span className="notranslate">
              © {new Date().getFullYear()} {SITE.name}.
            </span>{" "}
            {t("footer.rights")}
          </span>
          <a
            href="https://salhantech.com"
            target="_blank"
            rel="noopener noreferrer"
            className="notranslate text-xs font-semibold text-white/45 transition hover:text-brand"
          >
            Powered by Salhantech
          </a>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <FooterLink
            href="/privacy"
            className="text-white/55 hover:text-brand"
          >
            Privacy Policy
          </FooterLink>
          <FooterLink href="/terms" className="text-white/55 hover:text-brand">
            Terms &amp; Conditions
          </FooterLink>
          <FooterLink
            href="/contact"
            className="text-white/55 hover:text-brand"
          >
            {t("footer.contact")}
          </FooterLink>
        </div>
      </div>
    </footer>
  );
}
