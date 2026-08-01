import Image from "next/image";
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
        "flex items-center justify-center gap-4",
        fullScreen && "fixed inset-0 z-[100] bg-background/85 backdrop-blur-sm",
        !fullScreen && "min-h-[12rem] w-full py-10",
        className,
      )}
    >
      <Image
        src="/brand/logo.png"
        alt="Brass Foundation"
        width={56}
        height={56}
        priority
        className="object-contain"
      />
      <div className="flex items-center gap-3">
        <span
          className="size-8 animate-spin rounded-full border-2 border-brand/25 border-t-brand"
          aria-hidden
        />
        <span className="font-heading text-sm font-medium tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
