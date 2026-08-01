import { cn } from "@/lib/utils";

export function PageShell({
  eyebrow,
  title,
  description,
  children,
  className,
  wide,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto px-4 pt-28 pb-20 sm:px-6 lg:px-20",
        wide ? "max-w-[1280px]" : "max-w-3xl",
        className,
      )}
    >
      <p className="text-sm font-semibold tracking-wide text-primary uppercase">
        {eyebrow}
      </p>
      <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-10">{children}</div> : null}
    </div>
  );
}
