"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header
      className={cn(
        "z-50",
        isHome
          ? "absolute inset-x-0 top-0"
          : "sticky top-0 border-b border-border/80 bg-background/90 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:h-20 lg:px-8">
        <Link
          href="/"
          className={cn(
            "font-heading text-lg font-semibold tracking-tight",
            isHome ? "text-white" : "text-foreground",
          )}
        >
          {SITE.name}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm transition-colors",
                isHome
                  ? "text-white/80 hover:text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              isHome && "text-white hover:bg-white/10 hover:text-white",
            )}
          >
            Login
          </Link>
          <Link
            href="/membership"
            className={cn(
              buttonVariants({ variant: "default" }),
              "rounded-2xl bg-gold text-gold-foreground hover:bg-gold/90",
            )}
          >
            Become a Member
          </Link>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "md:hidden",
                  isHome && "text-white hover:bg-white/10",
                )}
                aria-label="Open menu"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(100%,20rem)]">
            <SheetHeader>
              <SheetTitle className="font-heading text-left">
                {SITE.name}
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-4 px-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-base text-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "justify-center rounded-2xl",
                  )}
                >
                  Login
                </Link>
                <Link
                  href="/membership"
                  onClick={() => setOpen(false)}
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "justify-center rounded-2xl bg-gold text-gold-foreground hover:bg-gold/90",
                  )}
                >
                  Become a Member
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
