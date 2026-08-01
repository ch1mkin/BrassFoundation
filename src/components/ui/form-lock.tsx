"use client";

import { cn } from "@/lib/utils";

/**
 * Soft-locks form UI while saving without using fieldset disabled,
 * which can interrupt server actions and leave buttons stuck on "Saving…".
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
    <div
      aria-busy={pending}
      data-pending={pending ? "true" : "false"}
      className={cn(
        "min-w-0",
        pending && "pointer-events-none opacity-70",
        className,
      )}
    >
      {children}
    </div>
  );
}
