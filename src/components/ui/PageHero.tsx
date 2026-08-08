import Image from "next/image";
import { resolveMediaUrl } from "@/lib/uploads/types";

export function PageHero({
  eyebrow,
  headline,
  subcopy,
  image,
}: {
  eyebrow?: string;
  headline: string;
  subcopy?: string;
  image?: string;
}) {
  const bg = resolveMediaUrl(image || "/images/hero/hero-bg.png", "/images/hero/hero-bg.png");
  return (
    <section className="relative overflow-hidden bg-hero-gradient py-20 lg:py-28">
      {image !== "" && (
        <div className="absolute inset-0 opacity-30">
          <Image
            src={bg}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            unoptimized={bg.startsWith("/api/uploads/")}
            priority
          />
          <div className="absolute inset-0 bg-burgundy/70" />
        </div>
      )}
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center lg:px-6">
        {eyebrow && <span className="font-script text-2xl text-gold">{eyebrow}</span>}
        <h1 className="font-display mt-3 text-3xl font-bold text-cream sm:text-5xl">
          {headline}
        </h1>
        {subcopy && <p className="mt-4 text-lg text-cream/80">{subcopy}</p>}
      </div>
      <div className="sauce-divider relative z-10 mt-12" aria-hidden />
    </section>
  );
}
