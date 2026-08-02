"use client";

import { cn } from "@/lib/utils";
import { ButtonSpinner } from "@/components/ui/inline-loader";

/**
 * Soft-locks form UI while saving without using fieldset disabled,
 * which can interrupt server actions and leave buttons stuck on "Saving…".
 */
export function FormLock({
  pending,
  children,
  className,
  label = "Saving…",
}: {
  pending: boolean;
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div
      aria-busy={pending}
      data-pending={pending ? "true" : "false"}
      className={cn("relative min-w-0", className)}
    >
      <div
        className={cn(
          "min-w-0 transition",
          pending && "pointer-events-none select-none opacity-55",
        )}
      >
        {children}
      </div>
      {pending ? (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/55 backdrop-blur-[1px]"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-white shadow-lg">
            <ButtonSpinner />
            {label}
          </div>
        </div>
      ) : null}
    </div>
  );
}
