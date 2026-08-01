"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Menu, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BrandLogo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLocale } from "@/components/i18n/locale-provider";
import { signOutAction } from "@/lib/auth/actions";
import { NAV_ITEMS, SITE, type NavItem } from "@/lib/constants";
import { NAV_MESSAGE_KEYS } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

export type HeaderUser = {
  email: string | null;
  fullName: string | null;
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
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLocale();
  const initials = (
    user?.fullName?.trim()?.[0] ||
    user?.email?.trim()?.[0] ||
    "U"
  ).toUpperCase();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function navLabel(label: string) {
    const key = NAV_MESSAGE_KEYS[label];
    return key ? t(key) : label;
  }

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  const linkClass = (active: boolean) =>
    cn(
      "notranslate relative z-10 inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
      active
        ? "bg-white/10 font-semibold text-brand"
        : "text-white/75 hover:bg-white/5 hover:text-white",
    );

  return (
    <header className="fixed top-0 z-[60] w-full border-b border-white/10 bg-[#0B1C28]/95 shadow-md backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1280px] items-center gap-4 px-4 sm:px-6 lg:px-20">
        <BrandLogo
          size="md"
          priority
          showWordmark
          wordmarkClassName="notranslate font-heading text-xl font-bold text-white"
        />

        {/* Breathing room between brand and clustered nav */}
        <div className="hidden min-w-8 flex-1 md:block" aria-hidden />

        <nav
          className="notranslate relative z-10 hidden items-center gap-1 md:flex"
          aria-label="Primary"
        >
          {NAV_ITEMS.map((item) => {
            const active = itemActive(pathname, item);

            if (item.children?.length) {
              return (
                <DropdownMenu key={item.label}>
                  <DropdownMenuTrigger
                    className={cn(linkClass(active), "outline-none")}
                    aria-label={navLabel(item.label)}
                  >
                    {navLabel(item.label)}
                    <ChevronDown className="size-3.5 opacity-70" aria-hidden />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    sideOffset={10}
                    className="z-[80] min-w-56 rounded-xl p-2 shadow-soft"
                  >
                    {item.children.map((child) => (
                      <DropdownMenuItem
                        key={child.href}
                        className="cursor-pointer rounded-lg"
                        onClick={() => go(child.href)}
                      >
                        <span className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium">
                            {navLabel(child.label)}
                          </span>
                          {child.description ? (
                            <span className="text-xs text-muted-foreground">
                              {child.description}
                            </span>
                          ) : null}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            const href = item.href || "/";
            return (
              <button
                key={item.label}
                type="button"
                className={linkClass(active)}
                onClick={() => go(href)}
              >
                {navLabel(item.label)}
              </button>
            );
          })}
        </nav>

        <div className="relative z-10 ml-auto hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex size-10 items-center justify-center rounded-full bg-brand text-[#004149] outline-none transition hover:bg-brand/90"
                aria-label="Open profile menu"
              >
                <span className="font-heading text-sm font-semibold">
                  {initials}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="z-[80] min-w-52 rounded-xl p-2 shadow-soft"
              >
                <div className="px-2 py-2">
                  <p className="truncate text-sm font-medium">
                    {user.fullName || "Member"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg"
                  onClick={() => go("/member")}
                >
                  {t("nav.memberPortal")}
                </DropdownMenuItem>
                {user.isAdmin ? (
                  <DropdownMenuItem
                    className="cursor-pointer rounded-lg"
                    onClick={() => go("/admin")}
                  >
                    {t("nav.adminPortal")}
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="flex w-full cursor-pointer items-center rounded-lg px-1.5 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10"
                  >
                    {t("nav.signOut")}
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <button
                type="button"
                onClick={() => go("/login")}
                className="hidden text-sm font-medium text-white/80 transition hover:text-white lg:inline"
              >
                {t("nav.login")}
              </button>
              <button
                type="button"
                onClick={() => go("/membership")}
                className={cn(
                  buttonVariants(),
                  "rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-[#004149] shadow-lg shadow-black/20 hover:bg-brand/90 active:scale-95",
                )}
              >
                {t("nav.becomeMember")}
              </button>
            </>
          )}
        </div>

        <div className="relative z-10 ml-auto flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg text-white hover:bg-white/10"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="right"
            className="z-[70] w-[min(100%,20rem)] bg-[#0B1C28] text-white"
          >
            <SheetHeader>
              <SheetTitle className="sr-only">{SITE.name}</SheetTitle>
              <BrandLogo
                size="sm"
                href={null}
                showWordmark
                wordmarkClassName="notranslate text-white"
              />
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1 px-2" aria-label="Mobile">
              <div className="mb-2 px-1">
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
                        <button
                          key={child.href}
                          type="button"
                          onClick={() => go(child.href)}
                          className="notranslate flex w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white"
                        >
                          {navLabel(child.label)}
                        </button>
                      ))}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => go(item.href || "/")}
                    className="notranslate flex w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white"
                  >
                    {navLabel(item.label)}
                  </button>
                );
              })}
              <div className="mt-4 border-t border-white/15 pt-4">
                {user ? (
                  <>
                    <div className="mb-3 flex items-center gap-3 px-2">
                      <span className="flex size-9 items-center justify-center rounded-full bg-brand text-[#004149]">
                        <UserRound className="size-4" />
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
                    <button
                      type="button"
                      onClick={() => go("/member")}
                      className={cn(
                        buttonVariants(),
                        "mb-2 w-full justify-center rounded-lg bg-brand text-[#004149] hover:bg-brand/90",
                      )}
                    >
                      {t("nav.memberPortal")}
                    </button>
                    {user.isAdmin ? (
                      <button
                        type="button"
                        onClick={() => go("/admin")}
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "mb-2 w-full justify-center rounded-lg border-white/30 bg-transparent text-white hover:bg-white/10",
                        )}
                      >
                        {t("nav.adminPortal")}
                      </button>
                    ) : null}
                    <form action={signOutAction}>
                      <Button
                        type="submit"
                        variant="ghost"
                        className="w-full text-red-300 hover:bg-white/10 hover:text-red-200"
                      >
                        {t("nav.signOut")}
                      </Button>
                    </form>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => go("/login")}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "mb-2 w-full justify-center rounded-lg border-white/30 bg-transparent text-white hover:bg-white/10",
                      )}
                    >
                      {t("nav.login")}
                    </button>
                    <button
                      type="button"
                      onClick={() => go("/membership")}
                      className={cn(
                        buttonVariants(),
                        "w-full justify-center rounded-lg bg-brand text-[#004149] hover:bg-brand/90",
                      )}
                    >
                      {t("nav.becomeMember")}
                    </button>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
