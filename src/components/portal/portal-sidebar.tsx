"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

export function PortalSidebar({
  title,
  subtitle,
  nav,
  signOutAction,
  storageKey,
}: {
  title: string;
  subtitle?: string | null;
  nav: readonly NavItem[];
  signOutAction: (formData: FormData) => void | Promise<void>;
  storageKey: string;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === "1") setCollapsed(true);
  }, [storageKey]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(storageKey, next ? "1" : "0");
      return next;
    });
  }

  const aside = (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border/40 bg-white p-4 transition-all duration-200",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={cn("min-w-0", collapsed && "mx-auto")}>
          <BrandLogo
            size="sm"
            showWordmark={!collapsed}
            wordmarkClassName="text-sm font-bold text-primary"
          />
          {!collapsed ? (
            <>
              <p className="mt-3 text-xs font-semibold tracking-wide text-primary uppercase">
                {title}
              </p>
              {subtitle ? (
                <p className="mt-2 truncate text-xs text-muted-foreground">
                  {subtitle}
                </p>
              ) : null}
            </>
          ) : null}
        </div>
        <button
          type="button"
          onClick={toggle}
          className="hidden rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-surface-low md:inline-flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <MaterialIcon
            name={collapsed ? "chevron_right" : "chevron_left"}
            className="text-[18px]"
          />
        </button>
      </div>

      <nav className="mt-6 max-h-[calc(100svh-12rem)] flex-1 space-y-0.5 overflow-y-auto">
        {nav.map((item) => {
          const active =
            item.href === "/admin" || item.href === "/member"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              title={item.label}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors",
                collapsed && "justify-center px-2",
                active
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-muted-foreground hover:bg-surface-low hover:text-foreground",
              )}
            >
              <MaterialIcon name={item.icon} className="text-[18px]" />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <form action={signOutAction} className="mt-4">
        <Button
          type="submit"
          variant="outline"
          className={cn("w-full rounded-xl", collapsed && "px-2")}
        >
          {collapsed ? (
            <MaterialIcon name="logout" className="text-[18px]" />
          ) : (
            "Sign out"
          )}
        </Button>
      </form>
    </aside>
  );

  return (
    <>
      <div className="fixed top-3 left-3 z-40 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-xl border border-border bg-white p-2 shadow-sm"
          aria-label="Open menu"
        >
          <MaterialIcon name="menu" />
        </button>
      </div>

      <div className="hidden md:block">{aside}</div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 shadow-xl">{aside}</div>
        </div>
      ) : null}
    </>
  );
}
