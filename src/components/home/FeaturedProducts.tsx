"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Button } from "@/components/ui/Button";
import {
  FEATURED_HOME_SLUGS,
  FALLBACK_PRODUCTS,
  type StoreProduct,
} from "@/lib/data/fallback";

interface FeaturedProductsProps {
  products: StoreProduct[];
}

function pickFeaturedFour(products: StoreProduct[]): StoreProduct[] {
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const picked = FEATURED_HOME_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (p): p is StoreProduct => Boolean(p)
  );
  if (picked.length === 4) return picked;

  // Fallback catalogue already has the four featured items first
  const fallbackBySlug = new Map(FALLBACK_PRODUCTS.map((p) => [p.slug, p]));
  return FEATURED_HOME_SLUGS.map(
    (slug) => bySlug.get(slug) ?? fallbackBySlug.get(slug)!
  ).filter(Boolean);
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const [quickView, setQuickView] = useState<StoreProduct | null>(null);
  const featuredFour = useMemo(() => pickFeaturedFour(products), [products]);

  return (
    <section className="paper-texture py-14 sm:py-20 lg:py-28">
      <div className="relative z-[2] mx-auto max-w-7xl px-4 lg:px-6">
        <ScrollReveal className="mb-12 text-center">
          <span className="font-script text-xl text-orange">Chef&apos;s Picks</span>
          <h2 className="font-display mt-2 text-3xl font-bold text-burgundy sm:text-4xl">
            Featured Favourites
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Handpicked dishes our customers crave — shawarmas, roll parathas & hearty sandwiches.
          </p>
        </ScrollReveal>

        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredFour.map((product, i) => (
            <ProductCard
              key={product._id}
              product={product}
              index={i}
              onQuickView={setQuickView}
            />
          ))}
        </div>

        <ScrollReveal className="mt-12 text-center" delay={0.2}>
          <Link href="/menu">
            <Button variant="outline" size="lg" className="gap-2">
              View Full Menu
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </ScrollReveal>
      </div>

      <QuickViewModal
        product={quickView}
        open={!!quickView}
        onClose={() => setQuickView(null)}
      />
    </section>
  );
}
