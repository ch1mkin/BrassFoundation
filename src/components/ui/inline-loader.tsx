import { cn } from "@/lib/utils";

export function InlineLoader({
  label = "Please wait…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-6",
        className,
      )}
    >
      <span
        className="size-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary"
        aria-hidden
      />
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

export function ButtonSpinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
      aria-hidden
    />
  );
}
