"use client";

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
  /**
   * On viewports below `lg`, hide the wordmark and wrap the logo with a
   * circular slogan (Education to Prosperity) to free horizontal space.
   */
  circularSloganMobile?: boolean;
};

function CircularSlogan({
  sizePx,
  text,
}: {
  sizePx: number;
  text: string;
}) {
  const ring = Math.round(sizePx * 2.35);
  const r = ring / 2 - 7;
  const pathId = "logo-slogan-circle";
  const label = `${text} · ${text} · `;

  return (
    <svg
      width={ring}
      height={ring}
      viewBox={`0 0 ${ring} ${ring}`}
      className="pointer-events-none absolute inset-0 size-full animate-[spin_28s_linear_infinite] text-white/85"
      aria-hidden
    >
      <defs>
        <path
          id={pathId}
          d={`M ${ring / 2},${ring / 2} m -${r},0 a ${r},${r} 0 1,1 ${r * 2},0 a ${r},${r} 0 1,1 -${r * 2},0`}
          fill="none"
        />
      </defs>
      <text
        className="fill-current uppercase"
        style={{
          fontSize: 8.5,
          letterSpacing: "0.22em",
          fontWeight: 600,
        }}
      >
        <textPath href={`#${pathId}`} startOffset="0%">
          {label}
        </textPath>
      </text>
    </svg>
  );
}

export function BrandLogo({
  size = "md",
  className,
  priority = false,
  href = "/",
  alt = "Brass Foundation",
  plate = true,
  showWordmark = false,
  wordmarkClassName,
  circularSloganMobile = false,
}: BrandLogoProps) {
  const px = SIZES[size];
  const ring = Math.round(px * 2.35);

  const mark = (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        circularSloganMobile && "lg:static",
        className,
      )}
      style={
        circularSloganMobile
          ? ({
              ["--logo-ring" as string]: `${ring}px`,
            } as React.CSSProperties)
          : undefined
      }
    >
      {circularSloganMobile ? (
        <span
          className="relative inline-flex items-center justify-center lg:hidden"
          style={{ width: ring, height: ring }}
        >
          <CircularSlogan sizePx={px} text={SITE.slogan} />
          <span
            className={cn(
              "relative z-[1] inline-flex items-center justify-center",
              plate && "rounded-full bg-white p-1 shadow-sm ring-1 ring-black/5",
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
        </span>
      ) : null}

      <span
        className={cn(
          "inline-flex items-center justify-center",
          circularSloganMobile && "hidden lg:inline-flex",
          plate && "rounded-full bg-white p-1 shadow-sm ring-1 ring-black/5",
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
    </span>
  );

  const content = showWordmark ? (
    <span className="inline-flex min-w-0 max-w-full items-center gap-2 sm:gap-3">
      {mark}
      <span
        className={cn(
          "font-heading min-w-0 truncate text-lg font-semibold tracking-tight sm:text-xl",
          circularSloganMobile && "hidden lg:inline",
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
      className="inline-flex min-w-0 max-w-full items-center"
    >
      {content}
    </a>
  );
}
