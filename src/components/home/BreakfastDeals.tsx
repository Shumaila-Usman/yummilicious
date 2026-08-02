"use client";

import Link from "next/link";
import { Tag } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { applySale } from "@/lib/pricing/calculate";
import { formatPKR } from "@/lib/utils/format";
import type { StoreProduct } from "@/lib/data/fallback";
import { getProductImage } from "@/lib/data/fallback";
import Image from "next/image";

interface BreakfastDealsProps {
  products: StoreProduct[];
}

export function BreakfastDeals({ products }: BreakfastDealsProps) {
  const deals = products.filter((p) => p.sale?.enabled || p.name.toLowerCase().includes("deal"));
  const display = deals.length > 0 ? deals.slice(0, 3) : products.slice(0, 3);

  return (
    <section className="bg-burgundy py-14 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <ScrollReveal className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange/20 px-4 py-1.5 text-sm font-semibold text-gold">
            <Tag className="h-4 w-4" />
            Limited Time Offers
          </div>
          <h2 className="font-display mt-4 text-3xl font-bold text-cream sm:text-4xl">
            Breakfast Deals & Combos
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-cream/75">
            Save more on morning combos — available during our 9 AM – 12 PM ordering window.
          </p>
        </ScrollReveal>

        <div
          className={
            display.length === 1
              ? "mx-auto grid max-w-md gap-6"
              : display.length === 2
                ? "mx-auto grid max-w-3xl gap-6 md:grid-cols-2"
                : "mx-auto grid gap-6 md:grid-cols-3"
          }
        >
          {display.map((product, i) => {
            const pricing = applySale(
              product.variants?.[0]?.price ?? product.basePrice,
              product.sale
            );
            return (
              <ScrollReveal key={product._id} delay={i * 0.1}>
                <div className="overflow-hidden rounded-3xl border border-gold/20 bg-cream/10 backdrop-blur-sm">
                  <div className="relative aspect-video">
                    <Image
                      src={getProductImage(product)}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="33vw"
                    />
                    {pricing.onSale && (
                      <span className="absolute left-3 top-3 rounded-full bg-orange px-3 py-1 text-xs font-bold text-cream">
                        {pricing.percentOff}% OFF
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold text-cream">{product.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-cream/70">
                      {product.shortDescription}
                    </p>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="font-display text-2xl font-bold text-gold">
                        {formatPKR(pricing.finalPrice)}
                      </span>
                      {pricing.onSale && (
                        <span className="text-sm text-cream/50 line-through">
                          {formatPKR(pricing.originalPrice)}
                        </span>
                      )}
                    </div>
                    <Link href={`/menu/${product.slug}`} className="mt-4 block">
                      <Button size="sm" className="w-full">
                        Grab This Deal
                      </Button>
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal className="mt-10 text-center" delay={0.3}>
          <Link href="/deals">
            <Button variant="ghost" className="border border-cream/30">
              View All Deals
            </Button>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
