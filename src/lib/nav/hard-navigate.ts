import type { MouseEvent } from "react";

function isModifiedClick(e: MouseEvent) {
  return (
    e.button !== 0 ||
    e.metaKey ||
    e.ctrlKey ||
    e.shiftKey ||
    e.altKey
  );
}

/** Full document load — bypasses Next.js client routing, which was aborting portal tabs. */
export function hardNavigate(href: string) {
  if (typeof window === "undefined") return;
  window.location.href = href;
}

export function handleHardNavClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
  if (isModifiedClick(e)) return;
  e.preventDefault();
  e.stopPropagation();
  hardNavigate(href);
}
