import { cn } from "@/lib/utils";

type PageLoaderProps = {
  className?: string;
  label?: string;
  fullScreen?: boolean;
};

export function PageLoader({
  className,
  label = "Loading…",
  fullScreen = false,
}: PageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex items-center justify-center gap-3",
        fullScreen && "fixed inset-0 z-[100] bg-background/85 backdrop-blur-sm",
        !fullScreen && "min-h-[12rem] w-full py-10",
        className,
      )}
    >
      <span
        className="size-9 animate-spin rounded-full border-2 border-primary/20 border-t-brand"
        aria-hidden
      />
      <span className="text-sm font-medium tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="sr-only">{label}</span>
    </div>
  );
}
