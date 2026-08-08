"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

const STORAGE_PREFIX = "bf-confetti-milestone:";

/** First member, then every hundredth (1, 100, 200, …). */
export function isMemberMilestone(count: number): boolean {
  if (!Number.isFinite(count) || count < 1) return false;
  if (count === 1) return true;
  return count % 100 === 0;
}

function fireCelebration() {
  const duration = 2800;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ["#002B5B", "#11B5C9", "#F4B942", "#ffffff"],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ["#002B5B", "#11B5C9", "#F4B942", "#ffffff"],
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };

  confetti({
    particleCount: 160,
    spread: 90,
    startVelocity: 45,
    origin: { y: 0.55 },
    colors: ["#002B5B", "#006875", "#11B5C9", "#F4B942", "#E8ECF0"],
  });
  requestAnimationFrame(frame);
}

function markCelebrated(count: number): boolean {
  const key = `${STORAGE_PREFIX}${count}`;
  try {
    if (window.localStorage.getItem(key)) return false;
    window.localStorage.setItem(key, "1");
    return true;
  } catch {
    const sessionKey = `session:${key}`;
    try {
      if (window.sessionStorage.getItem(sessionKey)) return false;
      window.sessionStorage.setItem(sessionKey, "1");
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Celebrates member milestones (1, 100, 200…).
 * Fires live when the count rises into a milestone (e.g. 0 → 1 without refresh),
 * and once per browser when landing on a milestone cold.
 */
export function MemberMilestoneConfetti({ count }: { count: number }) {
  const prevRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const previous = prevRef.current;
    prevRef.current = count;

    if (!isMemberMilestone(count)) return;

    const roseIntoMilestone =
      previous !== null && previous < count && isMemberMilestone(count);
    const coldOnMilestone = previous === null;

    if (!roseIntoMilestone && !coldOnMilestone) return;
    if (!markCelebrated(count)) return;

    const delay = roseIntoMilestone ? 200 : 600;
    const t = window.setTimeout(() => fireCelebration(), delay);
    return () => window.clearTimeout(t);
  }, [count]);

  return null;
}
