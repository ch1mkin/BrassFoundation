import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/brand/logo.png";

const SIZES = {
  sm: 36,
  md: 48,
  lg: 72,
  xl: 112,
} as const;

type BrandLogoProps = {
  size?: keyof typeof SIZES;
  className?: string;
  priority?: boolean;
  href?: string | null;
  alt?: string;
};

export function BrandLogo({
  size = "md",
  className,
  priority = false,
  href = "/",
  alt = "Brass Foundation",
}: BrandLogoProps) {
  const px = SIZES[size];

  const image = (
    <Image
      src={LOGO_SRC}
      alt={alt}
      width={px}
      height={px}
      priority={priority}
      className={cn("object-contain", className)}
    />
  );

  if (href === null) {
    return image;
  }

  return (
    <Link
      href={href}
      aria-label="Brass Foundation home"
      className="inline-flex shrink-0 items-center"
    >
      {image}
    </Link>
  );
}
