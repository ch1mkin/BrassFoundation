"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand/logo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { cdnMediaUrl } from "@/lib/media/cdn";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

/** Path only — ignore hash fragments used for in-page anchors. */
function navPath(href: string) {
  return href.split("#")[0] || href;
}

function pathMatches(pathname: string, href: string) {
  const base = navPath(href);
  return pathname === base || pathname.startsWith(`${base}/`);
}

/** Exactly one active item: longest matching href; ties keep the first. */
function getActiveNavIndex(pathname: string, nav: readonly NavItem[]) {
  let bestIdx = -1;
  let bestLen = -1;
  nav.forEach((item, idx) => {
    if (!pathMatches(pathname, item.href)) return;
    const len = navPath(item.href).length;
    if (len > bestLen) {
      bestLen = len;
      bestIdx = idx;
    }
  });
  return bestIdx;
}

export function PortalSidebar({
  title,
  subtitle,
  avatarUrl,
  nav,
  storageKey,
}: {
  title: string;
  subtitle?: string | null;
  avatarUrl?: string | null;
  nav: readonly NavItem[];
  /** @deprecated Sign-out is handled client-side now. */
  signOutAction?: (formData: FormData) => void | Promise<void>;
  storageKey: string;
}) {
  const pathname = usePathname();
  const activeIndex = getActiveNavIndex(pathname, nav);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === "1") setCollapsed(true);
  }, [storageKey]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

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
              {(subtitle || avatarUrl) ? (
                <div className="mt-2 flex min-w-0 items-center gap-2">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cdnMediaUrl(avatarUrl)}
                      alt=""
                      className="size-7 shrink-0 rounded-full object-cover bg-surface-low"
                    />
                  ) : null}
                  {subtitle ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {subtitle}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : avatarUrl ? (
            <div className="mt-3 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cdnMediaUrl(avatarUrl)}
                alt=""
                className="size-8 rounded-full object-cover bg-surface-low"
              />
            </div>
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
        {nav.map((item, index) => {
          const active = index === activeIndex;
          const isHashOnly = item.href.includes("#");
          const className = cn(
            "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors",
            collapsed && "justify-center px-2",
            active
              ? "bg-primary/10 font-semibold text-primary"
              : "text-muted-foreground hover:bg-surface-low hover:text-foreground",
          );
          const inner = (
            <>
              <MaterialIcon name={item.icon} className="text-[18px]" />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </>
          );
          return isHashOnly ? (
            <a
              key={`${item.label}-${item.href}`}
              href={item.href}
              title={item.label}
              className={className}
              onClick={() => setMobileOpen(false)}
            >
              {inner}
            </a>
          ) : (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              title={item.label}
              prefetch
              className={className}
              onClick={() => setMobileOpen(false)}
            >
              {inner}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4">
        <SignOutButton
          className={cn(
            "inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium transition hover:bg-surface-low",
            collapsed && "px-2",
          )}
        >
          {collapsed ? (
            <MaterialIcon name="logout" className="text-[18px]" />
          ) : (
            "Sign out"
          )}
        </SignOutButton>
      </div>
    </aside>
  );

  return (
    <>
      <div className="fixed top-3 left-3 z-40 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-white p-2 shadow-sm"
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
          <div className="absolute inset-y-0 left-0 w-[min(100%,18rem)] shadow-xl">
            {aside}
          </div>
        </div>
      ) : null}
    </>
  );
}
