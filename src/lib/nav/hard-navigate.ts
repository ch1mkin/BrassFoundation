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

export const NAV_START_EVENT = "bf-nav-start";

function notifyNavStart() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NAV_START_EVENT));
}

/** Full document load — bypasses Next.js client routing, which was aborting portal tabs. */
export function hardNavigate(href: string) {
  if (typeof window === "undefined") return;
  notifyNavStart();
  window.setTimeout(() => {
    window.location.href = href;
  }, 40);
}

export function handleHardNavClick(
  e: MouseEvent<HTMLAnchorElement>,
  href: string,
) {
  if (isModifiedClick(e)) return;

  const url = new URL(href, window.location.origin);
  const samePath = url.pathname === window.location.pathname;
  if (samePath && url.hash) return;
  if (samePath && !url.search && !url.hash) {
    e.preventDefault();
    return;
  }

  e.preventDefault();
  e.stopPropagation();
  hardNavigate(href);
}
