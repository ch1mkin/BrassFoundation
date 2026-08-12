"use client";

/**
 * Previously showed a full-screen pen overlay on every client route change.
 * That overlay often stuck and blocked the portal. Keep as a no-op.
 */
export function RouteLoader() {
  return null;
}
