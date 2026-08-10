"use client";

import { usePathname } from "next/navigation";
import { ChevronDown, Menu, UserRound, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLocale } from "@/components/i18n/locale-provider";
import { MembershipLink } from "@/components/membership/membership-link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { GOLD_SHINY_BTN } from "@/components/website/premium-accents";
import { NAV_ITEMS, SITE, type NavItem } from "@/lib/constants";
import { NAV_MESSAGE_KEYS } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

/** Plain anchors — full navigation always works. */
function NavLink({
  href,
  className,
  children,
  onClick,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}

export type HeaderUser = {
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
};

function pathActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function itemActive(pathname: string, item: NavItem) {
  if (item.href) return pathActive(pathname, item.href);
  return Boolean(item.children?.some((c) => pathActive(pathname, c.href)));
}

export function SiteHeader({ user }: { user: HeaderUser | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const { t } = useLocale();
  const menuRef = useRef<HTMLElement>(null);
  const menuId = useId();
  const initials = (
    user?.fullName?.trim()?.[0] ||
    user?.email?.trim()?.[0] ||
    "U"
  ).toUpperCase();

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {
    if (!openMenu) return;
    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenMenu(null);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  function navLabel(label: string) {
    const key = NAV_MESSAGE_KEYS[label];
    return key ? t(key) : label;
  }

  const linkClass = (active: boolean) =>
    cn(
      "inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
      active
        ? "bg-white/10 font-semibold text-brand"
        : "text-white/75 hover:bg-white/5 hover:text-white",
    );

  return (
    <header className="pointer-events-auto fixed top-0 z-[200] w-full border-b border-white/10 bg-[#0B1C28]/95 shadow-md backdrop-blur-md">
      {/* Compact bar: logo + hamburger on small screens; full nav from lg up */}
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-2 px-3 sm:h-20 sm:gap-4 sm:px-6 lg:px-20">
        <div className="min-w-0 flex-1 overflow-hidden">
          <BrandLogo
            size="sm"
            priority
            showWordmark
            wordmarkClassName="notranslate font-heading truncate text-base font-bold text-white sm:text-xl"
          />
        </div>

        <nav
          ref={menuRef}
          className="notranslate relative hidden shrink-0 items-center gap-1 lg:flex"
          aria-label="Primary"
        >
          {NAV_ITEMS.map((item) => {
            const active = itemActive(pathname, item);

            if (item.children?.length) {
              const expanded = openMenu === item.label;
              return (
                <div key={item.label} className="relative">
                  <button
                    type="button"
                    className={cn(linkClass(active), "outline-none")}
                    aria-expanded={expanded}
                    aria-controls={`${menuId}-${item.label}`}
                    onClick={() =>
                      setOpenMenu(expanded ? null : item.label)
                    }
                  >
                    {navLabel(item.label)}
                    <ChevronDown
                      className={cn(
                        "size-3.5 opacity-70 transition",
                        expanded && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </button>
                  {expanded ? (
                    <div
                      id={`${menuId}-${item.label}`}
                      className="absolute top-full left-0 z-[210] mt-2 min-w-56 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-soft"
                    >
                      {item.children.map((child) => (
                        <NavLink
                          key={child.href}
                          href={child.href}
                          className="block rounded-lg px-3 py-2 hover:bg-muted"
                          onClick={() => setOpenMenu(null)}
                        >
                          <span className="block text-sm font-medium">
                            {navLabel(child.label)}
                          </span>
                          {child.description ? (
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {child.description}
                            </span>
                          ) : null}
                        </NavLink>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            }

            return (
              <NavLink
                key={item.label}
                href={item.href || "/"}
                className={linkClass(active)}
              >
                {navLabel(item.label)}
              </NavLink>
            );
          })}
        </nav>

        <div className="ml-3 hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <MembershipLink
            className={cn(
              GOLD_SHINY_BTN,
              "h-9 px-4 text-sm shadow-md sm:h-10 sm:px-5 sm:text-sm",
            )}
          >
            <span>{t("nav.becomeMember")}</span>
          </MembershipLink>
          {user ? (
            <div className="relative">
              <details className="group">
                <summary
                  className="flex size-10 cursor-pointer list-none items-center justify-center overflow-hidden rounded-full bg-brand text-[#004149] outline-none transition hover:bg-brand/90 [&::-webkit-details-marker]:hidden"
                  aria-label="Open profile menu"
                >
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="font-heading text-sm font-semibold">
                      {initials}
                    </span>
                  )}
                </summary>
                <div className="absolute top-full right-0 z-[210] mt-2 min-w-52 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-soft">
                  <div className="px-2 py-2">
                    <p className="truncate text-sm font-medium">
                      {user.fullName || "Member"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <div className="my-1 h-px bg-border" />
                  <NavLink
                    href="/member"
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-muted"
                  >
                    {t("nav.memberPortal")}
                  </NavLink>
                  <NavLink
                    href="/member/payments"
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-muted"
                  >
                    Contribute
                  </NavLink>
                  {user.isAdmin ? (
                    <NavLink
                      href="/admin"
                      className="block rounded-lg px-3 py-2 text-sm hover:bg-muted"
                    >
                      {t("nav.adminPortal")}
                    </NavLink>
                  ) : null}
                  <div className="my-1 h-px bg-border" />
                  <SignOutButton className="flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10">
                    {t("nav.signOut")}
                  </SignOutButton>
                </div>
              </details>
            </div>
          ) : (
            <NavLink
              href="/login"
              className="hidden text-sm font-medium text-white/80 transition hover:text-white xl:inline"
            >
              {t("nav.login")}
            </NavLink>
          )}
        </div>

        {/* Mobile / tablet: only hamburger in the bar — rest lives in the panel */}
        <button
          type="button"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-white hover:bg-white/10 lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? (
            <X className="size-6" strokeWidth={2} />
          ) : (
            <Menu className="size-6" strokeWidth={2} />
          )}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-white/10 bg-[#0B1C28] lg:hidden">
          <nav
            className="mx-auto flex max-h-[calc(100svh-4rem)] max-w-[1280px] flex-col gap-1 overflow-y-auto px-3 py-4 sm:px-6"
            aria-label="Mobile"
          >
            <div className="mb-3 px-1">
              <LanguageSwitcher className="w-full justify-center" />
            </div>

            {NAV_ITEMS.map((item) => {
              if (item.children?.length) {
                return (
                  <div key={item.label} className="mb-2">
                    <p className="notranslate px-3 py-1.5 text-[11px] font-semibold tracking-wide text-white/45 uppercase">
                      {navLabel(item.label)}
                    </p>
                    {item.children.map((child) => (
                      <NavLink
                        key={child.href}
                        href={child.href}
                        className="notranslate block rounded-lg px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white"
                        onClick={() => setMobileOpen(false)}
                      >
                        {navLabel(child.label)}
                      </NavLink>
                    ))}
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.label}
                  href={item.href || "/"}
                  className="notranslate block rounded-lg px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {navLabel(item.label)}
                </NavLink>
              );
            })}

            <div className="mt-4 border-t border-white/15 pt-4">
              {user ? (
                <>
                    <div className="mb-3 flex items-center gap-3 px-2">
                      <span className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-brand text-[#004149]">
                        {user.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.avatarUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <UserRound className="size-4" />
                        )}
                      </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {user.fullName || "Member"}
                      </p>
                      <p className="truncate text-xs text-white/60">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <MembershipLink
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      GOLD_SHINY_BTN,
                      "mb-2 h-11 w-full px-5 text-sm shadow-md",
                    )}
                  >
                    <span>{t("nav.becomeMember")}</span>
                  </MembershipLink>
                  <NavLink
                    href="/member"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      buttonVariants(),
                      "mb-2 w-full justify-center rounded-lg bg-brand text-[#004149] hover:bg-brand/90",
                    )}
                  >
                    {t("nav.memberPortal")}
                  </NavLink>
                  {user.isAdmin ? (
                    <NavLink
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "mb-2 w-full justify-center rounded-lg border-white/30 bg-transparent text-white hover:bg-white/10",
                      )}
                    >
                      {t("nav.adminPortal")}
                    </NavLink>
                  ) : null}
                  <SignOutButton className="inline-flex h-9 w-full items-center justify-center rounded-lg px-3 text-sm font-medium text-red-300 hover:bg-white/10 hover:text-red-200">
                    {t("nav.signOut")}
                  </SignOutButton>
                </>
              ) : (
                <>
                  <NavLink
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "mb-2 w-full justify-center rounded-lg border-white/30 bg-transparent text-white hover:bg-white/10",
                    )}
                  >
                    {t("nav.login")}
                  </NavLink>
                  <MembershipLink
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      GOLD_SHINY_BTN,
                      "h-11 w-full px-5 text-sm shadow-md sm:h-11",
                    )}
                  >
                    <span>{t("nav.becomeMember")}</span>
                  </MembershipLink>
                </>
              )}
            </div>
          </nav>
          <span className="sr-only">{SITE.name} menu</span>
        </div>
      ) : null}
    </header>
  );
}
