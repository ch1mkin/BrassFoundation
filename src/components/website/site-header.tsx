"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BrandLogo } from "@/components/brand/logo";
import { HamburgerButton } from "@/components/website/hamburger-button";
import { NAV_ITEMS, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "z-50",
        isHome
          ? "absolute inset-x-0 top-0"
          : "sticky top-0 border-b border-border/70 bg-background/90 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:h-[4.5rem] lg:px-8">
        <BrandLogo size="md" priority className="drop-shadow-sm" />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) =>
            item.children?.length ? (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger
                  className={cn(
                    "inline-flex items-center gap-1 rounded-2xl px-3 py-2 text-sm font-medium outline-none transition-colors",
                    isHome
                      ? "text-white/80 hover:bg-white/10 hover:text-white data-popup-open:bg-white/10 data-popup-open:text-white"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground data-popup-open:bg-muted data-popup-open:text-foreground",
                  )}
                >
                  {item.label}
                  <ChevronDown className="size-3.5 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={10}
                  className="min-w-[17rem] rounded-2xl border-border/80 p-2 shadow-soft"
                >
                  {item.children.map((child) => (
                    <DropdownMenuItem
                      key={child.href}
                      className="cursor-pointer rounded-xl px-3 py-2.5 focus:bg-accent"
                      render={<Link href={child.href} />}
                    >
                      <span className="flex flex-col gap-0.5">
                        <span className="font-medium text-foreground">
                          {child.label}
                        </span>
                        {child.description && (
                          <span className="text-xs leading-snug text-muted-foreground">
                            {child.description}
                          </span>
                        )}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={item.label}
                href={item.href || "/"}
                className={cn(
                  "rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
                  isHome
                    ? "text-white/80 hover:bg-white/10 hover:text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "rounded-2xl",
              isHome && "text-white hover:bg-white/10 hover:text-white",
            )}
          >
            Login
          </Link>
          <Link
            href="/membership"
            className={cn(
              buttonVariants({ variant: "default" }),
              "rounded-2xl bg-gold px-4 text-gold-foreground hover:bg-gold/90",
            )}
          >
            Become a Member
          </Link>
        </div>

        <div className="lg:hidden">
          <HamburgerButton
            open={open}
            onClick={() => setOpen((v) => !v)}
            light={isHome}
          />
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="right"
            showCloseButton={false}
            className="w-[min(100%,22rem)] gap-0 border-l border-border/80 p-0"
          >
            <SheetHeader className="border-b border-border/70 px-2 py-4">
              <div className="flex items-center justify-between pr-2">
                <div className="px-2">
                  <BrandLogo size="sm" href={null} />
                  <SheetTitle className="sr-only">{SITE.name}</SheetTitle>
                </div>
                <HamburgerButton open onClick={() => setOpen(false)} />
              </div>
            </SheetHeader>

            <nav className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
              <Accordion className="w-full">
                {NAV_ITEMS.map((item) =>
                  item.children?.length ? (
                    <AccordionItem
                      key={item.label}
                      value={item.label}
                      className="border-border/70"
                    >
                      <AccordionTrigger className="font-heading py-3.5 text-base font-medium hover:no-underline">
                        {item.label}
                      </AccordionTrigger>
                      <AccordionContent className="pb-3">
                        <ul className="space-y-1 border-l border-border/80 pl-3">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={() => setOpen(false)}
                                className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-muted"
                              >
                                <span className="block text-sm font-medium text-foreground">
                                  {child.label}
                                </span>
                                {child.description && (
                                  <span className="mt-0.5 block text-xs text-muted-foreground">
                                    {child.description}
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href || "/"}
                      onClick={() => setOpen(false)}
                      className="font-heading flex items-center border-b border-border/70 py-3.5 text-base font-medium text-foreground"
                    >
                      {item.label}
                    </Link>
                  ),
                )}
              </Accordion>

              <div className="mt-auto flex flex-col gap-2 border-t border-border/70 pt-6 pb-6">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "justify-center rounded-2xl",
                  )}
                >
                  Login
                </Link>
                <Link
                  href="/membership"
                  onClick={() => setOpen(false)}
                  className={cn(
                    buttonVariants({ size: "lg" }),
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
