"use client";

import { useEffect } from "react";
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

/**
 * Fires homepage confetti once per browser when the live member count
 * hits a milestone (1, 100, 200, …).
 */
export function MemberMilestoneConfetti({ count }: { count: number }) {
  useEffect(() => {
    if (!isMemberMilestone(count)) return;
    if (typeof window === "undefined") return;

    const key = `${STORAGE_PREFIX}${count}`;
    try {
      if (window.localStorage.getItem(key)) return;
      window.localStorage.setItem(key, "1");
    } catch {
      // Private mode / blocked storage — still celebrate this visit once via session
      const sessionKey = `session:${key}`;
      try {
        if (window.sessionStorage.getItem(sessionKey)) return;
        window.sessionStorage.setItem(sessionKey, "1");
      } catch {
        return;
      }
    }

    const t = window.setTimeout(() => fireCelebration(), 600);
    return () => window.clearTimeout(t);
  }, [count]);

  return null;
}
