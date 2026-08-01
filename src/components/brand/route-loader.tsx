"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PageLoader } from "@/components/brand/page-loader";

/**
 * Brief branded overlay on client-side route changes.
 */
export function RouteLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timeout = window.setTimeout(() => setVisible(false), 450);
    return () => window.clearTimeout(timeout);
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <PageLoader
      fullScreen
      label="Loading…"
      className="pointer-events-none animate-in fade-in duration-150"
    />
  );
}
