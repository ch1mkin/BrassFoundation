import { cn } from "@/lib/utils";

/** Solid blue rule used between homepage sections. */
export function SectionDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn("w-full bg-[#114C88]", className)}
      style={{ height: 3 }}
      aria-hidden
    />
  );
}
