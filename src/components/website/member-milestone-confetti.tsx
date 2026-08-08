"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

/** First member, then every hundredth (1, 100, 200, …). */
export function isMemberMilestone(count: number): boolean {
  if (!Number.isFinite(count) || count < 1) return false;
  if (count === 1) return true;
  return count % 100 === 0;
}

/** Milestones crossed when the live total rises from `from` → `to`. */
export function milestonesCrossed(from: number, to: number): number[] {
  if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) return [];
  const hits: number[] = [];
  if (from < 1 && to >= 1) hits.push(1);
  const firstHundred = Math.max(1, Math.floor(from / 100) + 1);
  const lastHundred = Math.floor(to / 100);
  for (let h = firstHundred; h <= lastHundred; h++) {
    const milestone = h * 100;
    if (milestone > from && milestone <= to) hits.push(milestone);
  }
  return hits;
}

function fireCelebration() {
  const duration = 3200;
  const end = Date.now() + duration;
  const colors = ["#002B5B", "#006875", "#11B5C9", "#F4B942", "#E8ECF0", "#ffffff"];

  confetti({
    particleCount: 180,
    spread: 100,
    startVelocity: 48,
    origin: { y: 0.55 },
    colors,
  });

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.7 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/**
 * Live homepage confetti when the member count rises into 1, 100, 200…
 * Fires for every open tab that observes that rise (no refresh required).
 */
export function MemberMilestoneConfetti({ count }: { count: number }) {
  const prevRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!Number.isFinite(count)) return;

    const previous = prevRef.current;
    prevRef.current = count;

    // Wait until we have a prior live reading so cold page-load at an
    // existing milestone does not re-fire — only actual live rises do.
    if (previous === null) return;
    if (count <= previous) return;

    const hits = milestonesCrossed(previous, count);
    if (!hits.length) return;

    const t = window.setTimeout(() => fireCelebration(), 180);
    return () => window.clearTimeout(t);
  }, [count]);

  return null;
}
