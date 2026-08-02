import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface LogoProps {
  size?: number;
  className?: string;
  withText?: boolean;
  href?: string;
  light?: boolean;
}

export function Logo({
  size = 48,
  className,
  withText = false,
  href = "/",
  light = false,
}: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Image
        src="/images/brand/logo.png"
        alt="Yummilicious"
        width={size}
        height={size}
        className="object-contain drop-shadow-lg"
        priority
      />
      {withText && (
        <span className="flex flex-col leading-tight">
          <span
            className={cn(
              "font-display text-xl font-bold tracking-tight sm:text-2xl",
              light ? "text-cream" : "text-burgundy"
            )}
          >
            Yummilicious
          </span>
          <span
            className={cn(
              "font-script text-sm",
              light ? "text-gold" : "text-orange"
            )}
          >
            Homemade Comfort
          </span>
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="focus-ring inline-flex overflow-visible rounded-full"
        aria-label="Yummilicious home"
      >
        {content}
      </Link>
    );
  }
  return content;
}
