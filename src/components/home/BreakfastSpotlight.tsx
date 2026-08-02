import Image from "next/image";
import Link from "next/link";
import { Sunrise } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SteamParticles } from "@/components/animations/SteamParticles";
import { Button } from "@/components/ui/Button";
import type { StoreProduct } from "@/lib/data/fallback";
import { applySale } from "@/lib/pricing/calculate";
import { formatPKR } from "@/lib/utils/format";

interface BreakfastSpotlightProps {
  products: StoreProduct[];
}

export function BreakfastSpotlight({ products }: BreakfastSpotlightProps) {
  const breakfast = products.filter(
    (p) => p.categories?.some((c) => c.slug.includes("breakfast")) || p.name.toLowerCase().includes("nashta")
  );
  const featured = breakfast[0] ?? products[0];
  if (!featured) return null;

  const pricing = applySale(
    featured.variants?.[0]?.price ?? featured.basePrice,
    featured.sale
  );

  return (
    <section className="relative overflow-hidden bg-sunrise py-14 sm:py-20 lg:py-28">
      <SteamParticles count={6} />
      <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <ScrollReveal>
            <div className="flex flex-wrap items-center gap-2 text-burgundy">
              <Sunrise className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
              <span className="text-xs font-semibold uppercase tracking-wide sm:text-sm sm:tracking-wider">
                Morning Window · 9 AM – 12 PM
              </span>
            </div>
            <h2 className="font-display mt-3 text-2xl font-bold text-brown sm:text-4xl">
              Rise & Shine with
              <br />
              <span className="text-burgundy">Desi Breakfast</span>
            </h2>
            <p className="mt-4 max-w-md text-muted leading-relaxed">
              Anda, paratha, aloo bhujia, doodh patti — the complete Islamabad morning ritual,
              plated fresh while the city wakes up.
            </p>
            {featured && (
              <div className="mt-6 rounded-2xl border border-burgundy/15 bg-cream/80 p-5 backdrop-blur-sm">
                <p className="font-display text-lg font-bold text-burgundy">{featured.name}</p>
                <p className="mt-1 text-sm text-muted">{featured.shortDescription}</p>
                <p className="mt-2 font-display text-xl font-bold text-orange">
                  {formatPKR(pricing.finalPrice)}
                </p>
              </div>
            )}
            <Link href="/categories/breakfast" className="mt-8 inline-block">
              <Button magnetic>Order Breakfast</Button>
            </Link>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.2}>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-lg overflow-hidden rounded-[2rem]">
              <Image
                src="/images/home/thaali-2.png"
                alt="Desi Nashta Platter"
                fill
                className="object-contain object-center drop-shadow-[0_24px_48px_rgba(158,11,24,0.25)]"
                sizes="(max-width: 1024px) 90vw, 520px"
                priority={false}
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
