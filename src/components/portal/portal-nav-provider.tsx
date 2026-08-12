"use client";

/**
 * Portal layout wrapper. Navigation loaders were removed because they
 * covered the page and often never cleared. Sidebar Links prefetch instead.
 */
export function PortalNavProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
