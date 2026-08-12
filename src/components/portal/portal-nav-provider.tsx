"use client";

import { useEffect, useState } from "react";
import { PageLoader } from "@/components/brand/page-loader";
import { NAV_START_EVENT } from "@/lib/nav/hard-navigate";

/**
 * Shows the pen overlay as soon as a portal sidebar tab is clicked,
 * then the full page load replaces this document.
 */
export function PortalNavProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pending, setPending] = useState(false);

  useEffect(() => {
    function onStart() {
      setPending(true);
    }
    window.addEventListener(NAV_START_EVENT, onStart);
    return () => window.removeEventListener(NAV_START_EVENT, onStart);
  }, []);

  return (
    <>
      {children}
      {pending ? (
        <PageLoader
          fullScreen
          label="Loading section…"
          className="pointer-events-auto z-[400] bg-background/85"
        />
      ) : null}
    </>
  );
}
