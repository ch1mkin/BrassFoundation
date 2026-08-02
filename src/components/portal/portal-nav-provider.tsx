"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { PageLoader } from "@/components/brand/page-loader";

/**
 * Full-screen loader for portal navigation so users see feedback
 * immediately when they tap a sidebar section.
 */
export function PortalNavProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setPending(false);
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      if (!href.startsWith("/") || href.startsWith("//")) return;
      if (anchor.target === "_blank") return;

      let nextPathname = href;
      try {
        nextPathname = new URL(href, window.location.origin).pathname;
      } catch {
        nextPathname = href.split("?")[0]?.split("#")[0] || href;
      }

      // Same page with only ?query / #hash — do not block the UI
      if (nextPathname === pathname) return;

      startTransition(() => setPending(true));
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, startTransition]);

  return (
    <>
      {children}
      {pending ? (
        <PageLoader
          fullScreen
          label="Loading…"
          className="pointer-events-auto z-[300] bg-background/92"
        />
      ) : null}
    </>
  );
}
