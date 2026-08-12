"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { PageLoader } from "@/components/brand/page-loader";

const LOADER_TIMEOUT_MS = 8000;

function pathFromHref(href: string) {
  try {
    return new URL(href, window.location.origin).pathname;
  } catch {
    return href.split("?")[0]?.split("#")[0] || href;
  }
}

/**
 * Brief overlay while portal sections load.
 * Always clears on pathname change, popstate, or a timeout so it cannot stick.
 */
export function PortalNavProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const pendingHrefRef = useRef<string | null>(null);

  function clearPending() {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    pendingHrefRef.current = null;
    setPending(false);
  }

  function startPending(nextPath: string) {
    pendingHrefRef.current = nextPath;
    setPending(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setPending(false);
      pendingHrefRef.current = null;
      timeoutRef.current = null;
    }, LOADER_TIMEOUT_MS);
  }

  useEffect(() => {
    clearPending();
  }, [pathname]);

  useEffect(() => {
    function onPopState() {
      clearPending();
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      if (event.button !== 0) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;

      const href = anchor.getAttribute("href") || "";
      if (!href.startsWith("/") || href.startsWith("//")) return;
      // Full document navigations (HardNavLink) should not freeze the overlay.
      if (anchor.dataset.hardNav === "true") return;

      const nextPathname = pathFromHref(href);
      // Same path (hash/query only, e.g. Membership Card) — never overlay.
      if (nextPathname === pathname) return;

      startPending(nextPathname);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      {children}
      {pending ? (
        <PageLoader
          fullScreen
          label="Loading…"
          className="z-[300] bg-background/70"
        />
      ) : null}
    </>
  );
}
