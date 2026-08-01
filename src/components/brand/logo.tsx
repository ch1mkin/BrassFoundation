import Image from "next/image";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/brand/logo.png";

const SIZES = {
  sm: 36,
  md: 44,
  lg: 64,
  xl: 96,
} as const;

type BrandLogoProps = {
  size?: keyof typeof SIZES;
  className?: string;
  priority?: boolean;
  href?: string | null;
  alt?: string;
  /** White plate behind logo for contrast on dark/busy backgrounds */
  plate?: boolean;
  showWordmark?: boolean;
  wordmarkClassName?: string;
};

export function BrandLogo({
  size = "md",
  className,
  priority = false,
  href = "/",
  alt = "Brass Foundation",
  plate = true,
  showWordmark = false,
  wordmarkClassName,
}: BrandLogoProps) {
  const px = SIZES[size];

  const mark = (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        plate && "rounded-full bg-white p-1 shadow-sm ring-1 ring-black/5",
        className,
      )}
    >
      <Image
        src={LOGO_SRC}
        alt={alt}
        width={px}
        height={px}
        priority={priority}
        className="object-contain"
      />
    </span>
  );

  const content = showWordmark ? (
    <span className="inline-flex items-center gap-3">
      {mark}
      <span
        className={cn(
          "font-heading text-lg font-semibold tracking-tight sm:text-xl",
          wordmarkClassName,
        )}
      >
        {SITE.name}
      </span>
    </span>
  ) : (
    mark
  );

  if (href === null) {
    return content;
  }

  return (
    <a
      href={href}
      aria-label="Brass Foundation home"
      className="inline-flex shrink-0 items-center"
    >
      {content}
    </a>
  );
}
