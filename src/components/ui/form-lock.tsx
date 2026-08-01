"use client";

import { cn } from "@/lib/utils";

/**
 * Disables all form controls while a server action is pending
 * to prevent duplicate submissions.
 */
export function FormLock({
  pending,
  children,
  className,
}: {
  pending: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <fieldset
      disabled={pending}
      aria-busy={pending}
      className={cn(
        "min-w-0 border-0 p-0 disabled:pointer-events-none",
        pending && "opacity-70",
        className,
      )}
    >
      {children}
    </fieldset>
  );
}
