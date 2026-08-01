"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, UserRound } from "lucide-react";
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
import { signOutAction } from "@/lib/auth/actions";
import { NAV_ITEMS, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type HeaderUser = {
  email: string | null;
  fullName: string | null;
  isAdmin: boolean;
};

export function SiteHeader({ user }: { user: HeaderUser | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const initials = (
    user?.fullName?.trim()?.[0] ||
    user?.email?.trim()?.[0] ||
    "U"
  ).toUpperCase();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#0B1C28]/95 shadow-md backdrop-blur-md">
      <nav className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-20">
        <BrandLogo
          size="md"
          priority
          showWordmark
          wordmarkClassName="font-heading text-xl font-bold text-white"
        />

        <div className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => {
            const href = item.href || "/";
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={item.label}
                href={href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  active
                    ? "border-b-2 border-brand font-bold text-brand"
                    : "text-white/75 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-4 lg:flex">
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
                className="min-w-52 rounded-xl p-2 shadow-soft"
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
                  render={<Link href="/member" />}
                >
                  Member portal
                </DropdownMenuItem>
                {user.isAdmin && (
                  <DropdownMenuItem
                    className="cursor-pointer rounded-lg"
                    render={<Link href="/admin" />}
                  >
                    Admin portal
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="flex w-full cursor-pointer items-center rounded-lg px-1.5 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10"
                  >
                    Sign out
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium text-white/80 transition hover:text-white lg:block"
              >
                Login
              </Link>
              <Link
                href="/membership"
                className={cn(
                  buttonVariants(),
                  "rounded-lg bg-brand px-6 py-2.5 text-sm font-bold text-[#004149] shadow-lg shadow-black/20 hover:bg-brand/90 active:scale-95",
                )}
              >
                Become Member
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-white hover:bg-white/10 md:hidden"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Menu className="size-5" />
        </button>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="w-[min(100%,20rem)] bg-[#0B1C28] text-white">
            <SheetHeader>
              <SheetTitle className="sr-only">{SITE.name}</SheetTitle>
              <BrandLogo
                size="sm"
                href={null}
                showWordmark
                wordmarkClassName="text-white"
              />
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-2 px-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href || "/"}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
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
                    <Link
                      href="/member"
                      onClick={() => setOpen(false)}
                      className={cn(
                        buttonVariants(),
                        "mb-2 w-full justify-center rounded-lg bg-brand text-[#004149] hover:bg-brand/90",
                      )}
                    >
                      Member portal
                    </Link>
                    <form action={signOutAction}>
                      <Button
                        type="submit"
                        variant="ghost"
                        className="w-full text-red-300 hover:bg-white/10 hover:text-red-200"
                      >
                        Sign out
                      </Button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "mb-2 w-full justify-center rounded-lg border-white/30 bg-transparent text-white hover:bg-white/10",
                      )}
                    >
                      Login
                    </Link>
                    <Link
                      href="/membership"
                      onClick={() => setOpen(false)}
                      className={cn(
                        buttonVariants(),
                        "w-full justify-center rounded-lg bg-brand text-[#004149] hover:bg-brand/90",
                      )}
                    >
                      Become Member
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
