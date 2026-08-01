import { cn } from "@/lib/utils";

type PageLoaderProps = {
  className?: string;
  label?: string;
  fullScreen?: boolean;
};

function PenMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M4.5 19.5L9.2 18.1L18.4 8.9C19.1 8.2 19.1 7.1 18.4 6.4L17.1 5.1C16.4 4.4 15.3 4.4 14.6 5.1L5.4 14.3L4 19L4.5 19.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M13.8 6.2L17.3 9.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M5.2 14.8L8.7 18.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
        "flex flex-col items-center justify-center gap-3",
        fullScreen && "fixed inset-0 z-[100] bg-background/85 backdrop-blur-sm",
        !fullScreen && "min-h-[12rem] w-full py-10",
        className,
      )}
    >
      <div className="relative flex size-14 items-center justify-center">
        <span
          className="absolute inset-0 animate-spin rounded-full border-2 border-primary/20 border-t-primary"
          aria-hidden
        />
        <PenMark className="relative size-6 text-primary" />
      </div>
      <span className="text-sm font-medium tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="sr-only">{label}</span>
    </div>
  );
}
