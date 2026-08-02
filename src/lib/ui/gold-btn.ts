import type { CSSProperties } from "react";

/** Shared shiny gold CTA class for Become a Member buttons. */
export const GOLD_SHINY_BTN =
  "gold-shiny-btn inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-bold text-white sm:h-14 sm:px-8 sm:text-base";

/** Inline fallback so the gold look still renders if CSS class fails to load. */
export const GOLD_SHINY_STYLE: CSSProperties = {
  backgroundColor: "#d69a17",
  backgroundImage:
    "linear-gradient(135deg, #f7e2a1 0%, #e8c15a 18%, #d69a17 42%, #b0780c 62%, #f0d078 82%, #c99212 100%)",
  backgroundSize: "200% 200%",
  color: "#ffffff",
  boxShadow:
    "0 4px 14px rgba(214, 154, 23, 0.45), 0 1px 0 rgba(255, 240, 190, 0.55) inset, 0 -1px 0 rgba(120, 70, 0, 0.25) inset",
};
