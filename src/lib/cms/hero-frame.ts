import type { CSSProperties } from "react";

export type HeroImageFrame = {
  focusX: number;
  focusY: number;
  zoom: number;
};

export const DEFAULT_HERO_FRAME: HeroImageFrame = {
  focusX: 50,
  focusY: 50,
  zoom: 1,
};

export function clampHeroFocus(value: unknown, fallback = 50): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, Math.round(n * 10) / 10));
}

export function clampHeroZoom(value: unknown, fallback = 1): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(3, Math.max(1, Math.round(n * 100) / 100));
}

export function parseHeroFrame(raw: {
  focusX?: unknown;
  focusY?: unknown;
  zoom?: unknown;
}): HeroImageFrame {
  return {
    focusX: clampHeroFocus(raw.focusX),
    focusY: clampHeroFocus(raw.focusY),
    zoom: clampHeroZoom(raw.zoom),
  };
}

/** CSS for hero / preview framing (object-position + scale crop). */
export function heroFrameStyle(frame: HeroImageFrame): CSSProperties {
  const { focusX, focusY, zoom } = frame;
  const z = clampHeroZoom(zoom);
  return {
    objectPosition: `${focusX}% ${focusY}%`,
    transform: z > 1.001 ? `scale(${z})` : undefined,
    transformOrigin: `${focusX}% ${focusY}%`,
    willChange: z > 1.001 ? "transform" : undefined,
  };
}
